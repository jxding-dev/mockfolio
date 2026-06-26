import { useRef, useState, useCallback } from 'react';
import type { AppMode, UploadedImage, FrameId, FrameColor, BgStyle } from '../../types';
import type { DevicePreset } from '../../types';
import { DEVICE_PRESETS } from '../../data/devices';
import { getBackground } from '../../data/backgrounds';
import { DeviceFrame } from '../mockup/DeviceFrame';
import { CompareSlider } from '../mockup/CompareSlider';
import styles from './EditorCanvas.module.css';

interface GuideOptions {
  showGuides?: boolean;
  showGrid?: boolean;
  showCenter?: boolean;
  showMargins?: boolean;
}

interface Props {
  image: UploadedImage | null;
  activeMode: AppMode;
  selectedDeviceId: string;
  fitMode?: 'fit' | 'fill' | 'original';
  inspectOrientation?: 'portrait' | 'landscape';
  guides?: GuideOptions;
  shadowIntensity?: number;
  frameCornerRadius?: number;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  transparentBg?: boolean;
  // Mockup
  frameId?: FrameId;
  frameColor?: FrameColor;
  bgStyle?: BgStyle;
  bgCustomColor?: string;
  mockupTitle?: string;
  mockupSubtitle?: string;
  mockupTags?: string;
  mockupTextPosition?: 'top' | 'bottom' | 'none';
  // Compare
  beforeImage?: UploadedImage | null;
  afterImage?: UploadedImage | null;
  compareOrientation?: 'horizontal' | 'vertical';
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function EditorCanvas({
  image,
  activeMode,
  selectedDeviceId,
  fitMode = 'fit',
  inspectOrientation = 'portrait',
  guides = {},
  shadowIntensity = 60,
  frameCornerRadius = 8,
  exportRef,
  transparentBg = false,
  frameId = 'browser',
  frameColor = 'light',
  bgStyle = 'soft-gradient',
  bgCustomColor = '#6366F1',
  mockupTitle = '',
  mockupSubtitle = '',
  mockupTags = '',
  mockupTextPosition = 'none',
  beforeImage = null,
  afterImage = null,
  compareOrientation = 'horizontal',
}: Props) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const device = DEVICE_PRESETS.find((d) => d.id === selectedDeviceId) ?? DEVICE_PRESETS[0];

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
  }, []);

  const zoomIn  = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => setZoom(1);

  const isCompare = activeMode === 'compare';
  const hasContent = isCompare ? (!!beforeImage || !!afterImage) : !!image;

  return (
    <div className={styles.wrap}>
      {/* canvas area */}
      <div
        ref={containerRef}
        className={styles.canvas}
        onWheel={handleWheel}
      >
        {isCompare ? (
          <div className={styles.sceneOuter} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            <div ref={exportRef as React.RefObject<HTMLDivElement>}>
              <CompareSlider before={beforeImage} after={afterImage} orientation={compareOrientation} />
            </div>
          </div>
        ) : image ? (
          <div className={styles.sceneOuter} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            <CanvasContent
              image={image}
              device={device}
              activeMode={activeMode}
              fitMode={fitMode}
              inspectOrientation={inspectOrientation}
              guides={guides}
              shadowIntensity={shadowIntensity}
              frameCornerRadius={frameCornerRadius}
              exportRef={exportRef}
              transparentBg={transparentBg}
              frameId={frameId}
              frameColor={frameColor}
              bgStyle={bgStyle}
              bgCustomColor={bgCustomColor}
              mockupTitle={mockupTitle}
              mockupSubtitle={mockupSubtitle}
              mockupTags={mockupTags}
              mockupTextPosition={mockupTextPosition}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* zoom controls */}
      {hasContent && (
        <div className={styles.zoomBar}>
          <button className={styles.zoomBtn} onClick={zoomOut} title="축소" disabled={zoom <= MIN_ZOOM}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button className={styles.zoomVal} onClick={resetZoom} title="100% 초기화">
            {Math.round(zoom * 100)}%
          </button>
          <button className={styles.zoomBtn} onClick={zoomIn} title="확대" disabled={zoom >= MAX_ZOOM}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className={styles.zoomDivider} />
          <span className={styles.deviceInfo}>
            {isCompare ? 'Before / After' : `${device.label} · ${device.width}×${device.height}`}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Canvas content (mode-aware) ──────────── */
function CanvasContent({
  image, device, activeMode, fitMode, inspectOrientation, guides,
  shadowIntensity, frameCornerRadius, exportRef, transparentBg,
  frameId, frameColor, bgStyle, bgCustomColor,
  mockupTitle, mockupSubtitle, mockupTags, mockupTextPosition,
}: {
  image: UploadedImage;
  device: DevicePreset;
  activeMode: AppMode;
  fitMode: 'fit' | 'fill' | 'original';
  inspectOrientation: 'portrait' | 'landscape';
  guides: GuideOptions;
  shadowIntensity: number;
  frameCornerRadius: number;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  transparentBg: boolean;
  frameId: FrameId;
  frameColor: FrameColor;
  bgStyle: BgStyle;
  bgCustomColor: string;
  mockupTitle: string;
  mockupSubtitle: string;
  mockupTags: string;
  mockupTextPosition: 'top' | 'bottom' | 'none';
}) {
  if (activeMode === 'inspect' || activeMode === 'compare') {
    return (
      <InspectView
        image={image}
        device={device}
        fitMode={fitMode}
        orientation={inspectOrientation}
        guides={guides}
      />
    );
  }

  if (activeMode === 'mockup') {
    return (
      <MockupView
        image={image}
        shadowIntensity={shadowIntensity}
        frameCornerRadius={frameCornerRadius}
        exportRef={exportRef}
        transparentBg={transparentBg}
        frameId={frameId}
        frameColor={frameColor}
        bgStyle={bgStyle}
        bgCustomColor={bgCustomColor}
        title={mockupTitle}
        subtitle={mockupSubtitle}
        tags={mockupTags}
        textPosition={mockupTextPosition}
      />
    );
  }

  if (activeMode === 'export') {
    return (
      <ExportView
        image={image}
        exportRef={exportRef}
        transparentBg={transparentBg}
      />
    );
  }

  return null;
}

/* ── Inspect View ─────────────────────────── */
function InspectView({
  image, device, fitMode, orientation, guides,
}: {
  image: UploadedImage;
  device: DevicePreset;
  fitMode: 'fit' | 'fill' | 'original';
  orientation: 'portrait' | 'landscape';
  guides: GuideOptions;
}) {
  const landscape = orientation === 'landscape';
  const dispW = landscape ? device.height : device.width;
  const dispH = landscape ? device.width : device.height;
  const maxH = Math.min(dispH, 700);
  const maxW = Math.min(dispW, 1100);

  let imgStyle: React.CSSProperties = {};
  if (fitMode === 'fit') {
    imgStyle = { width: '100%', height: '100%', objectFit: 'contain' };
  } else if (fitMode === 'fill') {
    imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
  } else {
    imgStyle = { width: image.width, height: image.height, maxWidth: '100%', objectFit: 'none', objectPosition: 'top left' };
  }

  return (
    <div
      className={styles.inspectFrame}
      style={{ width: maxW, height: maxH }}
    >
      {/* device label */}
      <div className={styles.deviceLabel}>
        {device.label} · {dispW}×{dispH} · {landscape ? '가로' : '세로'}
      </div>

      {/* image */}
      <div className={styles.inspectImageWrap}>
        <img src={image.dataUrl} alt={image.name} style={imgStyle} draggable={false} />

        {/* guides */}
        {guides.showGrid    && <div className={styles.guideGrid} />}
        {guides.showCenter  && <div className={styles.guideCenter} />}
        {guides.showMargins && (
          <>
            <div className={`${styles.guideMargin} ${styles.guideMarginL}`} />
            <div className={`${styles.guideMargin} ${styles.guideMarginR}`} />
          </>
        )}
        {guides.showGuides  && (
          <>
            <div className={`${styles.guideSafe} ${styles.guideSafeTop}`} />
            <div className={`${styles.guideSafe} ${styles.guideSafeBottom}`} />
          </>
        )}
      </div>

      {/* size badge */}
      <div className={styles.sizeBadge}>{image.width} × {image.height}</div>
    </div>
  );
}

/* ── Mockup View ──────────────────────────── */
function MockupView({
  image, shadowIntensity, frameCornerRadius, exportRef, transparentBg,
  frameId, frameColor, bgStyle, bgCustomColor,
  title, subtitle, tags, textPosition,
}: {
  image: UploadedImage;
  shadowIntensity: number;
  frameCornerRadius: number;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  transparentBg: boolean;
  frameId: FrameId;
  frameColor: FrameColor;
  bgStyle: BgStyle;
  bgCustomColor: string;
  title: string;
  subtitle: string;
  tags: string;
  textPosition: 'top' | 'bottom' | 'none';
}) {
  const bg = getBackground(bgStyle, bgCustomColor);
  const shadowAlpha = shadowIntensity / 100;
  const shadow = `0 ${24 + shadowIntensity * 0.4}px ${48 + shadowIntensity}px rgba(0,0,0,${(shadowAlpha * 0.6).toFixed(2)})`;

  const textColor = bg.dark ? '#ffffff' : '#1a1d24';
  const subColor = bg.dark ? 'rgba(255,255,255,0.7)' : 'rgba(26,29,36,0.6)';
  const hasText = textPosition !== 'none' && (title || subtitle || tags);

  const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

  const textBlock = hasText ? (
    <div className={styles.mockupText} style={{ color: textColor }}>
      {title && <div className={styles.mockupTitle}>{title}</div>}
      {subtitle && <div className={styles.mockupSubtitle} style={{ color: subColor }}>{subtitle}</div>}
      {tagList.length > 0 && (
        <div className={styles.mockupTags}>
          {tagList.map((t, i) => (
            <span key={i} className={styles.mockupTag} style={{
              borderColor: bg.dark ? 'rgba(255,255,255,0.25)' : 'rgba(26,29,36,0.18)',
              color: subColor,
            }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      ref={exportRef as React.RefObject<HTMLDivElement>}
      className={styles.mockupScene}
      style={{ background: transparentBg ? 'transparent' : bg.css }}
    >
      {textPosition === 'top' && textBlock}
      <div className={styles.mockupFrameWrap} style={{ filter: `drop-shadow(${shadow})` }}>
        <DeviceFrame
          frameId={frameId}
          frameColor={frameColor}
          imageUrl={image.dataUrl}
          imageAlt={image.name}
          cornerRadius={frameCornerRadius}
        />
      </div>
      {textPosition === 'bottom' && textBlock}
    </div>
  );
}

/* ── Export View ──────────────────────────── */
function ExportView({
  image, exportRef, transparentBg,
}: {
  image: UploadedImage;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  transparentBg: boolean;
}) {
  return (
    <div
      ref={exportRef as React.RefObject<HTMLDivElement>}
      className={styles.exportScene}
      style={{ background: transparentBg ? 'transparent' : undefined }}
    >
      <img
        src={image.dataUrl}
        alt={image.name}
        className={styles.exportImage}
        draggable={false}
      />
      <div className={styles.exportBadge}>
        PNG · {image.width}×{image.height}
      </div>
    </div>
  );
}

/* ── Empty State ──────────────────────────── */
function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="6" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/>
          <path d="M18 30l6-8 5 6 3-4 4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="16" cy="18" r="2.5" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>
      <p className={styles.emptyTitle}>이미지를 업로드하세요</p>
      <p className={styles.emptyDesc}>PNG, JPG, WebP · 최대 20MB</p>
    </div>
  );
}
