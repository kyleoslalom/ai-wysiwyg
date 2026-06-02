import type { Project } from '../../domain/types'
import { saveToLocalStorage } from './local-storage'
import { setOperationStatus } from '../../stores/status'

const PROJECT_PREFIX = 'ai-wysiwyg:project:'

export interface AutosaveCoordinator {
  schedule: (project: Project) => void
  flush: (project: Project) => void
  stop: () => void
}

export function projectStorageKey(projectId: string): string {
  return `${PROJECT_PREFIX}${projectId}`
}

export function createAutosaveCoordinator(delayMs = 500): AutosaveCoordinator {
  let timer: ReturnType<typeof setTimeout> | null = null

  const flush = (project: Project): void => {
    const ok = saveToLocalStorage(projectStorageKey(project.id), project)
    if (ok) {
      setOperationStatus('autosave', 'success', 'Project saved locally')
    } else {
      setOperationStatus('autosave', 'error', 'Storage full: autosave paused')
    }
  }

  const schedule = (project: Project): void => {
    setOperationStatus('autosave', 'running', 'Saving...')

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      flush(project)
      timer = null
    }, delayMs)
  }

  const stop = (): void => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    schedule,
    flush,
    stop,
  }
}
