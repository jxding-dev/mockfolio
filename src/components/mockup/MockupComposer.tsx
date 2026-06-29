import { useEffect, useRef } from 'react';
import type { MockupAsset } from '../../data/mockups';
import type { MockupItem } from '../../types';
import styles from './MockupComposer.module.css';

interface Props {
  items: MockupItem[];
  selectedId: string | null;
  mockup: MockupAsset;
  onSelect: (id: string | null) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onTransformChange: (id: string, patch: Partial<MockupItem>) => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_DIRECTIONS: Record<ResizeHandle, { x: -1 | 0 | 1; y: -1 | 0 | 1 }> = {
  nw: { x: -1, y: -1 },
  n: { x: 0, y: -1 },
  ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 },
  se: { x: 1, y: 1 },
  s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 },
  w: { x: -1, y: 0 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const round = (value: number) => Number(value.toFixed(3));

export function MockupComposer({
  items,
  selectedId,
  mockup,
  onSelect,
  onPositionChange,
  onTransformChange,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const resize = useRef<{
    id: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    baseScale: number;
    baseStretchX: number;
    baseStretchY: number;
    baseRotation: number;
    baseWidthPx: number;
    baseHeightPx: number;
  } | null>(null);
  const rotate = useRef<{
    id: string;
    centerX: number;
    centerY: number;
    startAngle: number;
    baseRotation: number;
  } | null>(null);

  const layerStyle = (item: MockupItem): React.CSSProperties => ({
    left: `${50 + item.x}%`,
    top: `${50 + item.y}%`,
    width: `${item.scale * 100}%`,
    transform: `translate(-50%, -50%) rotate(${item.rotation}deg) skew(${item.skewX}deg, ${item.skewY}deg) scale(${item.stretchX}, ${item.stretchY})`,
  });

  const onLayerPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: MockupItem) => {
    if (item.locked) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(item.id);
    drag.current = {
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      baseX: item.x,
      baseY: item.y,
    };
  };

  const onResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>, item: MockupItem, handle: ResizeHandle) => {
    if (item.locked) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(item.id);

    resize.current = {
      id: item.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      baseX: item.x,
      baseY: item.y,
      baseScale: item.scale,
      baseStretchX: item.stretchX,
      baseStretchY: item.stretchY,
      baseRotation: item.rotation,
      baseWidthPx: rect.width * item.scale * item.stretchX,
      baseHeightPx: rect.width * item.scale * (item.height / item.width) * item.stretchY,
    };
  };

  const onRotatePointerDown = (event: React.PointerEvent<HTMLButtonElement>, item: MockupItem) => {
    if (item.locked) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(item.id);

    const centerX = rect.left + rect.width * (0.5 + item.x / 100);
    const centerY = rect.top + rect.height * (0.5 + item.y / 100);
    const startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI;
    rotate.current = { id: item.id, centerX, centerY, startAngle, baseRotation: item.rotation };
  };

  const handleClientMove = (clientX: number, clientY: number, shiftKey: boolean, altKey: boolean) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentResize = resize.current;
    if (currentResize) {
      const direction = HANDLE_DIRECTIONS[currentResize.handle];
      const dx = clientX - currentResize.startX;
      const dy = clientY - currentResize.startY;
      const radians = (currentResize.baseRotation * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const localDx = dx * cos + dy * sin;
      const localDy = -dx * sin + dy * cos;
      const centered = altKey;
      const multiplier = centered ? 2 : 1;
      let nextWidth = currentResize.baseWidthPx;
      let nextHeight = currentResize.baseHeightPx;

      if (direction.x) nextWidth += localDx * direction.x * multiplier;
      if (direction.y) nextHeight += localDy * direction.y * multiplier;
      nextWidth = Math.max(24, nextWidth);
      nextHeight = Math.max(24, nextHeight);

      if (shiftKey && direction.x && direction.y) {
        const ratio = Math.max(nextWidth / currentResize.baseWidthPx, nextHeight / currentResize.baseHeightPx);
        nextWidth = currentResize.baseWidthPx * ratio;
        nextHeight = currentResize.baseHeightPx * ratio;
      }

      const widthRatio = nextWidth / currentResize.baseWidthPx;
      const heightRatio = nextHeight / currentResize.baseHeightPx;
      const shiftLocalX = centered ? 0 : ((nextWidth - currentResize.baseWidthPx) * direction.x) / 2;
      const shiftLocalY = centered ? 0 : ((nextHeight - currentResize.baseHeightPx) * direction.y) / 2;
      const shiftWorldX = shiftLocalX * cos - shiftLocalY * sin;
      const shiftWorldY = shiftLocalX * sin + shiftLocalY * cos;

      onTransformChange(currentResize.id, {
        x: round(clamp(currentResize.baseX + (shiftWorldX / rect.width) * 100, -120, 120)),
        y: round(clamp(currentResize.baseY + (shiftWorldY / rect.height) * 100, -120, 120)),
        scale: round(clamp(currentResize.baseScale, 0.1, 3)),
        stretchX: round(clamp(currentResize.baseStretchX * widthRatio, 0.1, 6)),
        stretchY: round(clamp(currentResize.baseStretchY * heightRatio, 0.1, 6)),
      });
      return;
    }

    const currentRotate = rotate.current;
    if (currentRotate) {
      const angle = Math.atan2(clientY - currentRotate.centerY, clientX - currentRotate.centerX) * 180 / Math.PI;
      onTransformChange(currentRotate.id, {
        rotation: Number(clamp(currentRotate.baseRotation + angle - currentRotate.startAngle, -180, 180).toFixed(1)),
      });
      return;
    }

    const currentDrag = drag.current;
    if (!currentDrag) return;
    const x = currentDrag.baseX + ((clientX - currentDrag.startX) / rect.width) * 100;
    const y = currentDrag.baseY + ((clientY - currentDrag.startY) / rect.height) * 100;
    onPositionChange(currentDrag.id, Number(clamp(x, -120, 120).toFixed(1)), Number(clamp(y, -120, 120).toFixed(1)));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    handleClientMove(event.clientX, event.clientY, event.shiftKey, event.altKey);
  };

  const onPointerUp = () => {
    drag.current = null;
    resize.current = null;
    rotate.current = null;
  };

  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      handleClientMove(event.clientX, event.clientY, event.shiftKey, event.altKey);
    };
    const onWindowMouseMove = (event: MouseEvent) => {
      handleClientMove(event.clientX, event.clientY, event.shiftKey, event.altKey);
    };
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
  });

  const selectedItem = items.find((item) => item.id === selectedId && item.visible) ?? null;

  return (
    <div className={styles.wrap}>
      <div className={styles.shortcutDock} aria-label="Mockup layer controls">
        <span><kbd>드래그</kbd> 이동</span>
        <span><kbd>코너</kbd> 꼭짓점 늘리기</span>
        <span><kbd>변</kbd> 한 방향 늘리기</span>
        <span><kbd>Shift</kbd> 비율 유지</span>
        <span><kbd>Alt</kbd> 중심 기준</span>
      </div>
      <div
        className={styles.stage}
        ref={stageRef}
        onPointerDown={() => onSelect(null)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(event) => event.preventDefault()}
      >
        {items.map((item, index) => item.visible && (
          <div
            key={item.id}
            className={`${styles.imageLayer} ${item.locked ? styles.imageLayerLocked : ''}`}
            style={{
              ...layerStyle(item),
              opacity: item.opacity,
              zIndex: index + 1,
            }}
            onPointerDown={(event) => onLayerPointerDown(event, item)}
            title={item.locked ? '잠긴 레이어입니다.' : item.name}
          >
            <img src={item.dataUrl} alt={item.name} className={styles.userImage} draggable={false} />
          </div>
        ))}

        <img
          src={mockup.src}
          alt={mockup.label}
          className={styles.mockupImage}
          draggable={false}
          onContextMenu={(event) => event.preventDefault()}
        />

        {selectedItem && !selectedItem.locked && (
          <div
            className={styles.transformBox}
            style={{
              ...layerStyle(selectedItem),
              aspectRatio: `${selectedItem.width} / ${selectedItem.height}`,
            }}
            onPointerDown={(event) => onLayerPointerDown(event, selectedItem)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label={`${selectedItem.name} transform box`}
          >
            {(Object.keys(HANDLE_DIRECTIONS) as ResizeHandle[]).map((handle) => {
              const dir = HANDLE_DIRECTIONS[handle];
              const isCorner = dir.x !== 0 && dir.y !== 0;
              return (
                <button
                  key={handle}
                  type="button"
                  className={`${styles.resizeHandle} ${isCorner ? styles.handleCorner : styles.handleEdge} ${styles[`handle_${handle}`]}`}
                  onPointerDown={(event) => onResizePointerDown(event, selectedItem, handle)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  aria-label={`${handle} ${isCorner ? '코너 늘리기' : '변 늘리기'} 핸들`}
                  title={isCorner ? '코너를 끌어 한쪽 꼭짓점만 늘리기 (Shift=비율 유지)' : '변을 끌어 한 방향으로 늘리기'}
                />
              );
            })}
            <button
              type="button"
              className={styles.rotateHandle}
              onPointerDown={(event) => onRotatePointerDown(event, selectedItem)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              aria-label="rotate handle"
              title="드래그해서 회전"
            />
          </div>
        )}
      </div>
      <p className={styles.hint}>레이어를 선택한 뒤 박스 안을 드래그하면 이동, 코너를 잡으면 한쪽 꼭짓점만, 변을 잡으면 한 방향으로 늘릴 수 있어요.</p>
    </div>
  );
}
