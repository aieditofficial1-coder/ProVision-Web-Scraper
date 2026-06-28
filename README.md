# PROVISION WEB SCRAPER
### AI-Powered Website Data Extraction

A complete full-stack web scraping application that extracts business information from websites in bulk — no AI/LLM dependency, pure regex + Playwright + Cheerio.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install Dependencies

```bash
# From the root /provision-scraper folder:
npm run install:all
```

This installs all backend + frontend dependencies AND downloads the Playwright Chromium browser.

### 2. Start the Backend

```bash
# Terminal 1
npm run dev:backend
# → Runs on http://localhost:3001
```

### 3. Start the Frontend

```bash
# Terminal 2
npm run dev:frontend
# → Opens on http://localhost:5173
```

### 4. Open the App

Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
provision-scraper/
├── package.json                  ← Root scripts
├── README.md
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js              ← Express server (port 3001)
│       ├── routes/
│       │   ├── scrape.js         ← POST /api/scrape/start, GET /api/scrape/status/:id
│       │   └── export.js         ← GET /api/export/csv/:id, GET /api/export/xlsx/:id
│       ├── scraper/
│       │   ├── scraper.js        ← Core Playwright + Axios engine
│       │   ├── extractors.js     ← Email / Phone / Social / Company name regex
│       │   └── industryDetector.js ← 18-industry keyword detection
│       └── utils/
│           ├── jobStore.js       ← In-memory job tracking
│           └── urlUtils.js       ← URL validation & deduplication
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               ← Root layout + state management
        ├── index.css             ← Global dark blue theme
        ├── utils/
        │   └── api.js            ← Fetch helpers + SSE subscription
        └── components/
            ├── Header.jsx
            ├── Sidebar.jsx       ← Live stats + engine info
            ├── StatsBar.jsx      ← 7 stat cards
            ├── ProgressBar.jsx   ← Animated progress
            ├── UrlInputPanel.jsx ← Paste + validate URLs
            ├── ResultsTable.jsx  ← Sortable, filterable, paginated table
            └── ExportPanel.jsx   ← CSV + Excel export buttons
```

---

## 🔍 Data Extracted

| Field | Method |
|-------|--------|
| Company Name | OG tags, meta, title, H1, Schema.org |
| Industry | 18-category keyword detection |
| Email | Regex across homepage + /contact + /about |
| Phone | Multi-format regex (UK, US, International) |
| LinkedIn | href pattern matching |
| Facebook | href pattern matching |
| Instagram | href pattern matching |
| Twitter/X | href pattern matching |
| Website URL | Input URL |
| Status | Success / Invalid URL / Website Unreachable / Failed |

---

## ⚙️ Architecture

- **Frontend** → React + Vite, SSE for live streaming results
- **Backend** → Express.js, job queue with concurrency=3
- **Scraping** → Axios (fast) → Playwright fallback (JS-heavy sites)
- **Pages Checked** → `/`, `/contact`, `/contact-us`, `/about`, `/about-us`, `/team`
- **Exports** → CSV via string builder, XLSX via SheetJS

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Lucide Icons |
| Backend | Node.js, Express.js |
| Scraping | Playwright (Chromium), Axios, Cheerio |
| Export | xlsx (SheetJS) |
| Streaming | Server-Sent Events (SSE) |

---

## 🛡️ No LLM / No AI APIs

All extraction is done via:
- CSS selectors (Cheerio)
- Regex patterns
- Keyword scoring
- DOM traversal

Zero dependency on Claude, OpenAI, Gemini, or any LLM.

---

## 📊 Performance

- Concurrency: 3 simultaneous scrapes
- Per-URL timeout: 15 seconds
- Retry: up to 2 attempts (Axios → Playwright)
- Rate limit: built-in queue prevents overwhelming targets
- Deduplication: automatic before processing

---

## 🔧 Configuration

Edit `backend/src/scraper/scraper.js`:
- `concurrency` in `processBatch()` — default 3
- `REQUEST_TIMEOUT` — default 15000ms
- `MAX_RETRIES` — default 2
- `PAGES_TO_CHECK` — subpages to crawl
