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
          기본 검수와 목업 제작은 무료로 시작하세요. Pro는 더 많은 목업과 고화질 저장을 위한
          정식 구독 플랜으로 준비 중이며, 현재 페이지에서는 실제 결제가 발생하지 않습니다.
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
        <h3>현재 결제 상태</h3>
        <p>
          지금은 가격과 플랜을 미리 보여주는 단계입니다. 버튼을 눌러도 실제 과금, 구독 변경,
          계정 저장은 발생하지 않습니다.
        </p>
      </section>
    </main>
  );
}
