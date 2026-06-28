import type { SavedProject } from '../../types';
import { LocalStorageService, type StorageService } from '../storage/storageService';

const PROJECTS_KEY = 'mockfolio.projects';

export interface ProjectService {
  list(): Promise<SavedProject[]>;
  save(project: SavedProject): Promise<void>;
  remove(projectId: string): Promise<void>;
}

export class LocalProjectService implements ProjectService {
  private readonly storage: StorageService<SavedProject[]>;

  constructor(storage: StorageService<SavedProject[]> = new LocalStorageService<SavedProject[]>()) {
    this.storage = storage;
  }

  async list(): Promise<SavedProject[]> {
    return (await this.storage.get(PROJECTS_KEY)) ?? [];
  }

  async save(project: SavedProject): Promise<void> {
    const projects = await this.list();
    const next = [project, ...projects.filter((item) => item.id !== project.id)];
    await this.storage.set(PROJECTS_KEY, next);
  }

  async remove(projectId: string): Promise<void> {
    const projects = await this.list();
    await this.storage.set(PROJECTS_KEY, projects.filter((item) => item.id !== projectId));
  }
}

export const projectService: ProjectService = new LocalProjectService();
