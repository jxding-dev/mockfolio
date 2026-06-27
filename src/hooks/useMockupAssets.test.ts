import { describe, it, expect } from 'vitest';
import { safeMockupSource } from './useMockupAssets';

describe('safeMockupSource (path-traversal guard)', () => {
  it('accepts valid overlay paths', () => {
    expect(safeMockupSource('mockups/overlays/app/phone.png')).toBe('mockups/overlays/app/phone.png');
    expect(safeMockupSource('/mockups/overlays/web/site.png')).toBe('mockups/overlays/web/site.png');
    expect(safeMockupSource('mockups\\overlays\\app\\x.png')).toBe('mockups/overlays/app/x.png');
  });

  it('rejects path traversal', () => {
    expect(safeMockupSource('mockups/overlays/../secret.png')).toBeNull();
    expect(safeMockupSource('mockups/overlays/a/../../etc/passwd')).toBeNull();
  });

  it('rejects paths outside the overlays folder', () => {
    expect(safeMockupSource('etc/passwd')).toBeNull();
    expect(safeMockupSource('mockups/images/x.png')).toBeNull();
  });

  it('rejects absolute URLs and protocols', () => {
    expect(safeMockupSource('https://evil.com/x.png')).toBeNull();
    expect(safeMockupSource('data:image/png;base64,AAAA')).toBeNull();
  });
});
