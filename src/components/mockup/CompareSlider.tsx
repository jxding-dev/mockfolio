import { useRef, useState, useCallback, useEffect } from 'react';
import type { UploadedImage } from '../../types';
import styles from './CompareSlider.module.css';

interface Props {
  before: UploadedImage | null;
  after: UploadedImage | null;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Before/After comparison with a draggable divider.
 * horizontal = divider moves left↔right (default)
 * vertical   = divider moves top↕bottom
 */
export function CompareSlider({ before, after, orientation = 'horizontal' }: Props) {
  const [pos, setPos] = useState(50); // percent
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isV = orientation === 'vertical';

  const updateFromPoint = useCallback((clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = isV
      ? ((clientY - rect.top) / rect.height) * 100
      : ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, p)));
  }, [isV]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => updateFromPoint(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) updateFromPoint(t.clientX, t.clientY);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouch);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, updateFromPoint]);

  if (!before || !after) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.phIcon}>🔄</div>
        <p className={styles.phTitle}>Before / After 비교</p>
        <p className={styles.phDesc}>
          왼쪽 패널에서 <strong>Before</strong>와 <strong>After</strong> 이미지를<br />
          각각 업로드하면 슬라이더로 비교할 수 있습니다.
        </p>
        <div className={styles.phSlots}>
          <div className={`${styles.phSlot} ${before ? styles.phSlotDone : ''}`}>
            Before {before ? '✓' : '—'}
          </div>
          <div className={`${styles.phSlot} ${after ? styles.phSlotDone : ''}`}>
            After {after ? '✓' : '—'}
          </div>
        </div>
      </div>
    );
  }

  const clipStyle: React.CSSProperties = isV
    ? { clipPath: `inset(0 0 ${100 - pos}% 0)` }
    : { clipPath: `inset(0 ${100 - pos}% 0 0)` };

  const handleStyle: React.CSSProperties = isV
    ? { top: `${pos}%`, left: 0, right: 0, transform: 'translateY(-50%)' }
    : { left: `${pos}%`, top: 0, bottom: 0, transform: 'translateX(-50%)' };

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${isV ? styles.vertical : ''}`}
      onMouseDown={(e) => { setDragging(true); updateFromPoint(e.clientX, e.clientY); }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (t) { setDragging(true); updateFromPoint(t.clientX, t.clientY); }
      }}
    >
      {/* After = base layer (full) */}
      <img src={after.dataUrl} alt="After" className={styles.img} draggable={false} />
      <span className={`${styles.label} ${styles.labelAfter}`}>After</span>

      {/* Before = clipped overlay */}
      <div className={styles.beforeLayer} style={clipStyle}>
        <img src={before.dataUrl} alt="Before" className={styles.img} draggable={false} />
        <span className={`${styles.label} ${styles.labelBefore}`}>Before</span>
      </div>

      {/* Divider handle */}
      <div className={`${styles.handle} ${isV ? styles.handleV : styles.handleH}`} style={handleStyle}>
        <div className={styles.handleLine} />
        <div className={styles.handleGrip}>
          <span className={styles.gripArrow}>{isV ? '↕' : '↔'}</span>
        </div>
      </div>
    </div>
  );
}
