import type { BgStyle } from '../types';

export interface BgMeta {
  id: BgStyle;
  label: string;
  /** CSS background value (used both for swatch + scene) */
  css: string;
  /** true when frame/text should switch to light-on-dark */
  dark: boolean;
}

export const BACKGROUNDS: BgMeta[] = [
  {
    id: 'white',
    label: '화이트',
    css: '#ffffff',
    dark: false,
  },
  {
    id: 'soft-gradient',
    label: '소프트',
    css: 'linear-gradient(135deg, #e8eaf6 0%, #ede7f6 50%, #fce4ec 100%)',
    dark: false,
  },
  {
    id: 'dark-studio',
    label: '다크',
    css: 'radial-gradient(circle at 50% 0%, #2a2d3a 0%, #16181f 70%)',
    dark: true,
  },
  {
    id: 'warm-neutral',
    label: '웜',
    css: 'linear-gradient(135deg, #f5ede4 0%, #efe2d3 100%)',
    dark: false,
  },
  {
    id: 'mesh',
    label: '메쉬',
    css: 'radial-gradient(at 20% 20%, #a5b4fc 0px, transparent 50%), radial-gradient(at 80% 0%, #f0abfc 0px, transparent 50%), radial-gradient(at 80% 80%, #818cf8 0px, transparent 50%), radial-gradient(at 0% 80%, #c4b5fd 0px, transparent 50%), #eef2ff',
    dark: false,
  },
];

export function getBackground(id: BgStyle, customColor?: string): BgMeta {
  const found = BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
  if (customColor && id === 'white') {
    return { ...found, css: customColor };
  }
  return found;
}
