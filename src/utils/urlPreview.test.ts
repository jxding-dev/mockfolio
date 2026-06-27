import { describe, it, expect } from 'vitest';
import { normalizePreviewUrl } from './urlPreview';

describe('normalizePreviewUrl', () => {
  it('prefixes https:// when no scheme is given', () => {
    expect(normalizePreviewUrl('example.com')).toBe('https://example.com/');
  });

  it('keeps http and https schemes', () => {
    expect(normalizePreviewUrl('http://example.com')).toBe('http://example.com/');
    expect(normalizePreviewUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('rejects dangerous schemes', () => {
    expect(normalizePreviewUrl('javascript:alert(1)')).toBeNull();
    expect(normalizePreviewUrl('data:text/html,<script>')).toBeNull();
    expect(normalizePreviewUrl('file:///etc/passwd')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(normalizePreviewUrl('')).toBeNull();
    expect(normalizePreviewUrl('   ')).toBeNull();
  });
});
