import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { canUseFeature, type FeatureKey } from '../../domain/features';
import { PlanTier, type PlanTier as PlanTierValue } from '../../domain/plans';
import styles from './FeatureLock.module.css';

interface Props {
  feature: FeatureKey;
  currentPlan?: PlanTierValue;
  title?: string;
  description?: string;
}

export function FeatureLock({
  feature,
  currentPlan = PlanTier.Free,
  title = 'Pro 기능',
  description = '이 기능은 Pro 플랜에서 사용할 수 있습니다.',
}: Props) {
  const navigate = useNavigate();
  const available = canUseFeature(currentPlan, feature);

  if (available) return null;

  return (
    <div className={styles.lock}>
      <div className={styles.icon} aria-hidden>🔒</div>
      <div>
        <Badge variant="outline">Upgrade</Badge>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={() => navigate('/billing')}>
        Pro 보기
      </Button>
    </div>
  );
}
