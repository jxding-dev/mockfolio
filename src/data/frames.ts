import type { FrameId } from '../types';

export interface FrameMeta {
  id: FrameId;
  label: string;
  icon: string;
  description: string;
}

export const FRAMES: FrameMeta[] = [
  { id: 'none',         label: 'No Frame',       icon: '◻',  description: '프레임 없이 이미지만' },
  { id: 'phone-solo',   label: 'Phone',           icon: '📱', description: '스마트폰 단독 프레임' },
  { id: 'browser',      label: 'Browser',         icon: '🌐', description: '크롬 스타일 브라우저' },
  { id: 'laptop',       label: 'Laptop',          icon: '💻', description: '맥북 스타일 노트북' },
  { id: 'tablet',       label: 'Tablet',          icon: '📲', description: '아이패드 스타일 태블릿' },
  { id: 'phone-desktop',label: 'Phone + Desktop', icon: '🖥',  description: '폰과 데스크탑 콤보' },
  { id: 'cover-card',   label: 'Cover Card',      icon: '✦',  description: '포트폴리오 커버 카드' },
];
