const BASE = 'https://provision-web-scraper-leadgen.onrender.com/api';

export async function startScrapeJob(urlText) {
  const res = await fetch(`${BASE}/scrape/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: urlText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to start scrape job');
  }
  return res.json();
}

export function subscribeToJob(jobId, onUpdate, onDone) {
  const es = new EventSource(`${BASE}/scrape/status/${jobId}`);
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onUpdate(data);
      if (data.status === 'completed' || data.status === 'error') {
        es.close();
        onDone(data);
      }
    } catch {}
  };
  es.onerror = () => {
    es.close();
    onDone(null);
  };
  return () => es.close();
}

export function getExportUrl(jobId, format) {
  return `${BASE}/export/${format}/${jobId}`;
}
