import { useState, useRef, useCallback } from 'react';
import type { AppMode, UploadedImage } from '../types';
import { DEVICE_PRESETS } from '../data/devices';
import { useImageUpload } from '../hooks/useImageUpload';
import { EditorTopBar } from '../components/layout/EditorTopBar';
import { EditorLeftPanel } from '../components/layout/EditorLeftPanel';
import { EditorRightPanel } from '../components/layout/EditorRightPanel';
import { EditorCanvas } from '../components/layout/EditorCanvas';
import styles from './Editor.module.css';

/* ─── Upload Zone ────────────────────────────────────── */
function UploadZone({ onUpload, error, onClearError }: {
  onUpload: (img: UploadedImage) => void;
  error: string | null;
  onClearError: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { handleFiles } = useImageUpload({ onSuccess: onUpload, onError: (msg) => { onClearError(); console.warn(msg); } });

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className={styles.uploadPage}>
      <div className={styles.uploadCard}>
        <div className={styles.uploadHeader}>
          <div className={styles.uploadLogoRow}>
            <div className={styles.uploadLogoMark}>M</div>
            <span className={styles.uploadLogoText}>Mockfolio</span>
          </div>
          <p className={styles.uploadTagline}>반응형 검수 + 포트폴리오 목업 제작 도구</p>
        </div>

        <div
          className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="이미지 업로드"
        >
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
            className={styles.hiddenInput} onChange={(e) => e.target.files && handleFiles(e.target.files)} />

          <div className={styles.dropzoneIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 16.5V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 8.25C3 7.00736 4.00736 6 5.25 6H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              <path d="M16.5 6H18.75C19.9926 6 21 7.00736 21 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </div>

          <div className={styles.dropzoneText}>
            <strong>{dragging ? '여기에 놓으세요!' : '화면 캡처를 여기에 끌어다 놓으세요'}</strong>
            <span>또는 클릭해서 파일 선택</span>
          </div>

          <div className={styles.dropzoneMeta}>PNG · JPG · WebP · 최대 20MB</div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={onClearError} aria-label="닫기">✕</button>
          </div>
        )}

        <div className={styles.uploadTips}>
          <div className={styles.tip}><span className={styles.tipIcon}>📐</span><span>업로드 후 <strong>반응형 검수</strong>로 레이아웃을 확인하세요</span></div>
          <div className={styles.tip}><span className={styles.tipIcon}>🖼</span><span>목업 모드에서 <strong>프레임과 배경</strong>을 꾸미세요</span></div>
          <div className={styles.tip}><span className={styles.tipIcon}>💾</span><span><strong>PNG 2×</strong> 고해상도로 바로 다운로드</span></div>
        </div>

        <div className={styles.uploadPrivacy}>
          🔒 이미지는 브라우저에서만 처리됩니다. 서버로 전송되지 않습니다.
        </div>
      </div>
    </div>
  );
}

/* ─── Workspace (3-panel editor) ─────────────────────── */
function Workspace({ image, onImageRemove, onImageChange }: {
  image: UploadedImage;
  onImageRemove: () => void;
  onImageChange: (img: UploadedImage) => void;
}) {
  const [activeMode, setActiveMode] = useState<AppMode>('inspect');
  const [projectName, setProjectName] = useState('내 프로젝트');
  const [selectedDeviceId, setSelectedDeviceId] = useState(DEVICE_PRESETS[1].id);
  const [error, setError] = useState<string | null>(null);

  // Inspect settings
  const [fitMode, setFitMode]       = useState<'fit'|'fill'|'original'>('fit');
  const [showGuides, setShowGuides]   = useState(false);
  const [showGrid, setShowGrid]       = useState(false);
  const [showCenter, setShowCenter]   = useState(false);
  const [showMargins, setShowMargins] = useState(false);

  // Mockup settings
  const [shadowIntensity, setShadowIntensity]     = useState(60);
  const [frameCornerRadius, setFrameCornerRadius] = useState(8);

  // Export settings
  const [exportScale, setExportScale]     = useState(2);
  const [transparentBg, setTransparentBg] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const exportRef = useRef<HTMLDivElement | null>(null);

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    setExportLoading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(exportRef.current, { pixelRatio: exportScale });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${projectName.replace(/\s+/g, '_')}_${exportScale}x.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setExportLoading(false);
    }
  }, [exportScale, projectName]);

  return (
    <div className={styles.workspace}>
      {/* Top bar */}
      <EditorTopBar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        saveState="saved"
      />

      {/* Error banner */}
      {error && (
        <div className={styles.errorBannerInline}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} aria-label="닫기">✕</button>
        </div>
      )}

      {/* 3-panel body */}
      <div className={styles.wsBody}>
        <EditorLeftPanel
          image={image}
          activeMode={activeMode}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={setSelectedDeviceId}
          onImageChange={onImageChange}
          onImageRemove={onImageRemove}
          onError={setError}
        />

        <EditorCanvas
          image={image}
          activeMode={activeMode}
          selectedDeviceId={selectedDeviceId}
          fitMode={fitMode}
          guides={{ showGuides, showGrid, showCenter, showMargins }}
          shadowIntensity={shadowIntensity}
          frameCornerRadius={frameCornerRadius}
          exportRef={exportRef}
          transparentBg={transparentBg}
        />

        <EditorRightPanel
          activeMode={activeMode}
          image={image}
          fitMode={fitMode}
          onFitModeChange={setFitMode}
          showGuides={showGuides}
          showGrid={showGrid}
          showCenter={showCenter}
          showMargins={showMargins}
          onGuidesChange={setShowGuides}
          onGridChange={setShowGrid}
          onCenterChange={setShowCenter}
          onMarginsChange={setShowMargins}
          shadowIntensity={shadowIntensity}
          onShadowChange={setShadowIntensity}
          frameCornerRadius={frameCornerRadius}
          onCornerRadiusChange={setFrameCornerRadius}
          exportScale={exportScale}
          onExportScaleChange={setExportScale}
          transparentBg={transparentBg}
          onTransparentBgChange={setTransparentBg}
          onExport={handleExport}
          exportLoading={exportLoading}
        />
      </div>
    </div>
  );
}

/* ─── Main Editor Page ───────────────────────────────── */
export function Editor() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!image) {
    return (
      <UploadZone
        onUpload={(img) => { setImage(img); setError(null); }}
        error={error}
        onClearError={() => setError(null)}
      />
    );
  }

  return (
    <Workspace
      image={image}
      onImageRemove={() => setImage(null)}
      onImageChange={(img) => setImage(img)}
    />
  );
}
