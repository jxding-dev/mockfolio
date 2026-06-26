import styles from './Toggle.module.css';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ value, onChange, label, size = 'md' }: Props) {
  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label ?? '옵션 전환'}
        onClick={() => onChange(!value)}
        className={`${styles.track} ${value ? styles.on : ''}`}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  );
}
