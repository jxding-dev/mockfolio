import { useEffect, useRef, useState } from 'react';
import type { MockupAsset } from '../../data/mockups';
import type { MockupItem } from '../../types';
import { quadToMatrix3d, bilinear, triangleAffine } from '../../utils/homography';
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
type CornerKey = 'tl' | 'tr' | 'bl' | 'br';

const HANDLE_DIRECTIONS: Record<ResizeHandle, { x: -1 | 0 | 1; y: -1 | 0 | 1 }> = {
  nw: { x: -1, y: -1 }, n: { x: 0, y: -1 }, ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 }, se: { x: 1, y: 1 }, s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 }, w: { x: -1, y: 0 },
};

const WARP_SUBDIV = 10;
const CORNERS_SRC_W = 800;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const r3 = (v: number) => Number(v.toFixed(3));

// ── init helpers ─────────────────────────────────────────────────────────────

function initCorners(item: MockupItem, sw: number, sh: number): NonNullable<MockupItem['corners']> {
  const cx = 50 + item.x;
  const cy = 50 + item.y;
  const hw = item.scale * item.stretchX * 50;
  const hhPx = sw * item.scale * (item.height / item.width) * item.stretchY * 0.5;
  const hh = (hhPx / sh) * 100;
  return {
    tl: [cx - hw, cy - hh],
    tr: [cx + hw, cy - hh],
    bl: [cx - hw, cy + hh],
    br: [cx + hw, cy + hh],
  };
}

function initWarpGrid(item: MockupItem, sw: number, sh: number): [number, number][][] {
  const cx = 50 + item.x;
  const cy = 50 + item.y;
  const hw = item.scale * item.stretchX * 50;
  const hhPx = sw * item.scale * (item.height / item.width) * item.stretchY * 0.5;
  const hh = (hhPx / sh) * 100;
  return [
    [[cx - hw, cy - hh], [cx, cy - hh], [cx + hw, cy - hh]],
    [[cx - hw, cy], [cx, cy], [cx + hw, cy]],
    [[cx - hw, cy + hh], [cx, cy + hh], [cx + hw, cy + hh]],
  ];
}

function initWarpFromCorners(c: NonNullable<MockupItem['corners']>): [number, number][][] {
  const { tl, tr, bl, br } = c;
  const mt: [number, number] = [(tl[0] + tr[0]) / 2, (tl[1] + tr[1]) / 2];
  const mb: [number, number] = [(bl[0] + br[0]) / 2, (bl[1] + br[1]) / 2];
  const ml: [number, number] = [(tl[0] + bl[0]) / 2, (tl[1] + bl[1]) / 2];
  const mr: [number, number] = [(tr[0] + br[0]) / 2, (tr[1] + br[1]) / 2];
  const mc: [number, number] = [(tl[0] + tr[0] + bl[0] + br[0]) / 4, (tl[1] + tr[1] + bl[1] + br[1]) / 4];
  return [[tl, mt, tr], [ml, mc, mr], [bl, mb, br]];
}

// ── canvas warp drawing ───────────────────────────────────────────────────────

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  s0: [number, number], s1: [number, number], s2: [number, number],
  d0: [number, number], d1: [number, number], d2: [number, number],
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d0[0], d0[1]);
  ctx.lineTo(d1[0], d1[1]);
  ctx.lineTo(d2[0], d2[1]);
  ctx.closePath();
  ctx.clip();
  const [a, b, c, d, e, f] = triangleAffine(s0, s1, s2, d0, d1, d2);
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function drawWarpItem(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  item: MockupItem,
  sw: number, sh: number,
) {
  ctx.clearRect(0, 0, sw, sh);
  if (!item.warpGrid || !img.complete) return;
  ctx.globalAlpha = item.opacity;
  const grid = item.warpGrid;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const cellTL = [grid[row][col][0] * sw / 100, grid[row][col][1] * sh / 100] as [number, number];
      const cellTR = [grid[row][col + 1][0] * sw / 100, grid[row][col + 1][1] * sh / 100] as [number, number];
      const cellBL = [grid[row + 1][col][0] * sw / 100, grid[row + 1][col][1] * sh / 100] as [number, number];
      const cellBR = [grid[row + 1][col + 1][0] * sw / 100, grid[row + 1][col + 1][1] * sh / 100] as [number, number];

      for (let si = 0; si < WARP_SUBDIV; si++) {
        for (let sj = 0; sj < WARP_SUBDIV; sj++) {
          const u0 = sj / WARP_SUBDIV, u1 = (sj + 1) / WARP_SUBDIV;
          const v0 = si / WARP_SUBDIV, v1 = (si + 1) / WARP_SUBDIV;
          const d00 = bilinear(cellTL, cellTR, cellBL, cellBR, u0, v0);
          const d10 = bilinear(cellTL, cellTR, cellBL, cellBR, u1, v0);
          const d01 = bilinear(cellTL, cellTR, cellBL, cellBR, u0, v1);
          const d11 = bilinear(cellTL, cellTR, cellBL, cellBR, u1, v1);
          const sx0 = (col + u0) / 2 * iw, sx1 = (col + u1) / 2 * iw;
          const sy0 = (row + v0) / 2 * ih, sy1 = (row + v1) / 2 * ih;
          const s00: [number, number] = [sx0, sy0];
          const s10: [number, number] = [sx1, sy0];
          const s01: [number, number] = [sx0, sy1];
          const s11: [number, number] = [sx1, sy1];
          drawTriangle(ctx, img, s00, s10, s11, d00, d10, d11);
          drawTriangle(ctx, img, s00, s11, s01, d00, d11, d01);
        }
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ── component ────────────────────────────────────────────────────────────────

export function MockupComposer({
  items,
  selectedId,
  mockup,
  onSelect,
  onPositionChange,
  onTransformChange,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // track stage dimensions
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setStageSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // redraw warp canvases
  useEffect(() => {
    if (stageSize.w === 0) return;
    items.forEach((item) => {
      if (item.transformMode !== 'warp' || !item.warpGrid || !item.visible) return;
      const canvas = canvasRefs.current.get(item.id);
      if (!canvas) return;
      canvas.width = stageSize.w;
      canvas.height = stageSize.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let img = imgCache.current.get(item.id);
      if (!img || img.getAttribute('data-src') !== item.dataUrl) {
        img = new Image();
        img.setAttribute('data-src', item.dataUrl);
        img.src = item.dataUrl;
        imgCache.current.set(item.id, img);
        img.onload = () => drawWarpItem(ctx, img!, item, stageSize.w, stageSize.h);
      } else {
        drawWarpItem(ctx, img, item, stageSize.w, stageSize.h);
      }
    });
  }, [items, stageSize]);

  // ── drag refs ──────────────────────────────────────────────────────────────
  const drag = useRef<{
    id: string; startX: number; startY: number;
    baseX: number; baseY: number;
    baseCorners?: NonNullable<MockupItem['corners']>;
    baseGrid?: [number, number][][];
    mode: 'scale' | 'corners' | 'warp';
  } | null>(null);

  const resize = useRef<{
    id: string; handle: ResizeHandle;
    startX: number; startY: number;
    baseX: number; baseY: number;
    baseScale: number; baseStretchX: number; baseStretchY: number;
    baseRotation: number; baseWidthPx: number; baseHeightPx: number;
  } | null>(null);

  const rotate = useRef<{
    id: string; centerX: number; centerY: number;
    startAngle: number; baseRotation: number;
  } | null>(null);

  const cornerDrag = useRef<{
    id: string; corner: CornerKey;
    startX: number; startY: number;
    baseCorners: NonNullable<MockupItem['corners']>;
  } | null>(null);

  const warpDrag = useRef<{
    id: string; row: number; col: number;
    startX: number; startY: number;
    baseGrid: [number, number][][];
  } | null>(null);

  // ── style helpers ──────────────────────────────────────────────────────────
  const scaleLayerStyle = (item: MockupItem): React.CSSProperties => ({
    left: `${50 + item.x}%`,
    top: `${50 + item.y}%`,
    width: `${item.scale * 100}%`,
    transform: `translate(-50%, -50%) rotate(${item.rotation}deg) skew(${item.skewX}deg, ${item.skewY}deg) scale(${item.stretchX}, ${item.stretchY})`,
  });

  const cornersLayerStyle = (item: MockupItem): React.CSSProperties => {
    if (!item.corners || stageSize.w === 0) return scaleLayerStyle(item);
    const { tl, tr, bl, br } = item.corners;
    const sw = stageSize.w, sh = stageSize.h;
    const srcH = Math.round(CORNERS_SRC_W * item.height / item.width);
    const dst: [[number, number], [number, number], [number, number], [number, number]] = [
      [tl[0] * sw / 100, tl[1] * sh / 100],
      [tr[0] * sw / 100, tr[1] * sh / 100],
      [bl[0] * sw / 100, bl[1] * sh / 100],
      [br[0] * sw / 100, br[1] * sh / 100],
    ];
    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: CORNERS_SRC_W,
      height: srcH,
      transformOrigin: '0 0',
      transform: quadToMatrix3d(CORNERS_SRC_W, srcH, dst),
      opacity: item.opacity,
    };
  };

  // ── pointer handlers ───────────────────────────────────────────────────────
  const onLayerPointerDown = (event: React.PointerEvent, item: MockupItem) => {
    if (item.locked) return;
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    onSelect(item.id);
    const mode = item.transformMode ?? 'scale';
    drag.current = {
      id: item.id, startX: event.clientX, startY: event.clientY,
      baseX: item.x, baseY: item.y, mode,
      baseCorners: item.corners ? { ...item.corners } : undefined,
      baseGrid: item.warpGrid ? item.warpGrid.map((row) => row.map((pt) => [...pt] as [number, number])) : undefined,
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
      id: item.id, handle,
      startX: event.clientX, startY: event.clientY,
      baseX: item.x, baseY: item.y,
      baseScale: item.scale,
      baseStretchX: item.stretchX, baseStretchY: item.stretchY,
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
    rotate.current = {
      id: item.id, centerX, centerY,
      startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI,
      baseRotation: item.rotation,
    };
  };

  const onCornerHandlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, item: MockupItem, corner: CornerKey) => {
    if (item.locked || !item.corners) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    cornerDrag.current = {
      id: item.id, corner,
      startX: event.clientX, startY: event.clientY,
      baseCorners: {
        tl: [...item.corners.tl] as [number, number],
        tr: [...item.corners.tr] as [number, number],
        bl: [...item.corners.bl] as [number, number],
        br: [...item.corners.br] as [number, number],
      },
    };
  };

  const onWarpHandlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, item: MockupItem, row: number, col: number) => {
    if (item.locked || !item.warpGrid) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    warpDrag.current = {
      id: item.id, row, col,
      startX: event.clientX, startY: event.clientY,
      baseGrid: item.warpGrid.map((r) => r.map((pt) => [...pt] as [number, number])),
    };
  };

  const handleClientMove = (clientX: number, clientY: number, shiftKey: boolean, altKey: boolean) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    // warp grid point drag
    const wd = warpDrag.current;
    if (wd) {
      const dx = (clientX - wd.startX) / rect.width * 100;
      const dy = (clientY - wd.startY) / rect.height * 100;
      const newGrid = wd.baseGrid.map((r) => r.map((pt) => [...pt] as [number, number]));
      newGrid[wd.row][wd.col] = [wd.baseGrid[wd.row][wd.col][0] + dx, wd.baseGrid[wd.row][wd.col][1] + dy];
      onTransformChange(wd.id, { warpGrid: newGrid });
      return;
    }

    // corner handle drag
    const cd = cornerDrag.current;
    if (cd) {
      const dx = (clientX - cd.startX) / rect.width * 100;
      const dy = (clientY - cd.startY) / rect.height * 100;
      const nc = {
        tl: [...cd.baseCorners.tl] as [number, number],
        tr: [...cd.baseCorners.tr] as [number, number],
        bl: [...cd.baseCorners.bl] as [number, number],
        br: [...cd.baseCorners.br] as [number, number],
      };
      nc[cd.corner] = [cd.baseCorners[cd.corner][0] + dx, cd.baseCorners[cd.corner][1] + dy];
      onTransformChange(cd.id, { corners: nc });
      return;
    }

    // scale resize drag
    const rs = resize.current;
    if (rs) {
      const dir = HANDLE_DIRECTIONS[rs.handle];
      const dx = clientX - rs.startX;
      const dy = clientY - rs.startY;
      const rad = rs.baseRotation * Math.PI / 180;
      const localDx = dx * Math.cos(rad) + dy * Math.sin(rad);
      const localDy = -dx * Math.sin(rad) + dy * Math.cos(rad);
      const mult = altKey ? 2 : 1;
      let nw = rs.baseWidthPx, nh = rs.baseHeightPx;
      if (dir.x) nw += localDx * dir.x * mult;
      if (dir.y) nh += localDy * dir.y * mult;
      nw = Math.max(24, nw);
      nh = Math.max(24, nh);
      if (shiftKey && dir.x && dir.y) {
        const ratio = Math.max(nw / rs.baseWidthPx, nh / rs.baseHeightPx);
        nw = rs.baseWidthPx * ratio;
        nh = rs.baseHeightPx * ratio;
      }
      const wr = nw / rs.baseWidthPx, hr = nh / rs.baseHeightPx;
      const slx = altKey ? 0 : ((nw - rs.baseWidthPx) * dir.x) / 2;
      const sly = altKey ? 0 : ((nh - rs.baseHeightPx) * dir.y) / 2;
      const swx = slx * Math.cos(rad) - sly * Math.sin(rad);
      const swy = slx * Math.sin(rad) + sly * Math.cos(rad);
      onTransformChange(rs.id, {
        x: r3(clamp(rs.baseX + (swx / rect.width) * 100, -120, 120)),
        y: r3(clamp(rs.baseY + (swy / rect.height) * 100, -120, 120)),
        scale: r3(clamp(rs.baseScale, 0.1, 3)),
        stretchX: r3(clamp(rs.baseStretchX * wr, 0.1, 6)),
        stretchY: r3(clamp(rs.baseStretchY * hr, 0.1, 6)),
      });
      return;
    }

    // rotate
    const rot = rotate.current;
    if (rot) {
      const angle = Math.atan2(clientY - rot.centerY, clientX - rot.centerX) * 180 / Math.PI;
      onTransformChange(rot.id, {
        rotation: Number(clamp(rot.baseRotation + angle - rot.startAngle, -180, 180).toFixed(1)),
      });
      return;
    }

    // body drag
    const d = drag.current;
    if (!d) return;
    const dxPct = ((clientX - d.startX) / rect.width) * 100;
    const dyPct = ((clientY - d.startY) / rect.height) * 100;

    if (d.mode === 'corners' && d.baseCorners) {
      onTransformChange(d.id, {
        corners: {
          tl: [d.baseCorners.tl[0] + dxPct, d.baseCorners.tl[1] + dyPct],
          tr: [d.baseCorners.tr[0] + dxPct, d.baseCorners.tr[1] + dyPct],
          bl: [d.baseCorners.bl[0] + dxPct, d.baseCorners.bl[1] + dyPct],
          br: [d.baseCorners.br[0] + dxPct, d.baseCorners.br[1] + dyPct],
        },
      });
    } else if (d.mode === 'warp' && d.baseGrid) {
      onTransformChange(d.id, {
        warpGrid: d.baseGrid.map((row) => row.map(([px, py]) => [px + dxPct, py + dyPct] as [number, number])),
      });
    } else {
      const x = clamp(d.baseX + dxPct, -120, 120);
      const y = clamp(d.baseY + dyPct, -120, 120);
      onPositionChange(d.id, Number(x.toFixed(1)), Number(y.toFixed(1)));
    }
  };

  const onPointerMove = (event: React.PointerEvent) => handleClientMove(event.clientX, event.clientY, event.shiftKey, event.altKey);
  const onPointerUp = () => { drag.current = null; resize.current = null; rotate.current = null; cornerDrag.current = null; warpDrag.current = null; };

  useEffect(() => {
    const move = (e: PointerEvent) => handleClientMove(e.clientX, e.clientY, e.shiftKey, e.altKey);
    const mMove = (e: MouseEvent) => handleClientMove(e.clientX, e.clientY, e.shiftKey, e.altKey);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mousemove', mMove);
    window.addEventListener('mouseup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mousemove', mMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
  });

  // ── mode switch ────────────────────────────────────────────────────────────
  const switchMode = (item: MockupItem, mode: 'scale' | 'corners' | 'warp') => {
    const sw = stageSize.w || stageRef.current?.getBoundingClientRect().width || 600;
    const sh = stageSize.h || stageRef.current?.getBoundingClientRect().height || 400;
    if (mode === 'corners') {
      onTransformChange(item.id, {
        transformMode: 'corners',
        corners: initCorners(item, sw, sh),
      });
    } else if (mode === 'warp') {
      const grid = item.transformMode === 'corners' && item.corners
        ? initWarpFromCorners(item.corners)
        : initWarpGrid(item, sw, sh);
      onTransformChange(item.id, { transformMode: 'warp', warpGrid: grid });
    } else {
      onTransformChange(item.id, { transformMode: 'scale' });
    }
  };

  const selectedItem = items.find((item) => item.id === selectedId && item.visible) ?? null;
  const selMode = selectedItem?.transformMode ?? 'scale';

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrap}>
      <div className={styles.shortcutDock} aria-label="Mockup layer controls">
        <span><kbd>드래그</kbd> 이동</span>
        <span><kbd>Shift</kbd> 비율 유지</span>
        <span><kbd>Alt</kbd> 중심 기준</span>
        {selectedItem && (
          <span className={styles.modeSwitcher}>
            {(['scale', 'corners', 'warp'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.modeBtn} ${selMode === m ? styles.modeBtnActive : ''}`}
                onClick={() => switchMode(selectedItem, m)}
              >
                {m === 'scale' ? '일반' : m === 'corners' ? '꼭짓점' : '왜곡'}
              </button>
            ))}
          </span>
        )}
      </div>

      <div
        className={styles.stage}
        ref={stageRef}
        onPointerDown={() => onSelect(null)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item, index) => {
          if (!item.visible) return null;
          const mode = item.transformMode ?? 'scale';

          if (mode === 'warp') {
            return (
              <canvas
                key={item.id}
                ref={(el) => { if (el) canvasRefs.current.set(item.id, el); else canvasRefs.current.delete(item.id); }}
                className={`${styles.warpCanvas} ${item.locked ? styles.imageLayerLocked : ''}`}
                style={{ zIndex: index + 1, opacity: item.opacity, cursor: item.locked ? 'not-allowed' : 'grab' }}
                onPointerDown={(e) => onLayerPointerDown(e, item)}
                title={item.locked ? '잠긴 레이어입니다.' : item.name}
              />
            );
          }

          if (mode === 'corners') {
            return (
              <div
                key={item.id}
                className={`${styles.imageLayer} ${item.locked ? styles.imageLayerLocked : ''}`}
                style={{ ...cornersLayerStyle(item), zIndex: index + 1 }}
                onPointerDown={(e) => onLayerPointerDown(e, item)}
                title={item.locked ? '잠긴 레이어입니다.' : item.name}
              >
                <img src={item.dataUrl} alt={item.name} className={styles.userImage} draggable={false} />
              </div>
            );
          }

          // scale mode
          return (
            <div
              key={item.id}
              className={`${styles.imageLayer} ${item.locked ? styles.imageLayerLocked : ''}`}
              style={{ ...scaleLayerStyle(item), opacity: item.opacity, zIndex: index + 1 }}
              onPointerDown={(e) => onLayerPointerDown(e, item)}
              title={item.locked ? '잠긴 레이어입니다.' : item.name}
            >
              <img src={item.dataUrl} alt={item.name} className={styles.userImage} draggable={false} />
            </div>
          );
        })}

        <img
          src={mockup.src}
          alt={mockup.label}
          className={styles.mockupImage}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Transform overlay */}
        {selectedItem && !selectedItem.locked && (() => {
          const mode = selMode;

          // corners mode: 4 vertex handles + outline box
          if (mode === 'corners' && selectedItem.corners && stageSize.w > 0) {
            const { tl, tr, bl, br } = selectedItem.corners;
            const sw = stageSize.w, sh = stageSize.h;
            return (
              <>
                <svg className={styles.cornerOutline} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1090 }}>
                  <polygon
                    points={`${tl[0] * sw / 100},${tl[1] * sh / 100} ${tr[0] * sw / 100},${tr[1] * sh / 100} ${br[0] * sw / 100},${br[1] * sh / 100} ${bl[0] * sw / 100},${bl[1] * sh / 100}`}
                    fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3"
                  />
                </svg>
                {(['tl', 'tr', 'bl', 'br'] as CornerKey[]).map((corner) => {
                  const pt = selectedItem.corners![corner];
                  return (
                    <button
                      key={corner}
                      type="button"
                      className={`${styles.resizeHandle} ${styles.handleCorner} ${styles.cornerVertex}`}
                      style={{ left: `${pt[0] * sw / 100 / sw * 100}%`, top: `${pt[1] * sh / 100 / sh * 100}%`, zIndex: 1100 }}
                      onPointerDown={(e) => onCornerHandlePointerDown(e, selectedItem, corner)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                      aria-label={`${corner} 꼭짓점 핸들`}
                      title="끌어서 이 꼭짓점만 이동"
                    />
                  );
                })}
              </>
            );
          }

          // warp mode: 9 grid point handles + grid lines
          if (mode === 'warp' && selectedItem.warpGrid && stageSize.w > 0) {
            const grid = selectedItem.warpGrid;
            const sw = stageSize.w, sh = stageSize.h;
            const pts = (r: number, c: number) => `${grid[r][c][0] * sw / 100},${grid[r][c][1] * sh / 100}`;
            return (
              <>
                <svg className={styles.warpOutline} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1090 }}>
                  {/* grid lines */}
                  {[0, 1, 2].map((r) => (
                    <polyline key={`row${r}`} points={[0, 1, 2].map((c) => pts(r, c)).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                  ))}
                  {[0, 1, 2].map((c) => (
                    <polyline key={`col${c}`} points={[0, 1, 2].map((r) => pts(r, c)).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                  ))}
                </svg>
                {[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
                  const pt = grid[r][c];
                  const isCorner = (r === 0 || r === 2) && (c === 0 || c === 2);
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      className={`${styles.resizeHandle} ${isCorner ? styles.handleCorner : styles.handleEdge} ${styles.cornerVertex}`}
                      style={{ left: `${pt[0] * sw / 100 / sw * 100}%`, top: `${pt[1] * sh / 100 / sh * 100}%`, zIndex: 1100 }}
                      onPointerDown={(e) => onWarpHandlePointerDown(e, selectedItem, r, c)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                      aria-label={`warp ${r}-${c} 핸들`}
                      title="끌어서 이 점 이동"
                    />
                  );
                }))}
              </>
            );
          }

          // scale mode: normal transform box
          const layerStyle = scaleLayerStyle(selectedItem);
          return (
            <div
              className={styles.transformBox}
              style={{ ...layerStyle, aspectRatio: `${selectedItem.width} / ${selectedItem.height}` }}
              onPointerDown={(e) => onLayerPointerDown(e, selectedItem)}
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
                    onPointerDown={(e) => onResizePointerDown(e, selectedItem, handle)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    aria-label={`${handle} 핸들`}
                  />
                );
              })}
              <button
                type="button"
                className={styles.rotateHandle}
                onPointerDown={(e) => onRotatePointerDown(e, selectedItem)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                aria-label="rotate handle"
                title="드래그해서 회전"
              />
            </div>
          );
        })()}
      </div>

      <p className={styles.hint}>
        레이어 선택 후 상단에서 모드를 선택하세요. <strong>꼭짓점</strong>: 각 꼭짓점을 독립적으로 늘리기 &nbsp;|&nbsp; <strong>왜곡</strong>: 9개 그리드로 포토샵처럼 자유 변형
      </p>
    </div>
  );
}
