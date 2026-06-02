import type { Project, ProjectRegistry } from '../../domain/types'
import { loadFromLocalStorage } from './local-storage'
import { isProjectRegistry } from '../../domain/schemas/project-registry'
import { projectRegistryStore, setRegistry, setProjectInStore } from '../../stores/projects'
import { activeProjectStore, setEditorProject } from '../../stores/editor'
import { setOperationStatus } from '../../stores/status'
import { createSampleProject } from '../../domain/project/sample-project'
import { projectStorageKey } from './autosave'

const REGISTRY_KEY = 'ai-wysiwyg:project-registry'

export interface RestoreResult {
  registry: ProjectRegistry
  project: Project
  restored: boolean
}

export function bootstrapRestore(): RestoreResult {
  setOperationStatus('restore', 'running', 'Restoring previous session...')

  const fallbackProject = createSampleProject()
  const fallbackRegistry: ProjectRegistry = {
    activeProjectId: fallbackProject.id,
    projects: {
      [fallbackProject.id]: {
        id: fallbackProject.id,
        name: fallbackProject.name,
        createdAt: fallbackProject.createdAt,
        updatedAt: fallbackProject.updatedAt,
        version: fallbackProject.version,
      },
    },
    schemaVersion: 1,
    lastOpenedAt: fallbackProject.updatedAt,
  }

  const rawRegistry = loadFromLocalStorage<unknown>(REGISTRY_KEY)
  if (!rawRegistry || !isProjectRegistry(rawRegistry) || !rawRegistry.activeProjectId) {
    setRegistry(fallbackRegistry)
    setProjectInStore(fallbackProject)
    activeProjectStore.set(fallbackProject)
    setEditorProject(fallbackProject.id)
    setOperationStatus('restore', 'success', 'Initialized new session')
    return { registry: fallbackRegistry, project: fallbackProject, restored: false }
  }

  const registry = rawRegistry
  const activeId = registry.activeProjectId
  if (!activeId) {
    setRegistry(fallbackRegistry)
    setProjectInStore(fallbackProject)
    activeProjectStore.set(fallbackProject)
    setEditorProject(fallbackProject.id)
    setOperationStatus('restore', 'error', 'Missing active project. Started a new session')
    return { registry: fallbackRegistry, project: fallbackProject, restored: false }
  }
  const restoredProject = loadFromLocalStorage<Project>(projectStorageKey(activeId))

  if (!restoredProject) {
    setRegistry(fallbackRegistry)
    setProjectInStore(fallbackProject)
    activeProjectStore.set(fallbackProject)
    setEditorProject(fallbackProject.id)
    setOperationStatus('restore', 'error', 'Restore failed, started a new session')
    return { registry: fallbackRegistry, project: fallbackProject, restored: false }
  }

  setRegistry(registry)
  setProjectInStore(restoredProject)
  activeProjectStore.set(restoredProject)
  setEditorProject(activeId)
  setOperationStatus('restore', 'success', 'Restored previous session')

  return { registry, project: restoredProject, restored: true }
}
