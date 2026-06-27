import { describe, it, expect } from 'vitest';
import { normalizeImageUrl } from './useImageUpload';

describe('normalizeImageUrl', () => {
  it('prefixes https:// and accepts https image URLs', () => {
    expect(normalizeImageUrl('example.com/a.png')).toBe('https://example.com/a.png');
    expect(normalizeImageUrl('https://cdn.example.com/x.webp')).toBe('https://cdn.example.com/x.webp');
  });

  it('rejects non-https (http) URLs — https only', () => {
    expect(normalizeImageUrl('http://example.com/a.png')).toBeNull();
  });

  it('rejects dangerous schemes', () => {
    expect(normalizeImageUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeImageUrl('data:image/png;base64,AAAA')).toBeNull();
  });

  it('rejects empty and over-length input', () => {
    expect(normalizeImageUrl('')).toBeNull();
    expect(normalizeImageUrl('https://example.com/' + 'a'.repeat(3000))).toBeNull();
  });
});
