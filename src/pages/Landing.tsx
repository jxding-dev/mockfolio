import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import styles from './Landing.module.css';

/* ─── Subcomponents ──────────────────────────────────────── */
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{desc}</p>
    </div>
  );
}

function StepItem({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className={styles.step}>
      <div className={styles.stepDot}>{n}</div>
      <div>
        <h4 className={styles.stepTitle}>{title}</h4>
        <p className={styles.stepDesc}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── CSS Device Preview Component ──────────────────────── */
function DevicePreview() {
  return (
    <div className={styles.previewWrap}>
      {/* Desktop browser frame */}
      <div className={styles.previewBrowser}>
        <div className={styles.previewBrowserBar}>
          <span className={styles.pdot} style={{ background: '#FF5F57' }} />
          <span className={styles.pdot} style={{ background: '#FFBD2E' }} />
          <span className={styles.pdot} style={{ background: '#28C840' }} />
          <div className={styles.previewUrl}>yourportfolio.com</div>
        </div>
        <div className={styles.previewScreen}>
          {/* Placeholder UI skeleton */}
          <div className={styles.skNav} />
          <div className={styles.skHero} />
          <div className={styles.skCards}>
            <div className={styles.skCard} />
            <div className={styles.skCard} />
            <div className={styles.skCard} />
          </div>
        </div>
      </div>
      {/* Phone frame */}
      <div className={styles.previewPhone}>
        <div className={styles.previewPhoneIsland} />
        <div className={styles.previewPhoneScreen}>
          <div className={styles.skPhoneHero} />
          <div className={styles.skPhoneCard} />
          <div className={styles.skPhoneCard} />
        </div>
        <div className={styles.previewPhoneHome} />
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export function Landing() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <main className={styles.page}>
      {/* ── Hero ────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Badge variant="accent">무료 · 로그인 불필요 · 브라우저 전용</Badge>

          <h1 className={styles.heroTitle}>
            반응형 검수부터
            <br />
            <span className={styles.heroHighlight}>포트폴리오 목업 제작까지,</span>
            <br />
            한 번에.
          </h1>

          <p className={styles.heroDesc}>
            웹/앱 화면 캡처를 업로드하고 다양한 디바이스 크기로 확인한 뒤,<br />
            프리미엄 목업 이미지로 내보내세요. 서버 없이, 100% 로컬.
          </p>

          <div className={styles.heroCtas}>
            <Button variant="primary" size="lg" onClick={() => navigate('/editor')}>
              무료로 시작하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/editor')}>
              샘플 보기
            </Button>
          </div>

          <div className={styles.heroMeta}>
            <span>✓ 계정 불필요</span>
            <span>✓ 이미지 서버 전송 없음</span>
            <span>✓ PNG 2× Export 무료</span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <DevicePreview />
        </div>
      </section>

      {/* ── Features ────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>핵심 기능</h2>
          <p className={styles.sectionDesc}>디자이너와 개발자를 위한 반응형 검수 + 목업 제작 올인원 툴</p>
        </div>
        <div className={styles.featureGrid}>
          <FeatureCard icon="📐" title="Responsive Inspect" desc="360px부터 1920px까지 8가지 디바이스 프리셋으로 UI 깨짐을 즉시 확인합니다." />
          <FeatureCard icon="🖼" title="Portfolio Mockup" desc="iPhone, 브라우저, MacBook 프레임에 화면을 넣고 배경과 그림자를 조절합니다." />
          <FeatureCard icon="💾" title="PNG Export" desc="Retina 2× 해상도로 포트폴리오에 바로 쓸 수 있는 고화질 이미지를 저장합니다." />
          <FeatureCard icon="🔄" title="Before / After" desc="수정 전후 화면을 슬라이더로 비교하며 개선 포인트를 시각적으로 확인합니다." />
          <FeatureCard icon="🔒" title="완전 로컬 처리" desc="업로드된 이미지는 외부 서버로 전송되지 않습니다. 브라우저 내에서만 처리됩니다." />
          <FeatureCard icon="⚡" title="즉각 반응" desc="클라우드 렌더링 없이 로컬에서 실시간으로 편집 결과를 확인합니다." />
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>사용 방법</h2>
        </div>
        <div className={styles.stepGrid}>
          <StepItem n={1} title="스크린샷 업로드" desc="PNG, JPG, WebP 파일을 드래그하거나 클릭해서 업로드합니다." />
          <StepItem n={2} title="반응형 검수" desc="모바일, 태블릿, 데스크탑 크기로 전환하며 레이아웃을 확인합니다." />
          <StepItem n={3} title="목업 디자인" desc="디바이스 프레임, 배경, 그림자, 텍스트를 자유롭게 조절합니다." />
          <StepItem n={4} title="PNG 저장" desc="포트폴리오용 고해상도 PNG 파일로 다운로드합니다." />
        </div>
      </section>

      {/* ── Plan Teaser ──────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>요금제</h2>
          <p className={styles.sectionDesc}>지금은 무료 플랜만 사용 가능합니다</p>
        </div>
        <div className={styles.planTeaser}>
          <div className={`${styles.planCard} ${styles.planFree}`}>
            <div className={styles.planHeader}>
              <span className={styles.planName}>Free</span>
              <Badge variant="success">지금 사용 가능</Badge>
            </div>
            <div className={styles.planPrice}>₩0</div>
            <ul className={styles.planFeatures}>
              {['반응형 검수 (8종)', '기본 목업 프레임 6종', 'Before/After 비교', 'PNG Export 1×/2×', '완전 로컬 처리'].map((f) => (
                <li key={f}><span>✓</span>{f}</li>
              ))}
            </ul>
            <Button variant="primary" fullWidth onClick={() => navigate('/editor')}>
              지금 시작하기
            </Button>
          </div>

          <div className={`${styles.planCard} ${styles.planPro}`}>
            <div className={styles.planHeader}>
              <span className={styles.planName}>Pro</span>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <div className={styles.planPrice}>₩9,900 <span>/mo</span></div>
            <ul className={styles.planFeatures}>
              {['멀티 이미지 프로젝트', 'Export 3×/4×', '브랜드 키트', '워터마크 제거', '프로젝트 히스토리'].map((f) => (
                <li key={f}><span>–</span>{f}</li>
              ))}
            </ul>
            <Button variant="secondary" fullWidth onClick={() => setShowComingSoon(true)}>
              알림 신청
            </Button>
          </div>

          <div className={`${styles.planCard} ${styles.planStudio}`}>
            <div className={styles.planHeader}>
              <span className={styles.planName}>Studio</span>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <div className={styles.planPrice}>₩29,900 <span>/mo</span></div>
            <ul className={styles.planFeatures}>
              {['팀 공유 및 협업', '클라우드 저장', '클라이언트 리뷰 링크', 'PDF 리포트', '브랜드 템플릿 관리'].map((f) => (
                <li key={f}><span>–</span>{f}</li>
              ))}
            </ul>
            <Button variant="secondary" fullWidth onClick={() => setShowComingSoon(true)}>
              알림 신청
            </Button>
          </div>
        </div>
      </section>

      <Modal open={showComingSoon} onClose={() => setShowComingSoon(false)} title="Coming Soon">
        <div className={styles.comingSoonContent}>
          <div className={styles.comingSoonEmoji}>🚀</div>
          <p>유료 플랜은 현재 개발 중입니다. 출시 시 가장 먼저 알려드릴게요.</p>
          <Button variant="primary" fullWidth onClick={() => setShowComingSoon(false)}>확인</Button>
        </div>
      </Modal>
    </main>
  );
}
