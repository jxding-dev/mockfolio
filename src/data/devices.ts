import type { DevicePreset } from '../types';

export const DEVICE_PRESETS: DevicePreset[] = [
  // Mobile
  { id: 'mobile-360', label: 'Mobile S (360)', category: 'mobile', width: 360,  height: 780 },
  { id: 'mobile-390', label: 'iPhone 14 (390)',category: 'mobile', width: 390,  height: 844 },
  { id: 'mobile-430', label: 'iPhone 14 Plus', category: 'mobile', width: 430,  height: 932 },
  // Tablet
  { id: 'tablet-768',  label: 'iPad (768)',    category: 'tablet', width: 768,  height: 1024 },
  { id: 'tablet-1024', label: 'iPad Landscape',category: 'tablet', width: 1024, height: 768 },
  // Desktop
  { id: 'desktop-1280', label: 'Laptop (1280)', category: 'desktop', width: 1280, height: 800 },
  { id: 'desktop-1440', label: 'Desktop (1440)',category: 'desktop', width: 1440, height: 900 },
  { id: 'desktop-1920', label: 'Full HD (1920)',category: 'desktop', width: 1920, height: 1080 },
];
