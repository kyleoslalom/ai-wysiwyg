import { writable } from 'svelte/store'
import type { Project } from '../domain/types'

export interface EditorState {
  activeProjectId: string | null
  selectedElementId: string | null
  isDirty: boolean
  lastSavedAt: string | null
}

export const editorStateStore = writable<EditorState>({
  activeProjectId: null,
  selectedElementId: null,
  isDirty: false,
  lastSavedAt: null,
})

export const activeProjectStore = writable<Project | null>(null)

export function setEditorProject(projectId: string | null): void {
  editorStateStore.update((state) => ({
    ...state,
    activeProjectId: projectId,
    selectedElementId: null,
  }))
}

export function markDirty(): void {
  editorStateStore.update((state) => ({ ...state, isDirty: true }))
}

export function markSaved(): void {
  editorStateStore.update((state) => ({
    ...state,
    isDirty: false,
    lastSavedAt: new Date().toISOString(),
  }))
}
