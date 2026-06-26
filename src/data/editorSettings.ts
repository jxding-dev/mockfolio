import { DEVICE_PRESETS } from './devices';
import type { AppMode, BgStyle, FrameColor, FrameId } from '../types';

export interface EditorSettings {
  projectName: string;
  activeMode: AppMode;
  selectedDeviceId: string;
  fitMode: 'fit' | 'fill' | 'original';
  inspectOrientation: 'portrait' | 'landscape';
  showGuides: boolean;
  showGrid: boolean;
  showCenter: boolean;
  showMargins: boolean;
  inspectSource: 'image' | 'url';
  urlInput: string;
  previewUrl: string;
  previewWidth: number;
  previewHeight: number;
  frameId: FrameId;
  frameColor: FrameColor;
  bgStyle: BgStyle;
  shadowIntensity: number;
  frameCornerRadius: number;
  mockupScale: number;
  mockupOffsetX: number;
  mockupOffsetY: number;
  mockupTitle: string;
  mockupSubtitle: string;
  mockupTags: string;
  mockupTextPosition: 'top' | 'bottom' | 'none';
  showMockupDate: boolean;
  mockupTextColor: string;
  compareOrientation: 'horizontal' | 'vertical';
  exportScale: 1 | 2;
  transparentBg: boolean;
  selectedMockupId: string;
  compositeX: number;
  compositeY: number;
  compositeScale: number;
  compositeRotation: number;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  projectName: '내 프로젝트',
  activeMode: 'inspect',
  selectedDeviceId: DEVICE_PRESETS[1].id,
  fitMode: 'fit',
  inspectOrientation: 'portrait',
  showGuides: false,
  showGrid: false,
  showCenter: false,
  showMargins: false,
  inspectSource: 'image',
  urlInput: '',
  previewUrl: '',
  previewWidth: 390,
  previewHeight: 844,
  frameId: 'browser',
  frameColor: 'light',
  bgStyle: 'soft-gradient',
  shadowIntensity: 60,
  frameCornerRadius: 8,
  mockupScale: 1,
  mockupOffsetX: 0,
  mockupOffsetY: 0,
  mockupTitle: '',
  mockupSubtitle: '',
  mockupTags: '',
  mockupTextPosition: 'none',
  showMockupDate: false,
  mockupTextColor: '#1A1D24',
  compareOrientation: 'horizontal',
  exportScale: 2,
  transparentBg: false,
  selectedMockupId: '',
  compositeX: 0,
  compositeY: 0,
  compositeScale: 1,
  compositeRotation: 0,
};

const APP_MODES: AppMode[] = ['inspect', 'mockup', 'compare', 'export'];
const FIT_MODES = ['fit', 'fill', 'original'] as const;
const FRAME_IDS: FrameId[] = ['none', 'phone-solo', 'browser', 'laptop', 'tablet', 'phone-desktop', 'cover-card'];
const FRAME_COLORS: FrameColor[] = ['light', 'dark', 'silver'];
const BACKGROUNDS: BgStyle[] = ['white', 'soft-gradient', 'dark-studio', 'warm-neutral', 'paper-texture', 'glass-panel'];
const TEXT_POSITIONS = ['top', 'bottom', 'none'] as const;
const COMPARE_ORIENTATIONS = ['horizontal', 'vertical'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function enumValue<T extends string | number>(value: unknown, values: readonly T[], fallback: T): T {
  return (typeof value === 'string' || typeof value === 'number') && values.includes(value as T) ? value as T : fallback;
}

function textValue(value: unknown, fallback: string, maxLength: number): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function numberValue(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export function normalizeEditorSettings(value: unknown): EditorSettings {
  const source = isRecord(value) ? value : {};

  return {
    projectName: textValue(source.projectName, DEFAULT_EDITOR_SETTINGS.projectName, 80),
    activeMode: enumValue(source.activeMode, APP_MODES, DEFAULT_EDITOR_SETTINGS.activeMode),
    selectedDeviceId: enumValue(source.selectedDeviceId, DEVICE_PRESETS.map((device) => device.id), DEFAULT_EDITOR_SETTINGS.selectedDeviceId),
    fitMode: enumValue(source.fitMode, FIT_MODES, DEFAULT_EDITOR_SETTINGS.fitMode),
    inspectOrientation: enumValue(source.inspectOrientation, ['portrait', 'landscape'], DEFAULT_EDITOR_SETTINGS.inspectOrientation),
    showGuides: booleanValue(source.showGuides, DEFAULT_EDITOR_SETTINGS.showGuides),
    showGrid: booleanValue(source.showGrid, DEFAULT_EDITOR_SETTINGS.showGrid),
    showCenter: booleanValue(source.showCenter, DEFAULT_EDITOR_SETTINGS.showCenter),
    showMargins: booleanValue(source.showMargins, DEFAULT_EDITOR_SETTINGS.showMargins),
    inspectSource: enumValue(source.inspectSource, ['image', 'url'], DEFAULT_EDITOR_SETTINGS.inspectSource),
    urlInput: textValue(source.urlInput, DEFAULT_EDITOR_SETTINGS.urlInput, 2048),
    previewUrl: textValue(source.previewUrl, DEFAULT_EDITOR_SETTINGS.previewUrl, 2048),
    previewWidth: numberValue(source.previewWidth, DEFAULT_EDITOR_SETTINGS.previewWidth, 240, 1920),
    previewHeight: numberValue(source.previewHeight, DEFAULT_EDITOR_SETTINGS.previewHeight, 240, 1920),
    frameId: enumValue(source.frameId, FRAME_IDS, DEFAULT_EDITOR_SETTINGS.frameId),
    frameColor: enumValue(source.frameColor, FRAME_COLORS, DEFAULT_EDITOR_SETTINGS.frameColor),
    bgStyle: enumValue(source.bgStyle, BACKGROUNDS, DEFAULT_EDITOR_SETTINGS.bgStyle),
    shadowIntensity: numberValue(source.shadowIntensity, DEFAULT_EDITOR_SETTINGS.shadowIntensity, 0, 100),
    frameCornerRadius: numberValue(source.frameCornerRadius, DEFAULT_EDITOR_SETTINGS.frameCornerRadius, 0, 40),
    mockupScale: numberValue(source.mockupScale, DEFAULT_EDITOR_SETTINGS.mockupScale, 0.6, 1.3),
    mockupOffsetX: numberValue(source.mockupOffsetX, DEFAULT_EDITOR_SETTINGS.mockupOffsetX, -160, 160),
    mockupOffsetY: numberValue(source.mockupOffsetY, DEFAULT_EDITOR_SETTINGS.mockupOffsetY, -160, 160),
    mockupTitle: textValue(source.mockupTitle, DEFAULT_EDITOR_SETTINGS.mockupTitle, 120),
    mockupSubtitle: textValue(source.mockupSubtitle, DEFAULT_EDITOR_SETTINGS.mockupSubtitle, 240),
    mockupTags: textValue(source.mockupTags, DEFAULT_EDITOR_SETTINGS.mockupTags, 160),
    mockupTextPosition: enumValue(source.mockupTextPosition, TEXT_POSITIONS, DEFAULT_EDITOR_SETTINGS.mockupTextPosition),
    showMockupDate: booleanValue(source.showMockupDate, DEFAULT_EDITOR_SETTINGS.showMockupDate),
    mockupTextColor: /^#[0-9a-f]{6}$/i.test(String(source.mockupTextColor)) ? String(source.mockupTextColor) : DEFAULT_EDITOR_SETTINGS.mockupTextColor,
    compareOrientation: enumValue(source.compareOrientation, COMPARE_ORIENTATIONS, DEFAULT_EDITOR_SETTINGS.compareOrientation),
    exportScale: enumValue(source.exportScale, [1, 2] as const, DEFAULT_EDITOR_SETTINGS.exportScale),
    transparentBg: booleanValue(source.transparentBg, DEFAULT_EDITOR_SETTINGS.transparentBg),
    selectedMockupId: textValue(source.selectedMockupId, DEFAULT_EDITOR_SETTINGS.selectedMockupId, 80),
    compositeX: numberValue(source.compositeX, DEFAULT_EDITOR_SETTINGS.compositeX, -100, 100),
    compositeY: numberValue(source.compositeY, DEFAULT_EDITOR_SETTINGS.compositeY, -100, 100),
    compositeScale: numberValue(source.compositeScale, DEFAULT_EDITOR_SETTINGS.compositeScale, 0.1, 3),
    compositeRotation: numberValue(source.compositeRotation, DEFAULT_EDITOR_SETTINGS.compositeRotation, -180, 180),
  };
}
