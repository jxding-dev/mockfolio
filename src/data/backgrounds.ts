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
    id: 'paper-texture',
    label: '페이퍼',
    css: 'repeating-linear-gradient(0deg, rgba(80, 61, 43, 0.025) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(80, 61, 43, 0.018) 0 1px, transparent 1px 5px), #f4efe7',
    dark: false,
  },
  {
    id: 'glass-panel',
    label: '글래스',
    css: 'radial-gradient(circle at 18% 16%, rgba(191, 219, 254, 0.95), transparent 34%), radial-gradient(circle at 86% 82%, rgba(221, 214, 254, 0.9), transparent 38%), linear-gradient(135deg, #eaf2ff 0%, #f7f2ff 100%)',
    dark: false,
  },
];

export function getBackground(id: BgStyle): BgMeta {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}
