import { writable } from 'svelte/store'
import type { Project, ProjectRegistry } from '../domain/types'
import { isProjectRegistry } from '../domain/schemas/project-registry'
import { loadFromLocalStorage, saveToLocalStorage } from '../services/persistence/local-storage'

const REGISTRY_KEY = 'ai-wysiwyg:project-registry'

const defaultRegistry: ProjectRegistry = {
  activeProjectId: null,
  projects: {},
  schemaVersion: 1,
}

export const projectRegistryStore = writable<ProjectRegistry>(defaultRegistry)
export const projectsStore = writable<Record<string, Project>>({})

export function initializeRegistry(): void {
  const stored = loadFromLocalStorage<unknown>(REGISTRY_KEY)
  if (stored && isProjectRegistry(stored)) {
    projectRegistryStore.set(stored)
    return
  }
  projectRegistryStore.set(defaultRegistry)
}

export function persistRegistry(registry: ProjectRegistry): boolean {
  return saveToLocalStorage(REGISTRY_KEY, registry)
}

export function setActiveProject(projectId: string | null): void {
  projectRegistryStore.update((registry) => {
    if (projectId !== null && !(projectId in registry.projects)) {
      return registry
    }
    const updated = {
      ...registry,
      activeProjectId: projectId,
      lastOpenedAt: new Date().toISOString(),
    }
    persistRegistry(updated)
    return updated
  })
}
