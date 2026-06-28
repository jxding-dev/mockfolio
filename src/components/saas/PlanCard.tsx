import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Plan } from '../../types';
import styles from './PlanCard.module.css';

interface Props {
  plan: Plan;
  compact?: boolean;
}

function formatPrice(krw: number): string {
  return `₩${krw.toLocaleString('ko-KR')}`;
}

export function PlanCard({ plan, compact = false }: Props) {
  const navigate = useNavigate();
  const isFree = plan.id === 'free';

  return (
    <article className={`${styles.card} ${plan.highlighted ? styles.featured : ''} ${compact ? styles.compact : ''}`}>
      {plan.highlighted && <div className={styles.featuredTag}>Recommended</div>}
      <div className={styles.head}>
        <div>
          <h3 className={styles.name}>{plan.name}</h3>
          <p className={styles.desc}>{plan.description}</p>
        </div>
        {plan.badge && <Badge variant={isFree ? 'success' : 'outline'}>{plan.badge}</Badge>}
      </div>

      <div className={styles.price}>
        {plan.price === 0 ? '₩0' : formatPrice(plan.price)}
        <span> / {plan.period}</span>
      </div>

      {plan.note && <p className={styles.note}>{plan.note}</p>}

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature}>
            <span>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={plan.highlighted ? 'primary' : 'secondary'}
        fullWidth
        onClick={() => navigate(isFree ? '/editor' : '/billing')}
      >
        {plan.cta}
      </Button>
    </article>
  );
}

