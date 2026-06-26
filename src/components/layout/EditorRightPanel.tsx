import { useState } from 'react';
import type { AppMode, UploadedImage, FrameId, FrameColor, BgStyle } from '../../types';
import { FRAMES } from '../../data/frames';
import { BACKGROUNDS } from '../../data/backgrounds';
import { Slider } from '../ui/Slider';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import styles from './EditorRightPanel.module.css';

interface Props {
  activeMode: AppMode;
  image: UploadedImage | null;
  onExport?: () => void;
  exportLoading?: boolean;
  // Inspect props
  showGuides?: boolean;
  showGrid?: boolean;
  showCenter?: boolean;
  showMargins?: boolean;
  onGuidesChange?: (v: boolean) => void;
  onGridChange?: (v: boolean) => void;
  onCenterChange?: (v: boolean) => void;
  onMarginsChange?: (v: boolean) => void;
  fitMode?: 'fit' | 'fill' | 'original';
  onFitModeChange?: (v: 'fit' | 'fill' | 'original') => void;
  inspectOrientation?: 'portrait' | 'landscape';
  onInspectOrientationChange?: (v: 'portrait' | 'landscape') => void;
  // Mockup props
  frameId?: FrameId;
  onFrameChange?: (v: FrameId) => void;
  frameColor?: FrameColor;
  onFrameColorChange?: (v: FrameColor) => void;
  bgStyle?: BgStyle;
  onBgStyleChange?: (v: BgStyle) => void;
  shadowIntensity?: number;
  onShadowChange?: (v: number) => void;
  frameCornerRadius?: number;
  onCornerRadiusChange?: (v: number) => void;
  mockupTitle?: string;
  onMockupTitleChange?: (v: string) => void;
  mockupSubtitle?: string;
  onMockupSubtitleChange?: (v: string) => void;
  mockupTags?: string;
  onMockupTagsChange?: (v: string) => void;
  mockupTextPosition?: 'top' | 'bottom' | 'none';
  onMockupTextPositionChange?: (v: 'top' | 'bottom' | 'none') => void;
  // Compare props
  compareOrientation?: 'horizontal' | 'vertical';
  onCompareOrientationChange?: (v: 'horizontal' | 'vertical') => void;
  // Export props
  exportScale?: number;
  onExportScaleChange?: (v: number) => void;
  transparentBg?: boolean;
  onTransparentBgChange?: (v: boolean) => void;
}

export function EditorRightPanel({
  activeMode, image,
  onExport, exportLoading,
  showGuides, showGrid, showCenter, showMargins,
  onGuidesChange, onGridChange, onCenterChange, onMarginsChange,
  fitMode = 'fit', onFitModeChange,
  inspectOrientation = 'portrait', onInspectOrientationChange,
  frameId = 'browser', onFrameChange,
  frameColor = 'light', onFrameColorChange,
  bgStyle = 'soft-gradient', onBgStyleChange,
  shadowIntensity = 60, onShadowChange,
  frameCornerRadius = 8, onCornerRadiusChange,
  mockupTitle = '', onMockupTitleChange,
  mockupSubtitle = '', onMockupSubtitleChange,
  mockupTags = '', onMockupTagsChange,
  mockupTextPosition = 'none', onMockupTextPositionChange,
  compareOrientation = 'horizontal', onCompareOrientationChange,
  exportScale = 2, onExportScaleChange,
  transparentBg = false, onTransparentBgChange,
}: Props) {
  return (
    <aside className={styles.panel}>
      {activeMode === 'inspect'  && <InspectProps {...{ showGuides, showGrid, showCenter, showMargins, onGuidesChange, onGridChange, onCenterChange, onMarginsChange, fitMode, onFitModeChange, inspectOrientation, onInspectOrientationChange }} />}
      {activeMode === 'mockup'   && <MockupProps  {...{ frameId, onFrameChange, frameColor, onFrameColorChange, bgStyle, onBgStyleChange, shadowIntensity, onShadowChange, frameCornerRadius, onCornerRadiusChange, mockupTitle, onMockupTitleChange, mockupSubtitle, onMockupSubtitleChange, mockupTags, onMockupTagsChange, mockupTextPosition, onMockupTextPositionChange }} />}
      {activeMode === 'compare'  && <CompareProps {...{ compareOrientation, onCompareOrientationChange }} />}
      {activeMode === 'export'   && <ExportProps  {...{ image, exportScale, onExportScaleChange, transparentBg, onTransparentBgChange, onExport, exportLoading }} />}
    </aside>
  );
}

/* ── Section wrapper ──────────────────────── */
function RSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

/* ── Inspect Props ────────────────────────── */
function InspectProps({ showGuides, showGrid, showCenter, showMargins, onGuidesChange, onGridChange, onCenterChange, onMarginsChange, fitMode, onFitModeChange, inspectOrientation, onInspectOrientationChange }: Omit<Props, 'activeMode' | 'image'>) {
  return (
    <>
      <RSection title="방향">
        <div className={styles.fitRow}>
          <button
            className={`${styles.fitBtn} ${inspectOrientation === 'portrait' ? styles.fitBtnActive : ''}`}
            onClick={() => onInspectOrientationChange?.('portrait')}
          >▯ 세로</button>
          <button
            className={`${styles.fitBtn} ${inspectOrientation === 'landscape' ? styles.fitBtnActive : ''}`}
            onClick={() => onInspectOrientationChange?.('landscape')}
          >▭ 가로</button>
        </div>
      </RSection>

      <RSection title="이미지 맞춤">
        <div className={styles.fitRow}>
          {(['fit','fill','original'] as const).map((m) => (
            <button
              key={m}
              className={`${styles.fitBtn} ${fitMode === m ? styles.fitBtnActive : ''}`}
              onClick={() => onFitModeChange?.(m)}
            >
              {m === 'fit' ? 'Fit' : m === 'fill' ? 'Fill' : '1:1'}
            </button>
          ))}
        </div>
      </RSection>

      <RSection title="가이드">
        <Toggle label="안전영역 가이드" value={showGuides ?? false} onChange={v => onGuidesChange?.(v)} />
        <Toggle label="8px 그리드"      value={showGrid   ?? false} onChange={v => onGridChange?.(v)} />
        <Toggle label="중앙선"          value={showCenter ?? false} onChange={v => onCenterChange?.(v)} />
        <Toggle label="좌우 여백"       value={showMargins ?? false} onChange={v => onMarginsChange?.(v)} />
      </RSection>

      <RSection title="체크리스트">
        <CheckItem label="모바일 텍스트 크기 적절한가?" />
        <CheckItem label="버튼 터치 영역 충분한가?" />
        <CheckItem label="좌우 여백이 너무 좁지 않은가?" />
        <CheckItem label="중요 콘텐츠가 접히지 않는가?" />
        <CheckItem label="CTA 버튼이 잘 보이는가?" />
      </RSection>
    </>
  );
}

function CheckItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className={styles.checkItem}>
      <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className={styles.checkbox} />
      <span className={checked ? styles.checkLabelDone : styles.checkLabel}>{label}</span>
    </label>
  );
}

/* ── Mockup Props ─────────────────────────── */
const FRAME_COLORS: { id: FrameColor; label: string; swatch: string }[] = [
  { id: 'light',  label: '라이트', swatch: '#f3f4f6' },
  { id: 'dark',   label: '다크',   swatch: '#1f2329' },
  { id: 'silver', label: '실버',   swatch: '#c8ccd2' },
];

function MockupProps({
  frameId, onFrameChange, frameColor, onFrameColorChange,
  bgStyle, onBgStyleChange, shadowIntensity, onShadowChange,
  frameCornerRadius, onCornerRadiusChange,
  mockupTitle, onMockupTitleChange, mockupSubtitle, onMockupSubtitleChange,
  mockupTags, onMockupTagsChange, mockupTextPosition, onMockupTextPositionChange,
}: Omit<Props, 'activeMode'|'image'>) {
  return (
    <>
      <RSection title="프레임">
        <div className={styles.frameGrid}>
          {FRAMES.map((f) => (
            <button
              key={f.id}
              className={`${styles.frameBtn} ${frameId === f.id ? styles.frameBtnActive : ''}`}
              onClick={() => onFrameChange?.(f.id)}
              title={f.description}
            >
              <span className={styles.frameIcon}>{f.icon}</span>
              <span className={styles.frameLabel}>{f.label}</span>
            </button>
          ))}
        </div>
      </RSection>

      <RSection title="프레임 색상">
        <div className={styles.swatchRow}>
          {FRAME_COLORS.map((c) => (
            <button
              key={c.id}
              className={`${styles.swatch} ${frameColor === c.id ? styles.swatchActive : ''}`}
              onClick={() => onFrameColorChange?.(c.id)}
              title={c.label}
            >
              <span className={styles.swatchDot} style={{ background: c.swatch }} />
              <span className={styles.swatchLabel}>{c.label}</span>
            </button>
          ))}
        </div>
      </RSection>

      <RSection title="배경">
        <div className={styles.bgGrid}>
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              className={`${styles.bgBtn} ${bgStyle === b.id ? styles.bgBtnActive : ''}`}
              onClick={() => onBgStyleChange?.(b.id)}
              title={b.label}
            >
              <span className={styles.bgPreview} style={{ background: b.css }} />
              <span className={styles.bgLabel}>{b.label}</span>
            </button>
          ))}
        </div>
      </RSection>

      <RSection title="그림자">
        <Slider
          label="그림자 강도"
          value={shadowIntensity ?? 60}
          min={0} max={100} unit="%"
          onChange={v => onShadowChange?.(v)}
        />
      </RSection>

      <RSection title="모서리">
        <Slider
          label="둥글기"
          value={frameCornerRadius ?? 8}
          min={0} max={40} unit="px"
          onChange={v => onCornerRadiusChange?.(v)}
        />
      </RSection>

      <RSection title="텍스트 오버레이">
        <div className={styles.fitRow}>
          {(['none','top','bottom'] as const).map((p) => (
            <button
              key={p}
              className={`${styles.fitBtn} ${mockupTextPosition === p ? styles.fitBtnActive : ''}`}
              onClick={() => onMockupTextPositionChange?.(p)}
            >
              {p === 'none' ? '없음' : p === 'top' ? '위' : '아래'}
            </button>
          ))}
        </div>
        {mockupTextPosition !== 'none' && (
          <div className={styles.textFields}>
            <input
              className={styles.textInput}
              placeholder="제목"
              value={mockupTitle ?? ''}
              onChange={(e) => onMockupTitleChange?.(e.target.value)}
            />
            <input
              className={styles.textInput}
              placeholder="부제목"
              value={mockupSubtitle ?? ''}
              onChange={(e) => onMockupSubtitleChange?.(e.target.value)}
            />
            <input
              className={styles.textInput}
              placeholder="태그 (쉼표로 구분)"
              value={mockupTags ?? ''}
              onChange={(e) => onMockupTagsChange?.(e.target.value)}
            />
          </div>
        )}
      </RSection>
    </>
  );
}

/* ── Compare Props ────────────────────────── */
function CompareProps({ compareOrientation, onCompareOrientationChange }: Omit<Props, 'activeMode'|'image'>) {
  return (
    <>
      <RSection title="슬라이더 방향">
        <div className={styles.fitRow}>
          <button
            className={`${styles.fitBtn} ${compareOrientation === 'horizontal' ? styles.fitBtnActive : ''}`}
            onClick={() => onCompareOrientationChange?.('horizontal')}
          >↔ 좌우</button>
          <button
            className={`${styles.fitBtn} ${compareOrientation === 'vertical' ? styles.fitBtnActive : ''}`}
            onClick={() => onCompareOrientationChange?.('vertical')}
          >↕ 상하</button>
        </div>
      </RSection>

      <RSection title="사용법">
        <p className={styles.hint}>
          가운데 손잡이를 드래그하거나 이미지를 클릭/드래그하면<br />
          Before와 After를 비교할 수 있습니다.
        </p>
      </RSection>
    </>
  );
}

/* ── Export Props ─────────────────────────── */
function ExportProps({ image, exportScale, onExportScaleChange, transparentBg, onTransparentBgChange, onExport, exportLoading }: Omit<Props, 'activeMode'>) {
  const scales = [1, 2, 3] as const;

  return (
    <>
      <RSection title="해상도">
        <div className={styles.scaleRow}>
          {scales.map((s) => (
            <button
              key={s}
              className={`${styles.scaleBtn} ${exportScale === s ? styles.scaleBtnActive : ''}`}
              onClick={() => onExportScaleChange?.(s)}
            >
              <span className={styles.scaleName}>{s}×</span>
              <span className={styles.scaleSub}>
                {s === 1 ? '표준' : s === 2 ? 'Retina' : 'Ultra HD'}
              </span>
            </button>
          ))}
        </div>
      </RSection>

      <RSection title="옵션">
        <Toggle label="투명 배경" value={transparentBg ?? false} onChange={v => onTransparentBgChange?.(v)} />
      </RSection>

      {image && (
        <RSection title="출력 크기">
          <div className={styles.outputInfo}>
            <span>예상 크기</span>
            <span className={styles.outputVal}>
              {image.width * (exportScale ?? 2)} × {image.height * (exportScale ?? 2)}px
            </span>
          </div>
        </RSection>
      )}

      <div className={styles.exportFooter}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={exportLoading}
          disabled={!image}
          onClick={onExport}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M12 16L9 13M12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 16.5v2A1.5 1.5 0 0119.5 20h-15A1.5 1.5 0 013 18.5v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
        >
          PNG 저장
        </Button>
        <p className={styles.exportNote}>
          {!image ? '이미지를 먼저 업로드하세요.' : '다운로드 폴더에 저장됩니다.'}
        </p>
      </div>
    </>
  );
}
