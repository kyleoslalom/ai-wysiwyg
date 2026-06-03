import type { Project, ProjectRegistry } from '../../domain/types'
import type { RichProject } from '../../domain/schemas/projectSchema'
import { isRichProject } from '../../domain/schemas/projectSchema'
import { loadFromLocalStorage } from './local-storage'
import { isProjectRegistry } from '../../domain/schemas/project-registry'
import { setRegistry, setProjectInStore } from '../../stores/projects'
import { activeProjectStore, setEditorProject } from '../../stores/editor'
import { activeRichProjectStore, setRichEditorProject } from '../../stores/editorStore'
import { setOperationStatus } from '../../stores/status'
import { createSampleProject } from '../../domain/project/sample-project'
import { createRichSampleProject } from '../../domain/project/rich-sample-project'
import { projectStorageKey } from './autosave'

const REGISTRY_KEY = 'ai-wysiwyg:project-registry'

export interface RestoreResult {
  registry: ProjectRegistry
  project: Project
  restored: boolean
}

export interface RichRestoreResult {
  registry: ProjectRegistry
  project: RichProject
  restored: boolean
}

function buildRegistryForProject(project: Pick<ProjectRegistry['projects'][string], 'id' | 'name' | 'createdAt' | 'updatedAt' | 'version'>): ProjectRegistry {
  return {
    activeProjectId: project.id,
    projects: {
      [project.id]: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        version: project.version,
      },
    },
    schemaVersion: 1,
    lastOpenedAt: project.updatedAt,
  }
}

function isRestorableProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false

  const project = value as Partial<Project>
  if (!project.id || typeof project.id !== 'string') return false
  if (!project.rootNodeId || typeof project.rootNodeId !== 'string') return false
  if (!project.nodes || typeof project.nodes !== 'object') return false

  const nodes = project.nodes as Record<string, unknown>
  if (!(project.rootNodeId in nodes)) return false

  return true
}

function isRestorableRichProject(value: unknown): value is RichProject {
  if (!isRichProject(value)) return false
  return value.rootNodeId in value.nodes
}

export function bootstrapRestore(): RestoreResult {
  setOperationStatus('restore', 'running', 'Restoring previous session...')

  const fallbackProject = createSampleProject()
  const fallbackRegistry = buildRegistryForProject(fallbackProject)

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
  const restoredProject = loadFromLocalStorage<unknown>(projectStorageKey(activeId))

  if (!restoredProject || !isRestorableProject(restoredProject)) {
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

export function bootstrapRichRestore(): RichRestoreResult {
  setOperationStatus('restore', 'running', 'Restoring previous session...')

  const fallbackProject = createRichSampleProject()
  const fallbackRegistry = buildRegistryForProject(fallbackProject)

  const rawRegistry = loadFromLocalStorage<unknown>(REGISTRY_KEY)
  if (!rawRegistry || !isProjectRegistry(rawRegistry) || !rawRegistry.activeProjectId) {
    setRegistry(fallbackRegistry)
    activeRichProjectStore.set(fallbackProject)
    setRichEditorProject(fallbackProject.id)
    setOperationStatus('restore', 'success', 'Initialized new rich session')
    return { registry: fallbackRegistry, project: fallbackProject, restored: false }
  }

  const registry = rawRegistry
  const activeId = registry.activeProjectId
  if (!activeId) {
    setRegistry(fallbackRegistry)
    activeRichProjectStore.set(fallbackProject)
    setRichEditorProject(fallbackProject.id)
    setOperationStatus('restore', 'error', 'Missing active project. Started a new rich session')
    return { registry: fallbackRegistry, project: fallbackProject, restored: false }
  }

  const restoredProject = loadFromLocalStorage<unknown>(projectStorageKey(activeId))

  if (!restoredProject || !isRestorableRichProject(restoredProject)) {
    setRegistry(fallbackRegistry)
    activeRichProjectStore.set(fallbackProject)
    setRichEditorProject(fallbackProject.id)
    setOperationStatus('restore', 'error', 'Restore failed, started a new rich session')
    return { registry: fallbackRegistry, project: fallbackProject, restored: false }
  }

  setRegistry(registry)
  activeRichProjectStore.set(restoredProject)
  setRichEditorProject(activeId)
  setOperationStatus('restore', 'success', 'Restored previous rich session')

  return { registry, project: restoredProject, restored: true }
}
