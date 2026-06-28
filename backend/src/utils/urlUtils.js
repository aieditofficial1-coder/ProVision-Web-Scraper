export function validateUrl(raw) {
  try {
    const trimmed = raw.trim();
    if (!trimmed) return { valid: false, url: trimmed };
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (!['http:', 'https:'].includes(parsed.protocol)) return { valid: false, url: trimmed };
    if (!parsed.hostname || !parsed.hostname.includes('.')) return { valid: false, url: trimmed };
    return { valid: true, url: parsed.href };
  } catch {
    return { valid: false, url: raw.trim() };
  }
}

export function deduplicateUrls(urls) {
  const seen = new Set();
  const result = [];
  for (const url of urls) {
    const normalized = url.toLowerCase().replace(/\/+$/, '');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(url);
    }
  }
  return result;
}

export function parseUrlList(text) {
  return text
    .split(/[\n,\s]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}
