import { writable } from 'svelte/store'
import type { Project, ProjectMetadata, ProjectRegistry } from '../domain/types'
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

export function createRegistry(): ProjectRegistry {
  return {
    activeProjectId: null,
    projects: {},
    schemaVersion: 1,
  }
}

export function registerProjectMetadata(
  registry: ProjectRegistry,
  metadata: ProjectMetadata,
): ProjectRegistry {
  return {
    ...registry,
    projects: {
      ...registry.projects,
      [metadata.id]: metadata,
    },
  }
}

export function removeProjectMetadata(registry: ProjectRegistry, projectId: string): ProjectRegistry {
  const nextProjects = { ...registry.projects }
  delete nextProjects[projectId]

  return {
    ...registry,
    projects: nextProjects,
    activeProjectId: registry.activeProjectId === projectId ? null : registry.activeProjectId,
  }
}

export function setActiveProjectInRegistry(
  registry: ProjectRegistry,
  projectId: string | null,
): ProjectRegistry {
  if (projectId !== null && !(projectId in registry.projects)) {
    return registry
  }

  return {
    ...registry,
    activeProjectId: projectId,
    lastOpenedAt: new Date().toISOString(),
  }
}

export function setRegistry(registry: ProjectRegistry): void {
  projectRegistryStore.set(registry)
  persistRegistry(registry)
}

export function setProjectInStore(project: Project): void {
  projectsStore.update((projects) => ({
    ...projects,
    [project.id]: project,
  }))
}

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
    const updated = setActiveProjectInRegistry(registry, projectId)
    persistRegistry(updated)
    return updated
  })
}
