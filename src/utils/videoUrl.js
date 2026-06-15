const ALLOWED_HOST_PATTERNS = [
  /(^|\.)youtube\.com$/i,
  /^youtu\.be$/i,
  /(^|\.)tiktok\.com$/i,
  /(^|\.)instagram\.com$/i,
  /(^|\.)facebook\.com$/i,
  /^fb\.watch$/i,
];

const INVISIBLE_CHARS = /[\u200B-\u200D\uFEFF\u2060\u00A0\u202A-\u202E]/g;
const URL_IN_TEXT =
  /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
const BARE_DOMAIN =
  /^(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|youtube\.com|youtu\.be|instagram\.com|facebook\.com|fb\.watch)\/[^\s]+/i;

function stripInvisible(text) {
  return String(text).replace(INVISIBLE_CHARS, '').trim();
}

function extractHostname(urlString) {
  const match = String(urlString).match(/^https?:\/\/([^/?#]+)/i);
  if (!match) return '';

  const authority = match[1];
  const hostPort = authority.includes('@') ? authority.split('@').pop() : authority;
  return hostPort.split(':')[0].toLowerCase().replace(/^www\./, '');
}

function isAllowedHostname(hostname) {
  if (!hostname) return false;
  const host = hostname.toLowerCase().replace(/^www\./, '');
  return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(host));
}

/** Clean pasted share text into a single video URL */
export function normalizeVideoUrlInput(raw) {
  if (!raw) return '';

  let text = stripInvisible(raw);

  const embedded = text.match(URL_IN_TEXT);
  if (embedded?.length) {
    text = embedded.find((part) => isAllowedHostname(extractHostname(part))) || embedded[0];
  } else if (BARE_DOMAIN.test(text)) {
    text = `https://${text}`;
  }

  return text.replace(/[.,;:!?)]+$/, '').trim();
}

export function detectPlatform(urlString) {
  const normalized = normalizeVideoUrlInput(urlString);
  if (!normalized) return 'unknown';

  const host = extractHostname(normalized);
  if (!host) return 'unknown';

  if (host.includes('youtu')) return 'youtube';
  if (host.includes('tiktok')) return 'tiktok';
  if (host.includes('instagram')) return 'instagram';
  if (host.includes('facebook') || host.includes('fb.watch')) return 'facebook';

  return 'unknown';
}

export function isSupportedVideoUrl(urlString) {
  const normalized = normalizeVideoUrlInput(urlString);
  if (!normalized) return false;
  if (!/^https?:\/\//i.test(normalized)) return false;

  return isAllowedHostname(extractHostname(normalized));
}

export const PLATFORM_LABELS = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  facebook: 'Facebook',
};
