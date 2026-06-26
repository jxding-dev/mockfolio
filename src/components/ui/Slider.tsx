import styles from './Slider.module.css';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, step = 1, unit = '', onChange }: Props) {
  const safeValue = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  const pct = ((safeValue - min) / (max - min)) * 100;
  return (
    <div className={styles.row}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.val}>{safeValue}{unit}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
        <input
          type="range"
          className={styles.input}
          min={min} max={max} step={step}
          value={safeValue}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
