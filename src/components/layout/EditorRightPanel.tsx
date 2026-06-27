import { useRef, useState } from 'react';
import type { UploadedImage, FrameColor, MockupItem } from '../../types';
import type { EditorSettings } from '../../data/editorSettings';
import { FRAMES } from '../../data/frames';
import { BACKGROUNDS } from '../../data/backgrounds';
import { Slider } from '../ui/Slider';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import type { MockupAsset } from '../../data/mockups';
import styles from './EditorRightPanel.module.css';

/** Single setter shared with Editor: type-checked against EditorSettings keys. */
type Patch = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;

interface Props {
  settings: EditorSettings;
  patch: Patch;
  image: UploadedImage | null;
  beforeImage: UploadedImage | null;
  afterImage: UploadedImage | null;
  mockupAssets: MockupAsset[];
  mockupsLoading: boolean;
  exportLoading: boolean;
  exportMessage: string | null;
  gifLoading: boolean;
  gifMessage: string | null;
  autoSlide: boolean;
  onAutoSlideChange: (value: boolean) => void;
  onExport: () => void;
  onCompositeExport: () => void;
  onCompositeReset: () => void;
  onGifExport: () => void;
  // Multi-image mockup scene
  mockupItems: MockupItem[];
  selectedMockupItemId: string | null;
  onAddMockupImages: (files: FileList | File[]) => void;
  onSelectMockupItem: (id: string | null) => void;
  onUpdateMockupItem: (id: string, patch: Partial<MockupItem>) => void;
  onRemoveMockupItem: (id: string) => void;
}

export function EditorRightPanel(props: Props) {
  const { settings } = props;
  return (
    <aside className={styles.panel}>
      {settings.activeMode === 'inspect' && <InspectProps {...props} />}
      {settings.activeMode === 'mockup'  && <MockupProps {...props} />}
      {settings.activeMode === 'compare' && <CompareProps {...props} />}
      {settings.activeMode === 'export'  && <ExportProps {...props} />}
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
function InspectProps({ settings: s, patch }: Props) {
  return (
    <>
      <RSection title="방향">
        <div className={styles.fitRow}>
          <button
            className={`${styles.fitBtn} ${s.inspectOrientation === 'portrait' ? styles.fitBtnActive : ''}`}
            onClick={() => patch('inspectOrientation', 'portrait')}
          >▯ 세로</button>
          <button
            className={`${styles.fitBtn} ${s.inspectOrientation === 'landscape' ? styles.fitBtnActive : ''}`}
            onClick={() => patch('inspectOrientation', 'landscape')}
          >▭ 가로</button>
        </div>
      </RSection>

      <RSection title="이미지 맞춤">
        <div className={styles.fitRow}>
          {(['fit','fill','original'] as const).map((m) => (
            <button
              key={m}
              className={`${styles.fitBtn} ${s.fitMode === m ? styles.fitBtnActive : ''}`}
              onClick={() => patch('fitMode', m)}
            >
              {m === 'fit' ? 'Fit' : m === 'fill' ? 'Fill' : '1:1'}
            </button>
          ))}
        </div>
      </RSection>

      <RSection title="가이드">
        <Toggle label="안전영역 가이드" value={s.showGuides}  onChange={v => patch('showGuides', v)} />
        <Toggle label="8px 그리드"      value={s.showGrid}    onChange={v => patch('showGrid', v)} />
        <Toggle label="중앙선"          value={s.showCenter}  onChange={v => patch('showCenter', v)} />
        <Toggle label="좌우 여백"       value={s.showMargins} onChange={v => patch('showMargins', v)} />
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
  settings: s, patch, exportLoading, exportMessage, mockupAssets, mockupsLoading,
  onCompositeExport, onCompositeReset,
  mockupItems, selectedMockupItemId, onAddMockupImages, onSelectMockupItem, onUpdateMockupItem, onRemoveMockupItem,
}: Props) {
  const addRef = useRef<HTMLInputElement>(null);
  const selected = mockupItems.find((it) => it.id === selectedMockupItemId) ?? null;
  const isComposite = Boolean(s.selectedMockupId);

  /* ── Custom PNG mockup mode (overlay composite) ── */
  if (isComposite) {
    return (
      <>
        <RSection title="커스텀 PNG 목업">
          <button className={styles.backToFrames} onClick={() => patch('selectedMockupId', '')}>← 기본 프레임으로 돌아가기</button>
          <p className={styles.hint}>사용자 이미지는 목업 PNG 뒤에 배치되고, 투명하게 뚫린 영역으로만 보입니다.</p>
        </RSection>
        <RSection title="이미지 합성">
          <Slider label="X 위치" value={s.compositeX} min={-100} max={100} unit="%" onChange={value => patch('compositeX', value)} />
          <Slider label="Y 위치" value={s.compositeY} min={-100} max={100} unit="%" onChange={value => patch('compositeY', value)} />
          <Slider label="Scale" value={Math.round(s.compositeScale * 100)} min={10} max={300} unit="%" onChange={value => patch('compositeScale', value / 100)} />
          <Slider label="가로 늘림" value={Math.round(s.compositeStretchX * 100)} min={25} max={400} unit="%" onChange={value => patch('compositeStretchX', value / 100)} />
          <Slider label="세로 늘림" value={Math.round(s.compositeStretchY * 100)} min={25} max={400} unit="%" onChange={value => patch('compositeStretchY', value / 100)} />
          <Slider label="Rotate" value={s.compositeRotation} min={-180} max={180} unit="°" onChange={value => patch('compositeRotation', value)} />
          <Slider label="X 비틀기" value={s.compositeSkewX} min={-60} max={60} unit="°" onChange={value => patch('compositeSkewX', value)} />
          <Slider label="Y 비틀기" value={s.compositeSkewY} min={-60} max={60} unit="°" onChange={value => patch('compositeSkewY', value)} />
          <Button variant="secondary" size="sm" fullWidth onClick={onCompositeReset}>조정 초기화</Button>
        </RSection>
        <div className={styles.exportFooter}>
          <Button variant="primary" size="lg" fullWidth loading={exportLoading} onClick={onCompositeExport}>합성 PNG 저장</Button>
          <p className={styles.exportNote}>합성 결과만 PNG로 저장됩니다.</p>
          {exportMessage && <p className={styles.exportMessage} role="status">{exportMessage}</p>}
        </div>
      </>
    );
  }

  /* ── Default multi-frame scene mode ── */
  return (
    <>
      <RSection title={`이미지 (${mockupItems.length}장)`}>
        <div className={styles.itemList}>
          {mockupItems.map((it) => (
            <div
              key={it.id}
              className={`${styles.itemRow} ${selectedMockupItemId === it.id ? styles.itemRowActive : ''}`}
              onClick={() => onSelectMockupItem(it.id)}
            >
              <img src={it.dataUrl} alt={it.name} className={styles.itemThumb} />
              <span className={styles.itemName}>{it.name}</span>
              <button className={styles.itemRemove} onClick={(e) => { e.stopPropagation(); onRemoveMockupItem(it.id); }} aria-label="이미지 제거">✕</button>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" fullWidth onClick={() => addRef.current?.click()}>+ 이미지 추가</Button>
        <input
          ref={addRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => { if (e.target.files) onAddMockupImages(e.target.files); e.target.value = ''; }}
        />
        <p className={styles.hint}>이미지를 여러 장 올려 한 장면에 배치하고, 캔버스에서 드래그해 위치를 잡으세요.</p>
      </RSection>

      {selected ? (
        <>
          <RSection title="프레임 (선택 이미지)">
            <div className={styles.frameGrid}>
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  className={`${styles.frameBtn} ${selected.frameId === f.id ? styles.frameBtnActive : ''}`}
                  onClick={() => onUpdateMockupItem(selected.id, { frameId: f.id })}
                  title={f.description}
                >
                  <span className={styles.frameIcon}>{f.icon}</span>
                  <span className={styles.frameLabel}>{f.label}</span>
                </button>
              ))}
            </div>
          </RSection>

          <RSection title="프레임 색상 (선택 이미지)">
            <div className={styles.swatchRow}>
              {FRAME_COLORS.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.swatch} ${selected.frameColor === c.id ? styles.swatchActive : ''}`}
                  onClick={() => onUpdateMockupItem(selected.id, { frameColor: c.id })}
                  title={c.label}
                >
                  <span className={styles.swatchDot} style={{ background: c.swatch }} />
                  <span className={styles.swatchLabel}>{c.label}</span>
                </button>
              ))}
            </div>
          </RSection>

          <RSection title="크기 (선택 이미지)">
            <Slider label="크기" value={Math.round(selected.scale * 100)} min={40} max={160} unit="%" onChange={v => onUpdateMockupItem(selected.id, { scale: v / 100 })} />
          </RSection>
        </>
      ) : (
        <RSection title="프레임">
          <p className={styles.hint}>위 목록에서 이미지를 선택하면 프레임·색상·크기를 조절할 수 있습니다.</p>
        </RSection>
      )}

      <RSection title="배경">
        <div className={styles.bgGrid}>
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              className={`${styles.bgBtn} ${s.bgStyle === b.id ? styles.bgBtnActive : ''}`}
              onClick={() => patch('bgStyle', b.id)}
              title={b.label}
            >
              <span className={styles.bgPreview} style={{ background: b.css }} />
              <span className={styles.bgLabel}>{b.label}</span>
            </button>
          ))}
        </div>
      </RSection>

      <RSection title="그림자">
        <Slider label="그림자 강도" value={s.shadowIntensity} min={0} max={100} unit="%" onChange={v => patch('shadowIntensity', v)} />
      </RSection>

      <RSection title="모서리">
        <Slider label="둥글기" value={s.frameCornerRadius} min={0} max={40} unit="px" onChange={v => patch('frameCornerRadius', v)} />
      </RSection>

      <RSection title="텍스트 오버레이">
        <div className={styles.fitRow}>
          {(['none','top','bottom'] as const).map((p) => (
            <button
              key={p}
              className={`${styles.fitBtn} ${s.mockupTextPosition === p ? styles.fitBtnActive : ''}`}
              onClick={() => patch('mockupTextPosition', p)}
            >
              {p === 'none' ? '없음' : p === 'top' ? '위' : '아래'}
            </button>
          ))}
        </div>
        {s.mockupTextPosition !== 'none' && (
          <div className={styles.textFields}>
            <input className={styles.textInput} placeholder="제목" value={s.mockupTitle} onChange={(e) => patch('mockupTitle', e.target.value)} />
            <input className={styles.textInput} placeholder="부제목" value={s.mockupSubtitle} onChange={(e) => patch('mockupSubtitle', e.target.value)} />
            <input className={styles.textInput} placeholder="태그 (쉼표로 구분)" value={s.mockupTags} onChange={(e) => patch('mockupTags', e.target.value)} />
            <label className={styles.colorField}>
              <span>텍스트 색상</span>
              <input type="color" value={s.mockupTextColor} onChange={(e) => patch('mockupTextColor', e.target.value)} aria-label="텍스트 색상" />
            </label>
            <Toggle label="날짜 표시" value={s.showMockupDate} onChange={v => patch('showMockupDate', v)} />
          </div>
        )}
      </RSection>

      <CollapsibleSection title="커스텀 PNG 목업 (직접 만든 PNG)">
        {mockupsLoading ? <p className={styles.hint}>목업 목록을 불러오는 중입니다.</p> : mockupAssets.length ? (
          <div className={styles.mockupCategoryList}>
            {Object.entries(mockupAssets.reduce<Record<string, MockupAsset[]>>((g, a) => { const c = a.category || '기본 목업'; g[c] = [...(g[c] ?? []), a]; return g; }, {})).map(([category, assets]) => (
              <div key={category} className={styles.mockupCategory}>
                <div className={styles.mockupCategoryTitle}>{category}</div>
                <div className={styles.mockupAssetGrid}>
                  {assets.map((asset) => (
                    <button key={asset.id} className={styles.frameBtn} onClick={() => patch('selectedMockupId', asset.id)}>{asset.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : <p className={styles.hint}>public/mockups에 PNG와 manifest를 추가하면 여기에서 선택할 수 있습니다.</p>}
      </CollapsibleSection>

      <div className={styles.exportFooter}>
        <p className={styles.exportNote}>저장은 <strong>Export 탭</strong>에서 해상도·투명 배경을 정한 뒤 진행합니다.</p>
      </div>
    </>
  );
}

/* ── Collapsible section (secondary content) ── */
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.section}>
      <button className={styles.collapseHead} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{title}</span>
        <span className={`${styles.collapseChevron} ${open ? styles.collapseChevronOpen : ''}`}>⌄</span>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

/* ── Compare Props ────────────────────────── */
function CompareProps({ settings: s, patch, autoSlide, onAutoSlideChange, onGifExport, gifLoading, gifMessage, beforeImage, afterImage }: Props) {
  const readyForGif = Boolean(beforeImage && afterImage);
  return (
    <>
      <RSection title="슬라이더 방향">
        <div className={styles.fitRow}>
          <button
            className={`${styles.fitBtn} ${s.compareOrientation === 'horizontal' ? styles.fitBtnActive : ''}`}
            onClick={() => patch('compareOrientation', 'horizontal')}
          >↔ 좌우</button>
          <button
            className={`${styles.fitBtn} ${s.compareOrientation === 'vertical' ? styles.fitBtnActive : ''}`}
            onClick={() => patch('compareOrientation', 'vertical')}
          >↕ 상하</button>
        </div>
      </RSection>

      <RSection title="사용법">
        <p className={styles.hint}>
          가운데 손잡이를 드래그하거나 이미지를 클릭/드래그하면<br />
          Before와 After를 비교할 수 있습니다.
        </p>
      </RSection>
      <RSection title="자동 비교">
        <Button variant={autoSlide ? 'secondary' : 'primary'} fullWidth onClick={() => onAutoSlideChange(!autoSlide)} disabled={!readyForGif}>
          {autoSlide ? '자동 슬라이드 정지' : '자동 슬라이드'}
        </Button>
        <Button variant="secondary" fullWidth loading={gifLoading} onClick={onGifExport} disabled={!readyForGif}>
          GIF 저장
        </Button>
        <p className={styles.hint}>{readyForGif ? (gifMessage ?? 'Before와 After를 GIF로 저장할 수 있습니다.') : 'Before와 After 이미지를 모두 업로드해야 GIF를 저장할 수 있어요.'}</p>
      </RSection>
    </>
  );
}

/* ── Export Props ─────────────────────────── */
function safeFileLabel(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, '-').replace(/[\\/:*?"<>|]/g, '');
  return cleaned || 'project';
}

function ExportProps({ settings: s, patch, image, mockupItems, onExport, exportLoading, exportMessage }: Props) {
  const scales = [1, 2] as const;
  const isComposite = Boolean(s.selectedMockupId);
  const canExport = isComposite ? !!image : mockupItems.length > 0;
  const fileName = isComposite
    ? `mockfolio-${safeFileLabel(s.projectName)}-mockup.png`
    : `mockfolio-${safeFileLabel(s.projectName)}-${new Date().toISOString().slice(0, 10)}.png`;

  return (
    <>
      {isComposite ? (
        <RSection title="커스텀 목업 내보내기">
          <p className={styles.hint}>
            선택한 PNG 목업과 사용자 이미지를 합성한 결과를 <strong>원본 해상도</strong>로 저장합니다.
            해상도·투명 배경 옵션은 합성 저장에 적용되지 않습니다.
          </p>
        </RSection>
      ) : (
        <>
          <RSection title="해상도">
            <div className={styles.scaleRow}>
              {scales.map((scaleOption) => (
                <button
                  key={scaleOption}
                  className={`${styles.scaleBtn} ${s.exportScale === scaleOption ? styles.scaleBtnActive : ''}`}
                  onClick={() => patch('exportScale', scaleOption)}
                >
                  <span className={styles.scaleName}>{scaleOption}×</span>
                  <span className={styles.scaleSub}>{scaleOption === 1 ? '표준' : 'Retina'}</span>
                </button>
              ))}
            </div>
          </RSection>

          <RSection title="옵션">
            <Toggle label="투명 배경" value={s.transparentBg} onChange={v => patch('transparentBg', v)} />
          </RSection>

          <RSection title="내보낼 내용">
            <div className={styles.exportSummary}>
              <div className={styles.summaryRow}><span>이미지</span><span className={styles.summaryVal}>{mockupItems.length}장</span></div>
              <div className={styles.summaryRow}><span>배경</span><span className={styles.summaryVal}>{s.transparentBg ? '투명' : BACKGROUNDS.find(b => b.id === s.bgStyle)?.label}</span></div>
              <div className={styles.summaryRow}><span>해상도</span><span className={styles.summaryVal}>{s.exportScale}× (Retina)</span></div>
              <div className={styles.summaryRow}><span>형식</span><span className={styles.summaryVal}>PNG</span></div>
            </div>
            <p className={styles.hint}>구성한 장면(프레임·배경·텍스트 포함) 전체가 한 장의 PNG로 저장됩니다.</p>
          </RSection>
        </>
      )}

      <div className={styles.exportFooter}>
        <div className={styles.fileNamePreview}>
          <span className={styles.fileNameIcon}>🖼</span>
          <span className={styles.fileNameText}>{fileName}</span>
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={exportLoading}
          disabled={!canExport}
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
          {!canExport ? '먼저 Mockup 탭에서 이미지를 추가하세요.' : '다운로드 폴더에 저장됩니다.'}
        </p>
        {exportMessage && <p className={styles.exportMessage} role="status">{exportMessage}</p>}
      </div>
    </>
  );
}
