import { writable } from 'svelte/store'
import type { Project } from '../domain/types'

export interface EditorActionHistory {
  past: Project[]
  future: Project[]
}

const MAX_HISTORY = 50

export const editorActionHistoryStore = writable<EditorActionHistory>({
  past: [],
  future: [],
})

export function recordProjectSnapshot(project: Project): void {
  editorActionHistoryStore.update((history) => {
    const nextPast = [...history.past, structuredClone(project)]
    return {
      past: nextPast.slice(-MAX_HISTORY),
      future: [],
    }
  })
}

export function undo(current: Project): Project | null {
  let nextProject: Project | null = null

  editorActionHistoryStore.update((history) => {
    if (history.past.length === 0) return history

    const nextPast = [...history.past]
    const previous = nextPast.pop()
    if (!previous) return history

    nextProject = previous
    return {
      past: nextPast,
      future: [...history.future, structuredClone(current)],
    }
  })

  return nextProject
}

export function redo(current: Project): Project | null {
  let nextProject: Project | null = null

  editorActionHistoryStore.update((history) => {
    if (history.future.length === 0) return history

    const nextFuture = [...history.future]
    const restored = nextFuture.pop()
    if (!restored) return history

    nextProject = restored
    return {
      past: [...history.past, structuredClone(current)],
      future: nextFuture,
    }
  })

  return nextProject
}
