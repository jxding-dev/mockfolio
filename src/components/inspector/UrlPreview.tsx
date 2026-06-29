import { useEffect, useRef, useState } from 'react';
import styles from './UrlPreview.module.css';

interface Props {
  url: string;
  width: number;
  height: number;
  refreshKey: number;
}

type Status = 'loading' | 'loaded' | 'blocked';

export function UrlPreview({ url, width, height, refreshKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Reset to loading on each URL/refresh. If the iframe never reports a load
  // within the timeout, treat it as a likely embed block (X-Frame-Options/CSP).
  useEffect(() => {
    setStatus('loading');
    const timeout = window.setTimeout(() => {
      setStatus((current) => (current === 'loading' ? 'blocked' : current));
    }, 6000);
    return () => window.clearTimeout(timeout);
  }, [url, refreshKey]);

  const scale = availableWidth ? Math.min(1, Math.max(0.16, (availableWidth - 32) / width)) : 1;
  const scaledHeight = Math.max(180, height * scale);

  return (
    <div className={styles.preview} ref={containerRef}>
      <div className={styles.previewHead}>
        <span className={styles.deviceLabel}>{width} × {height}</span>
        <span className={`${styles.statusChip} ${styles[`status_${status}`]}`}>
          {status === 'loading' ? '불러오는 중' : status === 'loaded' ? '미리보기 표시됨' : '임베드 차단 의심'}
        </span>
      </div>
      <div className={styles.viewport} style={{ height: scaledHeight }}>
        <div className={styles.frame} style={{ width, height, transform: `scale(${scale})` }}>
          <iframe
            key={refreshKey}
            src={url}
            title="URL 반응형 미리보기"
            sandbox="allow-forms allow-popups allow-scripts"
            referrerPolicy="no-referrer"
            loading="lazy"
            className={status === 'loading' ? styles.iframeLoading : styles.iframeReady}
            onLoad={() => setStatus('loaded')}
          />
        </div>

        {status === 'loading' && (
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

      {status === 'loaded' && (
        <p className={styles.noticeInfo}>
          미리보기를 불러왔습니다. 화면이 비어 보인다면 해당 사이트가 임베드를 제한한 경우이며, 새 창에서 정확히 확인할 수 있습니다.
        </p>
      )}
      {status === 'blocked' && (
        <p className={styles.noticeWarn}>
          이 사이트는 외부 미리보기를 차단한 것 같습니다. 왼쪽 패널의 <strong>새 창에서 열기</strong>로 반응형을 확인해주세요.
        </p>
      )}
    </div>
  );
}
