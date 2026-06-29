import { useState, useRef, useCallback, useEffect } from 'react';
import type { UploadedImage, MockupItem } from '../types';
import { DEFAULT_EDITOR_SETTINGS, normalizeEditorSettings, type EditorSettings } from '../data/editorSettings';
import { DEVICE_PRESETS } from '../data/devices';
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

/* Loads a bundled public asset into the same UploadedImage shape as a real upload. */
const SAMPLE_IMAGE_SRC = `${import.meta.env.BASE_URL}mockups/overlays/samples/sample-desktop-studio.webp`;

async function loadSampleImage(): Promise<UploadedImage> {
  const response = await fetch(SAMPLE_IMAGE_SRC, { cache: 'force-cache' });
  if (!response.ok) throw new Error('sample-fetch-failed');
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const probe = new Image();
    probe.onload = () => resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = reject;
    probe.src = dataUrl;
  });
  return {
    id: `sample_${Date.now()}`,
    name: '샘플 프로젝트.webp',
    dataUrl,
    width,
    height,
    size: blob.size,
    uploadedAt: Date.now(),
  };
}

/* ─── Upload Zone ────────────────────────────────────── */
function UploadZone({ onUpload, onUseSample, error, onError, onClearError, onStartWithUrl }: {
  onUpload: (img: UploadedImage) => void;
  onUseSample: () => Promise<void>;
  error: string | null;
  onError: (msg: string) => void;
  onClearError: () => void;
  onStartWithUrl: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const dragDepth = useRef(0);
  const { handleFiles, handleInputChange } = useImageUpload({ onSuccess: onUpload, onError });

  // Use a depth counter so dragging child elements doesn't flicker the highlight.
  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }, []);
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Paste an image straight from the clipboard (screenshot → Ctrl/Cmd+V).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
      if (file) {
        e.preventDefault();
        handleFiles([file]);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFiles]);

  const handleSample = useCallback(async () => {
    if (sampleLoading) return;
    setSampleLoading(true);
    try {
      await onUseSample();
    } finally {
      setSampleLoading(false);
    }
  }, [onUseSample, sampleLoading]);

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
          onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
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
            <span>클릭해서 파일 선택 · 스크린샷은 <strong>Ctrl/⌘ + V</strong>로 바로 붙여넣기</span>
          </div>

          <div className={styles.dropzoneMeta}>PNG · JPG · WebP · 최대 20MB</div>
        </div>

        <div className={styles.startActions}>
          <button
            className={styles.sampleButton}
            type="button"
            onClick={handleSample}
            disabled={sampleLoading}
          >
            {sampleLoading ? (
              <><span className={styles.sampleSpinner} aria-hidden />샘플 불러오는 중…</>
            ) : (
              <>✨ 샘플 프로젝트로 둘러보기</>
            )}
          </button>
          <button className={styles.urlStartButton} type="button" onClick={onStartWithUrl}>
            URL 링크로 반응형 검수 시작
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠️ {error}</span>
            <button onClick={onClearError} aria-label="닫기">✕</button>
          </div>
        )}

        <div className={styles.uploadTips}>
          <div className={styles.tip}><span className={styles.tipIcon}>📐</span><span>이미지 또는 <strong>URL 링크</strong>로 반응형 레이아웃을 확인하세요</span></div>
          <div className={styles.tip}><span className={styles.tipIcon}>🖼</span><span>목업 모드에서 <strong>실사 목업과 레이어</strong>를 합성하세요</span></div>
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
  } = settings;

  // Reflects the debounced localStorage write so the top bar can show a real time.
  const [savedAt, setSavedAt] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = window.setTimeout(() => setSavedAt(Date.now()), 250);
    return () => window.clearTimeout(t);
  }, [settings]);

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
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [initialSourceApplied, setInitialSourceApplied] = useState(false);
  const { assets: mockupAssets, loading: mockupsLoading } = useMockupAssets();

  // ── Multi-image mockup scene (transient: holds dataUrls) ──
  const [mockupItems, setMockupItems] = useState<MockupItem[]>([]);
  const [selectedMockupItemId, setSelectedMockupItemId] = useState<string | null>(null);

  const makeMockupItem = useCallback((img: UploadedImage, offset: number): MockupItem => ({
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dataUrl: img.dataUrl,
    name: img.name,
    width: img.width,
    height: img.height,
    frameId: settings.frameId,
    frameColor: settings.frameColor,
    x: offset * 7,
    y: offset * 5,
    scale: offset === 0 ? 1 : 0.82,
    stretchX: 1,
    stretchY: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    opacity: 1,
    visible: true,
    locked: false,
  }), [settings.frameId, settings.frameColor]);

  // Seed the scene with the main image the first time Mockup/Export opens.
  useEffect(() => {
    if ((activeMode === 'mockup' || activeMode === 'export') && image && mockupItems.length === 0) {
      const first = makeMockupItem(image, 0);
      setMockupItems([first]);
      setSelectedMockupItemId(first.id);
    }
  }, [activeMode, image, mockupItems.length, makeMockupItem]);

  const { handleFilesMultiple: addMockupFiles } = useImageUpload({
    onSuccess: (img) => {
      setMockupItems((prev) => {
        const item = makeMockupItem(img, prev.length);
        setSelectedMockupItemId(item.id);
        return [...prev, item];
      });
    },
    onError: setError,
  });

  const updateMockupItem = useCallback((id: string, patchItem: Partial<MockupItem>) => {
    setMockupItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patchItem } : it)));
  }, []);
  const removeMockupItem = useCallback((id: string) => {
    setMockupItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      setSelectedMockupItemId((sel) => (sel === id ? (next[next.length - 1]?.id ?? null) : sel));
      return next;
    });
  }, []);
  const moveMockupItem = useCallback((id: string, x: number, y: number) => updateMockupItem(id, { x, y }), [updateMockupItem]);
  const duplicateMockupItem = useCallback((id: string) => {
    setMockupItems((prev) => {
      const index = prev.findIndex((it) => it.id === id);
      if (index < 0) return prev;
      const source = prev[index];
      const copy: MockupItem = {
        ...source,
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: `${source.name} copy`,
        x: Math.min(120, source.x + 4),
        y: Math.min(120, source.y + 4),
        locked: false,
      };
      setSelectedMockupItemId(copy.id);
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  }, []);
  const reorderMockupItem = useCallback((id: string, direction: 'forward' | 'backward') => {
    setMockupItems((prev) => {
      const index = prev.findIndex((it) => it.id === id);
      const target = direction === 'forward' ? index + 1 : index - 1;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const exportRef = useRef<HTMLDivElement | null>(null);
  const selectedMockup = mockupAssets.find((asset) => asset.id === selectedMockupId) ?? null;

  useEffect(() => {
    if ((activeMode === 'mockup' || activeMode === 'export') && !selectedMockup && mockupAssets.length > 0) {
      patch('selectedMockupId', mockupAssets[0].id);
    }
  }, [activeMode, mockupAssets, patch, selectedMockup]);

  // Keyboard: 1–4 switch modes (ignored while typing in inputs)
  useEffect(() => {
    const modes: EditorSettings['activeMode'][] = ['inspect', 'mockup', 'compare', 'export'];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx >= 0) patch('activeMode', modes[idx]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [patch]);

  // Auto-pick a device preset matching the uploaded image's aspect ratio
  // (desktop screenshot → desktop preset, portrait → mobile, ~square → tablet).
  const lastSizedImageId = useRef<string | null>(null);
  useEffect(() => {
    if (!image || image.id === lastSizedImageId.current) return;
    lastSizedImageId.current = image.id;
    const ratio = image.width / image.height;
    const category = ratio > 1.3 ? 'desktop' : ratio < 0.85 ? 'mobile' : 'tablet';
    const preset = DEVICE_PRESETS.find((d) => d.category === category);
    if (preset) patch('selectedDeviceId', preset.id);
  }, [image, patch]);

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

  // Auto-preview: once a complete URL (dotted host) is typed, load it after a
  // short debounce so the user doesn't have to press the button every time.
  useEffect(() => {
    if (activeMode !== 'inspect' || inspectSource !== 'url') return;
    const normalized = normalizePreviewUrl(urlInput);
    if (!normalized || normalized === previewUrl) return;
    let host = '';
    try { host = new URL(normalized).hostname; } catch { return; }
    if (!host.includes('.')) return;
    const timer = window.setTimeout(() => {
      patch('previewUrl', normalized);
      setUrlRefreshKey((key) => key + 1);
      setError(null);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [urlInput, activeMode, inspectSource, previewUrl, patch]);

  // Auto-dismiss the save toast.
  useEffect(() => {
    if (!saveToast) return;
    const timer = window.setTimeout(() => setSaveToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [saveToast]);

  const handleCompositeExport = useCallback(async () => {
    if (!selectedMockup) return;
    if (!mockupItems.some((item) => item.visible)) {
      setExportMessage('보이는 이미지 레이어가 있어야 PNG를 저장할 수 있습니다.');
      return;
    }
    setExportLoading(true);
    setExportMessage(null);
    try {
      await exportMockupComposite(mockupItems, selectedMockup.src, projectName);
      setExportMessage('합성된 PNG 파일을 저장했습니다.');
      setSaveToast('합성 PNG를 저장했어요');
    } catch {
      setExportMessage('목업 PNG를 저장하지 못했습니다. 목업 파일을 확인해주세요.');
    } finally {
      setExportLoading(false);
    }
  }, [mockupItems, projectName, selectedMockup]);

  const handleCompositeReset = useCallback(() => {
    if (!selectedMockupItemId) return;
    updateMockupItem(selectedMockupItemId, {
      x: 0,
      y: 0,
      scale: 1,
      stretchX: 1,
      stretchY: 1,
      rotation: 0,
      skewX: 0,
      skewY: 0,
      opacity: 1,
    });
  }, [selectedMockupItemId, updateMockupItem]);

  const handleGifExport = useCallback(async () => {
    if (!beforeImage || !afterImage) return;
    setGifLoading(true);
    setGifMessage(null);
    try {
      await exportComparisonGif(beforeImage.dataUrl, afterImage.dataUrl, projectName, compareOrientation);
      setGifMessage('GIF 파일을 저장했습니다.');
      setSaveToast('GIF를 저장했어요');
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
      setSaveToast('PNG를 저장했어요');
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
        savedAt={savedAt}
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
          mockupItems={mockupItems}
          selectedMockupItemId={selectedMockupItemId}
          onMockupItemSelect={(id) => setSelectedMockupItemId(id || null)}
          onMockupItemMove={moveMockupItem}
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
          mockupItems={mockupItems}
          selectedMockupItemId={selectedMockupItemId}
          onAddMockupImages={addMockupFiles}
          onSelectMockupItem={setSelectedMockupItemId}
          onUpdateMockupItem={updateMockupItem}
          onRemoveMockupItem={removeMockupItem}
          onDuplicateMockupItem={duplicateMockupItem}
          onReorderMockupItem={reorderMockupItem}
        />
      </div>

      {/* save / success toast */}
      {saveToast && (
        <div className={styles.saveToast} role="status">
          <span className={styles.saveToastCheck} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {saveToast}
        </div>
      )}
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
        onUseSample={async () => {
          setError(null);
          try {
            const sample = await loadSampleImage();
            setImage(sample);
            setInitialInspectSource('image');
            setStarted(true);
          } catch {
            setError('샘플을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
          }
        }}
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
