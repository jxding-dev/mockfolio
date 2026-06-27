import { useState, useRef, useCallback, useEffect } from 'react';
import type { UploadedImage } from '../types';
import { DEFAULT_EDITOR_SETTINGS, normalizeEditorSettings, type EditorSettings } from '../data/editorSettings';
import { useImageUpload } from '../hooks/useImageUpload';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMockupAssets } from '../hooks/useMockupAssets';
import { exportPng } from '../utils/exportPng';
import { exportComparisonGif, exportMockupComposite } from '../utils/mediaExport';
import { normalizePreviewUrl, openPreviewWindow } from '../utils/urlPreview';
import { EditorTopBar } from '../components/layout/EditorTopBar';
import { EditorLeftPanel } from '../components/layout/EditorLeftPanel';
import { EditorRightPanel } from '../components/layout/EditorRightPanel';
import { EditorCanvas } from '../components/layout/EditorCanvas';
import styles from './Editor.module.css';

/* ─── Upload Zone ────────────────────────────────────── */
function UploadZone({ onUpload, error, onError, onClearError, onStartWithUrl }: {
  onUpload: (img: UploadedImage) => void;
  error: string | null;
  onError: (msg: string) => void;
  onClearError: () => void;
  onStartWithUrl: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { handleFiles, handleInputChange } = useImageUpload({ onSuccess: onUpload, onError });

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
          <p className={styles.uploadTagline}>이미지 업로드 또는 URL 링크로 시작하는 목업 제작 도구</p>
        </div>

        <div
          className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label="이미지 업로드"
        >
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
            className={styles.hiddenInput} onChange={handleInputChange} />

          <div className={styles.dropzoneIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 16.5V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 8.25C3 7.00736 4.00736 6 5.25 6H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              <path d="M16.5 6H18.75C19.9926 6 21 7.00736 21 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </div>

          <div className={styles.dropzoneText}>
            <strong>{dragging ? '여기에 놓으세요!' : '화면 캡처 이미지를 여기에 끌어다 놓으세요'}</strong>
            <span>또는 클릭해서 파일 선택 · URL은 아래 버튼으로 시작</span>
          </div>

          <div className={styles.dropzoneMeta}>PNG · JPG · WebP · 최대 20MB</div>
        </div>

        <button className={styles.urlStartButton} type="button" onClick={onStartWithUrl}>
          URL 링크로 반응형 검수 시작
        </button>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠️ {error}</span>
            <button onClick={onClearError} aria-label="닫기">✕</button>
          </div>
        )}

        <div className={styles.uploadTips}>
          <div className={styles.tip}><span className={styles.tipIcon}>📐</span><span>이미지 또는 <strong>URL 링크</strong>로 반응형 레이아웃을 확인하세요</span></div>
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
function Workspace({ image, onImageRemove, onImageChange, initialInspectSource = 'image' }: {
  image: UploadedImage | null;
  onImageRemove: () => void;
  onImageChange: (img: UploadedImage) => void;
  initialInspectSource?: 'image' | 'url';
}) {
  // All lightweight UI settings persist to localStorage (images stay in-memory).
  const [settings, setSettings] = useLocalStorage<EditorSettings>('mf_settings', DEFAULT_EDITOR_SETTINGS, normalizeEditorSettings);
  const patch = useCallback(
    <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) =>
      setSettings((s) => ({ ...s, [key]: value })),
    [setSettings]
  );

  // Only the fields Editor itself reads (handlers, top bar, left panel, URL flow).
  // The mockup/inspect/export/compare option fields are consumed inside the panels
  // via the whole `settings` object + `patch`.
  const {
    projectName, activeMode, selectedDeviceId,
    inspectSource, urlInput, previewUrl, previewWidth, previewHeight,
    compareOrientation, exportScale, selectedMockupId,
    compositeX, compositeY, compositeScale, compositeStretchX, compositeStretchY, compositeRotation, compositeSkewX, compositeSkewY,
  } = settings;

  // Transient (not persisted): images + UI status
  const [error, setError] = useState<string | null>(null);
  const [beforeImage, setBeforeImage] = useState<UploadedImage | null>(null);
  const [afterImage, setAfterImage]   = useState<UploadedImage | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [urlRefreshKey, setUrlRefreshKey] = useState(0);
  const [autoSlide, setAutoSlide] = useState(false);
  const [gifLoading, setGifLoading] = useState(false);
  const [gifMessage, setGifMessage] = useState<string | null>(null);
  const [initialSourceApplied, setInitialSourceApplied] = useState(false);
  const { assets: mockupAssets, loading: mockupsLoading } = useMockupAssets();

  const exportRef = useRef<HTMLDivElement | null>(null);
  const selectedMockup = mockupAssets.find((asset) => asset.id === selectedMockupId) ?? null;

  useEffect(() => {
    if (initialSourceApplied) return;
    if (initialInspectSource === 'url') {
      if (activeMode !== 'inspect') patch('activeMode', 'inspect');
      if (inspectSource !== 'url') patch('inspectSource', 'url');
    }
    setInitialSourceApplied(true);
  }, [activeMode, initialInspectSource, initialSourceApplied, inspectSource, patch]);

  const handlePreviewUrl = useCallback(() => {
    const normalized = normalizePreviewUrl(urlInput);
    if (!normalized) {
      setError('http 또는 https URL을 입력해주세요.');
      return;
    }
    patch('previewUrl', normalized);
    patch('inspectSource', 'url');
    setUrlRefreshKey((key) => key + 1);
    setError(null);
  }, [patch, urlInput]);

  const handleCompositeExport = useCallback(async () => {
    if (!selectedMockup || !image) return;
    setExportLoading(true);
    setExportMessage(null);
    try {
      await exportMockupComposite(image.dataUrl, selectedMockup.src, {
        x: compositeX,
        y: compositeY,
        scale: compositeScale,
        stretchX: compositeStretchX,
        stretchY: compositeStretchY,
        rotation: compositeRotation,
        skewX: compositeSkewX,
        skewY: compositeSkewY,
      }, projectName);
      setExportMessage('합성된 PNG 파일을 저장했습니다.');
    } catch {
      setExportMessage('목업 PNG를 저장하지 못했습니다. 목업 파일을 확인해주세요.');
    } finally {
      setExportLoading(false);
    }
  }, [compositeRotation, compositeScale, compositeSkewX, compositeSkewY, compositeStretchX, compositeStretchY, compositeX, compositeY, image, projectName, selectedMockup]);

  const handleCompositeReset = useCallback(() => {
    patch('compositeX', 0); patch('compositeY', 0); patch('compositeScale', 1);
    patch('compositeStretchX', 1); patch('compositeStretchY', 1);
    patch('compositeRotation', 0); patch('compositeSkewX', 0); patch('compositeSkewY', 0);
  }, [patch]);

  const handleGifExport = useCallback(async () => {
    if (!beforeImage || !afterImage) return;
    setGifLoading(true);
    setGifMessage(null);
    try {
      await exportComparisonGif(beforeImage.dataUrl, afterImage.dataUrl, projectName, compareOrientation);
      setGifMessage('GIF 파일을 저장했습니다.');
    } catch {
      setGifMessage('GIF를 생성하지 못했습니다. 이미지를 다시 확인해주세요.');
    } finally {
      setGifLoading(false);
    }
  }, [afterImage, beforeImage, compareOrientation, projectName]);

  const handleExport = useCallback(async () => {
    if (selectedMockup) {
      await handleCompositeExport();
      return;
    }
    if (!exportRef.current) return;
    setExportLoading(true);
    setExportMessage(null);
    try {
      const fileName = await exportPng(exportRef.current, projectName, exportScale);
      setExportMessage(`${fileName} 파일을 저장했습니다.`);
    } catch {
      setExportMessage('PNG를 저장하지 못했습니다. 이미지를 다시 확인한 뒤 재시도하세요.');
    } finally {
      setExportLoading(false);
    }
  }, [exportScale, handleCompositeExport, projectName, selectedMockup]);

  return (
    <div className={styles.workspace}>
      {/* Top bar */}
      <EditorTopBar
        projectName={projectName}
        onProjectNameChange={(v) => patch('projectName', v)}
        activeMode={activeMode}
        onModeChange={(v) => patch('activeMode', v)}
        saveState="saved"
      />

      {/* Error banner */}
      {error && (
        <div className={styles.errorBannerInline} role="alert">
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
          onDeviceChange={(v) => patch('selectedDeviceId', v)}
          onImageChange={onImageChange}
          onImageRemove={onImageRemove}
          onError={setError}
          beforeImage={beforeImage}
          afterImage={afterImage}
          onBeforeChange={setBeforeImage}
          onAfterChange={setAfterImage}
          onBeforeRemove={() => setBeforeImage(null)}
          onAfterRemove={() => setAfterImage(null)}
          inspectSource={inspectSource}
          onInspectSourceChange={(value) => patch('inspectSource', value)}
          urlInput={urlInput}
          onUrlInputChange={(value) => patch('urlInput', value)}
          previewWidth={previewWidth}
          previewHeight={previewHeight}
          onPreviewSizeChange={(width, height) => {
            patch('previewWidth', Math.max(240, Math.min(1920, Number.isFinite(width) ? width : previewWidth)));
            patch('previewHeight', Math.max(240, Math.min(1920, Number.isFinite(height) ? height : previewHeight)));
          }}
          onPreviewUrl={handlePreviewUrl}
          onPreviewRefresh={() => setUrlRefreshKey((key) => key + 1)}
          onOpenPreview={() => previewUrl && openPreviewWindow(previewUrl)}
          previewReady={Boolean(previewUrl)}
        />

        <EditorCanvas
          settings={settings}
          image={image}
          beforeImage={beforeImage}
          afterImage={afterImage}
          exportRef={exportRef}
          autoSlide={autoSlide}
          urlRefreshKey={urlRefreshKey}
          selectedMockup={selectedMockup}
          onCompositePositionChange={(x, y) => { patch('compositeX', x); patch('compositeY', y); }}
        />

        <EditorRightPanel
          settings={settings}
          patch={patch}
          image={image}
          beforeImage={beforeImage}
          afterImage={afterImage}
          mockupAssets={mockupAssets}
          mockupsLoading={mockupsLoading}
          exportLoading={exportLoading}
          exportMessage={exportMessage}
          gifLoading={gifLoading}
          gifMessage={gifMessage}
          autoSlide={autoSlide}
          onAutoSlideChange={setAutoSlide}
          onExport={handleExport}
          onCompositeExport={handleCompositeExport}
          onCompositeReset={handleCompositeReset}
          onGifExport={handleGifExport}
        />
      </div>
    </div>
  );
}

/* ─── Main Editor Page ───────────────────────────────── */
export function Editor() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [started, setStarted] = useState(false);
  const [initialInspectSource, setInitialInspectSource] = useState<'image' | 'url'>('image');
  const [error, setError] = useState<string | null>(null);

  if (!image && !started) {
    return (
      <UploadZone
        onUpload={(img) => { setImage(img); setInitialInspectSource('image'); setStarted(true); setError(null); }}
        error={error}
        onError={setError}
        onClearError={() => setError(null)}
        onStartWithUrl={() => { setInitialInspectSource('url'); setStarted(true); setError(null); }}
      />
    );
  }

  return (
    <Workspace
      image={image}
      onImageRemove={() => setImage(null)}
      onImageChange={(img) => setImage(img)}
      initialInspectSource={initialInspectSource}
    />
  );
}
