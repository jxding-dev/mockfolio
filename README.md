# Mockfolio

웹·앱 화면 캡처를 **브라우저 안에서만** 검수하고, 포트폴리오용 목업 PNG로 저장하는 로컬 우선 도구.
이 문서가 프로젝트의 유일한 기준 문서다. 다음 작업자(사람·AI)는 작업 전 **반드시 전체를 읽는다**.

**최우선 순위: ① 보안 ② 버그/오류 안전 ③ 유지보수성.** 이 셋을 높이는 변경은 — 구조 리팩터링 포함 — 적극 권장한다.
단, 두 가지 전제: (1) 기존 **기능·UX·동작을 보존**하고 변경 후 `lint`·`build`로 검증한다, (2) §1의 **보안/로컬처리/Coming Soon 정책은 절대 불변**이다.
"작은 단위로 작업"은 한 번에 다 갈아엎지 말라는 뜻이지, 유지보수·보안 개선을 미루라는 뜻이 아니다. 깨질 위험이 큰 리팩터링은 단독 변경으로 나누고 각 단계를 검증하라. **이유 없는 전면 UI 재작성만 금지.**

- 저장소: `jxding-dev/mockfolio` · 브랜치: `main`
- 배포: GitHub Pages — https://jxding-dev.github.io/mockfolio/
- 라우팅: `HashRouter` · Vite base: `/mockfolio/` (둘 다 변경 금지)

---

## 1. 절대 지켜야 할 정책 (건드리면 안 됨)

- 유료 API · 앱 내부 AI 연결 · 이미지 생성 금지
- 사용자 업로드 이미지를 **서버로 전송 금지** (모든 처리는 브라우저 메모리)
- 실제 로그인/결제/계정 저장 구현 금지 — 로그인·Pro·Studio는 **Coming Soon UI만**
- 목업은 **CSS/SVG/HTML 또는 직접 제작한 투명 PNG 오버레이만** 사용 (외부 목업 이미지 무단 사용 금지)
- 이미지 URL 불러오기는 `credentials: 'omit'` 유지, HTTPS 직접 이미지만 허용
- `public/mockups/manifest.json` 경로 검증(`mockups/overlays/`로 시작, `../`·절대경로·프로토콜 차단) 완화 금지
- iframe `sandbox`를 불필요하게 넓히지 말 것 (`allow-same-origin` 추가 금지)
- CSP를 완화할 땐 정확한 사유를 커밋에 남길 것
- 목업 PNG 단독 다운로드 기능 금지 — Export는 **합성 결과만** 허용
- 외부 유료 라이브러리/API 추가 금지, Tailwind 등 스타일 체계 새로 도입 금지

---

## 2. 기능

- **이미지 업로드**: PNG/JPG/JPEG/WebP, 최대 20MB·4,000만 픽셀. 드래그앤드롭 또는 파일 선택.
- **반응형 Inspect**: 360~1920px 모바일·태블릿·데스크탑 프리셋, 세로/가로 전환, Fit/Fill/Original, 안전영역·8px 그리드·중앙선·여백 가이드.
- **URL 미리보기**: URL을 지정 디바이스 크기 iframe으로 확인. X-Frame-Options/CSP로 막힌 사이트는 새 창 열기로 안내 (정상 동작).
- **Before/After**: 좌우·상하 비교 슬라이더, 자동 슬라이드(rAF), GIF 저장(`gifenc`).
- **Mockup (CSS 프레임)**: Phone, Browser, Laptop, Tablet, Phone+Desktop, Cover Card. 프레임 색상·배경·그림자·모서리·크기/위치·텍스트/태그/날짜 조절.
- **Custom PNG Mockup**: 투명 PNG 목업 위에 업로드 이미지를 합성(위치·스케일·늘림·회전·스큐), 합성 결과만 PNG 저장.
- **PNG Export**: 1×/2× 저장. 파일명 `mockfolio-프로젝트명-날짜.png`.

업로드한 이미지 원본은 저장하지 않는다. `localStorage`(키 `mf_settings`)에는 **UI 설정만** 저장하며, 읽을 때 `normalizeEditorSettings()`로 전부 검증한다. 새로고침하면 업로드 이미지는 사라진다.

---

## 3. 기술 스택 · 실행

- React 19 + TypeScript · Vite 8 · React Router DOM 7 · CSS Modules + 디자인 토큰
- PNG 내보내기 `html-to-image` · GIF `gifenc` · 린트 `oxlint`

```bash
npm install
npm run dev       # 개발 서버
npm run lint      # oxlint
npm test          # vitest — 보안/검증 순수 함수 단위 테스트
npm run build     # tsc -b (strict) && vite build
npm run preview   # 빌드 미리보기
```

작업 후 반드시: `npm run lint` → `npm test` → `npm run build` → `npm audit --omit=dev --audit-level=high`,
그리고 UI를 **홈 1280px / 에디터 1280px / 에디터 390px**에서 확인한 뒤 push. (CI도 동일 게이트를 강제한다.)

- TypeScript는 **strict** 모드다. 새 코드도 null 안전성을 유지한다.
- 보안 핵심 순수 함수(`normalizeEditorSettings`, `normalizeImageUrl`, `normalizePreviewUrl`, `safeMockupSource`)는 **단위 테스트로 보호**된다. 이 로직을 바꾸면 테스트도 갱신한다.
- 알 수 없는 경로는 `*` 라우트의 404 페이지로 처리된다. SEO/OG 메타와 `manifest.webmanifest`·`robots.txt`·`sitemap.xml`은 `public/`과 `index.html`에 있다.

---

## 4. 폴더 구조

```text
src/
  pages/        Landing.tsx · Editor.tsx · Pricing.tsx · NotFound.tsx
  components/
    layout/     EditorTopBar · EditorLeftPanel · EditorCanvas · EditorRightPanel · Header · Footer
    inspector/  UrlPreview            # iframe URL 미리보기
    mockup/     DeviceFrame · CompareSlider · MockupComposer · MockupScene
    landing/    ReviewsSlider         # 후기 캐러셀
    ui/         Button · Modal · Toggle · Slider · Badge · ErrorBoundary
  data/         editorSettings.ts(+normalize) · devices · frames · backgrounds · mockups · plans
  hooks/        useImageUpload · useLocalStorage · useMockupAssets · useReveal
  utils/        exportPng · mediaExport(GIF·합성) · urlPreview
  types/        index.ts
  styles/       tokens.css · reset.css
  **/*.test.ts  보안 검증 함수 단위 테스트 (vitest)
public/         manifest.webmanifest · robots.txt · sitemap.xml · favicon.svg
public/mockups/ manifest.json · overlays/{ecommerce,app,web,poster,banner,social,ads,signage,samples}/
```

상태는 `Editor.tsx`의 `EditorSettings` 한 객체에 모이고 `patch(key, value)`로만 갱신한다. 새 옵션을 추가할 땐 `editorSettings.ts`의 타입·기본값·`normalizeEditorSettings`를 함께 갱신한다.

---

## 5. 커스텀 목업 PNG 추가

1. 투명 PNG를 `public/mockups/overlays/{category}/` 아래에 넣는다 (사용자 이미지가 들어갈 영역은 alpha로 뚫는다).
2. `public/mockups/manifest.json`에 등록한다:

```json
{ "id": "unique-id", "label": "표시 이름", "category": "표시 카테고리", "src": "mockups/overlays/app/my-mockup.png" }
```

`src`는 반드시 `mockups/overlays/`로 시작. 외부 URL·`../`·절대경로는 런타임에서 차단된다.

---

## 6. 배포 · 보안 헤더

- `main` push 시 GitHub Actions가 `lint → audit → build → GitHub Pages 배포` 수행 (`.github/workflows/deploy.yml`).
- **Settings → Pages → Source는 "GitHub Actions"** 여야 새 빌드가 반영된다. (브랜치 배포 방식 아님)
- 보안 헤더는 `index.html`의 CSP·Permissions-Policy·`referrer=no-referrer`로 적용. GitHub Pages 외 환경으로 옮기면 엣지에서 `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`를 동일하게 설정해야 한다.
- 취약점은 공개 이슈가 아니라 저장소의 **private security advisory**로 신고.
- 분석·인증·결제·백엔드를 도입하려면 데이터 처리 모델이 바뀌므로 별도 보안/프라이버시 검토 후 진행.

---

## 7. 알려진 한계

- iframe URL 미리보기는 사이트의 X-Frame-Options/CSP로 막힐 수 있다.
- 웹페이지 URL을 canvas로 캡처/export하는 기능은 브라우저 보안상 안정 제공 불가.
- 외부 이미지 URL은 CORS 허용된 직접 이미지 파일만 불러올 수 있다.
- 이미지는 메모리 기반이라 새로고침 시 사라진다. (`localStorage`엔 UI 설정만)
- Pro/Studio의 다중 프로젝트·고배율 export·협업 기능은 Coming Soon UI만 존재.
- 랜딩의 **후기(`Landing.tsx`의 `REVIEWS`)와 요금(`data/plans.ts`)은 플레이스홀더**다. 정식 출시 전 실제 후기/확정 가격으로 교체할 것.

---

## 8. 다음 작업 — Codex 로드맵

> 비즈니스 모델: 가입 시 **30일 무료 체험**, 핵심 내보내기 **첫 3회 평생 무료**, 그 외 **프리미엄 SaaS**. 현재 프론트는 이 메시지를 보여주지만 **인증·결제·사용량 게이팅은 미구현(Coming Soon)** 이다.

### 8.1 최우선: 로그인 + 결제 연동 (실서비스화)
작업 순서와 보안 원칙:

1. **로컬 우선 원칙 유지.** 이미지 처리·목업 합성·export는 계속 브라우저에서만 한다. 백엔드는 **계정·구독 상태·사용량**만 다룬다. 이미지 픽셀을 서버로 보내지 말 것.
2. **인증**: 직접 구현하지 말고 검증된 제공자 사용 (예: Supabase Auth / Clerk / Auth.js). 토큰은 메모리 또는 httpOnly 쿠키에 두고 **localStorage에 토큰 저장 금지**(XSS 탈취 방지).
3. **결제**: 국내 PG(토스페이먼츠/포트원) 또는 Stripe. **결제 비밀키·웹훅 시크릿은 절대 프론트에 두지 말 것** — 서버(서버리스 함수 등)에서만 사용. 프론트엔 공개 키만.
4. **사용량 게이팅("첫 3회 무료")은 반드시 서버에서 집계·검증.** `localStorage` 카운터는 사용자가 지울 수 있어 신뢰 불가 — UX 힌트로만 쓰고, 실제 제한은 서버 권위 데이터로 enforce.
5. 백엔드 도입 시 **CSP의 `connect-src`에 API 도메인만 명시적으로 추가**(현재 `https:` 광역 → 좁히기). 그리고 README §6의 보안 헤더를 호스팅 엣지에 적용. PG 콜백을 위해 필요한 최소 `frame-src`/`form-action`만 연다.
6. 인증·결제는 **데이터 처리 모델을 바꾸므로** 도입 전 별도 보안/프라이버시 검토(README §6).

게이팅 지점(코드): export는 `Editor.tsx`의 `handleExport`/`handleCompositeExport`/`handleGifExport`에서 일어난다. 무료 횟수 체크는 여기서 서버 상태를 확인해 감싼다.

### 8.2 프론트 업그레이드 백로그 (우선순위 순)
- **다크 모드**: `tokens.css`가 이미 라이트 토큰 구조라 `[data-theme="dark"]` 오버라이드 + 토글만 추가하면 됨.
- **실제 OG 이미지**: 현재 `og:image`가 favicon.svg → 1200×630 PNG 제작해 `public/`에 넣고 메타 교체.
- **온보딩/툴팁 투어**(첫 진입), **키보드 단축키**(zoom, 모드 전환).
- **i18n(EN)**: 문자열이 JSX에 하드코딩됨 → 리소스 분리 후 영어 추가(해외 SaaS 확장).
- 디바이스 프리셋·프레임·배경 추가(`data/`만 수정하면 확장됨).
- **분석**: 프라이버시 존중형(Plausible 등) — 단, 이미지/입력은 절대 수집 금지.
- **테스트 확장**: 현재 보안 순수함수 17개. 컴포넌트/플로우는 Playwright E2E로 확장 권장(업로드→목업→export, 결제 게이팅).

### 8.3 코드 규칙 (지킬 것)
- 에디터 상태는 `EditorSettings` 한 객체 + `patch(key,value)`. 새 설정은 `editorSettings.ts`(타입·기본값·`normalizeEditorSettings`)에 함께 추가 → 패널은 `settings`/`patch`만 받는다.
- 스타일은 CSS Modules + `tokens.css` 변수. 애니메이션은 항상 `prefers-reduced-motion` 분기.
- TS strict 유지, 새 검증/정규화 로직엔 `*.test.ts` 추가. push 전 `lint → test → build` 통과(CI도 강제).
