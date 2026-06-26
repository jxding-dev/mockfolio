import { useState, useRef, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { useImageUpload } from '../hooks/useImageUpload';
import { Button } from '../components/ui/Button';
import styles from './Editor.module.css';

type AppTab = 'inspect' | 'mockup' | 'export';

/* ─── Upload Zone ────────────────────────────────────── */
interface UploadZoneProps {
  onUpload: (img: UploadedImage) => void;
  error: string | null;
  onClearError: () => void;
}

function UploadZone({ onUpload, error, onClearError }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { handleFiles } = useImageUpload({ onSuccess: onUpload, onError: onClearError });

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className={styles.uploadPage}>
      <div className={styles.uploadCard}>
        {/* Header */}
        <div className={styles.uploadHeader}>
          <div className={styles.uploadLogoRow}>
            <div className={styles.uploadLogoMark}>M</div>
            <span className={styles.uploadLogoText}>Mockfolio</span>
          </div>
          <p className={styles.uploadTagline}>반응형 검수 + 포트폴리오 목업 제작 도구</p>
        </div>

        {/* Drop zone */}
        <div
          className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="이미지 업로드"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className={styles.hiddenInput}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

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

          <div className={styles.dropzoneMeta}>
            PNG · JPG · WebP · 최대 20MB
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={onClearError} aria-label="닫기">✕</button>
          </div>
        )}

        {/* Tips */}
        <div className={styles.uploadTips}>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>📐</span>
            <span>업로드 후 <strong>반응형 검수</strong>로 레이아웃을 확인하세요</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>🖼</span>
            <span>목업 모드에서 <strong>프레임과 배경</strong>을 꾸미세요</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>💾</span>
            <span><strong>PNG 2×</strong> 고해상도로 바로 다운로드</span>
          </div>
        </div>

        {/* Privacy */}
        <div className={styles.uploadPrivacy}>
          🔒 이미지는 브라우저에서만 처리됩니다. 서버로 전송되지 않습니다.
        </div>
      </div>
    </div>
  );
}

/* ─── Workspace ──────────────────────────────────────── */
interface WorkspaceProps {
  image: UploadedImage;
  onChangeImage: () => void;
}

function Workspace({ image, onChangeImage }: WorkspaceProps) {
  const [tab, setTab] = useState<AppTab>('inspect');

  return (
    <div className={styles.workspace}>
      {/* Top bar */}
      <div className={styles.wsTopBar}>
        <div className={styles.wsLogo}>
          <div className={styles.wsLogoMark}>M</div>
          <span className={styles.wsLogoText}>Mockfolio</span>
        </div>

        <div className={styles.wsTabs}>
          {([
            { id: 'inspect', label: 'Inspect', icon: '📐' },
            { id: 'mockup',  label: 'Mockup',  icon: '🖼'  },
            { id: 'export',  label: 'Export',  icon: '💾'  },
          ] as { id: AppTab; label: string; icon: string }[]).map(({ id, label, icon }) => (
            <button
              key={id}
              className={`${styles.wsTab} ${tab === id ? styles.wsTabActive : ''}`}
              onClick={() => setTab(id)}
            >
              <span className={styles.wsTabIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <div className={styles.wsRight}>
          <span className={styles.wsSaved}>● 자동 저장됨</span>
          <Button variant="ghost" size="sm" onClick={onChangeImage}>
            이미지 변경
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className={styles.wsMain}>
        {/* Coming soon notice */}
        <div className={styles.wsCenterNotice}>
          <div className={styles.wcnImageThumb}>
            <img src={image.dataUrl} alt={image.name} className={styles.wcnThumb} />
          </div>
          <div className={styles.wcnInfo}>
            <div className={styles.wcnFileName}>{image.name}</div>
            <div className={styles.wcnSize}>{image.width} × {image.height}px</div>
          </div>

          <div className={styles.wcnTabPreview}>
            <div className={styles.wcnTabRow}>
              {(['inspect', 'mockup', 'export'] as AppTab[]).map((t) => (
                <button
                  key={t}
                  className={`${styles.wcnTabBtn} ${tab === t ? styles.wcnTabBtnActive : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t === 'inspect' ? '📐 Inspect' : t === 'mockup' ? '🖼 Mockup' : '💾 Export'}
                </button>
              ))}
            </div>

            <div className={styles.wcnContent}>
              {tab === 'inspect' && <InspectPlaceholder image={image} />}
              {tab === 'mockup'  && <MockupPlaceholder  image={image} />}
              {tab === 'export'  && <ExportPlaceholder />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab Placeholders ───────────────────────────────── */
function InspectPlaceholder({ image }: { image: UploadedImage }) {
  const [device, setDevice] = useState<number>(390);
  const devices = [360, 390, 768, 1280, 1440];

  return (
    <div className={styles.tabContent}>
      <div className={styles.inspectToolbar}>
        <span className={styles.inspectLabel}>디바이스 너비</span>
        {devices.map((w) => (
          <button
            key={w}
            className={`${styles.inspectDevBtn} ${device === w ? styles.inspectDevBtnActive : ''}`}
            onClick={() => setDevice(w)}
          >
            {w}px
          </button>
        ))}
      </div>
      <div className={styles.inspectFrame}>
        <div className={styles.inspectBrowserBar}>
          <span className={styles.ibDot} style={{background:'#ff5f57'}}/>
          <span className={styles.ibDot} style={{background:'#ffbd2e'}}/>
          <span className={styles.ibDot} style={{background:'#28c840'}}/>
          <div className={styles.ibUrl}>yourportfolio.com</div>
          <span className={styles.ibWidth}>{device}px</span>
        </div>
        <div className={styles.inspectScreen}>
          <img
            src={image.dataUrl}
            alt="preview"
            className={styles.inspectImage}
            style={{ width: Math.min(device, 800) }}
          />
        </div>
      </div>
      <p className={styles.tabNote}>
        🚀 <strong>3단계</strong>에서 안전영역·그리드 가이드, 방향 전환, Before/After 비교 등 전체 기능이 추가됩니다.
      </p>
    </div>
  );
}

function MockupPlaceholder({ image }: { image: UploadedImage }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.mockupPreview}>
        <div className={styles.mpGradient}>
          <div className={styles.mpFrame}>
            <div className={styles.mpFrameBar}>
              <span className={styles.ibDot} style={{background:'#ff5f57'}}/>
              <span className={styles.ibDot} style={{background:'#ffbd2e'}}/>
              <span className={styles.ibDot} style={{background:'#28c840'}}/>
              <div className={styles.ibUrl}>yourportfolio.com</div>
            </div>
            <div className={styles.mpFrameScreen}>
              <img src={image.dataUrl} alt="mockup" className={styles.mpImage} />
            </div>
          </div>
        </div>
      </div>
      <p className={styles.tabNote}>
        🚀 <strong>4단계</strong>에서 프레임 선택, 배경 커스텀, 그림자, 텍스트 오버레이 전체 기능이 추가됩니다.
      </p>
    </div>
  );
}

function ExportPlaceholder() {
  return (
    <div className={styles.tabContent}>
      <div className={styles.exportPreview}>
        <div className={styles.epIcon}>💾</div>
        <div className={styles.epTitle}>PNG Export</div>
        <div className={styles.epOptions}>
          {['1×', '2× (Retina)', '3×'].map((s) => (
            <div key={s} className={`${styles.epOption} ${s === '2× (Retina)' ? styles.epOptionActive : ''}`}>
              {s}
            </div>
          ))}
        </div>
        <Button variant="primary" size="lg" disabled>
          PNG 저장 (준비 중)
        </Button>
      </div>
      <p className={styles.tabNote}>
        🚀 <strong>5단계</strong>에서 실제 PNG Export 기능이 구현됩니다.
      </p>
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
      onChangeImage={() => setImage(null)}
    />
  );
}
