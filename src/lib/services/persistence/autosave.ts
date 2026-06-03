import { saveToLocalStorage } from './local-storage'
import { setOperationStatus } from '../../stores/status'

const PROJECT_PREFIX = 'ai-wysiwyg:project:'

interface PersistableProject {
  id: string
}

export interface AutosaveCoordinator<T extends PersistableProject = PersistableProject> {
  schedule: (project: T) => void
  flush: (project: T) => void
  stop: () => void
}

export function projectStorageKey(projectId: string): string {
  return `${PROJECT_PREFIX}${projectId}`
}

export function createAutosaveCoordinator<T extends PersistableProject>(delayMs = 500): AutosaveCoordinator<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let paused = false

  const flush = (project: T): void => {
    const ok = saveToLocalStorage(projectStorageKey(project.id), project)
    if (ok) {
      paused = false
      setOperationStatus('autosave', 'success', 'Project saved locally')
    } else {
      paused = true
      setOperationStatus('autosave', 'error', 'Storage full: autosave paused')
    }
  }

  const schedule = (project: T): void => {
    if (paused) return
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
