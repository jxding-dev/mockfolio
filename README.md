# Mockfolio — Portfolio Mockup Builder

웹·앱 화면 캡처를 브라우저 안에서 검수하고, 포트폴리오용 목업 PNG로 저장하는 로컬 우선 도구입니다.

## 주요 기능

- **이미지 업로드**: PNG, JPG, JPEG, WebP 파일을 드래그 앤 드롭 또는 파일 선택으로 업로드합니다. 최대 파일 크기는 20MB, 최대 해상도는 4,000만 픽셀입니다.
- **반응형 Inspect**: 360px부터 1920px까지의 모바일·태블릿·데스크탑 프리셋, 세로/가로 전환, Fit/Fill/Original, 안전영역·8px 그리드·중앙선·여백 가이드를 제공합니다.
- **Before / After**: 수정 전후 이미지를 좌우 또는 상하 슬라이더로 비교합니다.
- **Mockup Editor**: 외부 목업 이미지 없이 CSS/HTML로 만든 Phone, Browser, Laptop, Tablet, Phone + Desktop, Cover Card 프레임을 제공합니다. 프레임 색상, 배경, 그림자, 모서리, 크기와 위치, 텍스트·태그·날짜를 조절할 수 있습니다.
- **Custom PNG Mockup**: 직접 만든 투명 PNG 목업 위에 업로드 이미지를 합성하고 위치·크기·회전을 조정한 뒤 합성 결과만 PNG로 저장합니다.
- **URL Preview & GIF**: URL을 지정한 디바이스 크기의 iframe으로 확인하고, Before/After 비교를 자동 슬라이드 GIF로 저장할 수 있습니다.
- **PNG Export**: 완성된 목업 캔버스를 1× 또는 2× PNG로 저장합니다. 파일명은 `mockfolio-프로젝트명-날짜.png` 형식으로 생성됩니다.
- **Coming Soon UI**: 로그인, Pro, Studio 플랜은 화면만 제공하며 실제 인증·결제·서버 기능은 없습니다.

## 로컬 처리 원칙

- 업로드한 이미지는 브라우저 메모리에서만 처리하며 외부 서버로 전송하지 않습니다.
- 설정값만 `localStorage`에 저장합니다. 이미지 원본은 저장하지 않습니다.
- AI, 이미지 생성, 외부 목업 이미지, 로그인, 결제 기능을 사용하지 않습니다.

## 기술 스택

- React 19 + TypeScript
- Vite 8
- React Router DOM 7
- html-to-image (PNG 내보내기)
- CSS Modules + 디자인 토큰

## 설치 및 실행

```bash
git clone https://github.com/jxding-dev/mockfolio.git
cd mockfolio
npm install
npm run dev
```

Windows PowerShell에서 실행 정책으로 `npm` 명령이 차단되면 `npm.cmd run dev`를 사용합니다.

## 빌드

```bash
npm run lint
npm run build
npm run preview
```

## 공개 배포

- `main` 브랜치에 반영되면 GitHub Actions가 린트와 빌드를 수행한 뒤 GitHub Pages에 배포합니다.
- 배포 작업은 GitHub 공식 Pages 액션만 사용하며, CI는 모든 `main` 및 `codex/**` 브랜치 푸시와 `main` 대상 Pull Request에서 실행됩니다.
- 서비스는 이미지를 외부로 전송하지 않습니다. 배포 환경을 GitHub Pages 이외로 바꿀 경우 [SECURITY.md](SECURITY.md)의 보안 헤더 요구사항을 적용해야 합니다.

## 폴더 구조

```text
src/
├── components/
│   ├── layout/      # 에디터 레이아웃과 패널
│   ├── mockup/      # CSS 기반 디바이스 프레임과 비교 슬라이더
│   └── ui/          # Button, Modal, Toggle, Slider 등 공통 UI
├── data/            # 디바이스·프레임·배경·플랜 데이터
├── hooks/           # 이미지 업로드와 localStorage 훅
├── pages/           # Landing, Editor, Pricing
├── styles/          # 전역 리셋과 디자인 토큰
├── types/           # 공용 TypeScript 타입
└── utils/           # PNG 내보내기 유틸리티

public/
├── mockups/         # 추후 직접 제작한 목업 에셋 추가 위치
└── samples/         # 직접 만든 샘플 에셋 추가 위치
```

`public/mockups`에 투명 PNG를 넣고 같은 폴더의 `manifest.json`에 표시용 이름과 경로를 등록하면 Mockup 모드에서 선택할 수 있습니다. 예시는 `public/mockups/README.md`를 참고하세요.

## 현재 제한 사항과 향후 계획

- 무료 버전은 이미지 1개 작업과 1×/2× PNG 내보내기를 지원합니다.
- Pro/Studio의 다중 프로젝트, 3×/4× 내보내기, 브랜드 프리셋, 협업·클라우드 기능은 Coming Soon UI만 있으며 아직 구현하지 않았습니다.
- 추후 직접 제작한 목업 에셋을 `public/mockups`에 추가할 수 있도록 폴더를 유지합니다.
- 공개 운영 전에는 [SECURITY.md](SECURITY.md)의 취약점 신고 경로와 배포 요구사항을 확인하세요.
