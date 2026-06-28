import { useRef } from 'react';
import type { MockupItem } from '../../types';
import { getBackground } from '../../data/backgrounds';
import { DeviceFrame } from './DeviceFrame';
import styles from './MockupScene.module.css';

interface TextOptions {
  title: string;
  subtitle: string;
  tags: string;
  showDate: boolean;
  textPosition: 'top' | 'bottom' | 'none';
  textColor: string;
}

interface Props {
  items: MockupItem[];
  selectedId: string | null;
  bgStyle: Parameters<typeof getBackground>[0];
  shadowIntensity: number;
  frameCornerRadius: number;
  transparentBg: boolean;
  text: TextOptions;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  /** false in export preview — disables selection/drag so the capture is clean */
  interactive?: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}

export function MockupScene({
  items, selectedId, bgStyle, shadowIntensity, frameCornerRadius,
  transparentBg, text, exportRef, interactive = true, onSelect, onMove,
}: Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const bg = getBackground(bgStyle);
  const shadowAlpha = shadowIntensity / 100;
  const shadow = `0 ${24 + shadowIntensity * 0.4}px ${48 + shadowIntensity}px rgba(0,0,0,${(shadowAlpha * 0.6).toFixed(2)})`;

  const textColor = text.textColor;
  const subColor = `${textColor}B3`;
  const tagList = text.tags.split(',').map((t) => t.trim()).filter(Boolean);
  const hasText = text.textPosition !== 'none' && (text.title || text.subtitle || tagList.length > 0 || text.showDate);
  const dateLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  const onPointerDown = (e: React.PointerEvent, item: MockupItem) => {
    if (!interactive || item.locked) return;
    onSelect?.(item.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: item.id, startX: e.clientX, startY: e.clientY, baseX: item.x, baseY: item.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const dx = ((e.clientX - d.startX) / rect.width) * 100;
    const dy = ((e.clientY - d.startY) / rect.height) * 100;
    onMove?.(d.id, Math.max(-60, Math.min(60, +(d.baseX + dx).toFixed(1))), Math.max(-60, Math.min(60, +(d.baseY + dy).toFixed(1))));
  };
  const onPointerUp = () => { drag.current = null; };

  const textBlock = hasText ? (
    <div className={styles.text} style={{ color: textColor }}>
      {text.title && <div className={styles.title}>{text.title}</div>}
      {text.subtitle && <div className={styles.subtitle} style={{ color: subColor }}>{text.subtitle}</div>}
      {tagList.length > 0 && (
        <div className={styles.tags}>
          {tagList.map((t, i) => (
            <span key={i} className={styles.tag} style={{ borderColor: bg.dark ? 'rgba(255,255,255,0.25)' : 'rgba(26,29,36,0.18)', color: subColor }}>{t}</span>
          ))}
        </div>
      )}
      {text.showDate && <div className={styles.date} style={{ color: subColor }}>{dateLabel}</div>}
    </div>
  ) : null;

  return (
    <div
      ref={exportRef as React.RefObject<HTMLDivElement>}
      className={styles.scene}
      style={{ background: transparentBg ? 'transparent' : bg.css }}
    >
      {text.textPosition === 'top' && textBlock}

      <div ref={sceneRef} className={styles.stage} onClick={(e) => { if (e.target === e.currentTarget) onSelect?.(''); }}>
        {items.filter((item) => item.visible).map((item) => (
          <div
            key={item.id}
            className={`${styles.item} ${interactive && !item.locked ? styles.itemInteractive : ''} ${selectedId === item.id && interactive && items.filter((i) => i.visible).length > 1 ? styles.itemSelected : ''}`}
            style={{
              left: `calc(50% + ${item.x}%)`,
              top: `calc(50% + ${item.y}%)`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg) skew(${item.skewX}deg, ${item.skewY}deg) scale(${item.scale * item.stretchX}, ${item.scale * item.stretchY})`,
              opacity: item.opacity,
              filter: `drop-shadow(${shadow})`,
            }}
            onPointerDown={(e) => onPointerDown(e, item)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <DeviceFrame
              frameId={item.frameId}
              frameColor={item.frameColor}
              imageUrl={item.dataUrl}
              imageAlt={item.name}
              cornerRadius={frameCornerRadius}
            />
          </div>
        ))}
      </div>

      {text.textPosition === 'bottom' && textBlock}
    </div>
  );
}
