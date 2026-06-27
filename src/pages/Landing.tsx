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
  { q: '정말 무료인가요?', a: '핵심 기능은 지금 바로 로그인 없이 무료로 쓸 수 있습니다. 정식 출시 후 가입하면 30일 무료 체험이 제공되고, 핵심 내보내기 첫 3회는 평생 무료입니다.' },
  { q: '업로드한 이미지는 안전한가요?', a: '모든 이미지는 브라우저 안에서만 처리됩니다. 외부 서버로 전송하지 않고, AI 학습에도 사용하지 않습니다.' },
  { q: '결제는 어떻게 하나요?', a: '유료 플랜과 결제는 곧 제공될 예정입니다. 지금은 무료 기능을 자유롭게 사용하세요.' },
  { q: '상업적으로 사용할 수 있나요?', a: '네. 직접 만든 목업 결과물은 포트폴리오·제안서 등 상업적 용도로 자유롭게 사용할 수 있습니다.' },
];

/* ─────────────────────────────────────────────────────────
   App Preview — CSS/SVG 기반 인터랙티브 미리보기
   ───────────────────────────────────────────────────────── */
type PreviewTab = 'inspect' | 'mockup' | 'export';

function AppPreview() {
  const [tab, setTab] = useState<PreviewTab>('inspect');

  return (
    <div className={styles.appPreview}>
      {/* Outer shell */}
      <div className={styles.apShell}>
        {/* Top bar */}
        <div className={styles.apTopBar}>
          <div className={styles.apLogo}>
            <div className={styles.apLogoMark} />
            <span>Mockfolio</span>
          </div>
          <div className={styles.apTabs}>
            {(['inspect','mockup','export'] as PreviewTab[]).map((t) => (
              <button
                key={t}
                className={`${styles.apTab} ${tab === t ? styles.apTabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'inspect' ? 'Inspect' : t === 'mockup' ? 'Mockup' : 'Export'}
              </button>
            ))}
          </div>
          <div className={styles.apActions}>
            <div className={styles.apSaveState}>저장됨</div>
            <div className={styles.apAvatar} />
          </div>
        </div>

        {/* Body */}
        <div className={styles.apBody}>
          {/* Left sidebar */}
          <div className={styles.apSidebar}>
            <div className={styles.apSideSection}>
              <div className={styles.apSideLabel}>업로드</div>
              <div className={styles.apUploadBox}>
                <div className={styles.apUploadIcon}>↑</div>
                <div className={styles.apUploadText}>이미지 드롭</div>
              </div>
            </div>
            <div className={styles.apSideSection}>
              <div className={styles.apSideLabel}>디바이스</div>
              {['Mobile 390', 'Tablet 768', 'Desktop 1440'].map((d, i) => (
                <div key={d} className={`${styles.apDeviceItem} ${i === 0 ? styles.apDeviceActive : ''}`}>
                  <div className={styles.apDeviceDot} />
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className={styles.apCanvas}>
            {tab === 'inspect' && <InspectCanvas />}
            {tab === 'mockup' && <MockupCanvas />}
            {tab === 'export' && <ExportCanvas />}
          </div>

          {/* Right panel */}
          <div className={styles.apRight}>
            <div className={styles.apSideLabel}>속성</div>
            {tab === 'inspect' && (
              <>
                <div className={styles.apPropRow}><span>가이드</span><div className={styles.apToggleOn} /></div>
                <div className={styles.apPropRow}><span>그리드</span><div className={styles.apToggleOff} /></div>
                <div className={styles.apPropRow}><span>중앙선</span><div className={styles.apToggleOff} /></div>
                <div className={styles.apPropRow}><span>여백</span><div className={styles.apToggleOn} /></div>
              </>
            )}
            {tab === 'mockup' && (
              <>
                <div className={styles.apPropRow}><span>프레임</span><div className={styles.apPropTag}>Browser</div></div>
                <div className={styles.apSliderRow}>
                  <span>그림자</span>
                  <div className={styles.apSlider}><div className={styles.apSliderFill} style={{width:'65%'}} /></div>
                </div>
                <div className={styles.apSliderRow}>
                  <span>배경</span>
                  <div className={styles.apColorDots}>
                    <div style={{background:'#6366F1'}} className={`${styles.apColorDot} ${styles.apColorActive}`}/>
                    <div style={{background:'#F472B6'}} className={styles.apColorDot}/>
                    <div style={{background:'#34D399'}} className={styles.apColorDot}/>
                    <div style={{background:'#1E293B'}} className={styles.apColorDot}/>
                  </div>
                </div>
                <div className={styles.apSliderRow}>
                  <span>스케일</span>
                  <div className={styles.apSlider}><div className={styles.apSliderFill} style={{width:'80%'}} /></div>
                </div>
              </>
            )}
            {tab === 'export' && (
              <>
                <div className={styles.apPropRow}><span>해상도</span><div className={styles.apPropTag}>2×</div></div>
                <div className={styles.apPropRow}><span>형식</span><div className={styles.apPropTag}>PNG</div></div>
                <div className={styles.apExportBtn}>PNG 저장</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectCanvas() {
  return (
    <div className={styles.inspectCanvas}>
      {/* Browser chrome */}
      <div className={styles.icBrowser}>
        <div className={styles.icBar}>
          <span className={styles.icDot} style={{background:'#ff5f57'}}/>
          <span className={styles.icDot} style={{background:'#ffbd2e'}}/>
          <span className={styles.icDot} style={{background:'#28c840'}}/>
          <div className={styles.icUrl}>yourportfolio.com</div>
          <span className={styles.icWidth}>390px</span>
        </div>
        <div className={styles.icScreen}>
          {/* Guide lines */}
          <div className={styles.icMarginLeft} />
          <div className={styles.icMarginRight} />
          <div className={styles.icCenterLine} />
          {/* Skeleton UI */}
          <div className={styles.icNav}/>
          <div className={styles.icHero}/>
          <div className={styles.icRow}>
            <div className={styles.icCard}/>
            <div className={styles.icCard}/>
          </div>
          <div className={styles.icBtn}/>
        </div>
      </div>
    </div>
  );
}

function MockupCanvas() {
  return (
    <div className={styles.mockupCanvas}>
      {/* Gradient background */}
      <div className={styles.mcGradientBg}>
        {/* Browser frame */}
        <div className={styles.mcFrame}>
          <div className={styles.mcFrameBar}>
            <span className={styles.icDot} style={{background:'#ff5f57'}}/>
            <span className={styles.icDot} style={{background:'#ffbd2e'}}/>
            <span className={styles.icDot} style={{background:'#28c840'}}/>
            <div className={styles.icUrl}>yourportfolio.com</div>
          </div>
          <div className={styles.mcFrameScreen}>
            <div className={styles.mcSkNav}/>
            <div className={styles.mcSkHero}/>
            <div className={styles.mcSkCards}>
              <div className={styles.mcSkCard}/>
              <div className={styles.mcSkCard}/>
              <div className={styles.mcSkCard}/>
            </div>
          </div>
        </div>
        {/* Phone */}
        <div className={styles.mcPhone}>
          <div className={styles.mcPhoneIsland}/>
          <div className={styles.mcPhoneScreen}>
            <div className={styles.mcSkPhoneHero}/>
            <div className={styles.mcSkPhoneCard}/>
            <div className={styles.mcSkPhoneCard}/>
          </div>
          <div className={styles.mcPhoneHome}/>
        </div>
      </div>
    </div>
  );
}

function ExportCanvas() {
  return (
    <div className={styles.exportCanvas}>
      <div className={styles.ecPreviewBox}>
        <div className={styles.ecMiniGrad}>
          <div className={styles.ecMiniFrame}>
            <div className={styles.ecMiniBar}/>
            <div className={styles.ecMiniScreen}/>
          </div>
        </div>
      </div>
      <div className={styles.ecInfo}>
        <div className={styles.ecFileName}>mockfolio-portfolio-2026.png</div>
        <div className={styles.ecSize}>3200 × 2000px · 2× · PNG</div>
        <div className={styles.ecCheck}>✓ 저장 준비 완료</div>
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
          <div className={styles.heroBgGlow1} />
          <div className={styles.heroBgGlow2} />
          <div className={styles.heroBgGrid} />
        </div>

        <div className={styles.heroInner}>
          <div className={`${styles.heroText} ${styles.heroEnter}`}>
            <span className={styles.heroBadgeWrap}>
              <Badge variant="accent">가입하면 30일 무료 · 핵심 기능 첫 3회 평생 무료</Badge>
            </span>

            <h1 className={styles.heroTitle}>
              반응형 검수부터<br />
              <span className={styles.heroAccent}>포트폴리오 목업</span><br />
              제작까지, 한 번에.
            </h1>

            <p className={styles.heroDesc}>
              웹/앱 화면 캡처를 업로드하고 다양한 디바이스 크기로 확인한 뒤,
              프리미엄 목업 이미지로 내보내세요.<br />
              <strong>서버 없이, 100% 로컬.</strong>
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
                <span className={styles.heroStatNum}>8종</span>
                <span className={styles.heroStatLabel}>디바이스 프리셋</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>6종</span>
                <span className={styles.heroStatLabel}>목업 프레임</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>2×</span>
                <span className={styles.heroStatLabel}>Retina Export</span>
              </div>
            </div>
          </div>

          <div className={`${styles.heroVisual} ${styles.heroEnterVisual}`}>
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className={styles.section}>
        <Reveal>
          <div className={styles.sectionLabel}>주요 기능</div>
          <h2 className={styles.sectionTitle}>
            디자이너와 개발자를 위한<br />올인원 검수 + 목업 툴
          </h2>
        </Reveal>

        <div className={styles.featureGrid}>
          {[
            { number: '01', icon: '📐', title: 'Responsive Inspect', desc: '360px부터 1920px까지 8가지 디바이스 프리셋으로 UI 레이아웃 깨짐을 즉시 확인합니다. 안전영역, 8px 그리드, 중앙선 가이드를 켜고 끄며 세밀하게 검수하세요.', tags: ['8종 프리셋', '가이드라인', '방향 전환', 'Before/After'], accent: '#6366F1' },
            { number: '02', icon: '🖼', title: 'Portfolio Mockup', desc: 'iPhone, 브라우저, MacBook 프레임에 화면을 넣고 배경, 그림자, 텍스트를 자유롭게 조절합니다. CSS/SVG 기반 프레임으로 추후 커스텀 목업도 추가 가능합니다.', tags: ['6종 프레임', '배경 커스텀', '그림자 조절', '텍스트 오버레이'], accent: '#8B5CF6' },
            { number: '03', icon: '💾', title: 'PNG Export', desc: 'Retina 2× 해상도로 포트폴리오에 바로 쓸 수 있는 고화질 PNG 파일을 저장합니다. 배경 포함/제외, 투명 배경을 선택해 다양한 용도로 활용하세요.', tags: ['1× / 2× 해상도', '투명 배경', '파일명 자동 생성', '즉시 다운로드'], accent: '#06B6D4' },
          ].map((f, i) => (
            <Reveal key={f.number} delay={i * 90}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsLeft}>
          <div className={styles.sectionLabel}>사용 방법</div>
          <h2 className={styles.sectionTitle}>4단계로 완성하는<br />포트폴리오 목업</h2>
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
            { n: '01', title: '스크린샷 업로드', desc: 'PNG, JPG, WebP 파일을 드래그하거나 클릭해서 업로드합니다. 서버로 전송되지 않습니다.' },
            { n: '02', title: '반응형 검수', desc: '모바일, 태블릿, 데스크탑 크기로 전환하며 레이아웃을 확인하고 가이드를 활용합니다.' },
            { n: '03', title: '목업 디자인', desc: '디바이스 프레임, 배경 스타일, 그림자 강도, 텍스트 오버레이를 자유롭게 조절합니다.' },
            { n: '04', title: 'PNG 저장', desc: '포트폴리오용 고해상도 PNG 파일을 바로 다운로드합니다.' },
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
          <h2 className={styles.sectionTitle}>가입하면 30일 무료, 첫 3회는 평생 무료</h2>
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
            <p className={styles.planDesc}>개인 포트폴리오 작업에 필요한 핵심 기능</p>
            <ul className={styles.planList}>
              {['반응형 검수 8종 디바이스', '기본 목업 프레임 6종', 'Before/After 비교', 'PNG Export 1× / 2×', '로컬 처리 (서버 전송 없음)'].map(f => (
                <li key={f}><span className={styles.checkOn}>✓</span>{f}</li>
              ))}
            </ul>
            <Button variant="primary" fullWidth onClick={() => navigate('/editor')}>
              지금 무료로 시작하기
            </Button>
          </div>

          {/* Pro + Studio */}
          <div className={styles.planComboCol}>
            {[
              {
                name: 'Pro',
                price: '₩9,900',
                features: ['멀티 이미지 프로젝트', 'Export 3× / 4×', '브랜드 키트', '워터마크 제거', '프로젝트 히스토리'],
              },
              {
                name: 'Studio',
                price: '₩29,900',
                features: ['팀 공유 및 협업', '클라우드 저장', '클라이언트 리뷰 링크', 'PDF 리포트', '브랜드 템플릿 관리'],
              },
            ].map((p) => (
              <div key={p.name} className={`${styles.planCard} ${styles.planCardSoon}`}>
                <div className={styles.planHead}>
                  <div>
                    <div className={styles.planName}>{p.name}</div>
                    <div className={styles.planPrice}>{p.price} <span>/mo</span></div>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <ul className={styles.planList}>
                  {p.features.map(f => (
                    <li key={f}><span className={styles.checkOff}>–</span>{f}</li>
                  ))}
                </ul>
                <Button variant="secondary" fullWidth onClick={() => setComingSoon(true)}>
                  준비 중
                </Button>
              </div>
            ))}
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
            <h2 className={styles.finalCtaTitle}>지금 바로, 무료로 시작하세요</h2>
            <p className={styles.finalCtaDesc}>설치도 가입도 필요 없습니다. 이미지를 올리는 순간 바로 작업이 시작됩니다.</p>
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
          <p>유료 플랜은 현재 개발 중입니다.<br />지금은 로그인 없이 무료 기능을 사용하세요.</p>
          <Button variant="primary" fullWidth onClick={() => setComingSoon(false)}>
            확인
          </Button>
        </div>
      </Modal>
    </main>
  );
}
