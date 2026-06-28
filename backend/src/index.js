import express from 'express';
import cors from 'cors';
import os from 'os';
import { scrapeRouter } from './routes/scrape.js';
import { exportRouter } from './routes/export.js';
import { resourceMonitor } from './utils/resourceMonitor.js';
import { browserPool } from './utils/browserPool.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/scrape', scrapeRouter);
app.use('/api/export', exportRouter);

app.get('/api/health', (req, res) => {
  const stats = resourceMonitor.getStats();
  const pool = browserPool.stats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
    },
    resources: stats,
    browserPool: pool,
  });
});

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║     PROVISION WEB SCRAPER BACKEND      ║`);
  console.log(`║  AI-Powered Website Data Extraction    ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(`\n  Port    : ${PORT}`);
  console.log(`  CPUs    : ${os.cpus().length} cores`);
  console.log(`  RAM     : ${Math.round(os.totalmem() / 1024 / 1024)} MB`);
  console.log(`  Mode    : Autonomous (adaptive concurrency)\n`);
});

export default app;
