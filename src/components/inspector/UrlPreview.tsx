import { useEffect, useRef, useState } from 'react';
import styles from './UrlPreview.module.css';

interface Props {
  url: string;
  width: number;
  height: number;
  refreshKey: number;
}

export function UrlPreview({ url, width, height, refreshKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Re-enter the skeleton state whenever the URL or a refresh reloads the iframe.
  // A safety timeout clears the skeleton even if onLoad never fires (blocked site).
  useEffect(() => {
    setLoading(true);
    const fallback = window.setTimeout(() => setLoading(false), 6000);
    return () => window.clearTimeout(fallback);
  }, [url, refreshKey]);

  const scale = availableWidth ? Math.min(1, Math.max(0.16, (availableWidth - 32) / width)) : 1;
  const scaledHeight = Math.max(180, height * scale);

  return (
    <div className={styles.preview} ref={containerRef}>
      <div className={styles.deviceLabel}>{width} × {height}</div>
      <div className={styles.viewport} style={{ height: scaledHeight }}>
        <div className={styles.frame} style={{ width, height, transform: `scale(${scale})` }}>
          <iframe
            key={refreshKey}
            src={url}
            title="URL 반응형 미리보기"
            sandbox="allow-forms allow-popups allow-scripts"
            referrerPolicy="no-referrer"
            loading="lazy"
            className={loading ? styles.iframeLoading : styles.iframeReady}
            onLoad={() => setLoading(false)}
          />
        </div>

        {loading && (
          <div className={styles.skeleton} aria-hidden>
            <div className={styles.skeletonBar} style={{ width: '38%' }} />
            <div className={styles.skeletonBlock} />
            <div className={styles.skeletonRow}>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </div>
            <div className={styles.skeletonBar} style={{ width: '70%' }} />
            <div className={styles.skeletonBar} style={{ width: '52%' }} />
            <div className={styles.skeletonSpinnerRow}>
              <span className={styles.skeletonSpinner} />
              불러오는 중…
            </div>
          </div>
        )}
      </div>
      <p className={styles.notice}>
        해당 사이트는 외부 미리보기를 차단했을 수 있습니다. 실제 반응형 확인은 새 창에서 열어 확인해주세요.
      </p>
    </div>
  );
}
