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

// ── Mockup item (one framed image in the multi-image scene) ──
// Transient (holds a dataUrl), so it is not persisted to localStorage.
export interface MockupItem {
  id: string;
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  frameId: FrameId;
  frameColor: FrameColor;
  x: number;             // % offset from scene center (-50..50-ish)
  y: number;
  scale: number;         // 0.3 .. 1.6
  stretchX: number;
  stretchY: number;
  rotation: number;
  skewX: number;
  skewY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
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
export type PlanId = 'free' | 'thirty-day';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;            // KRW per 30-day cycle (0 = free)
  period: string;
  description: string;
  features: string[];
  available: boolean;       // false = Coming Soon (auth/payment added later)
  highlighted?: boolean;
  badge?: string;
  note?: string;
  cta: string;
}
