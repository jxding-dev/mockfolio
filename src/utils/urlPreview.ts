export function normalizePreviewUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function openPreviewWindow(url: string) {
  const previewWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (previewWindow) previewWindow.opener = null;
}
