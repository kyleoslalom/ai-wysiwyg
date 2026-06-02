import type { Project, ProjectMetadata, ProjectRegistry } from '../../domain/types'
import { loadFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from './local-storage'
import { projectStorageKey } from './autosave'

const SNAPSHOT_PREFIX = 'ai-wysiwyg:snapshot:'

export function toMetadata(project: Project): ProjectMetadata {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    version: project.version,
  }
}

export function renameProject(project: Project, name: string): Project {
  return {
    ...project,
    name: name.trim(),
    updatedAt: new Date().toISOString(),
    version: project.version + 1,
  }
}

export function duplicateProject(project: Project, newId: string, newName: string): Project {
  const now = new Date().toISOString()
  return {
    ...structuredClone(project),
    id: newId,
    name: newName,
    createdAt: now,
    updatedAt: now,
    version: 1,
  }
}

export function snapshotKey(projectId: string): string {
  return `${SNAPSHOT_PREFIX}${projectId}`
}

export function saveSnapshot(project: Project): boolean {
  const key = snapshotKey(project.id)
  return saveToLocalStorage(key, project)
}

export function loadSnapshot(projectId: string): Project | null {
  return loadFromLocalStorage<Project>(snapshotKey(projectId))
}

export function resetFromSnapshot(current: Project): Project | null {
  return loadSnapshot(current.id)
}

export function deleteProjectData(projectId: string): void {
  removeFromLocalStorage(projectStorageKey(projectId))
  removeFromLocalStorage(snapshotKey(projectId))
}

export function updateRegistryMetadata(registry: ProjectRegistry, project: Project): ProjectRegistry {
  return {
    ...registry,
    projects: {
      ...registry.projects,
      [project.id]: toMetadata(project),
    },
    activeProjectId: project.id,
    lastOpenedAt: new Date().toISOString(),
  }
}
