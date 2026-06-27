import { useCallback, type ChangeEvent } from 'react';
import type { UploadedImage } from '../types';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_PIXELS = 40_000_000;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function uid(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
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
          onError?.(`"${meta.name}" — 이미지 해상도가 너무 큽니다. 최대 4,000만 픽셀까지 업로드 가능합니다.`);
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
      img.onerror = () => onError?.(`"${meta.name}" — 이미지를 불러올 수 없습니다.`);
      img.src = dataUrl;
    },
    [onSuccess, onError]
  );

  const processFile = useCallback(
    (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        onError?.(`"${file.name}" — 지원하지 않는 파일 형식입니다. PNG, JPG, WebP만 가능합니다.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        onError?.(`"${file.name}" — 파일 크기가 너무 큽니다. 최대 20MB까지 업로드 가능합니다.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        processDataUrl(dataUrl, { name: file.name, size: file.size });
      };
      reader.onerror = () => onError?.(`"${file.name}" — 파일 읽기에 실패했습니다.`);
      reader.readAsDataURL(file);
    },
    [processDataUrl, onError]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      // Single-image tool: only the first file is used.
      const first = Array.from(files)[0];
      if (first) processFile(first);
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
        onError?.('http 또는 https 이미지 URL을 입력해주세요.');
        return false;
      }

      try {
        const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (!response.ok) throw new Error('bad-response');
        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
        if (contentType && !contentType.startsWith('image/')) {
          onError?.('이미지 파일 URL만 불러올 수 있습니다. PNG, JPG, WebP 링크를 넣어주세요.');
          return false;
        }
        const blob = await response.blob();
        if (!ALLOWED_TYPES.includes(blob.type)) {
          onError?.('지원하지 않는 이미지 링크입니다. PNG, JPG, WebP만 가능합니다.');
          return false;
        }
        if (blob.size > MAX_FILE_SIZE) {
          onError?.('이미지 링크의 파일 크기가 너무 큽니다. 최대 20MB까지 가능합니다.');
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
        onError?.('이미지 링크를 불러오지 못했습니다. CORS가 허용된 직접 이미지 URL을 사용해주세요.');
        return false;
      }
    },
    [processDataUrl, onError]
  );

  return { handleFiles, handleInputChange, loadImageUrl };
}
