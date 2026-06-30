import { useCallback, type ChangeEvent } from 'react';
import type { UploadedImage } from '../types';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_PIXELS = 40_000_000;
const MAX_IMAGE_URL_LENGTH = 2048;
const IMAGE_URL_TIMEOUT_MS = 12_000;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function uid(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_IMAGE_URL_LENGTH) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

async function readLimitedBlob(response: Response, maxBytes: number, contentType: string): Promise<Blob | null> {
  if (!response.body) {
    const blob = await response.blob();
    return blob.size > maxBytes ? null : blob;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.length;
      if (received > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  }
  return new Blob(chunks as BlobPart[], contentType ? { type: contentType } : undefined);
}

function fileNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const name = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() ?? '');
    return name || 'linked-image';
  } catch {
    return 'linked-image';
  }
}

interface UseImageUploadOptions {
  onSuccess: (image: UploadedImage) => void;
  onError?: (msg: string) => void;
}

export function useImageUpload({ onSuccess, onError }: UseImageUploadOptions) {
  const processDataUrl = useCallback(
    (dataUrl: string, meta: { name: string; size: number }) => {
      const img = new Image();
      img.onload = () => {
        const pixelCount = img.naturalWidth * img.naturalHeight;
        if (!img.naturalWidth || !img.naturalHeight || pixelCount > MAX_IMAGE_PIXELS) {
          onError?.(`"${meta.name}" 이미지가 너무 커요. 최대 4,000만 픽셀까지 업로드할 수 있어요.`);
          return;
        }
        onSuccess({
          id: uid(),
          name: meta.name,
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: meta.size,
          uploadedAt: Date.now(),
        });
      };
      img.onerror = () => onError?.(`"${meta.name}" 이미지를 불러오지 못했어요. 다른 파일로 다시 시도해 주세요.`);
      img.src = dataUrl;
    },
    [onSuccess, onError]
  );

  const processFile = useCallback(
    (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        onError?.(`"${file.name}"은 지원하지 않는 파일 형식이에요. PNG, JPG, WebP만 사용할 수 있어요.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        onError?.(`"${file.name}" 파일 용량이 너무 커요. 20MB 이하 파일로 다시 업로드해 주세요.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        processDataUrl(dataUrl, { name: file.name, size: file.size });
      };
      reader.onerror = () => onError?.(`"${file.name}" 파일을 읽지 못했어요. 잠시 후 다시 시도해 주세요.`);
      reader.readAsDataURL(file);
    },
    [processDataUrl, onError]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const first = Array.from(files)[0];
      if (first) processFile(first);
    },
    [processFile]
  );

  const handleFilesMultiple = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach(processFile);
    },
    [processFile]
  );

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFiles(event.target.files);
    event.target.value = '';
  }, [handleFiles]);

  const loadImageUrl = useCallback(
    async (value: string) => {
      const url = normalizeImageUrl(value);
      if (!url) {
        onError?.('https 이미지 URL을 입력해 주세요. 예: https://site.com/image.png');
        return false;
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), IMAGE_URL_TIMEOUT_MS);
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store',
          referrerPolicy: 'no-referrer',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('bad-response');
        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
        if (contentType && !contentType.startsWith('image/')) {
          onError?.('이미지 파일 URL만 불러올 수 있어요. PNG, JPG, WebP 링크를 넣어주세요.');
          return false;
        }
        const contentLength = Number(response.headers.get('content-length') ?? 0);
        if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE) {
          onError?.('이미지 링크의 파일 용량이 너무 커요. 20MB 이하 이미지를 사용해 주세요.');
          return false;
        }
        const blob = await readLimitedBlob(response, MAX_FILE_SIZE, contentType);
        if (!blob) {
          onError?.('이미지 링크의 파일 용량이 너무 커요. 20MB 이하 이미지를 사용해 주세요.');
          return false;
        }
        if (!ALLOWED_TYPES.includes(blob.type)) {
          onError?.('지원하지 않는 이미지 링크예요. PNG, JPG, WebP만 사용할 수 있어요.');
          return false;
        }
        if (blob.size > MAX_FILE_SIZE) {
          onError?.('이미지 링크의 파일 용량이 너무 커요. 20MB 이하 이미지를 사용해 주세요.');
          return false;
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        processDataUrl(dataUrl, { name: fileNameFromUrl(url), size: blob.size });
        return true;
      } catch {
        onError?.('이미지 링크를 불러오지 못했어요. CORS가 허용된 직접 이미지 URL을 사용해 주세요.');
        return false;
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [processDataUrl, onError]
  );

  return { handleFiles, handleFilesMultiple, handleInputChange, loadImageUrl };
}
