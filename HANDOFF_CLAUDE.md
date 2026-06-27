# Mockfolio Claude 인수인계서

이 문서는 다음 작업자가 기존 UI/UX와 보안 결정을 망치지 않고 이어서 개발하도록 남기는 기준 문서다.  
대규모 재작성 금지. 기존 톤, 컴포넌트 구조, 로컬 처리 정책을 유지한다.

## 1. 현재 상태

- 프로젝트: Mockfolio
- 저장소: `jxding-dev/mockfolio`
- 배포: GitHub Pages `https://jxding-dev.github.io/mockfolio/`
- 라우팅: `HashRouter`
- Vite base: `/mockfolio/`
- 브랜치: `main`
- 앱 성격: 로그인/결제 없는 무료 로컬 기반 웹앱
- 핵심 정책:
  - 유료 API 금지
  - 앱 내부 AI 연결 금지
  - 사용자 업로드 이미지를 서버로 전송 금지
  - 실제 로그인/결제 구현 금지
  - 로그인/유료 플랜은 Coming Soon UI만 유지
  - 목업은 CSS/SVG/HTML 또는 직접 제작한 PNG 오버레이만 사용

## 2. 현재 기능 요약

### 반응형 검수

- 이미지 업로드 후 Mobile/Tablet/Desktop 프리셋으로 확인 가능.
- URL 모드에서 웹페이지 URL을 입력해 iframe으로 미리보기 가능.
- `https://`가 없으면 자동으로 붙임.
- Mobile / Tablet / Desktop / Wide 프리셋과 직접 W/H 입력 지원.
- iframe 차단 사이트 대응 문구와 새 창 열기 버튼 있음.
- 일부 사이트는 X-Frame-Options/CSP 때문에 iframe 표시가 안 되는 것이 정상이다.

### 목업 합성

- `public/mockups/manifest.json` 기반으로 PNG 목업 오버레이를 불러온다.
- 사용자 이미지는 아래 레이어, 목업 PNG는 위 레이어다.
- 목업 PNG는 투명하게 뚫린 부분으로 사용자 이미지가 보이도록 설계한다.
- 조정 기능:
  - 드래그 이동
  - X/Y 위치
  - Scale
  - 가로/세로 늘림
  - Rotate
  - X/Y 비틀기
  - Reset
- 저장은 canvas 합성 결과만 PNG로 다운로드한다.
- 사용자 이미지가 없으면 목업 단독 저장은 막는다.

### Before / After

- Before / After 이미지 업로드.
- 좌우/상하 비교 슬라이더.
- requestAnimationFrame 기반 자동 슬라이드.
- GIF 저장 가능.
- 상하 모드에서는 GIF도 상하 기준으로 저장된다.

### 이미지 URL 불러오기

- 왼쪽 이미지 섹션과 Compare Before/After 슬롯에서 직접 이미지 URL을 불러올 수 있다.
- HTTPS 직접 이미지 URL만 허용한다.
- CORS가 막힌 이미지는 브라우저 보안 정책상 불러올 수 없다.
- fetch 옵션은 `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, `cache: 'no-store'`.
- 최대 20MB, 4,000만 픽셀 제한.

## 3. 내가 작업한 주요 내용

### 이전 작업 누적

- React + Vite + TypeScript 기반 앱 구조 정리.
- SaaS/생산성 툴 톤의 랜딩/에디터/요금제 UI 구성.
- 사용자 이미지 로컬 처리 흐름 구현.
- URL 반응형 미리보기 구현.
- iframe sandbox/referrer policy 보강.
- Before/After 비교와 GIF 저장 구현.
- GIF 저장 방향 오류 수정.
- 목업 PNG 오버레이 합성 기능 구현.
- 커스텀 PNG 목업 카테고리/manifest 구조 구현.
- 실사용 카테고리별 목업 PNG 에셋 추가:
  - 상세페이지 목업
  - 앱 목업
  - 웹사이트 목업
  - 포스터 목업
  - 배너/광고 목업
  - 소셜 광고 목업
  - 실사 광고 목업
  - 간판 목업
  - 샘플 목업
- 이미지 URL 불러오기 기능 구현.
- `SECURITY.md` 추가.
- GitHub Actions CI/deploy workflow 보강.
- CSP, referrer policy, permissions policy 추가.
- Google Fonts 외부 호출 제거.

### 이번 작업에서 추가 개선한 내용

- 실제 브라우저로 홈/에디터/URL 시작 흐름/390px 모바일 레이아웃을 확인했다.
- 시작 화면의 “URL 링크로 반응형 검수 시작” 버튼이 에디터 진입 후 이미지 모드로 열리던 문제를 수정했다.
  - 이제 URL 버튼으로 시작하면 Inspect + URL 모드로 바로 열린다.
- URL 모드 빈 화면이 “이미지를 업로드하세요”라고 나오던 문제를 수정했다.
  - URL 전용 빈 상태 안내로 변경했다.
- 이미지 링크 불러오기 버튼과 사이트 URL 미리보기 버튼 라벨을 분리했다.
  - 테스트/접근성/사용자 이해 모두 좋아졌다.
- URL 입력창에서 Enter 키로 사이트 미리보기가 실행되게 했다.
- 이미지 URL 입력창에서 Enter 키로 이미지 링크 불러오기가 실행되게 했다.
- 홈 헤더 로그인 모달의 “에디터 바로 열기” 버튼이 닫기만 하던 문제를 수정했다.
  - 이제 모달을 닫고 `/editor`로 이동한다.
- 390px 모바일에서 에디터 패널이 240px로만 남고 우측이 비는 레이아웃 문제를 수정했다.
  - 모바일에서는 왼쪽 패널, 캔버스, 오른쪽 옵션 패널이 세로 스크롤 구조로 쌓인다.
- 모바일에서 버튼/입력창/목업 선택 카드가 줄바꿈되도록 보정했다.
- 긴 목업 라벨이 버튼 밖으로 밀리지 않도록 처리했다.

## 4. 주요 파일 구조

```text
src/
  App.tsx
  main.tsx
  pages/
    Landing.tsx
    Editor.tsx
    Pricing.tsx
  components/
    layout/
      Header.tsx
      EditorTopBar.tsx
      EditorLeftPanel.tsx
      EditorCanvas.tsx
      EditorRightPanel.tsx
    inspector/
      UrlPreview.tsx
    mockup/
      DeviceFrame.tsx
      MockupComposer.tsx
      CompareSlider.tsx
    ui/
      Button.tsx
      Modal.tsx
      Toggle.tsx
      Slider.tsx
      ErrorBoundary.tsx
  data/
    editorSettings.ts
    devices.ts
    frames.ts
    mockups.ts
  hooks/
    useImageUpload.ts
    useLocalStorage.ts
    useMockupAssets.ts
  utils/
    exportPng.ts
    mediaExport.ts
    urlPreview.ts
public/
  mockups/
    manifest.json
    README.md
    images/
      README.md
    overlays/
      ecommerce/
      app/
      web/
      poster/
      banner/
      social/
      ads/
      signage/
      samples/
```

## 5. 목업 PNG 추가 방법

목업 PNG는 `public/mockups/overlays/{category}/` 아래에 넣는다.

예:

```text
public/mockups/overlays/ecommerce/my-detail-page-mockup.png
public/mockups/overlays/app/my-app-showcase.png
public/mockups/overlays/ads/my-outdoor-ad.png
```

그 다음 `public/mockups/manifest.json`에 추가한다.

```json
{
  "id": "unique-id",
  "label": "사용자에게 보일 이름",
  "category": "표시할 카테고리",
  "src": "mockups/overlays/ecommerce/my-detail-page-mockup.png"
}
```

중요:

- `src`는 반드시 `mockups/overlays/`로 시작해야 한다.
- 외부 URL, `../`, 절대경로는 차단된다.
- PNG의 사용자 이미지 삽입 영역은 투명 alpha로 뚫어야 한다.
- 원본 목업 파일명/경로를 UI에 불필요하게 노출하지 않는다.

## 6. 보안/정책상 건드리면 안 되는 부분

- 앱에 실제 로그인/결제/계정 저장을 넣지 말 것.
- 사용자 이미지를 서버로 업로드하지 말 것.
- 이미지 URL 불러오기에 credentials를 포함하지 말 것.
- manifest path 검증을 완화하지 말 것.
- iframe sandbox를 불필요하게 넓히지 말 것.
- CSP를 완화할 때는 정확한 사유를 남길 것.
- 목업 PNG 단독 다운로드 기능을 만들지 말 것.
- Export는 합성 결과만 허용할 것.
- 외부 유료 라이브러리/API 추가 금지.

## 7. 알려진 한계

- iframe URL 미리보기는 사이트의 X-Frame-Options/CSP에 막힐 수 있다.
- 웹페이지 URL을 canvas로 캡처/export하는 기능은 브라우저 보안 정책상 안정적으로 제공하기 어렵다.
- 외부 이미지 URL은 CORS가 허용된 직접 이미지 파일만 불러올 수 있다.
- 현재 이미지는 메모리 기반으로만 들고 있고, 새로고침하면 업로드 이미지는 사라진다.
- localStorage에는 UI 설정만 저장한다.
- 현재는 PR이 아니라 `main` 직접 커밋/푸시 방식으로 진행했다.

## 8. 다음 작업자 체크리스트

작업 전:

```bash
npm install
npm run lint
npm run build
```

작업 후 반드시 확인:

```bash
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
```

UI 확인:

- 홈 1280px
- 에디터 1280px
- 에디터 390px
- URL 시작 버튼
- URL 사이트 미리보기
- 이미지 업로드
- 이미지 URL 불러오기
- Mockup 탭
- 커스텀 PNG 목업 선택
- 합성 PNG 저장
- Compare 탭
- 좌우/상하 슬라이더
- GIF 저장
- Export 탭
- 로그인/업그레이드 Coming Soon 모달

배포 확인:

- push 후 GitHub Pages가 새 빌드 asset hash를 반영하는지 확인한다.
- Vite base(`/mockfolio/`)와 HashRouter를 바꾸지 않는다.

## 9. Claude에게 하는 주의

이 프로젝트는 이미 실제 서비스 전 단계 기준으로 정리해 둔 상태다.  
전체를 다시 만들지 말고, 작은 개선 단위로 변경하라.

특히 아래는 금지:

- 랜딩/에디터 UI 전체 갈아엎기
- Tailwind 등 스타일 체계 새로 도입
- 백엔드/DB/로그인/결제 임의 도입
- 앱 내부 AI 기능 추가
- 목업 이미지 원본 다운로드 버튼 추가
- 사용자 이미지 외부 전송
- `public/mockups/manifest.json` 보안 검증 제거
- 모바일 레이아웃 확인 없이 push

작업 기준은 “바로 서비스 배포 가능한 무료 로컬 기반 툴”이다.
