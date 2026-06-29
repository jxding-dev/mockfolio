import { PRO_MONTHLY_PRICE_KRW, PlanTier } from '../domain/plans';
import type { Plan } from '../types';

export const PLANS: Plan[] = [
  {
    id: PlanTier.Free,
    name: 'Free',
    price: 0,
    period: '계속 무료',
    description: '서비스를 바로 체험하고 기본 결과물을 만들 수 있는 플랜',
    available: true,
    badge: '무료 사용 가능',
    cta: '무료로 시작',
    features: [
      'URL Preview',
      '기본 목업',
      'PNG 저장',
      '일부 프레임',
      '브라우저 로컬 처리',
    ],
  },
  {
    id: PlanTier.Pro,
    name: 'Pro',
    price: PRO_MONTHLY_PRICE_KRW,
    period: '월',
    description: '상업용 목업 제작과 고급 Export를 위한 운영형 플랜',
    available: false,
    highlighted: true,
    badge: '출시 준비 중',
    cta: 'Pro 미리보기',
    note: '현재는 플랜 미리보기 단계이며 실제 과금은 발생하지 않습니다.',
    features: [
      '모든 목업',
      'Before / After GIF',
      '고화질 Export',
      'Premium Mockups',
      '커스텀 PNG 목업',
      '향후 추가 기능 포함',
    ],
  },
];
