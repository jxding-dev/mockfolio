export function normalizePreviewUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  // Validate the host the user actually typed — not the IDNA/punycode form the
  // URL constructor produces, which would let free text like "그냥 텍스트"
  // through as a bogus "https://xn--…" address.
  const rawHost = candidate
    .replace(/^[a-z][a-z\d+.-]*:\/\//i, '')
    .split(/[/?#]/)[0]
    .split('@').pop()!
    .split(':')[0];

  const isLocalhost = rawHost === 'localhost';
  const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(rawHost);
  // A plausible domain: no whitespace, ends in a 2+ letter TLD, has a dot.
  const isDomain = !/\s/.test(rawHost) && /\.[a-z]{2,}$/i.test(rawHost) && rawHost.length <= 253;

  if (!isLocalhost && !isIPv4 && !isDomain) return null;
  return url.toString();
}

export function openPreviewWindow(url: string) {
  const previewWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (previewWindow) previewWindow.opener = null;
}
