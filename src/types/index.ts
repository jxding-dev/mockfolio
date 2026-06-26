/* ============================================================
   Mockfolio — Global Types
   ============================================================ */

// ── App Mode ─────────────────────────────────────────────────
export type AppMode = 'inspect' | 'mockup' | 'compare' | 'export';

// ── Device ───────────────────────────────────────────────────
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface DevicePreset {
  id: string;
  label: string;
  category: DeviceCategory;
  width: number;
  height: number;
  dpr?: number;
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

export type FitMode = 'fit' | 'fill' | 'original';

export interface MockupSettings {
  frameId: FrameId;
  frameColor: FrameColor;
  bgStyle: BgStyle;
  cornerRadius: number;      // px
  shadowIntensity: number;   // 0-100
  scale: number;             // 0.3-1.5
  offsetX: number;
  offsetY: number;
  title: string;
  subtitle: string;
  tags: string;
  showDate: boolean;
  textPosition: 'top' | 'bottom' | 'none';
  textColor: string;
}

// ── Inspect ──────────────────────────────────────────────────
export interface InspectGuides {
  safeArea: boolean;
  grid8: boolean;
  centerline: boolean;
  margins: boolean;
}

export interface InspectSettings {
  deviceId: string;
  orientation: Orientation;
  fitMode: FitMode;
  guides: InspectGuides;
}

// ── Project ──────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  imageId: string | null;
  beforeImageId: string | null;
  afterImageId: string | null;
  mockupSettings: MockupSettings;
  inspectSettings: InspectSettings;
  activeMode: AppMode;
  createdAt: number;
  updatedAt: number;
}

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
