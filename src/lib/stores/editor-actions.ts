import { writable } from 'svelte/store'
import type { Project } from '../domain/types'
import type { RichProject } from '../domain/schemas/projectSchema'

export type EditorHistoryProject = Project | RichProject

export interface EditorActionHistory {
  past: EditorHistoryProject[]
  future: EditorHistoryProject[]
}

const MAX_HISTORY = 50

export const editorActionHistoryStore = writable<EditorActionHistory>({
  past: [],
  future: [],
})

export function clearActionHistory(): void {
  editorActionHistoryStore.set({
    past: [],
    future: [],
  })
}

export function recordProjectSnapshot<T extends EditorHistoryProject>(project: T): void {
  editorActionHistoryStore.update((history) => {
    const nextPast = [...history.past, structuredClone(project)]
    return {
      past: nextPast.slice(-MAX_HISTORY),
      future: [],
    }
  })
}

export function undo<T extends EditorHistoryProject>(current: T): T | null {
  let nextProject: T | null = null

  editorActionHistoryStore.update((history) => {
    if (history.past.length === 0) return history

    const nextPast = [...history.past]
    const previous = nextPast.pop()
    if (!previous) return history

    nextProject = previous as T
    return {
      past: nextPast,
      future: [...history.future, structuredClone(current)],
    }
  })

  return nextProject
}

export function redo<T extends EditorHistoryProject>(current: T): T | null {
  let nextProject: T | null = null

  editorActionHistoryStore.update((history) => {
    if (history.future.length === 0) return history

    const nextFuture = [...history.future]
    const restored = nextFuture.pop()
    if (!restored) return history

    nextProject = restored as T
    return {
      past: [...history.past, structuredClone(current)],
      future: nextFuture,
    }
  })

  return nextProject
}
