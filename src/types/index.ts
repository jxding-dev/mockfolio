/* ============================================================
   Mockfolio — Global Types
   ============================================================ */

// ── App Mode ─────────────────────────────────────────────────
export type AppMode = 'inspect' | 'mockup' | 'compare' | 'export';

// ── Device ───────────────────────────────────────────────────
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

export interface DevicePreset {
  id: string;
  label: string;
  category: DeviceCategory;
  width: number;
  height: number;
}

// ── Image ────────────────────────────────────────────────────
export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  size: number;          // bytes
  uploadedAt: number;
}

// ── Mockup ───────────────────────────────────────────────────
export type FrameId =
  | 'none'
  | 'phone-solo'
  | 'browser'
  | 'laptop'
  | 'tablet'
  | 'phone-desktop'
  | 'cover-card';

export type FrameColor = 'light' | 'dark' | 'silver';

export type BgStyle =
  | 'white'
  | 'soft-gradient'
  | 'dark-studio'
  | 'warm-neutral'
  | 'paper-texture'
  | 'glass-panel';

// ── Plan ─────────────────────────────────────────────────────
export type PlanId = 'free' | 'pro' | 'studio';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  description: string;
  features: string[];
  available: boolean;
}
