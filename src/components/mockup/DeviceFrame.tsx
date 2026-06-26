import type { FrameId, FrameColor } from '../../types';
import styles from './DeviceFrame.module.css';

interface Props {
  frameId: FrameId;
  frameColor: FrameColor;
  imageUrl: string;
  imageAlt: string;
  cornerRadius?: number;
}

/**
 * Pure CSS/SVG device frames — no external images.
 * Wraps an uploaded screenshot in a selected device shell.
 */
export function DeviceFrame({ frameId, frameColor, imageUrl, imageAlt, cornerRadius = 8 }: Props) {
  const colorClass =
    frameColor === 'dark' ? styles.colorDark :
    frameColor === 'silver' ? styles.colorSilver :
    styles.colorLight;

  switch (frameId) {
    case 'phone-solo':
      return <PhoneFrame className={colorClass} imageUrl={imageUrl} imageAlt={imageAlt} />;
    case 'browser':
      return <BrowserFrame className={colorClass} imageUrl={imageUrl} imageAlt={imageAlt} radius={cornerRadius} />;
    case 'laptop':
      return <LaptopFrame className={colorClass} imageUrl={imageUrl} imageAlt={imageAlt} />;
    case 'tablet':
      return <TabletFrame className={colorClass} imageUrl={imageUrl} imageAlt={imageAlt} />;
    case 'phone-desktop':
      return <PhoneDesktopFrame className={colorClass} imageUrl={imageUrl} imageAlt={imageAlt} radius={cornerRadius} />;
    case 'cover-card':
      return <CoverCard imageUrl={imageUrl} imageAlt={imageAlt} radius={cornerRadius} />;
    case 'none':
    default:
      return (
        <img
          src={imageUrl}
          alt={imageAlt}
          className={styles.bareImage}
          style={{ borderRadius: cornerRadius }}
          draggable={false}
        />
      );
  }
}

/* ── Phone (solo) ─────────────────────────── */
function PhoneFrame({ className, imageUrl, imageAlt }: { className: string; imageUrl: string; imageAlt: string }) {
  return (
    <div className={`${styles.phone} ${className}`}>
      <div className={styles.phoneNotch} />
      <div className={styles.phoneScreen}>
        <img src={imageUrl} alt={imageAlt} draggable={false} />
      </div>
    </div>
  );
}

/* ── Browser ──────────────────────────────── */
function BrowserFrame({ className, imageUrl, imageAlt, radius }: { className: string; imageUrl: string; imageAlt: string; radius: number }) {
  return (
    <div className={`${styles.browser} ${className}`} style={{ borderRadius: Math.max(radius, 6) }}>
      <div className={styles.browserBar}>
        <span className={styles.dot} style={{ background: '#ff5f57' }} />
        <span className={styles.dot} style={{ background: '#ffbd2e' }} />
        <span className={styles.dot} style={{ background: '#28c840' }} />
        <div className={styles.browserUrl}>yourportfolio.com</div>
      </div>
      <div className={styles.browserScreen}>
        <img src={imageUrl} alt={imageAlt} draggable={false} />
      </div>
    </div>
  );
}

/* ── Laptop (MacBook) ─────────────────────── */
function LaptopFrame({ className, imageUrl, imageAlt }: { className: string; imageUrl: string; imageAlt: string }) {
  return (
    <div className={`${styles.laptop} ${className}`}>
      <div className={styles.laptopLid}>
        <div className={styles.laptopCamera} />
        <div className={styles.laptopScreen}>
          <img src={imageUrl} alt={imageAlt} draggable={false} />
        </div>
      </div>
      <div className={styles.laptopBase}>
        <div className={styles.laptopNotch} />
      </div>
    </div>
  );
}

/* ── Tablet (iPad) ────────────────────────── */
function TabletFrame({ className, imageUrl, imageAlt }: { className: string; imageUrl: string; imageAlt: string }) {
  return (
    <div className={`${styles.tablet} ${className}`}>
      <div className={styles.tabletCamera} />
      <div className={styles.tabletScreen}>
        <img src={imageUrl} alt={imageAlt} draggable={false} />
      </div>
    </div>
  );
}

/* ── Phone + Desktop combo ────────────────── */
function PhoneDesktopFrame({ className, imageUrl, imageAlt, radius }: { className: string; imageUrl: string; imageAlt: string; radius: number }) {
  return (
    <div className={styles.combo}>
      <div className={`${styles.browser} ${styles.comboBrowser} ${className}`} style={{ borderRadius: Math.max(radius, 6) }}>
        <div className={styles.browserBar}>
          <span className={styles.dot} style={{ background: '#ff5f57' }} />
          <span className={styles.dot} style={{ background: '#ffbd2e' }} />
          <span className={styles.dot} style={{ background: '#28c840' }} />
          <div className={styles.browserUrl}>yourportfolio.com</div>
        </div>
        <div className={styles.browserScreen}>
          <img src={imageUrl} alt={imageAlt} draggable={false} />
        </div>
      </div>
      <div className={`${styles.phone} ${styles.comboPhone} ${className}`}>
        <div className={styles.phoneNotch} />
        <div className={styles.phoneScreen}>
          <img src={imageUrl} alt={imageAlt} draggable={false} />
        </div>
      </div>
    </div>
  );
}

function CoverCard({ imageUrl, imageAlt, radius }: { imageUrl: string; imageAlt: string; radius: number }) {
  return (
    <div className={styles.coverCard} style={{ borderRadius: Math.max(radius, 18) }}>
      <div className={styles.coverCardGlow} />
      <div className={styles.coverCardChrome}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.coverCardScreen}>
        <img src={imageUrl} alt={imageAlt} draggable={false} />
      </div>
    </div>
  );
}
