import { chromium } from 'playwright';

const MAX_PAGES_PER_CONTEXT = 20; // recycle context after N uses to prevent memory leaks
const MAX_BROWSER_AGE_MS = 10 * 60 * 1000; // recycle browser every 10 min
const BROWSER_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-sync',
  '--disable-translate',
  '--hide-scrollbars',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-first-run',
  '--safebrowsing-disable-auto-update',
  '--js-flags=--max-old-space-size=512',
];

class BrowserPool {
  constructor() {
    this._browser = null;
    this._launchedAt = null;
    this._contextPool = []; // [{ context, useCount, busy }]
    this._lock = false;
  }

  async _ensureBrowser() {
    const now = Date.now();
    const tooOld = this._launchedAt && (now - this._launchedAt > MAX_BROWSER_AGE_MS);

    if (!this._browser || !this._browser.isConnected() || tooOld) {
      if (this._browser) {
        try { await this._browser.close(); } catch {}
      }
      this._contextPool = [];
      this._browser = await chromium.launch({
        headless: true,
        args: BROWSER_LAUNCH_ARGS,
      });
      this._launchedAt = now;
    }
    return this._browser;
  }

  async acquireContext() {
    const browser = await this._ensureBrowser();

    // Find a free context that hasn't hit its use limit
    const slot = this._contextPool.find(s => !s.busy && s.useCount < MAX_PAGES_PER_CONTEXT);

    if (slot) {
      slot.busy = true;
      slot.useCount++;
      return { context: slot.context, _slot: slot };
    }

    // Create new context
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      javaScriptEnabled: true,
      bypassCSP: true,
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    // Block unnecessary resources to reduce memory/bandwidth
    await context.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,mp4,mp3,avi}', route => route.abort());
    await context.route('**/{analytics,tracking,ads,doubleclick,googlesyndication}**', route => route.abort());

    const newSlot = { context, useCount: 1, busy: true };
    this._contextPool.push(newSlot);
    return { context, _slot: newSlot };
  }

  releaseContext({ _slot }) {
    if (_slot) {
      _slot.busy = false;
      // If used up, close it asynchronously
      if (_slot.useCount >= MAX_PAGES_PER_CONTEXT) {
        const idx = this._contextPool.indexOf(_slot);
        if (idx !== -1) this._contextPool.splice(idx, 1);
        _slot.context.close().catch(() => {});
      }
    }
  }

  async runInContext(fn) {
    const handle = await this.acquireContext();
    const page = await handle.context.newPage();
    try {
      return await fn(page);
    } finally {
      await page.close().catch(() => {});
      this.releaseContext(handle);
    }
  }

  async drain() {
    for (const slot of this._contextPool) {
      try { await slot.context.close(); } catch {}
    }
    this._contextPool = [];
    if (this._browser) {
      try { await this._browser.close(); } catch {}
      this._browser = null;
    }
  }

  stats() {
    return {
      contextCount: this._contextPool.length,
      busyContexts: this._contextPool.filter(s => s.busy).length,
      freeContexts: this._contextPool.filter(s => !s.busy).length,
      browserAlive: !!this._browser?.isConnected(),
      browserAgeMs: this._launchedAt ? Date.now() - this._launchedAt : 0,
    };
  }
}

export const browserPool = new BrowserPool();

// Graceful shutdown
process.on('SIGINT', () => browserPool.drain().finally(() => process.exit(0)));
process.on('SIGTERM', () => browserPool.drain().finally(() => process.exit(0)));
