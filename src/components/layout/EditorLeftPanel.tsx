import { useRef, useState } from 'react';
import type { AppMode, UploadedImage } from '../../types';
import type { DevicePreset } from '../../types';
import { DEVICE_PRESETS } from '../../data/devices';
import { useImageUpload } from '../../hooks/useImageUpload';
import { Button } from '../ui/Button';
import styles from './EditorLeftPanel.module.css';

interface Props {
  image: UploadedImage | null;
  activeMode: AppMode;
  selectedDeviceId: string;
  onDeviceChange: (id: string) => void;
  onImageChange: (img: UploadedImage) => void;
  onImageRemove: () => void;
  onError: (msg: string) => void;
  // Compare
  beforeImage?: UploadedImage | null;
  afterImage?: UploadedImage | null;
  onBeforeChange?: (img: UploadedImage) => void;
  onAfterChange?: (img: UploadedImage) => void;
  onBeforeRemove?: () => void;
  onAfterRemove?: () => void;
  inspectSource?: 'image' | 'url';
  onInspectSourceChange?: (value: 'image' | 'url') => void;
  urlInput?: string;
  onUrlInputChange?: (value: string) => void;
  previewWidth?: number;
  previewHeight?: number;
  onPreviewSizeChange?: (width: number, height: number) => void;
  onPreviewUrl?: () => void;
  onPreviewRefresh?: () => void;
  onOpenPreview?: () => void;
  previewReady?: boolean;
}

export function EditorLeftPanel({
  image,
  activeMode,
  selectedDeviceId,
  onDeviceChange,
  onImageChange,
  onImageRemove,
  onError,
  beforeImage = null,
  afterImage = null,
  onBeforeChange,
  onAfterChange,
  onBeforeRemove,
  onAfterRemove,
  inspectSource = 'image', onInspectSourceChange,
  urlInput = '', onUrlInputChange,
  previewWidth = 390, previewHeight = 844, onPreviewSizeChange,
  onPreviewUrl, onPreviewRefresh, onOpenPreview, previewReady = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleInputChange, loadImageUrl } = useImageUpload({ onSuccess: onImageChange, onError });

  const byCategory = (cat: DevicePreset['category']) =>
    DEVICE_PRESETS.filter((d) => d.category === cat);

  const isCompare = activeMode === 'compare';

  return (
    <aside className={styles.panel}>
      {/* ── Compare slots ─────────────────── */}
      {isCompare ? (
        <Section title="비교 이미지">
          <ImageSlot
            label="Before" image={beforeImage}
            onChange={(img) => onBeforeChange?.(img)} onRemove={onBeforeRemove}
            onError={onError}
          />
          <div className={styles.slotSpacer} />
          <ImageSlot
            label="After" image={afterImage}
            onChange={(img) => onAfterChange?.(img)} onRemove={onAfterRemove}
            onError={onError}
          />
        </Section>
      ) : (
      /* ── Image Section ─────────────────── */
      <Section title="이미지">
        {image ? (
          <div className={styles.imageCard}>
            <div className={styles.imageThumbWrap}>
              <img src={image.dataUrl} alt={image.name} className={styles.imageThumb} />
            </div>
            <div className={styles.imageInfo}>
              <div className={styles.imageName} title={image.name}>{image.name}</div>
              <div className={styles.imageMeta}>{image.width} × {image.height}px</div>
              <div className={styles.imageMeta}>{(image.size / 1024).toFixed(0)}KB</div>
            </div>
            <div className={styles.imageActions}>
              <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>교체</Button>
              <Button variant="danger" size="sm" onClick={onImageRemove}>삭제</Button>
            </div>
          </div>
        ) : (
          <button
            className={styles.uploadBtn}
            onClick={() => inputRef.current?.click()}
          >
            <span className={styles.uploadBtnIcon}>+</span>
            이미지 업로드
          </button>
        )}
        <p className={styles.hint}>
          파일 업로드 또는 이미지 링크를 넣어 목업에 합성하세요. 웹페이지 검수는 아래 URL 모드를 사용하세요.
        </p>
        <ImageUrlInput onLoad={loadImageUrl} placeholder="https://example.com/screenshot.png" />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className={styles.hidden}
          onChange={handleInputChange}
        />
      </Section>
      )}

      {/* ── Device Section (Inspect only) ── */}
      {activeMode === 'inspect' && (
        <>
          <Section title="미리보기">
            <div className={styles.previewModeRow}>
              <button className={`${styles.previewModeBtn} ${inspectSource === 'image' ? styles.previewModeBtnActive : ''}`} onClick={() => onInspectSourceChange?.('image')}>이미지</button>
              <button className={`${styles.previewModeBtn} ${inspectSource === 'url' ? styles.previewModeBtnActive : ''}`} onClick={() => onInspectSourceChange?.('url')}>URL</button>
            </div>
            {inspectSource === 'url' && (
              <>
                <p className={styles.hint}>웹페이지 주소를 넣고 사이트 미리보기를 누르세요. https://가 없으면 자동으로 붙습니다.</p>
                <input
                  className={styles.urlInput}
                  value={urlInput}
                  onChange={(event) => onUrlInputChange?.(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onPreviewUrl?.();
                  }}
                  placeholder="example.com"
                  inputMode="url"
                  aria-label="사이트 미리보기 URL"
                />
                <div className={styles.previewActions}>
                  <Button size="sm" variant="primary" onClick={onPreviewUrl}>사이트 미리보기</Button>
                  <Button size="sm" variant="secondary" onClick={onPreviewRefresh} disabled={!previewReady}>새로고침</Button>
                </div>
                <div className={styles.sizeInputs}>
                  <label>W<input type="number" min="240" max="1920" value={previewWidth} onChange={(event) => onPreviewSizeChange?.(Number(event.target.value), previewHeight)} /></label>
                  <label>H<input type="number" min="240" max="1920" value={previewHeight} onChange={(event) => onPreviewSizeChange?.(previewWidth, Number(event.target.value))} /></label>
                </div>
                <div className={styles.presetRow}>
                  {[
                    ['Mobile', 390, 844], ['Tablet', 768, 1024], ['Desktop', 1440, 900], ['Wide', 1920, 1080],
                  ].map(([label, width, height]) => <button key={String(label)} onClick={() => onPreviewSizeChange?.(Number(width), Number(height))}>{label}</button>)}
                </div>
                <Button size="sm" variant="ghost" fullWidth onClick={onOpenPreview} disabled={!previewReady}>새 창에서 열기</Button>
              </>
            )}
          </Section>
          <Section title="디바이스">
            {(['mobile', 'tablet', 'desktop'] as DevicePreset['category'][]).map((cat) => (
              <div key={cat} className={styles.deviceGroup}>
                <div className={styles.deviceGroupLabel}>
                  {cat === 'mobile' ? '📱 모바일' : cat === 'tablet' ? '📲 태블릿' : '🖥 데스크탑'}
                </div>
                {byCategory(cat).map((d) => (
                  <button
                    key={d.id}
                    className={`${styles.deviceBtn} ${selectedDeviceId === d.id ? styles.deviceBtnActive : ''}`}
                    onClick={() => onDeviceChange(d.id)}
                  >
                    <span className={styles.deviceLabel}>{d.label}</span>
                    <span className={styles.deviceSize}>{d.width}×{d.height}</span>
                  </button>
                ))}
              </div>
            ))}
          </Section>
        </>
      )}

      {/* ── Mockup mode hint ─────────────── */}
      {activeMode === 'mockup' && (
        <Section title="목업 설정">
          <p className={styles.hint}>
            우측 패널에서 프레임, 배경, 그림자를 조절하세요.
          </p>
        </Section>
      )}

      {/* ── Export mode hint ─────────────── */}
      {activeMode === 'export' && (
        <Section title="내보내기">
          <p className={styles.hint}>
            우측 패널에서 해상도와 옵션을 선택하고 저장하세요.
          </p>
        </Section>
      )}

      {/* ── Privacy notice ───────────────── */}
      <div className={styles.privacyNote}>
        🔒 이미지는 브라우저 내에서만 처리됩니다
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

/* ── Image Slot (compare before/after) ─────── */
function ImageSlot({
  label, image, onChange, onRemove, onError,
}: {
  label: string;
  image: UploadedImage | null;
  onChange: (img: UploadedImage) => void;
  onRemove?: () => void;
  onError: (msg: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { handleInputChange, loadImageUrl } = useImageUpload({ onSuccess: onChange, onError });

  return (
    <div>
      <div className={styles.slotLabel}>{label}</div>
      {image ? (
        <div className={styles.imageCard}>
          <div className={styles.imageThumbWrap}>
            <img src={image.dataUrl} alt={label} className={styles.imageThumb} />
          </div>
          <div className={styles.imageActions}>
            <Button variant="ghost" size="sm" onClick={() => ref.current?.click()}>교체</Button>
            <Button variant="danger" size="sm" onClick={onRemove}>삭제</Button>
          </div>
        </div>
      ) : (
        <button className={styles.uploadBtn} onClick={() => ref.current?.click()}>
          <span className={styles.uploadBtnIcon}>+</span>
          {label} 업로드
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className={styles.hidden}
        onChange={handleInputChange}
      />
      <ImageUrlInput onLoad={loadImageUrl} placeholder={`${label} 이미지 URL`} compact />
    </div>
  );
}

function ImageUrlInput({
  onLoad,
  placeholder,
  compact = false,
}: {
  onLoad: (url: string) => Promise<boolean>;
  placeholder: string;
  compact?: boolean;
}) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    try {
      const ok = await onLoad(value);
      if (ok) setValue('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.linkLoader} ${compact ? styles.linkLoaderCompact : ''}`}>
      <input
        className={styles.linkInput}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void handleLoad();
        }}
        placeholder={placeholder}
        inputMode="url"
        aria-label="이미지 URL"
      />
      <Button size="sm" variant="secondary" onClick={handleLoad} loading={loading} disabled={!value.trim()}>
        이미지 링크 불러오기
      </Button>
    </div>
  );
}
