import { useRef, useState, useCallback } from 'react';
import type { AppMode, UploadedImage, FrameId, FrameColor, BgStyle } from '../../types';
import type { DevicePreset } from '../../types';
import { DEVICE_PRESETS } from '../../data/devices';
import { getBackground } from '../../data/backgrounds';
import { DeviceFrame } from '../mockup/DeviceFrame';
import { CompareSlider } from '../mockup/CompareSlider';
import { MockupComposer } from '../mockup/MockupComposer';
import { UrlPreview } from '../inspector/UrlPreview';
import type { MockupAsset } from '../../data/mockups';
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
  mockupScale?: number;
  mockupOffsetX?: number;
  mockupOffsetY?: number;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  transparentBg?: boolean;
  // Mockup
  frameId?: FrameId;
  frameColor?: FrameColor;
  bgStyle?: BgStyle;
  mockupTitle?: string;
  mockupSubtitle?: string;
  mockupTags?: string;
  mockupTextPosition?: 'top' | 'bottom' | 'none';
  showMockupDate?: boolean;
  mockupTextColor?: string;
  // Compare
  beforeImage?: UploadedImage | null;
  afterImage?: UploadedImage | null;
  compareOrientation?: 'horizontal' | 'vertical';
  autoSlide?: boolean;
  inspectSource?: 'image' | 'url';
  previewUrl?: string;
  previewWidth?: number;
  previewHeight?: number;
  urlRefreshKey?: number;
  selectedMockup?: MockupAsset | null;
  compositeTransform?: { x: number; y: number; scale: number; rotation: number };
  onCompositePositionChange?: (x: number, y: number) => void;
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
  mockupScale = 1,
  mockupOffsetX = 0,
  mockupOffsetY = 0,
  exportRef,
  transparentBg = false,
  frameId = 'browser',
  frameColor = 'light',
  bgStyle = 'soft-gradient',
  mockupTitle = '',
  mockupSubtitle = '',
  mockupTags = '',
  mockupTextPosition = 'none',
  showMockupDate = false,
  mockupTextColor = '#1A1D24',
  beforeImage = null,
  afterImage = null,
  compareOrientation = 'horizontal',
  autoSlide = false,
  inspectSource = 'image',
  previewUrl = '',
  previewWidth = 390,
  previewHeight = 844,
  urlRefreshKey = 0,
  selectedMockup = null,
  compositeTransform = { x: 0, y: 0, scale: 1, rotation: 0 },
  onCompositePositionChange,
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
              <CompareSlider before={beforeImage} after={afterImage} orientation={compareOrientation} autoSlide={autoSlide} />
            </div>
          </div>
        ) : activeMode === 'inspect' && inspectSource === 'url' && previewUrl ? (
          <div className={styles.sceneOuter}>
            <UrlPreview url={previewUrl} width={previewWidth} height={previewHeight} refreshKey={urlRefreshKey} />
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
              mockupScale={mockupScale}
              mockupOffsetX={mockupOffsetX}
              mockupOffsetY={mockupOffsetY}
              exportRef={exportRef}
              transparentBg={transparentBg}
              frameId={frameId}
              frameColor={frameColor}
              bgStyle={bgStyle}
              mockupTitle={mockupTitle}
              mockupSubtitle={mockupSubtitle}
              mockupTags={mockupTags}
              mockupTextPosition={mockupTextPosition}
              showMockupDate={showMockupDate}
              mockupTextColor={mockupTextColor}
              selectedMockup={selectedMockup}
              compositeTransform={compositeTransform}
              onCompositePositionChange={onCompositePositionChange}
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
  shadowIntensity, frameCornerRadius, mockupScale, mockupOffsetX, mockupOffsetY, exportRef, transparentBg,
  frameId, frameColor, bgStyle,
  mockupTitle, mockupSubtitle, mockupTags, mockupTextPosition, showMockupDate, mockupTextColor,
  selectedMockup, compositeTransform, onCompositePositionChange,
}: {
  image: UploadedImage;
  device: DevicePreset;
  activeMode: AppMode;
  fitMode: 'fit' | 'fill' | 'original';
  inspectOrientation: 'portrait' | 'landscape';
  guides: GuideOptions;
  shadowIntensity: number;
  frameCornerRadius: number;
  mockupScale: number;
  mockupOffsetX: number;
  mockupOffsetY: number;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  transparentBg: boolean;
  frameId: FrameId;
  frameColor: FrameColor;
  bgStyle: BgStyle;
  mockupTitle: string;
  mockupSubtitle: string;
  mockupTags: string;
  mockupTextPosition: 'top' | 'bottom' | 'none';
  showMockupDate: boolean;
  mockupTextColor: string;
  selectedMockup: MockupAsset | null;
  compositeTransform: { x: number; y: number; scale: number; rotation: number };
  onCompositePositionChange?: (x: number, y: number) => void;
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
    if (selectedMockup) {
      return <MockupComposer image={image} mockup={selectedMockup} transform={compositeTransform} onPositionChange={onCompositePositionChange ?? (() => {})} />;
    }
    return (
      <MockupView
        image={image}
        shadowIntensity={shadowIntensity}
        frameCornerRadius={frameCornerRadius}
        scale={mockupScale}
        offsetX={mockupOffsetX}
        offsetY={mockupOffsetY}
        exportRef={exportRef}
        transparentBg={transparentBg}
        frameId={frameId}
        frameColor={frameColor}
        bgStyle={bgStyle}
        title={mockupTitle}
        subtitle={mockupSubtitle}
        tags={mockupTags}
        textPosition={mockupTextPosition}
        showDate={showMockupDate}
        textColor={mockupTextColor}
      />
    );
  }

  if (activeMode === 'export') {
    if (selectedMockup) {
      return <MockupComposer image={image} mockup={selectedMockup} transform={compositeTransform} onPositionChange={onCompositePositionChange ?? (() => {})} />;
    }
    return (
      <ExportView
        image={image}
        shadowIntensity={shadowIntensity}
        frameCornerRadius={frameCornerRadius}
        scale={mockupScale}
        offsetX={mockupOffsetX}
        offsetY={mockupOffsetY}
        exportRef={exportRef}
        transparentBg={transparentBg}
        frameId={frameId}
        frameColor={frameColor}
        bgStyle={bgStyle}
        title={mockupTitle}
        subtitle={mockupSubtitle}
        tags={mockupTags}
        textPosition={mockupTextPosition}
        showDate={showMockupDate}
        textColor={mockupTextColor}
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
  image, shadowIntensity, frameCornerRadius, scale, offsetX, offsetY, exportRef, transparentBg,
  frameId, frameColor, bgStyle,
  title, subtitle, tags, textPosition, showDate, textColor,
}: {
  image: UploadedImage;
  shadowIntensity: number;
  frameCornerRadius: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  transparentBg: boolean;
  frameId: FrameId;
  frameColor: FrameColor;
  bgStyle: BgStyle;
  title: string;
  subtitle: string;
  tags: string;
  textPosition: 'top' | 'bottom' | 'none';
  showDate: boolean;
  textColor: string;
}) {
  const bg = getBackground(bgStyle);
  const shadowAlpha = shadowIntensity / 100;
  const shadow = `0 ${24 + shadowIntensity * 0.4}px ${48 + shadowIntensity}px rgba(0,0,0,${(shadowAlpha * 0.6).toFixed(2)})`;

  const subColor = `${textColor}B3`;
  const hasText = textPosition !== 'none' && (title || subtitle || tags || showDate);
  const dateLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

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
      {showDate && <div className={styles.mockupDate} style={{ color: subColor }}>{dateLabel}</div>}
    </div>
  ) : null;

  return (
    <div
      ref={exportRef as React.RefObject<HTMLDivElement>}
      className={styles.mockupScene}
      style={{ background: transparentBg ? 'transparent' : bg.css }}
    >
      {textPosition === 'top' && textBlock}
      <div
        className={styles.mockupFrameWrap}
        style={{ filter: `drop-shadow(${shadow})`, transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }}
      >
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
const ExportView = MockupView;

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
