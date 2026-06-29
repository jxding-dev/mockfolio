import { Fragment, useState, type ReactNode } from 'react';
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
  { q: 'Free와 Pro는 무엇이 다른가요?', a: 'Free는 샘플 목업 2개와 반응형 검수를 체험용으로 제공하고, 저장은 워터마크·저해상도로 제한됩니다. Pro는 무제한 목업, 고화질 PNG·GIF Export, Premium Mockup, 상업적 사용까지 모두 열립니다.' },
  { q: '왜 월 9,900원인가요?', a: '하루로 치면 약 330원입니다. 목업 외주나 스톡 목업 한 건 값보다 싸게, 무제한으로 결과물을 뽑을 수 있도록 책정했습니다.' },
  { q: '무료로도 충분하지 않나요?', a: '가볍게 둘러보기엔 충분합니다. 다만 워터마크 없이 고화질로 저장하거나 포트폴리오·납품 등 상업적으로 쓰려면 Pro가 필요합니다.' },
  { q: '업로드한 이미지는 안전한가요?', a: '모든 이미지는 브라우저 안에서만 처리됩니다. 외부 서버로 전송하지 않고, AI 학습에도 사용하지 않습니다.' },
  { q: '결제는 어떻게 하나요?', a: '현재는 결제 기능 준비 단계입니다. 정식 출시 시 월 9,900원 구독을 제공하며, 구독 약정 없이 언제든 해지할 수 있습니다.' },
  { q: '상업적으로 사용할 수 있나요?', a: 'Pro 플랜에서 만든 결과물은 포트폴리오·제안서·광고 등 상업적 용도로 자유롭게 사용할 수 있습니다.' },
];

/* Free vs Pro comparison — true=included, false=not, string=detail */
const PLAN_COMPARISON: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: '사용 가능한 목업', free: '샘플 2개', pro: '무제한' },
  { label: 'Premium Mockup', free: false, pro: true },
  { label: 'PNG Export', free: '제한 · 워터마크', pro: '고화질 무제한' },
  { label: 'GIF Export (Before/After)', free: false, pro: true },
  { label: '상업적 사용', free: false, pro: true },
  { label: '우선 업데이트 · 신규 목업', free: false, pro: true },
];

const TRUST_ITEMS: { icon: string; label: string }[] = [
  { icon: '🔒', label: '서버 업로드 없음' },
  { icon: '💳', label: '카드 정보 저장 안 함' },
  { icon: '↩️', label: '구독 약정 없이 언제든 해지' },
  { icon: '⚡', label: '결제 즉시 전체 기능 적용' },
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

/* ─────────────────────────────────────────────────────────
   Workflow steps — the 5-step flow a first-time user follows
   ───────────────────────────────────────────────────────── */
interface WorkflowStep {
  title: string;
  desc: string;
  icon: ReactNode;
  pro?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: 'URL 입력',
    desc: '확인할 사이트 주소를 붙여넣거나 작업 이미지를 바로 업로드합니다.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: '반응형 확인',
    desc: '모바일·태블릿·데스크탑·와이드에서 레이아웃이 깨지지 않는지 한눈에 검수합니다.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="2"/>
        <rect x="17" y="9" width="5" height="11" rx="1.5" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: '목업 적용',
    desc: '실사형·디바이스 목업에 작업물을 올리고 위치·크기·각도를 맞춥니다.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="m3 12 9 4.5L21 12M3 16.5 12 21l9-4.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    pro: '프리미엄 목업',
  },
  {
    title: '비포애프터 비교',
    desc: '원본과 목업 결과를 슬라이더로 나란히 두고 완성도를 확인합니다.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 4v16" stroke="currentColor" strokeWidth="2"/>
        <path d="m8 9-2 3 2 3M16 9l2 3-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: '저장',
    desc: '완성된 결과를 PNG·GIF로 내려받아 포트폴리오·제안서에 바로 사용합니다.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    pro: '고화질 Export',
  },
];

const WORKFLOW_EXAMPLES = [
  { src: 'mockups/overlays/realistic/devices/real-laptop-cafe-table.webp', cat: 'WEB', title: '카페 노트북 목업' },
  { src: 'mockups/overlays/realistic/devices/real-smartphone-in-hand.webp', cat: 'APP', title: '손에 든 스마트폰 목업' },
  { src: 'mockups/overlays/realistic/ads/real-city-building-billboard.webp', cat: 'AD', title: '도심 빌딩 광고판' },
] as const;

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
   Pricing comparison cell — renders ✓ / — / detail text
   ───────────────────────────────────────────────────────── */
function CompareCell({ value }: { value: boolean | string }) {
  if (value === true) return <span className={styles.cellYes} aria-label="포함">✓</span>;
  if (value === false) return <span className={styles.cellNo} aria-label="미포함">—</span>;
  return <span className={styles.cellText}>{value}</span>;
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
              <Badge variant="accent">지금 무료 · 가입 없이 바로 시작</Badge>
            </span>

            <h1 className={styles.heroTitle}>
              내 포트폴리오를<br />
              <span className={styles.heroAccent}>실제 출시된 서비스처럼</span><br />
              보여주세요.
            </h1>

            <p className={styles.heroLead}>
              포트폴리오를 전문가처럼 목업으로 만들고,<br className={styles.brDesktop} />
              반응형까지 한 번에 확인하세요.
            </p>

            <p className={styles.heroDesc}>
              웹·앱·상세페이지·포스터·배너 이미지를 올리면 실사형 목업 합성과 반응형 검수를 한 화면에서.
              <strong> 서버 업로드 없이 브라우저에서만 처리합니다.</strong>
            </p>

            <div className={styles.heroCtaGroup}>
              <div className={styles.heroCtas}>
                <Button variant="primary" size="lg" className={styles.heroPrimaryCta} onClick={() => navigate('/editor')}>
                  <span className={styles.heroCtaInline}>
                    무료로 시작하기
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/pricing')}>
                  요금제 보기
                </Button>
              </div>
              <p className={styles.heroCtaNote}>
                신용카드 불필요 · 회원가입 없이 · 결과물은 내 브라우저에만 저장
              </p>
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
            { title: '계속 늘어나는 목업', desc: '카테고리별 실사·디바이스 목업을 꾸준히 추가하고 있어, 작업물 종류가 달라도 어울리는 목업을 고를 수 있습니다.' },
            { title: '간단한 가격 구조', desc: '지금은 무료 베타로 핵심 기능을 모두 열어두었고, Pro는 월 9,900원 한 가지로 단순하게 준비하고 있습니다.' },
            { title: '로컬 우선 보안', desc: '업로드한 이미지는 브라우저 안에서만 처리하고 외부 서버로 보내지 않아, 작업물이 유출될 걱정 없이 사용할 수 있습니다.' },
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

      {/* ── WORKFLOW (HOW IT WORKS) ──────────── */}
      <section className={styles.workflowSection}>
        <Reveal>
          <div className={styles.sectionLabelCenter}>사용 흐름</div>
          <h2 className={styles.sectionTitleCenter}>URL만 넣으면, 저장까지 한 흐름으로</h2>
          <p className={styles.workflowSubtitle}>
            처음 써도 막히지 않도록 5단계로 단순하게. 화면 흐름 그대로 따라가면 끝납니다.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <ol className={styles.workflowFlow}>
            {WORKFLOW_STEPS.map((s, i) => (
              <Fragment key={s.title}>
                <li className={styles.workflowStep}>
                  <span className={styles.workflowStepNum}>STEP {i + 1}</span>
                  <div className={styles.workflowIcon}>{s.icon}</div>
                  <h3 className={styles.workflowStepTitle}>{s.title}</h3>
                  <p className={styles.workflowStepDesc}>{s.desc}</p>
                  <div className={styles.workflowTags}>
                    <span className={styles.tagFree}>무료</span>
                    {s.pro && <span className={styles.tagPro}>+ Pro {s.pro}</span>}
                  </div>
                </li>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <li className={styles.workflowArrow} aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </Reveal>

        {/* 사용 예시 이미지 — 결과 미리보기 */}
        <Reveal delay={120}>
          <div className={styles.workflowExample}>
            <div className={styles.workflowExampleHead}>
              <span className={styles.sectionLabelCenter}>결과 예시</span>
              <h3>이 흐름을 거치면 이렇게 완성됩니다</h3>
            </div>
            <div className={styles.workflowExampleGrid}>
              {WORKFLOW_EXAMPLES.map((ex) => (
                <figure className={styles.workflowExampleItem} key={ex.src}>
                  <img src={publicMockupSrc(ex.src)} alt={ex.title} loading="lazy" decoding="async" />
                  <figcaption>
                    <span>{ex.cat}</span>
                    <strong>{ex.title}</strong>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 무료 → Pro 자연스러운 연결 */}
        <Reveal delay={160}>
          <div className={styles.workflowUpsell}>
            <div className={styles.workflowUpsellText}>
              <strong>전체 흐름은 무료로 사용할 수 있어요.</strong>
              <span>Pro는 프리미엄 목업과 고화질 Export, Before/After GIF를 더합니다.</span>
            </div>
            <div className={styles.workflowUpsellBtns}>
              <Button variant="primary" onClick={() => navigate('/editor')}>무료로 시작하기</Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')}>Pro 기능 보기 →</Button>
            </div>
          </div>
        </Reveal>
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

      {/* ── PRICING ──────────────────────────── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.sectionLabelCenter}>요금제</div>
          <h2 className={styles.sectionTitleCenter}>하루 330원으로, 모든 한계를 풉니다</h2>
          <p className={styles.pricingLede}>
            커피 한 잔보다 싼 월 9,900원. 무제한 목업과 고화질·상업적 사용까지 한 번에 풀립니다.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className={styles.planRow}>
            {/* Free */}
            <div className={`${styles.planCard} ${styles.planCardFree}`}>
              <div className={styles.planHead}>
                <div>
                  <div className={styles.planName}>Free</div>
                  <div className={styles.planPrice}>₩0 <span>/ 월</span></div>
                </div>
                <Badge variant="outline">맛보기</Badge>
              </div>
              <p className={styles.planDesc}>먼저 가볍게 체험해보는 샘플 플랜</p>
              <ul className={styles.planList}>
                <li><span className={styles.checkOn}>✓</span>샘플 목업 2개</li>
                <li><span className={styles.checkOn}>✓</span>반응형 검수 · URL 미리보기</li>
                <li className={styles.planLimitItem}><span className={styles.checkLimit}>!</span>저장 제한 (워터마크 · 저해상도)</li>
                <li className={styles.planOffItem}><span className={styles.checkOff}>✕</span>Premium Mockup</li>
                <li className={styles.planOffItem}><span className={styles.checkOff}>✕</span>상업적 사용</li>
              </ul>
              <Button variant="secondary" fullWidth onClick={() => navigate('/editor')}>
                무료로 시작하기
              </Button>
            </div>

            {/* Pro — highlighted */}
            <div className={`${styles.planCard} ${styles.planCardPro}`}>
              <span className={styles.planRibbon}>가장 인기</span>
              <div className={styles.planHead}>
                <div>
                  <div className={styles.planName}>Pro</div>
                  <div className={styles.planPrice}>₩9,900 <span>/ 월</span></div>
                  <div className={styles.planPerDay}>하루 약 330원</div>
                </div>
                <Badge variant="accent">추천</Badge>
              </div>
              <p className={styles.planDesc}>실제 작업·납품까지 쓰는 무제한 상업용 플랜</p>
              <ul className={styles.planList}>
                {['무제한 목업', 'PNG Export (고화질)', 'GIF Export (Before/After)', 'Premium Mockup', '상업적 사용', '우선 업데이트 · 신규 목업 먼저'].map(f => (
                  <li key={f}><span className={styles.checkOn}>✓</span>{f}</li>
                ))}
              </ul>
              <Button variant="primary" fullWidth className={styles.planProCta} onClick={() => setComingSoon(true)}>
                Pro 결과 예시 보기
              </Button>
              <p className={styles.planProNote}>카드 정보 없이 출시 알림부터 받아보세요</p>
            </div>
          </div>
        </Reveal>

        {/* 가격 비교표 */}
        <Reveal delay={120}>
          <div className={styles.compareWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>기능</th>
                  <th>Free</th>
                  <th className={styles.compareProCol}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_COMPARISON.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td><CompareCell value={row.free} /></td>
                    <td className={styles.compareProCol}><CompareCell value={row.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* 신뢰 요소 */}
        <Reveal delay={160}>
          <ul className={styles.trustRow}>
            {TRUST_ITEMS.map((t) => (
              <li key={t.label}><span aria-hidden>{t.icon}</span>{t.label}</li>
            ))}
          </ul>
        </Reveal>

        <p className={styles.planGuardCenter}>
          지금은 무료 베타라 모든 기능을 그냥 쓰실 수 있어요. Pro는 정식 출시 때 열리며, 그때까지 카드 정보는 받지 않습니다.
        </p>
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

      <Modal open={comingSoon} onClose={() => setComingSoon(false)} title="Pro로 만드는 결과">
        <div className={styles.comingSoonModal}>
          <div className={styles.csPreviewGrid}>
            {WORKFLOW_EXAMPLES.map((ex) => (
              <figure className={styles.csPreviewItem} key={ex.src}>
                <img src={publicMockupSrc(ex.src)} alt={ex.title} loading="lazy" decoding="async" />
                <figcaption>{ex.cat}</figcaption>
              </figure>
            ))}
          </div>
          <ul className={styles.csBenefits}>
            <li><span className={styles.checkOn}>✓</span>무제한 목업 · 프리미엄 50종+</li>
            <li><span className={styles.checkOn}>✓</span>워터마크 없는 고화질(2x·4x) PNG · GIF</li>
            <li><span className={styles.checkOn}>✓</span>상업적 사용 + 신규 목업 우선 제공</li>
          </ul>
          <p className={styles.csNote}>정식 출시 때 열립니다. 지금은 무료 베타로 핵심 기능을 바로 써볼 수 있어요.</p>
          <Button variant="primary" fullWidth onClick={() => { setComingSoon(false); navigate('/editor'); }}>
            무료로 지금 만들어보기
          </Button>
        </div>
      </Modal>
    </main>
  );
}
