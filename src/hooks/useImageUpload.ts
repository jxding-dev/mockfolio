import { useCallback, type ChangeEvent } from 'react';
import type { UploadedImage } from '../types';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_PIXELS = 40_000_000;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function uid(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface UseImageUploadOptions {
  onSuccess: (image: UploadedImage) => void;
  onError?: (msg: string) => void;
}

export function useImageUpload({ onSuccess, onError }: UseImageUploadOptions) {
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
        const img = new Image();
        img.onload = () => {
          const pixelCount = img.naturalWidth * img.naturalHeight;
          if (!img.naturalWidth || !img.naturalHeight || pixelCount > MAX_IMAGE_PIXELS) {
            onError?.(`"${file.name}" — 이미지 해상도가 너무 큽니다. 최대 4,000만 픽셀까지 업로드 가능합니다.`);
            return;
          }
          onSuccess({
            id: uid(),
            name: file.name,
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: file.size,
            uploadedAt: Date.now(),
          });
        };
        img.onerror = () => onError?.(`"${file.name}" — 이미지를 불러올 수 없습니다.`);
        img.src = dataUrl;
      };
      reader.onerror = () => onError?.(`"${file.name}" — 파일 읽기에 실패했습니다.`);
      reader.readAsDataURL(file);
    },
    [onSuccess, onError]
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

  return { handleFiles, handleInputChange };
}
