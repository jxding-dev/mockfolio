# 연동 가이드 (로그인 / 결제)

Mockfolio는 **로그인 없이도 모든 기능이 무료로 동작**합니다. 로그인은 환경변수만
넣으면 켜지는 구조(seam)로 미리 연결해 두었습니다. 이 문서대로 따라가면 됩니다.

---

## 1. Supabase 로그인 켜기 (간단)

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. **Project Settings → API** 에서 두 값 복사
   - `Project URL`
   - `anon public` key
3. 로컬: 프로젝트 루트에 `.env` 생성 (`.env.example` 복사)
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. **Supabase → Authentication → URL Configuration**
   - `Site URL` 에 배포 주소 추가: `https://jxding-dev.github.io/mockfolio/`
   - `Redirect URLs` 에도 같은 주소(그리고 로컬 `http://localhost:5173/mockfolio/`) 추가
5. 이메일 매직링크는 기본 활성화. Google 로그인을 쓰려면
   **Authentication → Providers → Google** 에서 OAuth 설정.

`npm run dev` 후 헤더 **로그인** 버튼 → 이메일 입력 → 메일의 링크로 로그인됩니다.

### 배포(GitHub Pages)에서 켜기
- 저장소 **Settings → Secrets and variables → Actions** 에 동일 이름으로 등록:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `deploy.yml` 빌드 단계가 이미 이 시크릿을 주입합니다. 다음 푸시부터 로그인 활성화.
- 시크릿이 없으면 자동으로 게스트 모드로 빌드되어 **사이트가 깨지지 않습니다.**

---

## 2. 결제 (다음 단계)

> 현재는 의도적으로 결제를 붙이지 않았습니다(모든 기능 무료). 아래는 붙일 때 참고.

⚠️ **GitHub Pages(정적 호스팅)에서는 결제를 안전하게 처리할 수 없습니다.** 결제는
비밀키·웹훅 검증용 서버가 필요합니다. 두 가지 경로:

- **A. Stripe 호스티드 (백엔드 최소)** — Stripe Payment Links / Checkout 링크로
  시작. 서버 없이 구독 링크만 연결, 현재 호스팅 유지 가능.
- **B. Toss/Stripe + 서버리스 (한국 결제)** — Vercel/Netlify/Cloudflare로 호스팅을
  옮기고 서버리스 함수에서 결제 검증 + Supabase에 플랜 기록.

결제 연동 후 유료 기능을 잠그려면: 사용자 플랜을 Supabase(`profiles.plan` 등)에
저장하고, `src/domain/features.ts`의 `canUseFeature(plan, feature)`를 에디터의
저장/프리미엄 목업 지점에서 호출하면 됩니다. (지금은 게이팅 미적용 = 전부 무료)

---

## 3. 코드 구조 (어디를 건드리면 되나)

| 목적 | 파일 |
|---|---|
| Supabase 클라이언트 (env 없으면 null) | `src/lib/supabaseClient.ts` |
| 로그인 상태/액션 (`useAuth`) | `src/hooks/authContext.ts`, `src/hooks/AuthProvider.tsx` |
| 로그인 UI (이메일/구글) | `src/components/auth/LoginModal.tsx` |
| 헤더 로그인/로그아웃 표시 | `src/components/layout/Header.tsx` |
| 플랜·기능 권한 (결제 시 사용) | `src/domain/features.ts`, `src/domain/plans.ts` |

`useAuth()` 는 어디서든 `const { user, signOut } = useAuth()` 로 사용할 수 있습니다.
