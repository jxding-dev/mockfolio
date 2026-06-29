import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PlanCard } from '../components/saas/PlanCard';
import { FeatureLock } from '../components/saas/FeatureLock';
import { PLANS } from '../data/plans';
import { FEATURE_DEFINITIONS, FeatureKey } from '../domain/features';
import { PLAN_LABELS, PlanTier } from '../domain/plans';
import styles from './Pricing.module.css';

export function Pricing() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Badge variant="accent">Pricing</Badge>
        <h1>Free로 시작하고, Pro 월 9,900원으로 확장</h1>
        <p>
          반응형 검수와 목업 제작은 지금 무료로 시작하세요. Pro는 무제한 목업과 고화질·GIF 저장,
          상업적 사용까지 한 번에 여는 구독 플랜으로 곧 출시됩니다.
        </p>
      </section>

      <section className={styles.planGrid} aria-label="요금제">
        {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
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

      <section className={styles.lockPreview}>
        <FeatureLock
          feature={FeatureKey.CustomPngMockups}
          currentPlan={PlanTier.Free}
          title="커스텀 PNG 목업은 Pro에서 제공 예정"
          description="상업용 상세페이지, 광고, 디바이스 목업을 더 폭넓게 쓰고 싶을 때 업그레이드할 수 있습니다."
        />
      </section>

      <section className={styles.notice}>
        <p>
          지금은 무료 베타입니다 — 카드 정보 없이 핵심 기능을 모두 사용할 수 있고, Pro는 정식 출시 때 열립니다.
        </p>
      </section>
    </main>
  );
}
