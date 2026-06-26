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
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={styles.row}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.val}>{value}{unit}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
        <input
          type="range"
          className={styles.input}
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
