import { useEffect, useState } from 'react';
import type { MockupAsset } from '../data/mockups';

interface MockupManifest {
  mockups?: unknown;
}

function isMockupAsset(value: unknown): value is { id: string; label: string; src: string } {
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
        setAssets(mockups.filter(isMockupAsset).map((asset) => ({
          id: asset.id.slice(0, 80),
          label: asset.label.slice(0, 80),
          src: `${base}${asset.src.replace(/^\/+/, '')}`,
        })));
      })
      .catch(() => active && setAssets([]))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, []);

  return { assets, loading };
}
