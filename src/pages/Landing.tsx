import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ReviewsSlider, type Review } from '../components/landing/ReviewsSlider';
import { useReveal } from '../hooks/useReveal';
import styles from './Landing.module.css';

/* Scroll-reveal wrapper — fades/rises content into view (reduced-motion safe). */
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${shown ? styles.revealShown : ''} ${className ?? ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

const REVIEWS: Review[] = [
  { quote: '포트폴리오에 올릴 목업을 만드는 데 5분도 안 걸렸어요. 피그마 켜는 것보다 빠릅니다.', name: '김서연', role: '프로덕트 디자이너', initial: '서', accent: 'linear-gradient(135deg,#6366F1,#8B5CF6)' },
  { quote: '반응형 깨짐을 한 화면에서 바로 확인하니 QA 시간이 확 줄었어요. 개발자 필수 툴.', name: '이준호', role: '프론트엔드 개발자', initial: '준', accent: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
  { quote: '클라이언트 시안 보여줄 때 Before/After 슬라이더가 반응이 정말 좋습니다.', name: '박지민', role: '프리랜서 디자이너', initial: '지', accent: 'linear-gradient(135deg,#F472B6,#8B5CF6)' },
  { quote: '이미지가 서버로 안 올라간다는 점이 보안 검토를 통과하는 데 결정적이었어요.', name: '최민영', role: '에이전시 디렉터', initial: '민', accent: 'linear-gradient(135deg,#34D399,#06B6D4)' },
];

const FAQS: { q: string; a: string }[] = [
  { q: '정말 무료인가요?', a: '네. Free 플랜은 URL Preview, 기본 목업, PNG 저장, 일부 프레임을 계속 무료로 제공합니다.' },
  { q: '업로드한 이미지는 안전한가요?', a: '모든 이미지는 브라우저 안에서만 처리됩니다. 외부 서버로 전송하지 않고, AI 학습에도 사용하지 않습니다.' },
  { q: '결제는 어떻게 하나요?', a: '아직 실제 결제는 연결하지 않았습니다. 향후 Supabase Auth와 Toss Payments를 붙여 Pro 월 9,900원 구조로 제공할 예정입니다.' },
  { q: '상업적으로 사용할 수 있나요?', a: '네. 직접 만든 목업 결과물은 포트폴리오·제안서 등 상업적 용도로 자유롭게 사용할 수 있습니다.' },
];

const showcaseMockups = [
  {
    title: '실사 도심 빌딩 광고판',
    category: 'Hero Mockup',
    src: 'mockups/overlays/realistic/ads/real-city-building-billboard.webp',
  },
  {
    title: '실사 카페 노트북',
    category: 'Web',
    src: 'mockups/overlays/realistic/devices/real-laptop-cafe-table.webp',
  },
  {
    title: '실사 손에 든 스마트폰',
    category: 'App',
    src: 'mockups/overlays/realistic/devices/real-smartphone-in-hand.webp',
  },
  {
    title: '실사 매장 행잉 간판',
    category: 'Signage',
    src: 'mockups/overlays/realistic/signage/real-storefront-hanging-sign.webp',
  },
] as const;

function publicMockupSrc(src: string): string {
  return `${import.meta.env.BASE_URL}${src}`;
}

function RealMockupShowcase() {
  const [main, side1, side2] = showcaseMockups;

  return (
    <div className={styles.realShowcase} aria-label="실제 목업 이미지 쇼케이스">
      <figure className={styles.realShowcaseMain}>
        <img src={publicMockupSrc(main.src)} alt={main.title} loading="eager" decoding="async" />
        <figcaption>
          <span>{main.category}</span>
          <strong>{main.title}</strong>
        </figcaption>
      </figure>
      <div className={styles.realShowcaseStrip}>
        <figure className={styles.realShowcaseThumb} key={side1.src}>
          <img src={publicMockupSrc(side1.src)} alt={side1.title} loading="lazy" decoding="async" />
          <figcaption>
            <span>{side1.category}</span>
            <strong>{side1.title}</strong>
          </figcaption>
        </figure>
        <figure className={styles.realShowcaseThumb} key={side2.src}>
          <img src={publicMockupSrc(side2.src)} alt={side2.title} loading="lazy" decoding="async" />
          <figcaption>
            <span>{side2.category}</span>
            <strong>{side2.title}</strong>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Feature Card
   ───────────────────────────────────────────────────────── */
interface FeatureCardProps {
  number: string;
  icon: string;
  title: string;
  desc: string;
  tags: string[];
  accent: string;
}

function FeatureCard({ number, icon, title, desc, tags, accent }: FeatureCardProps) {
  return (
    <div className={styles.featureCard} style={{'--card-accent': accent} as React.CSSProperties}>
      <div className={styles.fcTop}>
        <span className={styles.fcNumber}>{number}</span>
        <div className={styles.fcIcon}>{icon}</div>
      </div>
      <h3 className={styles.fcTitle}>{title}</h3>
      <p className={styles.fcDesc}>{desc}</p>
      <div className={styles.fcTags}>
        {tags.map((t) => <span key={t} className={styles.fcTag}>{t}</span>)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FAQ accordion item
   ───────────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}>
      <button className={styles.faqQ} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{q}</span>
        <span className={styles.faqChevron} aria-hidden>⌄</span>
      </button>
      <div className={styles.faqAWrap}>
        <p className={styles.faqA}>{a}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Landing
   ───────────────────────────────────────────────────────── */
export function Landing() {
  const navigate = useNavigate();
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <main className={styles.page}>

      {/* ── HERO ─────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgGradient} />
          <div className={styles.heroBgAurora} />
          <div className={styles.heroBgGlow1} />
          <div className={styles.heroBgGlow2} />
          <div className={styles.heroBgGlow3} />
          <div className={styles.heroBgGrid} />
        </div>

        <div className={styles.heroInner}>
          <div className={`${styles.heroText} ${styles.heroEnter}`}>
            <span className={styles.heroBadgeWrap}>
              <Badge variant="accent">Free available · Pro ₩9,900/mo 준비 중</Badge>
            </span>

            <h1 className={styles.heroTitle}>
              내 작업물을<br />
              <span className={styles.heroAccent}>실제 서비스처럼</span><br />
              보여주는 목업 툴.
            </h1>

            <p className={styles.heroDesc}>
              웹사이트, 앱, 상세페이지, 포스터, 배너 이미지를 업로드하고
              반응형 검수와 실사형 목업 합성을 한 화면에서 처리하세요.<br />
              <strong>서버 업로드 없이 브라우저에서만 처리합니다.</strong>
            </p>

            <div className={styles.heroCtas}>
              <Button variant="primary" size="lg" onClick={() => navigate('/editor')}>
                무료로 시작하기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/pricing')}>
                요금제 보기
              </Button>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>51종</span>
                <span className={styles.heroStatLabel}>목업 오버레이</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>4종</span>
                <span className={styles.heroStatLabel}>URL 프리셋</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>₩9,900</span>
                <span className={styles.heroStatLabel}>Pro 월 예정가</span>
              </div>
            </div>
          </div>

          <div className={`${styles.heroVisual} ${styles.heroEnterVisual}`}>
            <RealMockupShowcase />
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.sectionLabel}>주요 기능</div>
          <h2 className={styles.sectionTitle}>
            검수, 합성, 저장까지<br />작업 흐름을 끊지 않는 제작 도구
          </h2>
        </Reveal>

        <div className={styles.featureGrid}>
          {[
            { number: '01', icon: '📐', title: 'Responsive Inspect', desc: 'Mobile, Tablet, Desktop, Wide 크기로 URL과 업로드 이미지를 빠르게 확인합니다. iframe 차단 안내와 새 창 열기까지 포함해 검수 중 오류처럼 보이지 않게 처리했습니다.', tags: ['URL 미리보기', '직접 크기 입력', '새로고침', '새 창 확인'], accent: '#6366F1' },
            { number: '02', icon: '🖼', title: 'Commercial Mockup', desc: '앱, 웹, 상세페이지, 포스터, 간판, 전광판, 배너 작업물을 실사형 목업에 합성합니다. 여러 이미지 레이어를 겹치고 위치·크기·회전·왜곡을 조절할 수 있습니다.', tags: ['51종 오버레이', '레이어 합성', '고급 변형', '카테고리 분류'], accent: '#8B5CF6' },
            { number: '03', icon: '💾', title: 'Local Export', desc: '업로드 파일은 브라우저 안에서만 처리하고, 합성된 결과만 PNG/GIF로 저장합니다. 서버 업로드, AI 연결, 결제 정보 저장 없이 안전하게 시작할 수 있습니다.', tags: ['PNG 저장', 'GIF 저장', 'No AI', 'Local First'], accent: '#06B6D4' },
          ].map((f, i) => (
            <Reveal key={f.number} delay={i * 90}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ADVANTAGES ───────────────────────── */}
      <section className={styles.advantageSection}>
        <Reveal>
          <div className={styles.sectionLabelCenter}>서비스 강점</div>
          <h2 className={styles.sectionTitleCenter}>포트폴리오용 툴이 아니라, 실제 판매 가능한 제작 흐름으로</h2>
        </Reveal>
        <div className={styles.advantageGrid}>
          {[
            { title: '다양한 작업자 대응', desc: '웹 제작자, 앱 개발자, 상세페이지 디자이너, 광고·배너·포스터 작업자가 같은 에디터에서 결과물을 만들 수 있습니다.' },
            { title: '목업 자산 확장 구조', desc: 'public/mockups manifest 기반으로 카테고리와 파일을 분리해, 직접 제작한 목업을 계속 추가하기 쉽습니다.' },
            { title: '상업 서비스 준비', desc: '무료 사용과 30일 이용권만 남겨 가격 구조를 단순화했습니다. 결제 연동 전에는 실제 과금 코드가 없습니다.' },
            { title: '로컬 우선 보안', desc: '업로드 이미지를 외부 서버로 보내지 않는 구조라 초기 서비스 단계에서도 개인정보 리스크를 줄일 수 있습니다.' },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <article className={styles.advantageCard}>
                <span className={styles.advantageNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── USE CASES ───────────────────────── */}
      <section className={styles.useCaseSection}>
        <Reveal>
          <div className={styles.sectionLabelCenter}>실제 사용 예시</div>
          <h2 className={styles.sectionTitleCenter}>작업물 종류가 달라도 같은 흐름으로 완성합니다</h2>
        </Reveal>
        <div className={styles.useCaseGrid}>
          {[
            { title: '웹사이트 제작자', desc: 'URL Preview로 반응형을 확인하고 데스크탑·노트북 목업으로 제안서 이미지를 만듭니다.' },
            { title: '앱 개발자', desc: '모바일 화면을 여러 레이어로 배치하고 앱스토어/랜딩페이지용 이미지를 빠르게 제작합니다.' },
            { title: '상세페이지 디자이너', desc: '긴 상세 이미지를 카테고리별 목업에 합성해 실제 판매 페이지처럼 보여줍니다.' },
            { title: '광고·배너 작업자', desc: '전광판, 간판, 포스터, 배너 목업으로 캠페인 시안을 더 현실적으로 전달합니다.' },
          ].map((item) => (
            <Reveal key={item.title}>
              <article className={styles.useCaseCard}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── MOCKUP EXAMPLES ─────────────────── */}
      <section className={styles.mockupExampleSection}>
        <Reveal>
          <div className={styles.sectionLabel}>목업 예시</div>
          <h2 className={styles.sectionTitle}>실사형 목업부터 디바이스 목업까지</h2>
        </Reveal>
        <div className={styles.mockupExampleGrid}>
          {showcaseMockups.slice(1).map((item) => (
            <Reveal key={item.src}>
              <article className={styles.mockupExampleCard}>
                <img src={publicMockupSrc(item.src)} alt={item.title} loading="lazy" decoding="async" />
                <div className={styles.mockupExampleMeta}>
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsLeft}>
          <div className={styles.sectionLabel}>사용 방법</div>
          <h2 className={styles.sectionTitle}>4단계로 완성하는<br />상업용 목업 이미지</h2>
          <p className={styles.stepsDesc}>
            복잡한 설정 없이 이미지를 올리는 순간부터<br />
            바로 시작할 수 있습니다.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/editor')} style={{marginTop: 8}}>
            지금 바로 시작 →
          </Button>
        </div>

        <div className={styles.stepsRight}>
          {[
            { n: '01', title: '작업물 업로드', desc: '웹·앱 화면, 상세페이지, 포스터, 배너 이미지를 드래그하거나 클릭해서 올립니다. 서버로 전송되지 않습니다.' },
            { n: '02', title: 'URL 또는 이미지 검수', desc: '프리셋 크기와 직접 입력 크기로 레이아웃을 확인하고, iframe 차단 사이트는 새 창에서 검수합니다.' },
            { n: '03', title: '목업 합성', desc: '카테고리별 목업을 고르고 여러 이미지 레이어를 위치, 크기, 회전, 왜곡까지 조절합니다.' },
            { n: '04', title: 'PNG/GIF 저장', desc: '합성된 결과만 다운로드합니다. 목업 원본 단독 저장 흐름은 제공하지 않습니다.' },
          ].map((s) => (
            <div key={s.n} className={styles.stepItem}>
              <div className={styles.stepNum}>{s.n}</div>
              <div>
                <h4 className={styles.stepTitle}>{s.title}</h4>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────── */}
      <section className={`${styles.section} ${styles.reviewsSection}`}>
        <Reveal>
          <div className={styles.sectionLabelCenter}>사용자 후기</div>
          <h2 className={styles.sectionTitleCenter}>이미 많은 디자이너·개발자가<br />Mockfolio로 시간을 아끼고 있습니다</h2>
        </Reveal>
        <Reveal delay={120}>
          <ReviewsSlider reviews={REVIEWS} />
        </Reveal>
      </section>

      {/* ── PLAN TEASER ──────────────────────── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.sectionLabel}>요금제</div>
          <h2 className={styles.sectionTitle}>Free와 Pro, 운영하기 쉬운 두 가지 플랜</h2>
        </Reveal>

        <div className={styles.planRow}>
          {/* Free */}
          <div className={`${styles.planCard} ${styles.planCardFree}`}>
            <div className={styles.planHead}>
              <div>
                <div className={styles.planName}>Free</div>
                <div className={styles.planPrice}>₩0</div>
              </div>
              <Badge variant="success">지금 사용 가능</Badge>
            </div>
            <p className={styles.planDesc}>로그인 없이 바로 쓰는 핵심 제작 기능</p>
            <ul className={styles.planList}>
              {['반응형 검수와 URL 미리보기', '목업 이미지 레이어 합성', 'Before/After 비교와 GIF 저장', 'PNG 결과 저장', '로컬 처리 (서버 전송 없음)'].map(f => (
                <li key={f}><span className={styles.checkOn}>✓</span>{f}</li>
              ))}
            </ul>
            <Button variant="primary" fullWidth onClick={() => navigate('/editor')}>
              지금 무료로 시작하기
            </Button>
          </div>

          {/* Pro */}
          <div className={styles.planComboCol}>
            <div className={`${styles.planCard} ${styles.planCardSoon}`}>
              <div className={styles.planHead}>
                <div>
                  <div className={styles.planName}>Pro</div>
                  <div className={styles.planPrice}>₩9,900 <span>/ 월</span></div>
                </div>
                <Badge variant="outline">결제 준비 중</Badge>
              </div>
              <p className={styles.planDesc}>Supabase Auth와 Toss Payments 연결 후 제공할 상업용 플랜입니다.</p>
              <ul className={styles.planList}>
                {['모든 목업', 'Before / After GIF', '고화질 Export', 'Premium Mockups', '커스텀 PNG 목업', '향후 추가 기능 포함'].map(f => (
                  <li key={f}><span className={styles.checkOff}>–</span>{f}</li>
                ))}
              </ul>
              <Button variant="secondary" fullWidth onClick={() => setComingSoon(true)}>
                Upgrade 준비 보기
              </Button>
            </div>
            <div className={styles.planGuard}>
              결제 버튼처럼 보이더라도 현재 단계에서는 카드 정보나 개인정보를 받지 않습니다.
              정식 출시 전까지 결제와 구독 변경은 실제 동작하지 않습니다.
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section className={`${styles.section} ${styles.faqSection}`}>
        <Reveal>
          <div className={styles.sectionLabelCenter}>자주 묻는 질문</div>
          <h2 className={styles.sectionTitleCenter}>궁금한 점이 있으신가요?</h2>
        </Reveal>
        <div className={styles.faqList}>
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <FaqItem q={f.q} a={f.a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────── */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <div className={styles.finalCtaGlow} />
          <Reveal>
            <h2 className={styles.finalCtaTitle}>지금은 무료로 열어두고, 제품 완성도부터 올립니다</h2>
            <p className={styles.finalCtaDesc}>설치도 가입도 필요 없습니다. 이미지를 올리는 순간 반응형 검수와 목업 합성을 바로 시작할 수 있습니다.</p>
            <div className={styles.finalCtaActions}>
              <Button variant="primary" size="lg" onClick={() => navigate('/editor')}>
                무료로 에디터 열기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/pricing')}>요금제 자세히 보기</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRIVACY BANNER ───────────────────── */}
      <section className={styles.privacyBanner}>
        <div className={styles.privacyInner}>
          <div className={styles.privacyIcon}>🔒</div>
          <div>
            <h3 className={styles.privacyTitle}>No AI · No Server Upload · Local First</h3>
            <p className={styles.privacyDesc}>
              Mockfolio는 업로드된 모든 이미지를 브라우저 내에서만 처리합니다.
              AI 분석 없음 · 외부 서버 전송 없음 · 로그인 불필요.
              당신의 작업물은 오직 당신의 브라우저 안에만 존재합니다.
            </p>
          </div>
        </div>
      </section>

      <Modal open={comingSoon} onClose={() => setComingSoon(false)} title="준비 중입니다">
        <div className={styles.comingSoonModal}>
          <div className={styles.csEmoji}>📬</div>
          <p>Pro 결제는 아직 연결하지 않았습니다.<br />지금은 로그인 없이 Free 기능만 사용할 수 있습니다.</p>
          <Button variant="primary" fullWidth onClick={() => setComingSoon(false)}>
            확인
          </Button>
        </div>
      </Modal>
    </main>
  );
}
