import { useRef, useState } from 'react';
import type { UploadedImage, MockupItem } from '../../types';
import type { EditorSettings } from '../../data/editorSettings';
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
  onDuplicateMockupItem: (id: string) => void;
  onReorderMockupItem: (id: string, direction: 'forward' | 'backward') => void;
  onFitMockupItem: (id: string, mode: 'contain' | 'width' | 'height') => void;
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
        {CHECKLIST_LABELS.map((label, i) => (
          <CheckItem
            key={label}
            label={label}
            checked={s.inspectChecklist[i] ?? false}
            onChange={(v) => patch('inspectChecklist', s.inspectChecklist.map((c, j) => (j === i ? v : c)))}
          />
        ))}
      </RSection>
    </>
  );
}

const CHECKLIST_LABELS = [
  '모바일 텍스트 크기 적절한가?',
  '버튼 터치 영역 충분한가?',
  '좌우 여백이 너무 좁지 않은가?',
  '중요 콘텐츠가 접히지 않는가?',
  'CTA 버튼이 잘 보이는가?',
];

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.checkItem}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className={styles.checkbox} />
      <span className={checked ? styles.checkLabelDone : styles.checkLabel}>{label}</span>
    </label>
  );
}

function MockupProps({
  settings: s, patch, mockupAssets, mockupsLoading,
  onCompositeReset,
  mockupItems, selectedMockupItemId, onAddMockupImages, onSelectMockupItem, onUpdateMockupItem, onRemoveMockupItem,
  onDuplicateMockupItem, onReorderMockupItem, onFitMockupItem,
}: Props) {
  const addRef = useRef<HTMLInputElement>(null);
  const [mockupQuery, setMockupQuery] = useState('');
  // User-toggled category open states (overrides the default-open heuristic).
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  // The full mockup catalog stays collapsed once a mockup is chosen, so the
  // panel leads with the active mockup + per-layer controls instead.
  const [showCatalog, setShowCatalog] = useState(false);
  const selected = mockupItems.find((it) => it.id === selectedMockupItemId) ?? null;
  const selectedMockupAsset = mockupAssets.find((asset) => asset.id === s.selectedMockupId) ?? null;
  const catalogOpen = showCatalog || !selectedMockupAsset;
  const hasLongLayer = mockupItems.some((item) => item.height / item.width >= 1.75);
  const query = mockupQuery.trim().toLowerCase();
  const visibleMockupAssets = query
    ? mockupAssets.filter((asset) => [
      asset.label,
      asset.category ?? '',
      asset.description ?? '',
      ...(asset.tags ?? []),
    ].some((value) => value.toLowerCase().includes(query)))
    : mockupAssets;
  const groupedMockups = visibleMockupAssets.reduce<Record<string, MockupAsset[]>>((grouped, asset) => {
    const category = asset.category || '실사 목업';
    grouped[category] = [...(grouped[category] ?? []), asset];
    return grouped;
  }, {});

  return (
    <>
      <RSection title="목업">
        {selectedMockupAsset ? (
          <div className={styles.selectedMockupCard}>
            <div className={styles.mockupThumbWrap}>
              <img src={selectedMockupAsset.src} alt={selectedMockupAsset.label} className={styles.mockupThumb} draggable={false} />
            </div>
            <div className={styles.selectedMockupInfo}>
              <strong>{selectedMockupAsset.label}</strong>
              <span>{selectedMockupAsset.description ?? '이미지를 목업 PNG 뒤에 레이어로 배치해 합성합니다.'}</span>
            </div>
          </div>
        ) : (
          <p className={styles.hint}>아래에서 목업을 하나 선택하면 캔버스 중앙에 크게 표시됩니다.</p>
        )}
        {selectedMockupAsset && (
          <Button variant="secondary" size="sm" fullWidth onClick={() => setShowCatalog((v) => !v)}>
            {catalogOpen ? '목록 닫기' : '다른 목업 선택'}
          </Button>
        )}
      </RSection>

      {catalogOpen && (
        <RSection title="실사 목업 선택">
          {hasLongLayer && (
            <p className={styles.infoHint}>긴 상세페이지 이미지로 보입니다. 상세페이지 목업과 자동 맞춤 버튼을 먼저 사용해보세요.</p>
          )}
          <label className={styles.searchLabel}>
            <span>목업 검색</span>
            <input
              value={mockupQuery}
              onChange={(event) => setMockupQuery(event.target.value)}
              placeholder="상세페이지, 앱, 광고..."
            />
          </label>
          {mockupsLoading ? <p className={styles.hint}>목업 목록을 불러오는 중입니다.</p> : mockupAssets.length ? (
            <div className={styles.mockupCategoryList}>
              {Object.entries(groupedMockups).map(([category, assets]) => {
                const defaultOpen = assets.some((asset) => asset.id === s.selectedMockupId)
                  || (hasLongLayer && category.includes('상세페이지'));
                // While searching, force-open every group; otherwise respect the
                // user's manual toggle, falling back to the default-open heuristic.
                const isOpen = query ? true : (openCategories[category] ?? defaultOpen);
                return (
                <details
                  key={category}
                  className={styles.mockupCategory}
                  open={isOpen}
                  onToggle={(event) => {
                    const next = event.currentTarget.open;
                    setOpenCategories((prev) => (prev[category] === next ? prev : { ...prev, [category]: next }));
                  }}
                >
                  <summary className={styles.mockupCategoryTitle}>
                    <span>{category}</span>
                    <span>{assets.length}</span>
                  </summary>
                  <div className={styles.mockupAssetGrid}>
                    {assets.map((asset) => (
                      <MockupAssetCard
                        key={asset.id}
                        asset={asset}
                        active={s.selectedMockupId === asset.id}
                        onSelect={() => { patch('selectedMockupId', asset.id); setShowCatalog(false); }}
                      />
                    ))}
                  </div>
                </details>
                );
              })}
              {visibleMockupAssets.length === 0 && <p className={styles.hint}>검색 결과가 없습니다. 다른 키워드를 입력해보세요.</p>}
            </div>
          ) : <p className={styles.hint}>목업을 불러오지 못했습니다. 잠시 후 새로고침하면 목업 목록이 다시 표시됩니다.</p>}
          <p className={styles.hint}>실제 목업 이미지만 사용합니다. 투명하게 뚫린 영역 뒤로 사용자 이미지가 들어갑니다.</p>
        </RSection>
      )}

      <RSection title={`이미지 레이어 (${mockupItems.length}장)`}>
        <LayerList
          items={mockupItems}
          selectedId={selectedMockupItemId}
          onSelect={onSelectMockupItem}
          onUpdate={onUpdateMockupItem}
          onRemove={onRemoveMockupItem}
        />
        <Button variant="secondary" size="sm" fullWidth onClick={() => addRef.current?.click()}>+ 이미지 추가</Button>
        <input
          ref={addRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => { if (e.target.files) onAddMockupImages(e.target.files); e.target.value = ''; }}
        />
        <p className={styles.hint}>이미지를 여러 장 추가하고 캔버스에서 선택한 레이어를 드래그하세요.</p>
      </RSection>

      {selected ? (
        <RSection title="선택 레이어">
          <div className={styles.layerActionGrid}>
            <button className={styles.layerActionBtn} onClick={() => onFitMockupItem(selected.id, 'contain')}>전체 맞춤</button>
            <button className={styles.layerActionBtn} onClick={() => onFitMockupItem(selected.id, 'width')}>폭 맞춤</button>
            <button className={styles.layerActionBtn} onClick={() => onFitMockupItem(selected.id, 'height')}>높이 맞춤</button>
            <button className={styles.layerActionBtn} onClick={() => onUpdateMockupItem(selected.id, { x: 0, y: 0 })}>가운데</button>
            <button className={styles.layerActionBtn} onClick={() => onDuplicateMockupItem(selected.id)}>복제</button>
            <button className={styles.layerActionBtn} onClick={() => onReorderMockupItem(selected.id, 'forward')}>앞으로</button>
            <button className={styles.layerActionBtn} onClick={() => onReorderMockupItem(selected.id, 'backward')}>뒤로</button>
          </div>
          <p className={styles.hint}>캔버스에서 코너를 끌면 한쪽 꼭짓점만 늘릴 수 있어요. (Shift = 비율 유지)</p>

          <Slider label="X 위치" value={selected.x} min={-120} max={120} unit="%" onChange={value => onUpdateMockupItem(selected.id, { x: value })} />
          <Slider label="Y 위치" value={selected.y} min={-120} max={120} unit="%" onChange={value => onUpdateMockupItem(selected.id, { y: value })} />
          <Slider label="크기" value={Math.round(selected.scale * 100)} min={10} max={300} unit="%" onChange={value => onUpdateMockupItem(selected.id, { scale: value / 100 })} />
          <Slider label="회전" value={selected.rotation} min={-180} max={180} unit="°" onChange={value => onUpdateMockupItem(selected.id, { rotation: value })} />
          <Slider label="투명도" value={Math.round(selected.opacity * 100)} min={0} max={100} unit="%" onChange={value => onUpdateMockupItem(selected.id, { opacity: value / 100 })} />
          <CollapsibleSection title="고급 변형">
            <Slider label="가로 늘림" value={Math.round(selected.stretchX * 100)} min={25} max={400} unit="%" onChange={value => onUpdateMockupItem(selected.id, { stretchX: value / 100 })} />
            <Slider label="세로 늘림" value={Math.round(selected.stretchY * 100)} min={25} max={400} unit="%" onChange={value => onUpdateMockupItem(selected.id, { stretchY: value / 100 })} />
            <Slider label="X 비틀기" value={selected.skewX} min={-60} max={60} unit="°" onChange={value => onUpdateMockupItem(selected.id, { skewX: value })} />
            <Slider label="Y 비틀기" value={selected.skewY} min={-60} max={60} unit="°" onChange={value => onUpdateMockupItem(selected.id, { skewY: value })} />
          </CollapsibleSection>
          <Button variant="secondary" size="sm" fullWidth onClick={onCompositeReset}>선택 레이어 초기화</Button>
        </RSection>
      ) : (
        <RSection title="선택 레이어">
          <p className={styles.hint}>레이어를 선택하면 위치·크기·회전·변형을 조정할 수 있어요. 캔버스에서 코너를 끌면 한쪽 꼭짓점만 늘릴 수 있습니다.</p>
        </RSection>
      )}

      <div className={styles.exportFooter}>
        <p className={styles.exportNote}>
          저장은 Export 탭에서만 가능합니다. 목업과 레이어를 맞춘 뒤 Export에서 PNG로 저장해 주세요.
        </p>
      </div>
    </>
  );
}

function LayerList({
  items,
  selectedId,
  onSelect,
  onUpdate,
  onRemove,
}: {
  items: MockupItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<MockupItem>) => void;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className={styles.hint}>이미지를 추가하면 여기에서 레이어를 관리할 수 있습니다.</p>;
  }

  return (
    <div className={styles.itemList}>
      {items.map((it, index) => (
        <div
          key={it.id}
          className={`${styles.itemRow} ${selectedId === it.id ? styles.itemRowActive : ''} ${!it.visible ? styles.itemRowMuted : ''}`}
          onClick={() => onSelect(it.id)}
        >
          <span className={styles.itemIndex}>{index + 1}</span>
          <img src={it.dataUrl} alt={it.name} className={styles.itemThumb} />
          <span className={styles.itemName} title={it.name}>{it.name}</span>
          <button
            className={styles.itemMiniBtn}
            onClick={(e) => { e.stopPropagation(); onUpdate(it.id, { visible: !it.visible }); }}
            aria-label={it.visible ? '레이어 숨기기' : '레이어 보이기'}
            title={it.visible ? '숨기기' : '보이기'}
          >
            {it.visible ? '눈' : '숨김'}
          </button>
          <button
            className={styles.itemMiniBtn}
            onClick={(e) => { e.stopPropagation(); onUpdate(it.id, { locked: !it.locked }); }}
            aria-label={it.locked ? '레이어 잠금 해제' : '레이어 잠금'}
            title={it.locked ? '잠금 해제' : '잠금'}
          >
            {it.locked ? '잠김' : '열림'}
          </button>
          <button className={styles.itemRemove} onClick={(e) => { e.stopPropagation(); onRemove(it.id); }} aria-label="이미지 제거">×</button>
        </div>
      ))}
    </div>
  );
}

function MockupAssetCard({ asset, active, onSelect }: { asset: MockupAsset; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={`${styles.mockupAssetCard} ${active ? styles.mockupAssetCardActive : ''}`}
      onClick={onSelect}
      title={asset.description ?? asset.label}
    >
      <span className={styles.mockupPreviewBox}>
        <img
          src={asset.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          onContextMenu={(event) => event.preventDefault()}
        />
      </span>
      <span className={styles.mockupCardTitle}>{asset.label}</span>
      {asset.description && <span className={styles.mockupCardDesc}>{asset.description}</span>}
      {asset.tags && asset.tags.length > 0 && (
        <span className={styles.mockupTags}>
          {asset.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </span>
      )}
    </button>
  );
}

/* ── Collapsible section (secondary content) ── */
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
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

function ExportProps({ settings: s, mockupItems, onExport, exportLoading, exportMessage }: Props) {
  const isComposite = Boolean(s.selectedMockupId);
  const canExport = isComposite && mockupItems.some((item) => item.visible);
  const fileName = `mockfolio-${safeFileLabel(s.projectName)}-mockup.png`;

  return (
    <>
      <RSection title="실사 목업 내보내기">
        <p className={styles.hint}>
          선택한 목업 이미지와 사용자 이미지 레이어를 합성한 결과만 저장합니다.
          목업 원본 단독 저장 흐름은 제공하지 않습니다.
        </p>
        {!isComposite && <p className={styles.hint}>Mockup 탭에서 목업 이미지를 먼저 선택하세요.</p>}
      </RSection>

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
          {!isComposite ? '먼저 Mockup 탭에서 목업을 선택하세요.' : !canExport ? '먼저 Mockup 탭에서 이미지를 추가하세요.' : '다운로드 폴더에 저장됩니다.'}
        </p>
        {exportMessage && <p className={styles.exportMessage} role="status">{exportMessage}</p>}
      </div>
    </>
  );
}
