import { useEffect, useState } from 'react';
import type { MockupAsset } from '../data/mockups';

interface MockupManifest {
  mockups?: unknown;
}

export function safeMockupSource(value: string): string | null {
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
  if (
    !normalized.startsWith('mockups/overlays/')
    || normalized.includes('../')
    || normalized.includes('/..')
    || /^[a-z][a-z\d+.-]*:/i.test(normalized)
  ) {
    return null;
  }
  return normalized;
}

function isMockupAsset(value: unknown): value is {
  id: string;
  label: string;
  src: string;
  category?: string;
  description?: string;
  tags?: unknown;
} {
  return typeof value === 'object' && value !== null
    && typeof (value as Record<string, unknown>).id === 'string'
    && typeof (value as Record<string, unknown>).label === 'string'
    && typeof (value as Record<string, unknown>).src === 'string';
}

export function useMockupAssets() {
  const [assets, setAssets] = useState<MockupAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const base = import.meta.env.BASE_URL;
    fetch(`${base}mockups/manifest.json`)
      .then((response) => response.ok ? response.json() as Promise<MockupManifest> : { mockups: [] })
      .then((manifest) => {
        if (!active) return;
        const mockups = Array.isArray(manifest.mockups) ? manifest.mockups : [];
        setAssets(mockups.filter(isMockupAsset).flatMap((asset) => {
          const safeSource = safeMockupSource(asset.src);
          return safeSource ? [{
            id: asset.id.slice(0, 80),
            label: asset.label.slice(0, 80),
            src: `${base}${safeSource}`,
            category: typeof asset.category === 'string' ? asset.category.slice(0, 40) : '기본 목업',
            description: typeof asset.description === 'string' ? asset.description.slice(0, 160) : undefined,
            tags: Array.isArray(asset.tags)
              ? asset.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 6).map((tag) => tag.slice(0, 24))
              : undefined,
          }] : [];
        }));
      })
      .catch(() => active && setAssets([]))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, []);

  return { assets, loading };
}
