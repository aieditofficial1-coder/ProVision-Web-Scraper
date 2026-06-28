import * as cheerio from 'cheerio';
import axios from 'axios';
import { browserPool } from '../utils/browserPool.js';
import {
  extractEmails, getBestEmail,
  extractPhones, getBestPhone,
  extractSocials,
  extractCompanyName,
} from './extractors.js';
import { detectIndustry } from './industryDetector.js';

const PAGES_TO_CHECK = ['', '/contact', '/contact-us', '/about', '/about-us', '/team'];
const AXIOS_TIMEOUT = 12000;
const PW_TIMEOUT = 18000;
const PW_NAV_TIMEOUT = 15000;

// ─── Axios fetch (fast path) ───────────────────────────────────────────────────
async function fetchWithAxios(url) {
  const res = await axios.get(url, {
    timeout: AXIOS_TIMEOUT,
    maxRedirects: 6,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
    decompress: true,
    responseType: 'text',
    validateStatus: s => s < 500,
  });
  if (typeof res.data !== 'string') throw new Error('Non-text response');
  if (res.data.length < 200) throw new Error('Response too short');
  return res.data;
}

// ─── Playwright fetch (fallback for JS-heavy sites) ───────────────────────────
async function fetchWithPlaywright(url) {
  return browserPool.runInContext(async (page) => {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: PW_NAV_TIMEOUT,
    });
    // Brief wait for dynamic content
    await page.waitForTimeout(800).catch(() => {});
    return page.content();
  });
}

// ─── Single page fetch with smart retry ───────────────────────────────────────
async function fetchPage(url) {
  // Attempt 1: Axios (fast, low memory)
  try {
    const html = await fetchWithAxios(url);
    // Detect if site needs JS (empty body, framework shell, etc.)
    if (looksLikeJsShell(html)) throw new Error('JS shell detected');
    return { html, method: 'axios' };
  } catch (axiosErr) {
    // Attempt 2: Playwright (handles JS-rendered sites)
    try {
      const html = await fetchWithPlaywright(url);
      return { html, method: 'playwright' };
    } catch (pwErr) {
      throw pwErr;
    }
  }
}

function looksLikeJsShell(html) {
  const lower = html.toLowerCase();
  const bodyContent = lower.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const textOnly = bodyContent.replace(/<[^>]+>/g, '').trim();
  // If stripped text is very short relative to HTML size, it's likely a JS shell
  return textOnly.length < 100 && html.length > 500;
}

// ─── Multi-page crawl (homepage + sub-pages in parallel) ──────────────────────
async function fetchMultiplePages(baseUrl) {
  const base = baseUrl.replace(/\/$/, '');
  const htmlParts = [];
  let usedPlaywright = false;

  // Always fetch homepage first
  let homepageResult = null;
  try {
    homepageResult = await fetchPage(base);
    htmlParts.push(homepageResult.html);
    if (homepageResult.method === 'playwright') usedPlaywright = true;
  } catch {
    return { htmlParts: [], usedPlaywright: false };
  }

  // Sub-pages in parallel (skip homepage which is '')
  const subPaths = PAGES_TO_CHECK.filter(p => p !== '');
  const subResults = await Promise.allSettled(
    subPaths.map(async path => {
      const url = `${base}${path}`;
      const { html, method } = await fetchPage(url);
      return { html, method };
    })
  );

  for (const r of subResults) {
    if (r.status === 'fulfilled') {
      htmlParts.push(r.value.html);
      if (r.value.method === 'playwright') usedPlaywright = true;
    }
  }

  return { htmlParts, usedPlaywright };
}

// ─── Main scrape function ──────────────────────────────────────────────────────
export async function scrapeWebsite(rawUrl) {
  const result = {
    url: rawUrl,
    companyName: 'Not Available',
    industry: 'Not Available',
    email: 'Not Available',
    phone: 'Not Available',
    linkedin: 'Not Available',
    facebook: 'Not Available',
    instagram: 'Not Available',
    twitter: 'Not Available',
    status: 'Failed',
  };

  try {
    const { htmlParts } = await fetchMultiplePages(rawUrl);

    if (htmlParts.length === 0) {
      result.status = 'Website Unreachable';
      return result;
    }

    const primaryHtml = htmlParts[0];
    const combinedHtml = htmlParts.join('\n');

    const $ = cheerio.load(primaryHtml);
    const $combined = cheerio.load(combinedHtml);
    const textContent = $combined('body').text();

    result.companyName = extractCompanyName($, primaryHtml);
    result.industry = detectIndustry(textContent);

    const allEmails = extractEmails(combinedHtml);
    result.email = getBestEmail(allEmails);

    const allPhones = extractPhones(textContent);
    result.phone = getBestPhone(allPhones);

    const socials = extractSocials(combinedHtml);
    result.linkedin = socials.linkedin;
    result.facebook = socials.facebook;
    result.instagram = socials.instagram;
    result.twitter = socials.twitter;

    result.status = 'Success';
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    if (
      msg.includes('enotfound') ||
      msg.includes('econnrefused') ||
      msg.includes('econnreset') ||
      msg.includes('timeout') ||
      msg.includes('err_name_not_resolved') ||
      msg.includes('err_connection_refused') ||
      msg.includes('network')
    ) {
      result.status = 'Website Unreachable';
    } else {
      result.status = 'Failed';
    }
  }

  return result;
}
