import { useState } from 'react';
import type { AppMode, UploadedImage } from '../../types';
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
  // Mockup props
  shadowIntensity?: number;
  onShadowChange?: (v: number) => void;
  frameCornerRadius?: number;
  onCornerRadiusChange?: (v: number) => void;
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
  shadowIntensity = 60, onShadowChange,
  frameCornerRadius = 8, onCornerRadiusChange,
  exportScale = 2, onExportScaleChange,
  transparentBg = false, onTransparentBgChange,
}: Props) {
  return (
    <aside className={styles.panel}>
      {activeMode === 'inspect'  && <InspectProps {...{ showGuides, showGrid, showCenter, showMargins, onGuidesChange, onGridChange, onCenterChange, onMarginsChange, fitMode, onFitModeChange }} />}
      {activeMode === 'mockup'   && <MockupProps  {...{ shadowIntensity, onShadowChange, frameCornerRadius, onCornerRadiusChange }} />}
      {activeMode === 'compare'  && <CompareProps />}
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
function InspectProps({ showGuides, showGrid, showCenter, showMargins, onGuidesChange, onGridChange, onCenterChange, onMarginsChange, fitMode, onFitModeChange }: Omit<Props, 'activeMode' | 'image'>) {
  return (
    <>
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
function MockupProps({ shadowIntensity, onShadowChange, frameCornerRadius, onCornerRadiusChange }: Omit<Props, 'activeMode'|'image'>) {
  return (
    <>
      <RSection title="프레임 설정">
        <p className={styles.hint}>프레임 선택은 4단계(Mockup Mode)에서 추가됩니다.</p>
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
    </>
  );
}

/* ── Compare Props ────────────────────────── */
function CompareProps() {
  return (
    <RSection title="Before / After">
      <p className={styles.hint}>비교 기능은 5단계에서 구현됩니다.</p>
    </RSection>
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
