import { useRef, useState, useCallback } from 'react';
import type { UploadedImage, DevicePreset, MockupItem } from '../../types';
import type { EditorSettings } from '../../data/editorSettings';
import { DEVICE_PRESETS } from '../../data/devices';
import { CompareSlider } from '../mockup/CompareSlider';
import { MockupComposer } from '../mockup/MockupComposer';
import { MockupScene } from '../mockup/MockupScene';
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
  settings: EditorSettings;
  image: UploadedImage | null;
  beforeImage?: UploadedImage | null;
  afterImage?: UploadedImage | null;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  autoSlide?: boolean;
  urlRefreshKey?: number;
  selectedMockup?: MockupAsset | null;
  onCompositePositionChange?: (x: number, y: number) => void;
  // Multi-image mockup
  mockupItems?: MockupItem[];
  selectedMockupItemId?: string | null;
  onMockupItemSelect?: (id: string) => void;
  onMockupItemMove?: (id: string, x: number, y: number) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function EditorCanvas({
  settings,
  image,
  beforeImage = null,
  afterImage = null,
  exportRef,
  autoSlide = false,
  urlRefreshKey = 0,
  selectedMockup = null,
  onCompositePositionChange,
  mockupItems = [],
  selectedMockupItemId = null,
  onMockupItemSelect,
  onMockupItemMove,
}: Props) {
  const {
    activeMode, selectedDeviceId, fitMode, inspectOrientation,
    showGuides, showGrid, showCenter, showMargins,
    shadowIntensity, frameCornerRadius,
    transparentBg, bgStyle,
    mockupTitle, mockupSubtitle, mockupTags, mockupTextPosition, showMockupDate, mockupTextColor,
    compareOrientation, inspectSource, previewUrl, previewWidth, previewHeight,
    compositeX, compositeY, compositeScale, compositeStretchX, compositeStretchY, compositeRotation, compositeSkewX, compositeSkewY,
  } = settings;
  const sceneText = {
    title: mockupTitle, subtitle: mockupSubtitle, tags: mockupTags,
    showDate: showMockupDate, textPosition: mockupTextPosition, textColor: mockupTextColor,
  };
  const guides: GuideOptions = { showGuides, showGrid, showCenter, showMargins };
  const compositeTransform = {
    x: compositeX, y: compositeY, scale: compositeScale,
    stretchX: compositeStretchX, stretchY: compositeStretchY,
    rotation: compositeRotation, skewX: compositeSkewX, skewY: compositeSkewY,
  };

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const device = DEVICE_PRESETS.find((d) => d.id === selectedDeviceId) ?? DEVICE_PRESETS[0];
  const showingUrlPreview = activeMode === 'inspect' && inspectSource === 'url';

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
  }, []);

  const zoomIn  = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => setZoom(1);

  const isCompare = activeMode === 'compare';
  const isSceneMode = (activeMode === 'mockup' || activeMode === 'export') && !selectedMockup;
  const isComposite = (activeMode === 'mockup' || activeMode === 'export') && !!selectedMockup;
  const hasContent = isCompare ? (!!beforeImage || !!afterImage)
    : showingUrlPreview ? Boolean(previewUrl)
    : isSceneMode ? mockupItems.length > 0
    : !!image;

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
        ) : showingUrlPreview ? (
          <div className={styles.sceneOuter}>
            {previewUrl ? (
              <UrlPreview url={previewUrl} width={previewWidth} height={previewHeight} refreshKey={urlRefreshKey} />
            ) : (
              <UrlEmptyState />
            )}
          </div>
        ) : isSceneMode ? (
          mockupItems.length > 0 ? (
            <div className={styles.sceneOuter} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
              <MockupScene
                items={mockupItems}
                selectedId={selectedMockupItemId}
                bgStyle={bgStyle}
                shadowIntensity={shadowIntensity}
                frameCornerRadius={frameCornerRadius}
                transparentBg={transparentBg}
                text={sceneText}
                exportRef={exportRef}
                interactive={activeMode === 'mockup'}
                onSelect={onMockupItemSelect}
                onMove={onMockupItemMove}
              />
            </div>
          ) : <EmptyState />
        ) : isComposite && image ? (
          <div className={styles.sceneOuter} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            <MockupComposer image={image} mockup={selectedMockup} transform={compositeTransform} onPositionChange={onCompositePositionChange ?? (() => {})} />
          </div>
        ) : activeMode === 'inspect' && image ? (
          <div className={styles.sceneOuter} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            <InspectView image={image} device={device} fitMode={fitMode} orientation={inspectOrientation} guides={guides} />
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

function UrlEmptyState() {
  return (
    <div className={`${styles.emptyState} ${styles.urlEmptyState}`}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="12" width="32" height="24" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 36h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        </svg>
      </div>
      <p className={styles.emptyTitle}>URL을 입력하고 미리보기를 눌러주세요</p>
      <p className={styles.emptyDesc}>왼쪽 패널에서 Mobile · Tablet · Desktop · Wide 크기를 바로 바꿀 수 있습니다.</p>
    </div>
  );
}
