// ─── Email Extraction ──────────────────────────────────────────────────────────
const EMAIL_REGEX = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;
const EMAIL_BLACKLIST = ['example.com', 'domain.com', 'yourdomain.com', 'email.com', 'test.com', 'sentry.io', 'wixpress.com'];

export function extractEmails(text) {
  const matches = text.match(EMAIL_REGEX) || [];
  return matches
    .filter(e => !EMAIL_BLACKLIST.some(b => e.endsWith(b)))
    .filter(e => !e.startsWith('no-reply') && !e.startsWith('noreply') && !e.startsWith('donotreply'))
    .map(e => e.toLowerCase());
}

export function getBestEmail(emails) {
  if (!emails || emails.length === 0) return 'Not Available';
  const preferred = ['info@', 'contact@', 'hello@', 'enquiries@', 'admin@', 'support@'];
  for (const prefix of preferred) {
    const match = emails.find(e => e.startsWith(prefix));
    if (match) return match;
  }
  return emails[0];
}

// ─── Phone Extraction ──────────────────────────────────────────────────────────
const PHONE_PATTERNS = [
  // UK landline & mobile
  /(\+44\s?[\d\s\-()]{9,14})/g,
  /(0[1-9]\d{2,4}[\s\-]?\d{3,6}[\s\-]?\d{0,6})/g,
  // US
  /(\+1[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})/g,
  /(\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})/g,
  // International
  /(\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{0,4})/g,
];

export function extractPhones(text) {
  const found = new Set();
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern) || [];
    for (const m of matches) {
      const cleaned = m.trim().replace(/\s+/g, ' ');
      if (cleaned.replace(/\D/g, '').length >= 7) {
        found.add(cleaned);
      }
    }
  }
  return [...found];
}

export function getBestPhone(phones) {
  if (!phones || phones.length === 0) return 'Not Available';
  // Prefer numbers starting with + (international)
  const intl = phones.find(p => p.startsWith('+'));
  return intl || phones[0];
}

// ─── Social Media Extraction ───────────────────────────────────────────────────
const SOCIAL_PATTERNS = {
  linkedin: /https?:\/\/(www\.)?linkedin\.com\/(company|in|school)\/[a-zA-Z0-9\-_.%]+\/?/gi,
  facebook: /https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9\-_.%]+\/?/gi,
  instagram: /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9\-_.%]+\/?/gi,
  twitter: /https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?/gi,
};

const SOCIAL_BLACKLIST = ['share', 'sharer', 'intent', 'login', 'signup', 'home', 'explore', 'search'];

function cleanSocialUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/$/, '');
  } catch {
    return url;
  }
}

function isSocialBlacklisted(url, platform) {
  const lower = url.toLowerCase();
  return SOCIAL_BLACKLIST.some(word => lower.includes(`/${word}`));
}

export function extractSocials(html) {
  const result = {
    linkedin: 'Not Available',
    facebook: 'Not Available',
    instagram: 'Not Available',
    twitter: 'Not Available',
  };
  for (const [platform, pattern] of Object.entries(SOCIAL_PATTERNS)) {
    const matches = html.match(pattern) || [];
    const valid = matches
      .map(cleanSocialUrl)
      .filter(u => !isSocialBlacklisted(u, platform));
    if (valid.length > 0) result[platform] = valid[0];
  }
  return result;
}

// ─── Company Name Extraction ───────────────────────────────────────────────────
export function extractCompanyName($, html) {
  // 1. OG site name
  const ogSiteName = $('meta[property="og:site_name"]').attr('content');
  if (ogSiteName && ogSiteName.length > 1) return ogSiteName.trim();

  // 2. OG title (strip taglines)
  const ogTitle = $('meta[property="og:title"]').attr('content');
  if (ogTitle) {
    const stripped = ogTitle.split(/[\|\-–—:]/)[0].trim();
    if (stripped.length > 1 && stripped.length < 80) return stripped;
  }

  // 3. Twitter title
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  if (twitterTitle) {
    const stripped = twitterTitle.split(/[\|\-–—:]/)[0].trim();
    if (stripped.length > 1 && stripped.length < 80) return stripped;
  }

  // 4. Page title
  const title = $('title').text();
  if (title) {
    const stripped = title.split(/[\|\-–—:]/)[0].trim();
    if (stripped.length > 1 && stripped.length < 80) return stripped;
  }

  // 5. H1
  const h1 = $('h1').first().text().trim();
  if (h1 && h1.length > 1 && h1.length < 80) return h1;

  // 6. Schema.org
  const schemaMatch = html.match(/"name"\s*:\s*"([^"]{2,80})"/);
  if (schemaMatch) return schemaMatch[1].trim();

  return 'Not Available';
}
