import { GIFEncoder, applyPalette, quantize } from 'gifenc';

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  stretchX: number;
  stretchY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}

type ComparisonOrientation = 'horizontal' | 'vertical';

function safeFilePart(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}._-]/gu, '');
  return (cleaned || 'project').slice(0, 64);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
    image.src = source;
  });
}

function drawComposite(context: CanvasRenderingContext2D, user: HTMLImageElement, mockup: HTMLImageElement, transform: ImageTransform) {
  const width = mockup.naturalWidth;
  const height = mockup.naturalHeight;
  const imageWidth = width * transform.scale;
  const imageHeight = imageWidth * (user.naturalHeight / user.naturalWidth);
  const centerX = width * (0.5 + transform.x / 100);
  const centerY = height * (0.5 + transform.y / 100);
  const skewXRadians = (transform.skewX * Math.PI) / 180;
  const skewYRadians = (transform.skewY * Math.PI) / 180;

  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(centerX, centerY);
  context.rotate((transform.rotation * Math.PI) / 180);
  context.transform(1, Math.tan(skewYRadians), Math.tan(skewXRadians), 1, 0, 0);
  context.scale(transform.stretchX, transform.stretchY);
  context.drawImage(user, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
  context.restore();
  context.drawImage(mockup, 0, 0, width, height);
}

export async function exportMockupComposite(
  userSource: string,
  mockupSource: string,
  transform: ImageTransform,
  projectName: string,
) {
  const [user, mockup] = await Promise.all([loadImage(userSource), loadImage(mockupSource)]);
  if (!mockup.naturalWidth || !mockup.naturalHeight) throw new Error('목업 크기를 확인할 수 없습니다.');

  const canvas = document.createElement('canvas');
  canvas.width = mockup.naturalWidth;
  canvas.height = mockup.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas를 시작할 수 없습니다.');
  drawComposite(context, user, mockup, transform);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG를 생성하지 못했습니다.');
  downloadBlob(blob, `mockfolio-${safeFilePart(projectName)}-mockup.png`);
}

function drawComparison(
  context: CanvasRenderingContext2D,
  before: HTMLImageElement,
  after: HTMLImageElement,
  width: number,
  height: number,
  position: number,
  orientation: ComparisonOrientation,
) {
  context.clearRect(0, 0, width, height);
  context.drawImage(after, 0, 0, width, height);
  context.save();
  context.beginPath();
  if (orientation === 'vertical') {
    context.rect(0, 0, width, height * position);
  } else {
    context.rect(0, 0, width * position, height);
  }
  context.clip();
  context.drawImage(before, 0, 0, width, height);
  context.restore();
}

export async function exportComparisonGif(
  beforeSource: string,
  afterSource: string,
  projectName: string,
  orientation: ComparisonOrientation = 'horizontal',
) {
  const [before, after] = await Promise.all([loadImage(beforeSource), loadImage(afterSource)]);
  const sourceWidth = Math.max(before.naturalWidth, after.naturalWidth);
  const sourceHeight = Math.max(before.naturalHeight, after.naturalHeight);
  const scale = Math.min(1, 720 / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('GIF Canvas를 시작할 수 없습니다.');

  const encoder = GIFEncoder();
  const frameCount = 20;
  for (let index = 0; index <= frameCount; index += 1) {
    drawComparison(context, before, after, width, height, index / frameCount, orientation);
    const rgba = context.getImageData(0, 0, width, height).data;
    const palette = quantize(rgba, 128);
    encoder.writeFrame(applyPalette(rgba, palette), width, height, {
      palette,
      delay: 70,
      repeat: 0,
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  encoder.finish();
  const bytes = encoder.bytes();
  const output = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  downloadBlob(new Blob([output], { type: 'image/gif' }), `mockfolio-${safeFilePart(projectName)}-compare.gif`);
}
