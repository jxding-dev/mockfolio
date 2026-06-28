import { PlanTier, type PlanTier as PlanTierValue } from './plans';

export const FeatureKey = {
  UrlPreview: 'url-preview',
  BasicMockups: 'basic-mockups',
  PngExport: 'png-export',
  BasicFrames: 'basic-frames',
  AllMockups: 'all-mockups',
  BeforeAfterGif: 'before-after-gif',
  HighQualityExport: 'high-quality-export',
  PremiumMockups: 'premium-mockups',
  CustomPngMockups: 'custom-png-mockups',
  FutureFeatures: 'future-features',
} as const;

export type FeatureKey = (typeof FeatureKey)[keyof typeof FeatureKey];

export interface FeatureDefinition {
  key: FeatureKey;
  label: string;
  minimumPlan: PlanTierValue;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  { key: FeatureKey.UrlPreview, label: 'URL Preview', minimumPlan: PlanTier.Free },
  { key: FeatureKey.BasicMockups, label: '기본 목업', minimumPlan: PlanTier.Free },
  { key: FeatureKey.PngExport, label: 'PNG 저장', minimumPlan: PlanTier.Free },
  { key: FeatureKey.BasicFrames, label: '일부 프레임', minimumPlan: PlanTier.Free },
  { key: FeatureKey.AllMockups, label: '모든 목업', minimumPlan: PlanTier.Pro },
  { key: FeatureKey.BeforeAfterGif, label: 'Before / After GIF', minimumPlan: PlanTier.Pro },
  { key: FeatureKey.HighQualityExport, label: '고화질 Export', minimumPlan: PlanTier.Pro },
  { key: FeatureKey.PremiumMockups, label: 'Premium Mockups', minimumPlan: PlanTier.Pro },
  { key: FeatureKey.CustomPngMockups, label: '커스텀 PNG 목업', minimumPlan: PlanTier.Pro },
  { key: FeatureKey.FutureFeatures, label: '향후 추가 기능 포함', minimumPlan: PlanTier.Pro },
];

export function canUseFeature(plan: PlanTierValue, feature: FeatureKey): boolean {
  const definition = FEATURE_DEFINITIONS.find((item) => item.key === feature);
  if (!definition) return false;
  if (definition.minimumPlan === PlanTier.Free) return true;
  return plan === PlanTier.Pro;
}

