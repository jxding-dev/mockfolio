import { useRef, useState } from 'react';
import type { MockupAsset } from '../../data/mockups';
import type { UploadedImage } from '../../types';
import styles from './MockupComposer.module.css';

interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface Props {
  image: UploadedImage;
  mockup: MockupAsset;
  transform: Transform;
  onPositionChange: (x: number, y: number) => void;
}

export function MockupComposer({ image, mockup, transform, onPositionChange }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updatePosition = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(-100, Math.min(100, ((clientX - rect.left) / rect.width - 0.5) * 100));
    const y = Math.max(-100, Math.min(100, ((clientY - rect.top) / rect.height - 0.5) * 100));
    onPositionChange(Number(x.toFixed(1)), Number(y.toFixed(1)));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.stage} ref={stageRef} onContextMenu={(event) => event.preventDefault()}>
        <div
          className={`${styles.imageLayer} ${dragging ? styles.dragging : ''}`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            updatePosition(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => dragging && updatePosition(event.clientX, event.clientY)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <img
            src={image.dataUrl}
            alt="합성할 사용자 이미지"
            className={styles.userImage}
            style={{
              left: `${50 + transform.x}%`,
              top: `${50 + transform.y}%`,
              width: `${transform.scale * 100}%`,
              transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
            }}
            draggable={false}
          />
        </div>
        <img
          src={mockup.src}
          alt="선택한 목업 프레임"
          className={styles.mockupImage}
          draggable={false}
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>
      <p className={styles.hint}>이미지를 드래그해서 위치를 조정할 수 있습니다.</p>
    </div>
  );
}
