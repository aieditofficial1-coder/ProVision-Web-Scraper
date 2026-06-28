import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateUrl, deduplicateUrls, parseUrlList } from '../utils/urlUtils.js';
import { createJob, getJob, updateJob, updateMetrics, addResult } from '../utils/jobStore.js';
import { scrapeWebsite } from '../scraper/scraper.js';
import { resourceMonitor } from '../utils/resourceMonitor.js';
import { browserPool } from '../utils/browserPool.js';

export const scrapeRouter = Router();

// ─── POST /api/scrape/start ───────────────────────────────────────────────────
scrapeRouter.post('/start', async (req, res) => {
  const { urls: rawInput } = req.body;
  if (!rawInput || typeof rawInput !== 'string') {
    return res.status(400).json({ error: 'No URLs provided.' });
  }

  const parsed = parseUrlList(rawInput);
  if (parsed.length === 0) {
    return res.status(400).json({ error: 'No valid URLs found in input.' });
  }

  const validated = parsed.map(raw => validateUrl(raw));
  const validUrls = deduplicateUrls(validated.filter(v => v.valid).map(v => v.url));
  const invalidUrls = validated.filter(v => !v.valid).map(v => v.url);

  const jobId = uuidv4();
  const allUrls = [...validUrls, ...invalidUrls];
  createJob(jobId, allUrls);

  // Register invalid URLs immediately
  for (const url of invalidUrls) {
    addResult(jobId, {
      url, companyName: 'Not Available', industry: 'Not Available',
      email: 'Not Available', phone: 'Not Available',
      linkedin: 'Not Available', facebook: 'Not Available',
      instagram: 'Not Available', twitter: 'Not Available',
      status: 'Invalid URL',
    });
  }

  updateJob(jobId, { status: 'running', total: allUrls.length });

  res.json({
    jobId,
    total: allUrls.length,
    valid: validUrls.length,
    invalid: invalidUrls.length,
  });

  // Kick off autonomous processing (non-blocking)
  processAutonomous(jobId, validUrls).catch(err => {
    console.error(`[Job ${jobId}] Fatal error:`, err.message);
    updateJob(jobId, { status: 'error' });
  });
});

// ─── GET /api/scrape/status/:jobId  (SSE) ────────────────────────────────────
scrapeRouter.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
  };

  const interval = setInterval(() => {
    const job = getJob(jobId);
    if (!job) {
      send({ error: 'Job not found' });
      clearInterval(interval);
      return res.end();
    }
    send({
      jobId: job.id,
      status: job.status,
      total: job.total,
      processed: job.processed,
      success: job.success,
      failed: job.failed,
      invalid: job.invalid,
      results: job.results,
      metrics: job.metrics,
      updatedAt: job.updatedAt,
    });
    if (job.status === 'completed' || job.status === 'error') {
      clearInterval(interval);
      setTimeout(() => res.end(), 600);
    }
  }, 600);

  req.on('close', () => clearInterval(interval));
});

// ─── GET /api/scrape/results/:jobId ──────────────────────────────────────────
scrapeRouter.get('/results/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// ─── GET /api/scrape/system ──────────────────────────────────────────────────
scrapeRouter.get('/system', async (req, res) => {
  const stats = resourceMonitor.getStats();
  const pool = browserPool.stats();
  res.json({ resources: stats, browserPool: pool });
});

// ─── Autonomous Processing Engine ─────────────────────────────────────────────
async function processAutonomous(jobId, urls) {
  if (urls.length === 0) {
    updateJob(jobId, { status: 'completed' });
    return;
  }

  const queue = [...urls];
  let active = 0;
  const startTime = Date.now();
  let processedCount = 0;

  // Metrics update loop (independent of processing)
  const metricsInterval = setInterval(async () => {
    const job = getJob(jobId);
    if (!job || job.status !== 'running') {
      clearInterval(metricsInterval);
      return;
    }
    const resStats = resourceMonitor.getStats();
    const elapsedSec = (Date.now() - startTime) / 1000;
    const rate = elapsedSec > 0 ? (processedCount / elapsedSec).toFixed(2) : '0';
    updateMetrics(jobId, {
      concurrency: active,
      cpuPct: resStats.cpuPct,
      memFreeMb: resStats.memFreeMb,
      memUsedPct: resStats.memUsedPct,
      heapUsedMb: resStats.heapUsedMb,
      urlsPerSec: parseFloat(rate),
    });
  }, 2000);

  return new Promise((resolve) => {
    // Adaptive concurrency: re-evaluate every few completions
    let concurrency = resourceMonitor.getRecommendedConcurrency();
    let reEvalCounter = 0;

    function scheduleNext() {
      // Re-evaluate concurrency every 5 completions
      if (reEvalCounter % 5 === 0) {
        const recommended = resourceMonitor.getRecommendedConcurrency();
        // Smooth transition: don't jump more than +2 or -1 at a time
        if (recommended > concurrency) concurrency = Math.min(recommended, concurrency + 2);
        else if (recommended < concurrency) concurrency = Math.max(recommended, concurrency - 1);
      }

      while (active < concurrency && queue.length > 0) {
        const url = queue.shift();
        active++;

        scrapeWebsite(url)
          .then(result => {
            addResult(jobId, result);
          })
          .catch(() => {
            addResult(jobId, {
              url, companyName: 'Not Available', industry: 'Not Available',
              email: 'Not Available', phone: 'Not Available',
              linkedin: 'Not Available', facebook: 'Not Available',
              instagram: 'Not Available', twitter: 'Not Available',
              status: 'Failed',
            });
          })
          .finally(() => {
            active--;
            processedCount++;
            reEvalCounter++;

            if (active === 0 && queue.length === 0) {
              clearInterval(metricsInterval);
              updateJob(jobId, { status: 'completed' });
              resolve();
            } else {
              scheduleNext();
            }
          });
      }
    }

    scheduleNext();
  });
}
