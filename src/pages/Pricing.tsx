import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PLANS } from '../data/plans';
import styles from './Pricing.module.css';

function formatPrice(krw: number): string {
  return `₩${krw.toLocaleString('ko-KR')}`;
}

export function Pricing() {
  const [comingSoon, setComingSoon] = useState(false);
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.head}>
        <Badge variant="accent">요금제</Badge>
        <h1 className={styles.title}>무료로 시작하고, 필요해지면 30일 이용권으로 확장</h1>
        <p className={styles.desc}>
          지금은 로그인과 결제 없이 무료 기능을 제공합니다. 정식 결제 연동 후에는
          <strong> 30일 이용권 ₩9,900</strong> 구조로 단순하게 운영합니다.
        </p>
        <div className={styles.securityStrip} aria-label="서비스 운영 원칙">
          <span>실제 결제 미연동</span>
          <span>민감정보 수집 없음</span>
          <span>이미지 서버 업로드 없음</span>
        </div>
      </section>

      <section className={styles.grid} aria-label="요금제 목록">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`${styles.card} ${plan.highlighted ? styles.featured : ''} ${!plan.available ? styles.disabled : ''}`}
          >
            {plan.highlighted && <div className={styles.featuredTag}>출시 예정 플랜</div>}

            <div className={styles.cardTop}>
              <div className={styles.planMeta}>
                <span className={styles.planName}>{plan.name}</span>
                <Badge variant={plan.available ? 'success' : 'outline'}>{plan.badge}</Badge>
              </div>

              <div className={styles.price}>
                {plan.price === 0 ? '₩0' : formatPrice(plan.price)}
                <span className={styles.priceSuffix}> / {plan.period}</span>
              </div>

              <p className={styles.planDesc}>{plan.description}</p>
              {plan.note && <p className={styles.planNote}>{plan.note}</p>}
            </div>

            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className={styles.checkYes}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.available ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => plan.available ? navigate('/editor') : setComingSoon(true)}
            >
              {plan.cta}
            </Button>
          </article>
        ))}
      </section>

      <section className={styles.launchPlan}>
        <div>
          <Badge variant="outline">결제 연동 전 안전 정책</Badge>
          <h2>지금은 무료 사용만 열어두고, 과금 코드는 넣지 않습니다.</h2>
          <p>
            로그인, 카드 결제, 구독 갱신, 영수증 처리는 아직 연결하지 않습니다.
            따라서 현재 프론트에는 결제 토큰, 사용자 인증 정보, 임시 결제값을 저장하는 코드가 없습니다.
          </p>
        </div>
        <ul>
          <li>무료 사용자는 바로 에디터 사용</li>
          <li>30일 이용권은 가격과 혜택만 사전 안내</li>
          <li>정식 출시 시 검증된 결제 PG와 서버 인증으로 분리 구현</li>
        </ul>
      </section>

      <div className={styles.notice}>
        <h3>🔒 개인정보 보호 안내</h3>
        <p>
          Mockfolio는 No AI · No Server Upload · Local First 원칙으로 설계됩니다.
          업로드된 이미지는 외부 서버로 전송되지 않으며, 브라우저 안에서만 처리됩니다.
          결제·계정 기능은 정식 출시 단계에서 별도 보안 검토 후 연결합니다.
        </p>
      </div>

      <Modal open={comingSoon} onClose={() => setComingSoon(false)} title="결제 기능은 준비 중입니다">
        <div className={styles.comingSoon}>
          <div className={styles.csEmoji}>🧾</div>
          <p>
            30일 이용권은 정식 결제 연동 후 제공됩니다.<br />
            현재는 과금 없이 무료 기능만 사용할 수 있습니다.
          </p>
          <Button variant="primary" fullWidth onClick={() => { setComingSoon(false); navigate('/editor'); }}>
            무료로 에디터 열기
          </Button>
        </div>
      </Modal>
    </main>
  );
}
