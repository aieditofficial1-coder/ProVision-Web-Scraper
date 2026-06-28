// ─── In-memory job store with auto-cleanup ────────────────────────────────────
const jobs = new Map();
const JOB_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Auto-cleanup old jobs every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (now - new Date(job.updatedAt).getTime() > JOB_TTL_MS) {
      jobs.delete(id);
    }
  }
}, 30 * 60 * 1000);

export function createJob(id, urls) {
  const job = {
    id,
    status: 'pending',
    total: urls.length,
    processed: 0,
    success: 0,
    failed: 0,
    invalid: 0,
    results: [],
    metrics: {
      concurrency: 0,
      cpuPct: 0,
      memFreeMb: 0,
      memUsedPct: 0,
      heapUsedMb: 0,
      urlsPerSec: 0,
      batchesCompleted: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id) {
  return jobs.get(id) || null;
}

export function updateJob(id, updates) {
  const job = jobs.get(id);
  if (!job) return null;
  Object.assign(job, updates, { updatedAt: new Date().toISOString() });
  jobs.set(id, job);
  return job;
}

export function updateMetrics(id, metrics) {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job.metrics, metrics);
  job.updatedAt = new Date().toISOString();
}

export function addResult(id, result) {
  const job = jobs.get(id);
  if (!job) return null;
  job.results.push(result);
  job.processed += 1;
  if (result.status === 'Success') job.success += 1;
  else if (result.status === 'Invalid URL') job.invalid += 1;
  else job.failed += 1;
  job.updatedAt = new Date().toISOString();
  return job;
}

export function deleteJob(id) {
  jobs.delete(id);
}

export function getAllJobs() {
  return [...jobs.values()].map(j => ({
    id: j.id,
    status: j.status,
    total: j.total,
    processed: j.processed,
    createdAt: j.createdAt,
  }));
}
