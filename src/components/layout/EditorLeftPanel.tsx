import { useRef, useState, type ReactNode } from 'react';
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
  inspectSource = 'image',
  onInspectSourceChange,
  urlInput = '',
  onUrlInputChange,
  previewWidth = 390,
  previewHeight = 844,
  onPreviewSizeChange,
  onPreviewUrl,
  onPreviewRefresh,
  onOpenPreview,
  previewReady = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleInputChange, loadImageUrl } = useImageUpload({ onSuccess: onImageChange, onError });
  const byCategory = (cat: DevicePreset['category']) => DEVICE_PRESETS.filter((d) => d.category === cat);
  const isCompare = activeMode === 'compare';

  return (
    <aside className={styles.panel}>
      {isCompare ? (
        <Section title="비교 이미지">
          <ImageSlot
            label="Before"
            image={beforeImage}
            onChange={(img) => onBeforeChange?.(img)}
            onRemove={onBeforeRemove}
            onError={onError}
          />
          <div className={styles.slotSpacer} />
          <ImageSlot
            label="After"
            image={afterImage}
            onChange={(img) => onAfterChange?.(img)}
            onRemove={onAfterRemove}
            onError={onError}
          />
          {image && (
            <div className={styles.useCurrentRow}>
              <span className={styles.useCurrentLabel}>현재 이미지 사용</span>
              <button className={styles.useCurrentBtn} type="button" onClick={() => onBeforeChange?.(image)}>Before로</button>
              <button className={styles.useCurrentBtn} type="button" onClick={() => onAfterChange?.(image)}>After로</button>
            </div>
          )}
        </Section>
      ) : (
        <Section title="이미지">
          {image ? (
            <div className={styles.imageCard}>
              <div className={styles.imageThumbWrap}>
                <img src={image.dataUrl} alt={`${image.name} 미리보기`} className={styles.imageThumb} />
              </div>
              <div className={styles.imageInfo}>
                <div className={styles.imageName} title={image.name}>{image.name}</div>
                <div className={styles.imageMeta}>{image.width} x {image.height}px</div>
                <div className={styles.imageMeta}>{(image.size / 1024).toFixed(0)}KB</div>
              </div>
              <div className={styles.imageActions}>
                <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>교체</Button>
                <Button variant="danger" size="sm" onClick={onImageRemove}>삭제</Button>
              </div>
            </div>
          ) : (
            <button className={styles.uploadBtn} type="button" onClick={() => inputRef.current?.click()}>
              <span className={styles.uploadBtnIcon}>+</span>
              이미지 업로드
            </button>
          )}
          <p className={styles.hint}>
            {activeMode === 'inspect'
              ? '이미지를 올려 반응형 크기를 검수하거나, 아래 웹페이지 URL로 실제 사이트를 확인하세요.'
              : '첫 이미지는 목업 화면에 자동으로 들어갑니다. 여러 이미지는 오른쪽 패널에서 추가할 수 있어요.'}
          </p>
          <div className={styles.inputCard}>
            <div className={styles.inputCardHead}>
              <span className={styles.inputCardIcon} aria-hidden>URL</span>
              <div>
                <strong>이미지 링크 불러오기</strong>
                <span>PNG, JPG, WebP처럼 직접 열리는 이미지 주소를 넣어주세요.</span>
              </div>
            </div>
            <ImageUrlInput onLoad={loadImageUrl} placeholder="이미지 파일 주소 (예: https://site.com/image.png)" />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className={styles.hidden}
            onChange={handleInputChange}
            aria-label="이미지 파일 선택"
          />
        </Section>
      )}

      {activeMode === 'inspect' && (
        <>
          <Section title="미리보기">
            <div className={styles.previewModeRow}>
              <button type="button" className={`${styles.previewModeBtn} ${inspectSource === 'image' ? styles.previewModeBtnActive : ''}`} onClick={() => onInspectSourceChange?.('image')}>이미지</button>
              <button type="button" className={`${styles.previewModeBtn} ${inspectSource === 'url' ? styles.previewModeBtnActive : ''}`} onClick={() => onInspectSourceChange?.('url')}>웹페이지 URL</button>
            </div>
            {inspectSource === 'url' && (
              <>
                <div className={styles.inputCard}>
                  <div className={styles.inputCardHead}>
                    <span className={styles.inputCardIcon} aria-hidden>Web</span>
                    <div>
                      <strong>웹페이지 주소 검수</strong>
                      <span>사이트 주소를 넣으면 모바일, 태블릿, 데스크톱 크기로 확인합니다.</span>
                    </div>
                  </div>
                  <label className={styles.srOnly} htmlFor="preview-url">검수할 사이트 주소</label>
                  <input
                    id="preview-url"
                    className={styles.urlInput}
                    value={urlInput}
                    onChange={(event) => onUrlInputChange?.(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') onPreviewUrl?.();
                    }}
                    placeholder="검수할 사이트 주소 (예: https://example.com)"
                    inputMode="url"
                    aria-label="사이트 미리보기 URL"
                  />
                  <div className={styles.previewActions}>
                    <Button size="sm" variant="primary" onClick={onPreviewUrl}>사이트 미리보기</Button>
                    <Button size="sm" variant="secondary" onClick={onPreviewRefresh} disabled={!previewReady}>새로고침</Button>
                  </div>
                </div>
                <div className={styles.sizeInputs}>
                  <label>W<input type="number" min="240" max="1920" value={previewWidth} onChange={(event) => onPreviewSizeChange?.(Number(event.target.value), previewHeight)} /></label>
                  <label>H<input type="number" min="240" max="1920" value={previewHeight} onChange={(event) => onPreviewSizeChange?.(previewWidth, Number(event.target.value))} /></label>
                </div>
                <div className={styles.presetRow}>
                  {[
                    ['Mobile', 390, 844], ['Tablet', 768, 1024], ['Desktop', 1440, 900], ['Wide', 1920, 1080],
                  ].map(([label, width, height]) => (
                    <button type="button" key={String(label)} onClick={() => onPreviewSizeChange?.(Number(width), Number(height))}>{label}</button>
                  ))}
                </div>
                <Button size="sm" variant="ghost" fullWidth onClick={onOpenPreview} disabled={!previewReady}>새 창에서 열기</Button>
              </>
            )}
          </Section>
          <Section title="디바이스">
            {(['mobile', 'tablet', 'desktop'] as DevicePreset['category'][]).map((cat) => (
              <div key={cat} className={styles.deviceGroup}>
                <div className={styles.deviceGroupLabel}>
                  {cat === 'mobile' ? '모바일' : cat === 'tablet' ? '태블릿' : '데스크톱'}
                </div>
                {byCategory(cat).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`${styles.deviceBtn} ${selectedDeviceId === d.id ? styles.deviceBtnActive : ''}`}
                    onClick={() => onDeviceChange(d.id)}
                  >
                    <span className={styles.deviceLabel}>{d.label}</span>
                    <span className={styles.deviceSize}>{d.width}x{d.height}</span>
                  </button>
                ))}
              </div>
            ))}
          </Section>
        </>
      )}

      {activeMode === 'mockup' && (
        <Section title="목업 설정">
          <p className={styles.hint}>오른쪽 패널에서 실사 목업을 고르고 이미지 레이어를 맞춰보세요.</p>
        </Section>
      )}

      {activeMode === 'export' && (
        <Section title="내보내기">
          <p className={styles.hint}>오른쪽 패널에서 해상도와 저장 방식을 고른 뒤 PNG 또는 GIF로 저장하세요.</p>
        </Section>
      )}

      <div className={styles.privacyNote}>
        이미지는 브라우저 안에서만 처리됩니다.
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

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

  function handleRemove() {
    if (!onRemove) return;
    if (window.confirm('정말 삭제할까요? 삭제한 이미지는 되돌릴 수 없어요.')) onRemove();
  }

  return (
    <div>
      <div className={styles.slotLabel}>{label}</div>
      {image ? (
        <div className={styles.imageCard}>
          <div className={styles.imageThumbWrap}>
            <img src={image.dataUrl} alt={`${label} 이미지 미리보기`} className={styles.imageThumb} />
          </div>
          <div className={styles.imageActions}>
            <Button variant="ghost" size="sm" onClick={() => ref.current?.click()}>교체</Button>
            <Button variant="danger" size="sm" onClick={handleRemove}>삭제</Button>
          </div>
        </div>
      ) : (
        <button className={styles.uploadBtn} type="button" onClick={() => ref.current?.click()}>
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
        aria-label={`${label} 이미지 파일 선택`}
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
