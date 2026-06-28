import type { Plan } from '../types';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '계속 무료',
    description: '로그인 없이 바로 쓰는 핵심 제작 기능',
    available: true,
    badge: '지금 사용 가능',
    cta: '무료로 시작',
    features: [
      '이미지 업로드 및 로컬 편집',
      '모바일·태블릿·데스크탑 반응형 검수',
      'URL iframe 미리보기',
      'Before / After 비교와 GIF 저장',
      '기본 목업 합성 및 PNG 내보내기',
      '서버 업로드 없음 · AI 연결 없음',
    ],
  },
  {
    id: 'thirty-day',
    name: '30일 이용권',
    price: 9900,
    period: '30일',
    description: '정식 결제 연동 후 제공할 상업용 확장 플랜',
    available: false,
    highlighted: true,
    badge: '결제 준비 중',
    cta: '출시 준비 안내 보기',
    note: '로그인·결제 연동 전까지 실제 과금은 발생하지 않습니다.',
    features: [
      'Free의 모든 기능',
      '상업용 목업 카테고리 확장',
      '여러 이미지 레이어 합성 작업',
      '고급 변형·투명 PNG 목업 합성',
      '프로젝트 저장/관리 기능 준비',
      '정식 출시 후 30일 단위 이용',
    ],
  },
];
