import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ReviewsSlider.module.css';

export interface Review {
  quote: string;
  name: string;
  role: string;
  initial: string;
  accent: string;
}

interface Props {
  reviews: Review[];
  /** auto-advance interval ms; set 0 to disable */
  interval?: number;
}

export function ReviewsSlider({ reviews, interval = 5000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;

  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  // auto-advance, paused on hover/focus and for reduced-motion users
  useEffect(() => {
    if (!interval || paused || count <= 1) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [interval, paused, count]);

  // swipe support
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    startX.current = null;
  };

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="사용자 후기"
    >
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => go(index - 1)} aria-label="이전 후기">‹</button>

      <div className={styles.viewport} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className={styles.track} style={{ transform: `translateX(-${index * 100}%)` }}>
          {reviews.map((r, i) => (
            <figure className={styles.card} key={i} aria-hidden={i !== index}>
              <div className={styles.stars} aria-label="별점 5점 만점에 5점">★★★★★</div>
              <blockquote className={styles.quote}>“{r.quote}”</blockquote>
              <figcaption className={styles.person}>
                <span className={styles.avatar} style={{ background: r.accent }}>{r.initial}</span>
                <span className={styles.personText}>
                  <span className={styles.name}>{r.name}</span>
                  <span className={styles.role}>{r.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => go(index + 1)} aria-label="다음 후기">›</button>

      <div className={styles.dots} role="tablist" aria-label="후기 선택">
        {reviews.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}번째 후기`}
            aria-selected={i === index}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}
