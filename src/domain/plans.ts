import type { PlanId } from '../types';

export const PlanTier = {
  Free: 'free',
  Pro: 'pro',
} as const satisfies Record<string, PlanId>;

export type PlanTier = (typeof PlanTier)[keyof typeof PlanTier];

export const PLAN_LABELS: Record<PlanTier, string> = {
  [PlanTier.Free]: 'Free',
  [PlanTier.Pro]: 'Pro',
};

export const PRO_MONTHLY_PRICE_KRW = 9900;

