import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PLANS } from '../data/plans';
import styles from './Pricing.module.css';

export function Pricing() {
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <Badge variant="accent">요금제</Badge>
        <h1 className={styles.title}>심플하고 투명한 가격</h1>
        <p className={styles.desc}>
          지금 당장 무료로 시작하세요. 계정도, 카드도 필요 없습니다.
        </p>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.card} ${plan.id === 'pro' ? styles.featured : ''} ${!plan.available ? styles.disabled : ''}`}
          >
            {plan.id === 'pro' && (
              <div className={styles.featuredTag}>Most Popular</div>
            )}

            <div className={styles.cardTop}>
              <div className={styles.planMeta}>
                <span className={styles.planName}>{plan.name}</span>
                {plan.available ? (
                  <Badge variant="success">사용 가능</Badge>
                ) : (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
              <div className={styles.price}>
                {plan.price}
                {plan.id !== 'free' && <span className={styles.priceSuffix}> / 월</span>}
              </div>
              <p className={styles.planDesc}>{plan.description}</p>
            </div>

            <ul className={styles.features}>
              {plan.features.map((f) => (
                <li key={f}>
                  <span className={plan.available ? styles.checkYes : styles.checkNo}>
                    {plan.available ? '✓' : '–'}
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.id === 'free' ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => !plan.available && setComingSoon(true)}
              disabled={false}
            >
              {plan.available ? '지금 무료로 시작' : '출시 알림 신청'}
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.notice}>
        <h3>🔒 개인정보 보호 안내</h3>
        <p>
          Mockfolio는 No AI · No Server Upload · Local First 원칙으로 설계됩니다.
          업로드된 이미지는 어떠한 외부 서버로도 전송되지 않으며, 브라우저 내에서만 처리됩니다.
        </p>
      </div>

      <Modal open={comingSoon} onClose={() => setComingSoon(false)} title="출시 알림 신청">
        <div className={styles.comingSoon}>
          <div className={styles.csEmoji}>📬</div>
          <p>유료 플랜은 현재 개발 중입니다.<br />출시되면 가장 먼저 알려드릴게요.</p>
          <Button variant="primary" fullWidth onClick={() => setComingSoon(false)}>
            확인
          </Button>
        </div>
      </Modal>
    </main>
  );
}
