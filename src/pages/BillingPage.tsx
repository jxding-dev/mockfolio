import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PlanCard } from '../components/saas/PlanCard';
import { PLANS } from '../data/plans';
import { PRO_MONTHLY_PRICE_KRW } from '../domain/plans';
import type { BillingRouteState } from '../services/billing/billingContracts';
import styles from './SaasApp.module.css';

interface Props {
  view: BillingRouteState;
}

const detailCopy: Partial<Record<BillingRouteState, { badge: string; title: string; desc: string }>> = {
  subscription: {
    badge: 'Subscription',
    title: '구독 관리 페이지 준비',
    desc: '현재 플랜, 갱신일, 해지 예약 상태를 보여줄 자리입니다. 지금은 실제 구독 정보가 표시되지 않습니다.',
  },
  invoice: {
    badge: 'Invoice',
    title: '인보이스 페이지 준비',
    desc: '결제 내역과 영수증을 확인할 자리입니다. 지금은 실제 결제 내역을 만들거나 조회하지 않습니다.',
  },
  success: {
    badge: 'Payment success',
    title: '결제 완료 페이지 준비',
    desc: '정식 결제 연결 후 사용할 완료 화면입니다. 현재는 미리보기만 제공합니다.',
  },
  failure: {
    badge: 'Payment failure',
    title: '결제 실패 페이지 준비',
    desc: '정식 결제 연결 후 사용할 실패 안내 화면입니다. 현재는 미리보기만 제공합니다.',
  },
  cancel: {
    badge: 'Payment canceled',
    title: '결제 취소 페이지 준비',
    desc: '사용자가 결제를 취소하고 돌아왔을 때 보여줄 화면입니다. 실제 구독 상태는 변경하지 않습니다.',
  },
};

export function BillingPage({ view }: Props) {
  const navigate = useNavigate();
  const copy = view === 'upgrade' ? null : detailCopy[view];

  if (copy) {
    return (
      <main className={styles.statusPage}>
        <section className={styles.statusCard}>
          <Badge variant={view === 'success' ? 'success' : view === 'failure' ? 'error' : 'warning'}>{copy.badge}</Badge>
          <h1>{copy.title}</h1>
          <p>{copy.desc}</p>
          <div className={styles.inlineActions}>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>Dashboard Preview</Button>
            <Button variant="secondary" onClick={() => navigate('/billing')}>Billing</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.billingPage}>
      <section className={styles.billingHero}>
        <Badge variant="accent">Payment preview</Badge>
        <h1>Pro 월 9,900원 구독 화면 미리보기</h1>
        <p>
          현재는 실제 결제를 만들지 않습니다. Pro 혜택과 결제 후 화면을 미리 확인할 수 있으며,
          과금이나 구독 변경은 발생하지 않습니다.
        </p>
      </section>

      <section className={styles.billingGrid}>
        <div className={styles.billingPlans}>
          {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} compact />)}
        </div>

        <aside className={styles.checkoutPanel}>
          <span className={styles.eyebrow}>Payment preview</span>
          <h2>Upgrade 미리보기</h2>
          <p>Pro 월 {PRO_MONTHLY_PRICE_KRW.toLocaleString('ko-KR')}원 구독 화면의 흐름을 확인합니다.</p>
          <div className={styles.codeBox}>
            실제 결제 요청은 아직 생성하지 않습니다.
          </div>
          <Button variant="primary" fullWidth onClick={() => navigate('/payment/success')}>
            결제 완료 화면 미리보기
          </Button>
          <p className={styles.smallNote}>현재 버튼은 미리보기 이동만 수행하며 결제 요청은 만들지 않습니다.</p>
        </aside>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Subscription</span>
          <h3>구독 상태</h3>
          <p>정식 출시 후 현재 플랜과 갱신 상태를 보여줍니다.</p>
          <Link to="/subscription">Subscription 페이지</Link>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Invoice</span>
          <h3>인보이스</h3>
          <p>정식 결제 이후 영수증과 결제 내역을 확인할 수 있습니다.</p>
          <Link to="/invoice">Invoice 페이지</Link>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Cancel</span>
          <h3>취소 플로우</h3>
          <p>구독 해지 요청 전 확인해야 할 내용을 안내합니다.</p>
          <Link to="/payment/cancel">Cancel 페이지</Link>
        </article>
      </section>
    </main>
  );
}
