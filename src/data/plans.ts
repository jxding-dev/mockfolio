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
    badge: '곧 출시',
    cta: 'Pro 결과 예시 보기',
    note: '정식 출시 전까지는 카드 정보를 받지 않아요.',
    features: [
      '무제한 실사·디바이스 목업',
      '고화질(2x·4x) PNG Export',
      'Before / After GIF 저장',
      '프리미엄 목업 50종+',
      '커스텀 PNG 목업 업로드',
      '상업적 사용 + 우선 업데이트',
    ],
  },
];
