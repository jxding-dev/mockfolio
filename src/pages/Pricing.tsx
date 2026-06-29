import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PlanCard } from '../components/saas/PlanCard';
import { FeatureLock } from '../components/saas/FeatureLock';
import { PLANS } from '../data/plans';
import { FEATURE_DEFINITIONS, FeatureKey } from '../domain/features';
import { PLAN_LABELS, PlanTier } from '../domain/plans';
import styles from './Pricing.module.css';

const PRO_SHOWCASES = [
  {
    label: 'Premium mockups',
    title: '실사형 광고판, 디바이스, 상세페이지 목업',
    desc: '클라이언트 제안서나 포트폴리오에 바로 넣을 수 있는 상업용 장면을 더 많이 엽니다.',
  },
  {
    label: 'High-res export',
    title: '고화질 PNG와 GIF 결과물',
    desc: '웹 업로드용 썸네일뿐 아니라 발표 자료와 Behance 커버에 쓰기 좋은 해상도로 저장합니다.',
  },
  {
    label: 'Custom workflow',
    title: '커스텀 PNG 목업 확장',
    desc: '브랜드가 자주 쓰는 디바이스, 패키지, 매장 목업을 직접 추가하는 흐름까지 준비합니다.',
  },
];

const VALUE_ROWS = [
  ['작업 시작', '가입 없이 URL/이미지 검수', 'Free 기능 전체 + 프리미엄 목업 추천'],
  ['목업 범위', '기본 목업으로 빠른 확인', '실사 광고, 앱, 웹, 상세페이지 장면 전체'],
  ['결과 저장', '기본 PNG 저장', '고화질 PNG, Before/After GIF, 상업용 결과물'],
  ['추천 사용자', '개인 포트폴리오 초안', '프리랜서, 취업 포트폴리오, 클라이언트 제안'],
];

export function Pricing() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Badge variant="accent">Pricing</Badge>
        <h1>Free로 바로 만들고, Pro로 결과물의 설득력을 올리세요</h1>
        <p>
          Mockfolio는 무료로 반응형 검수와 기본 목업 제작을 시작할 수 있습니다.
          Pro는 더 많은 실사 목업, 고화질 Export, Before/After GIF처럼 포트폴리오와 제안서에서 차이가 나는 결과물을 위한 플랜입니다.
        </p>
        <div className={styles.heroActions}>
          <Button variant="primary" onClick={() => navigate('/editor')}>무료로 에디터 열기</Button>
          <Button variant="secondary" onClick={() => navigate('/billing')}>Pro 결과 예시 보기</Button>
        </div>
      </section>

      <section className={styles.planGrid} aria-label="요금제">
        {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
      </section>

      <section className={styles.showcase} aria-labelledby="pro-results-title">
        <div className={styles.showcaseIntro}>
          <span className={styles.eyebrow}>Pro results</span>
          <h2 id="pro-results-title">돈을 내는 이유가 결과물에서 보여야 합니다</h2>
          <p>
            Pro는 기능 개수보다 “더 완성도 높은 이미지가 더 빨리 나온다”는 순간을 만드는 데 집중합니다.
          </p>
        </div>
        <div className={styles.showcaseGrid}>
          {PRO_SHOWCASES.map((item, index) => (
            <article key={item.label} className={styles.showcaseCard}>
              <span className={styles.showcaseNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.showcaseLabel}>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.compare}>
        <div className={styles.compareHead}>
          <div>
            <span className={styles.eyebrow}>Feature matrix</span>
            <h2>Free와 Pro의 차이를 한눈에 확인하세요</h2>
          </div>
          <Button variant="secondary" onClick={() => navigate('/billing')}>결제 화면 미리보기</Button>
        </div>

        <div className={styles.table}>
          <div className={styles.tableRow}>
            <strong>기능</strong>
            <strong>{PLAN_LABELS[PlanTier.Free]}</strong>
            <strong>{PLAN_LABELS[PlanTier.Pro]}</strong>
          </div>
          {FEATURE_DEFINITIONS.map((feature) => (
            <div key={feature.key} className={styles.tableRow}>
              <span>{feature.label}</span>
              <span>{feature.minimumPlan === PlanTier.Free ? '포함' : '잠금'}</span>
              <span>포함</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.valueCompare} aria-label="Free와 Pro 사용 상황 비교">
        <span className={styles.eyebrow}>When to upgrade</span>
        <h2>무료로 충분한 순간과 Pro가 필요한 순간</h2>
        <div className={styles.valueRows}>
          {VALUE_ROWS.map(([label, free, pro]) => (
            <div key={label} className={styles.valueRow}>
              <strong>{label}</strong>
              <span>{free}</span>
              <span>{pro}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.lockPreview}>
        <FeatureLock
          feature={FeatureKey.CustomPngMockups}
          currentPlan={PlanTier.Free}
          title="커스텀 PNG 목업은 Pro에서 제공 예정"
          description="상업용 상세페이지, 광고, 디바이스 목업을 더 폭넓게 쓰고 싶을 때 업그레이드할 수 있습니다."
        />
      </section>

      <section className={styles.notice}>
        <h3>현재는 무료 베타로 제공 중입니다</h3>
        <p>
          지금은 카드 정보 없이 핵심 제작 흐름을 사용할 수 있습니다. 정식 Pro 결제 전까지 실제 과금은 발생하지 않으며,
          Pro 영역은 출시 전 결과 예시와 기능 범위를 미리 보여주는 용도입니다.
        </p>
      </section>
    </main>
  );
}
