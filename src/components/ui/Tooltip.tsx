import { useState, type ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface Props {
  label: string;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ label, children, placement = 'top' }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && label && (
        <div className={`${styles.tip} ${styles[placement]}`}>{label}</div>
      )}
    </div>
  );
}
