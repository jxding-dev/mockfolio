import { useRef } from 'react';
import type { MockupAsset } from '../../data/mockups';
import type { MockupItem } from '../../types';
import styles from './MockupComposer.module.css';

interface Props {
  items: MockupItem[];
  selectedId: string | null;
  mockup: MockupAsset;
  onSelect: (id: string | null) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function MockupComposer({ items, selectedId, mockup, onSelect, onPositionChange }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: MockupItem) => {
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

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!current || !rect) return;

    const x = current.baseX + ((event.clientX - current.startX) / rect.width) * 100;
    const y = current.baseY + ((event.clientY - current.startY) / rect.height) * 100;
    onPositionChange(current.id, Number(clamp(x, -120, 120).toFixed(1)), Number(clamp(y, -120, 120).toFixed(1)));
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className={styles.wrap}>
      <div
        className={styles.stage}
        ref={stageRef}
        onClick={() => onSelect(null)}
        onContextMenu={(event) => event.preventDefault()}
      >
        {items.map((item, index) => item.visible && (
          <div
            key={item.id}
            className={`${styles.imageLayer} ${selectedId === item.id ? styles.imageLayerSelected : ''} ${item.locked ? styles.imageLayerLocked : ''}`}
            style={{
              left: `${50 + item.x}%`,
              top: `${50 + item.y}%`,
              width: `${item.scale * 100}%`,
              opacity: item.opacity,
              zIndex: index + 1,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg) skew(${item.skewX}deg, ${item.skewY}deg) scale(${item.stretchX}, ${item.stretchY})`,
            }}
            onPointerDown={(event) => onPointerDown(event, item)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            title={item.locked ? '잠긴 레이어입니다.' : item.name}
          >
            <img
              src={item.dataUrl}
              alt={item.name}
              className={styles.userImage}
              draggable={false}
            />
          </div>
        ))}
        <img
          src={mockup.src}
          alt={mockup.label}
          className={styles.mockupImage}
          draggable={false}
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>
      <p className={styles.hint}>이미지를 여러 장 올린 뒤 레이어를 선택해 드래그로 위치를 조정할 수 있습니다.</p>
    </div>
  );
}
