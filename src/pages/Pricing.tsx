import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PLANS } from '../data/plans';
import styles from './Pricing.module.css';

type Billing = 'monthly' | 'annual';

function formatPrice(krw: number): string {
  return `₩${krw.toLocaleString('ko-KR')}`;
}

export function Pricing() {
  const [comingSoon, setComingSoon] = useState(false);
  const [billing, setBilling] = useState<Billing>('annual');
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <Badge variant="accent">요금제</Badge>
        <h1 className={styles.title}>심플하고 투명한 가격</h1>
        <p className={styles.desc}>
          핵심 기능은 지금 바로 무료. 가입하면 <strong>30일 무료 체험</strong>, 핵심 내보내기 <strong>첫 3회는 평생 무료</strong>입니다.
        </p>

        {/* Billing toggle */}
        <div className={styles.billingToggle} role="group" aria-label="결제 주기 선택">
          <button
            className={`${styles.billingBtn} ${billing === 'monthly' ? styles.billingActive : ''}`}
            onClick={() => setBilling('monthly')}
            aria-pressed={billing === 'monthly'}
          >
            월간
          </button>
          <button
            className={`${styles.billingBtn} ${billing === 'annual' ? styles.billingActive : ''}`}
            onClick={() => setBilling('annual')}
            aria-pressed={billing === 'annual'}
          >
            연간
            <span className={styles.billingSave}>최대 20% 절약</span>
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => {
          const price = billing === 'annual' ? plan.annual : plan.monthly;
          return (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.highlighted ? styles.featured : ''} ${!plan.available ? styles.disabled : ''}`}
            >
              {plan.highlighted && <div className={styles.featuredTag}>가장 인기</div>}

              <div className={styles.cardTop}>
                <div className={styles.planMeta}>
                  <span className={styles.planName}>{plan.name}</span>
                  {plan.available
                    ? <Badge variant="success">지금 사용 가능</Badge>
                    : <Badge variant="outline">Coming Soon</Badge>}
                </div>
                <div className={styles.price}>
                  {price === 0 ? '₩0' : formatPrice(price)}
                  {plan.id !== 'free' && <span className={styles.priceSuffix}> / 월</span>}
                </div>
                {plan.id !== 'free' && (
                  <div className={styles.priceNote}>
                    {billing === 'annual' ? '연간 결제 시 · 30일 무료 체험 포함' : '월간 결제 · 30일 무료 체험 포함'}
                  </div>
                )}
                <p className={styles.planDesc}>{plan.description}</p>
              </div>

              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f}>
                    <span className={styles.checkYes}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'primary' : plan.available ? 'primary' : 'secondary'}
                fullWidth
                onClick={() => plan.available ? navigate('/editor') : setComingSoon(true)}
              >
                {plan.cta}
              </Button>
            </div>
          );
        })}
      </div>

      <div className={styles.notice}>
        <h3>🔒 개인정보 보호 안내</h3>
        <p>
          Mockfolio는 No AI · No Server Upload · Local First 원칙으로 설계됩니다.
          업로드된 이미지는 어떠한 외부 서버로도 전송되지 않으며, 브라우저 내에서만 처리됩니다.
          결제·계정 기능은 정식 출시와 함께 제공될 예정입니다.
        </p>
      </div>

      <Modal open={comingSoon} onClose={() => setComingSoon(false)} title="곧 만나요">
        <div className={styles.comingSoon}>
          <div className={styles.csEmoji}>🚀</div>
          <p>
            유료 플랜과 30일 무료 체험은 정식 출시와 함께 시작됩니다.<br />
            지금은 로그인 없이 무료 기능을 마음껏 사용하세요.
          </p>
          <Button variant="primary" fullWidth onClick={() => { setComingSoon(false); navigate('/editor'); }}>
            무료로 에디터 열기
          </Button>
        </div>
      </Modal>
    </main>
  );
}
