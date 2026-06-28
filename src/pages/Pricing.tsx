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
          현재는 실제 결제를 연결하지 않습니다. 가격, 권한, Upgrade 흐름을 먼저 분리해두고
          나중에 Toss Payments와 서버 검증을 붙일 수 있게 설계했습니다.
        </p>
      </section>

      <section className={styles.planGrid} aria-label="요금제">
        {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
      </section>

      <section className={styles.compare}>
        <div className={styles.compareHead}>
          <div>
            <span className={styles.eyebrow}>Feature matrix</span>
            <h2>기능 권한은 Free / Pro 두 단계로만 관리합니다</h2>
          </div>
          <Button variant="secondary" onClick={() => navigate('/billing')}>Billing 구조 보기</Button>
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
          title="커스텀 PNG 목업은 Pro로 분리"
          description="사용자에게 과하게 막지 않고, 필요한 순간에만 Upgrade 이유와 비교표를 보여줍니다."
        />
      </section>

      <section className={styles.notice}>
        <h3>결제/로그인 구현 범위</h3>
        <p>
          Login, Sign up, Billing, Subscription, Invoice, Payment result 페이지는 준비되어 있지만,
          실제 인증·결제·구독 변경·DB 쓰기는 수행하지 않습니다.
        </p>
      </section>
    </main>
  );
}
