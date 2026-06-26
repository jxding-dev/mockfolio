# Mockfolio — Portfolio Mockup Builder

반응형 검수부터 포트폴리오 목업 제작까지, 한 번에.

## 프로젝트 소개

Mockfolio는 웹/앱 화면 캡처 이미지를 업로드해서:

1. 모바일/태블릿/데스크탑 크기로 반응형 검수
2. 제공된 목업 프레임에 화면을 넣어 포트폴리오용 이미지 제작
3. 고해상도 PNG로 내보내기

를 할 수 있는 **로컬 전용 웹 도구**입니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 반응형 Inspect | 360px ~ 1920px 8종 디바이스로 즉시 확인 |
| Before / After | 수정 전후 슬라이더 비교 |
| Mockup Editor | CSS/SVG 기반 프레임, 배경, 그림자 조절 |
| PNG Export | 1× / 2× 고해상도 저장 |
| 완전 로컬 처리 | 이미지가 서버로 전송되지 않음 |

## 기술 스택

- **React 19** + **TypeScript**
- **Vite 8**
- **React Router DOM 7**
- **html-to-image** (PNG 내보내기)
- CSS Modules (스파게티 코드 방지)
- LocalStorage 기반 데이터 저장

## 설치 방법

```bash
git clone https://github.com/jxding-dev/mockfolio.git
cd mockfolio
npm install
```

## 실행 방법

```bash
# 개발 서버 (권장)
npm run dev

# 또는 Windows에서 run.bat 더블클릭
```

브라우저에서 `http://localhost:5173` 접속

## 빌드 방법

```bash
npm run build
npm run preview
```

## 폴더 구조

```
src/
├── components/
│   ├── layout/      # Header, Footer
│   ├── upload/      # 이미지 업로드
│   ├── inspector/   # 반응형 검수 (2단계~)
│   ├── mockup/      # 목업 에디터 (3단계~)
│   ├── export/      # PNG 내보내기 (4단계~)
│   ├── pricing/     # 요금제 UI (Coming Soon)
│   └── ui/          # 공통 컴포넌트 (Button, Modal, Badge)
├── pages/           # Landing, Editor, Pricing
├── hooks/           # useProject, useImageUpload, useLocalStorage
├── utils/           # export 유틸
├── data/            # 디바이스 프리셋, 플랜 데이터, 프레임 데이터
├── types/           # TypeScript 타입 정의
└── styles/          # tokens.css (디자인 토큰), reset.css

public/
├── mockups/         # 추후 직접 제작한 목업 이미지 추가 위치
└── samples/         # 샘플 이미지
```

## 현재 제한 사항

- 1단계: 구조 및 기본 화면만 구현됨
- 에디터 기능은 2~8단계에서 순차적으로 추가 예정
- 로그인/결제 기능 미구현 (Coming Soon UI만)
- 서버 없음, 클라우드 저장 없음

## 추후 예정 기능

- [ ] 이미지 업로드 및 에디터 (2~3단계)
- [ ] 반응형 Inspect Mode (5단계)
- [ ] Before/After 비교 (6단계)
- [ ] Mockup Mode (7단계)
- [ ] PNG Export (8단계)
- [ ] Pro/Studio 유료 플랜 (별도 백엔드 연동 예정)

## 개인정보 보호

🔒 **No AI · No Server Upload · Local First**

모든 이미지는 브라우저 내에서만 처리됩니다. 외부 서버로 전송되지 않습니다.
AI 이미지 분석 또는 생성 기능이 없습니다. 결제 및 로그인 기능은 현재 미구현입니다.
