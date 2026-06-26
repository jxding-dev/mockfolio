import { useRef } from 'react';
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
}

export function EditorLeftPanel({
  image,
  activeMode,
  selectedDeviceId,
  onDeviceChange,
  onImageChange,
  onImageRemove,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleFiles } = useImageUpload({ onSuccess: onImageChange, onError });

  const byCategory = (cat: DevicePreset['category']) =>
    DEVICE_PRESETS.filter((d) => d.category === cat);

  return (
    <aside className={styles.panel}>
      {/* ── Image Section ─────────────────── */}
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
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className={styles.hidden}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </Section>

      {/* ── Device Section (Inspect/Compare mode) ── */}
      {(activeMode === 'inspect' || activeMode === 'compare') && (
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
