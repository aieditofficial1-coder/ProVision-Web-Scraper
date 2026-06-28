import os from 'os';

// ─── Resource Snapshot ────────────────────────────────────────────────────────
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) totalTick += cpu.times[type];
    totalIdle += cpu.times.idle;
  }
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length, cores: cpus.length };
}

let _lastCpu = getCpuUsage();

export async function measureCpuPercent() {
  return new Promise(resolve => {
    const before = getCpuUsage();
    setTimeout(() => {
      const after = getCpuUsage();
      const idleDiff = after.idle - before.idle;
      const totalDiff = after.total - before.total;
      const usedPct = totalDiff > 0 ? 100 - (idleDiff / totalDiff) * 100 : 0;
      _lastCpu = after;
      resolve(Math.round(usedPct));
    }, 200);
  });
}

export function getMemoryStats() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const usedPct = Math.round((used / total) * 100);
  const freeMb = Math.round(free / 1024 / 1024);
  const totalMb = Math.round(total / 1024 / 1024);
  return { total: totalMb, free: freeMb, used: totalMb - freeMb, usedPct };
}

// ─── Process-level heap ───────────────────────────────────────────────────────
export function getHeapStats() {
  const mem = process.memoryUsage();
  return {
    heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    rssMb: Math.round(mem.rss / 1024 / 1024),
    externalMb: Math.round(mem.external / 1024 / 1024),
  };
}

// ─── Adaptive Concurrency Engine ──────────────────────────────────────────────
const MIN_CONCURRENCY = 1;
const MAX_CONCURRENCY = 12;

// Each Playwright context uses ~100-150MB; Axios scrapes ~5MB each
const MB_PER_PW_WORKER = 150;
const MB_PER_AXIOS_WORKER = 10;

export async function computeOptimalConcurrency(usePlaywright = false) {
  const [cpuPct, mem] = await Promise.all([measureCpuPercent(), Promise.resolve(getMemoryStats())]);
  const heap = getHeapStats();

  const cores = os.cpus().length;

  // RAM budget: keep 400MB free as safety margin
  const safeFreeMb = Math.max(0, mem.free - 400);
  const mbPerWorker = usePlaywright ? MB_PER_PW_WORKER : MB_PER_AXIOS_WORKER;
  const memBasedLimit = Math.floor(safeFreeMb / mbPerWorker);

  // CPU budget: use up to 75% of remaining idle capacity
  const cpuHeadroom = Math.max(0, 75 - cpuPct);
  const cpuBasedLimit = Math.floor((cpuHeadroom / 100) * cores * 4);

  // Heap guard: if heap > 80% of total, reduce
  const heapPressure = heap.heapTotalMb > 0 ? heap.heapUsedMb / heap.heapTotalMb : 0;
  const heapMultiplier = heapPressure > 0.8 ? 0.5 : heapPressure > 0.6 ? 0.7 : 1.0;

  const raw = Math.min(memBasedLimit, cpuBasedLimit);
  const adjusted = Math.round(raw * heapMultiplier);
  const clamped = Math.min(MAX_CONCURRENCY, Math.max(MIN_CONCURRENCY, adjusted));

  return {
    concurrency: clamped,
    cpuPct,
    memFreeMb: mem.free,
    memUsedPct: mem.usedPct,
    heapUsedMb: heap.heapUsedMb,
    cores,
  };
}

// ─── Periodic Resource Reporter ───────────────────────────────────────────────
export class ResourceMonitor {
  constructor(intervalMs = 5000) {
    this.intervalMs = intervalMs;
    this._interval = null;
    this.latest = {
      concurrency: 3,
      cpuPct: 0,
      memFreeMb: 0,
      memUsedPct: 0,
      heapUsedMb: 0,
      cores: os.cpus().length,
    };
  }

  start() {
    this._tick();
    this._interval = setInterval(() => this._tick(), this.intervalMs);
  }

  stop() {
    if (this._interval) clearInterval(this._interval);
  }

  async _tick() {
    try {
      this.latest = await computeOptimalConcurrency(true);
    } catch {}
  }

  getRecommendedConcurrency() {
    return this.latest.concurrency;
  }

  getStats() {
    return { ...this.latest };
  }
}

export const resourceMonitor = new ResourceMonitor(4000);
resourceMonitor.start();
