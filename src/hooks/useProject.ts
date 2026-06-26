import { useCallback } from 'react';
import type { Project, MockupSettings, InspectSettings, AppMode, UploadedImage } from '../types';
import { DEFAULT_MOCKUP_SETTINGS } from '../data/frames';
import { DEFAULT_DEVICE_ID } from '../data/devices';
import { useLocalStorage } from './useLocalStorage';

function createProject(): Project {
  return {
    id: `proj_${Date.now()}`,
    name: '내 프로젝트',
    imageId: null,
    beforeImageId: null,
    afterImageId: null,
    mockupSettings: { ...DEFAULT_MOCKUP_SETTINGS },
    inspectSettings: {
      deviceId: DEFAULT_DEVICE_ID,
      orientation: 'portrait',
      fitMode: 'fit',
      guides: { safeArea: false, grid8: false, centerline: false, margins: false },
    },
    activeMode: 'inspect',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function useProject() {
  const [project, setProject] = useLocalStorage<Project>('mf_project', createProject());
  const [images, setImages] = useLocalStorage<Record<string, UploadedImage>>('mf_images', {});

  const touch = (patch: Partial<Project>) =>
    setProject((p) => ({ ...p, ...patch, updatedAt: Date.now() }));

  const setMode = useCallback((mode: AppMode) => touch({ activeMode: mode }), []);
  const setName = useCallback((name: string) => touch({ name }), []);

  const addImage = useCallback((img: UploadedImage) => {
    setImages((prev) => ({ ...prev, [img.id]: img }));
  }, []);

  const setMainImage = useCallback(
    (img: UploadedImage) => {
      setImages((prev) => ({ ...prev, [img.id]: img }));
      touch({ imageId: img.id });
    },
    []
  );

  const setBeforeImage = useCallback(
    (img: UploadedImage) => {
      setImages((prev) => ({ ...prev, [img.id]: img }));
      touch({ beforeImageId: img.id });
    },
    []
  );

  const setAfterImage = useCallback(
    (img: UploadedImage) => {
      setImages((prev) => ({ ...prev, [img.id]: img }));
      touch({ afterImageId: img.id });
    },
    []
  );

  const removeMainImage = useCallback(() => touch({ imageId: null }), []);

  const patchMockup = useCallback(
    (patch: Partial<MockupSettings>) =>
      touch({ mockupSettings: { ...project.mockupSettings, ...patch } }),
    [project.mockupSettings]
  );

  const patchInspect = useCallback(
    (patch: Partial<InspectSettings>) =>
      touch({ inspectSettings: { ...project.inspectSettings, ...patch } }),
    [project.inspectSettings]
  );

  const resetProject = useCallback(() => setProject(createProject()), []);

  const getImage = (id: string | null) => (id ? images[id] ?? null : null);

  return {
    project,
    images,
    getImage,
    setMode,
    setName,
    setMainImage,
    setBeforeImage,
    setAfterImage,
    removeMainImage,
    addImage,
    patchMockup,
    patchInspect,
    resetProject,
  };
}
