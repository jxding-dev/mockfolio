import styles from './Toggle.module.css';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ value, onChange, label, size = 'md' }: Props) {
  return (
    <label className={`${styles.wrap} ${styles[size]}`}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`${styles.track} ${value ? styles.on : ''}`}
      >
        <span className={styles.thumb} />
      </button>
    </label>
  );
}
