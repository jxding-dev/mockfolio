import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PlanCard } from '../components/saas/PlanCard';
import { PLANS } from '../data/plans';
import { PRO_MONTHLY_PRICE_KRW } from '../domain/plans';
import { paymentProviderLabel, type BillingRouteState } from '../services/billing/billingContracts';
import styles from './SaasApp.module.css';

interface Props {
  view: BillingRouteState;
}

const detailCopy: Partial<Record<BillingRouteState, { badge: string; title: string; desc: string }>> = {
  subscription: {
    badge: 'Subscription',
    title: '구독 관리 페이지 준비',
    desc: 'Supabase 사용자 plan 값과 Toss Payments 결제 상태를 조합해 현재 플랜, 갱신일, 해지 예약 상태를 표시할 화면입니다.',
  },
  invoice: {
    badge: 'Invoice',
    title: '인보이스 페이지 준비',
    desc: '결제 승인번호, 결제 금액, 영수증 URL, 환불 상태를 서버 검증 후 안전하게 표시할 화면입니다.',
  },
  success: {
    badge: 'Payment success',
    title: '결제 완료 페이지 준비',
    desc: 'Toss Payments 결제 성공 redirect를 받을 화면입니다. 현재는 실제 결제 검증을 수행하지 않습니다.',
  },
  failure: {
    badge: 'Payment failure',
    title: '결제 실패 페이지 준비',
    desc: '결제 실패 코드와 메시지를 안전하게 표시할 화면입니다. 현재는 테스트용 UI만 제공합니다.',
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
            <Button variant="primary" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button variant="secondary" onClick={() => navigate('/billing')}>Billing</Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.billingPage}>
      <section className={styles.billingHero}>
        <Badge variant="accent">Billing ready</Badge>
        <h1>Pro 월 9,900원 구조로 결제 연결 준비</h1>
        <p>
          현재는 실제 결제를 만들지 않습니다. Upgrade 버튼, 구독, 인보이스, 결제 결과 페이지를
          먼저 정리해두고 나중에 {paymentProviderLabel}와 서버 검증만 연결합니다.
        </p>
      </section>

      <section className={styles.billingGrid}>
        <div className={styles.billingPlans}>
          {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} compact />)}
        </div>

        <aside className={styles.checkoutPanel}>
          <span className={styles.eyebrow}>Checkout contract</span>
          <h2>Upgrade 버튼</h2>
          <p>Pro 월 {PRO_MONTHLY_PRICE_KRW.toLocaleString('ko-KR')}원 결제를 열 API 호출 위치입니다.</p>
          <div className={styles.codeBox}>
            createCheckout&#123; planId: 'pro', returnUrl, cancelUrl &#125;
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
          <p>Free · Pro · cancel_at_period_end 값을 표시할 예정입니다.</p>
          <Link to="/subscription">Subscription 페이지</Link>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Invoice</span>
          <h3>인보이스</h3>
          <p>결제 승인번호, 금액, 영수증 URL을 서버 검증 후 렌더링합니다.</p>
          <Link to="/invoice">Invoice 페이지</Link>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Cancel</span>
          <h3>취소 플로우</h3>
          <p>사용자가 해지 요청을 했을 때 확인 화면과 서버 액션을 분리합니다.</p>
          <Link to="/payment/cancel">Cancel 페이지</Link>
        </article>
      </section>
    </main>
  );
}
