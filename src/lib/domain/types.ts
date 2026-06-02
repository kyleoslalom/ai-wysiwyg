export type ElementType =
  | 'section'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'container'
  | 'custom-safe'

export interface CanvasElement {
  id: string
  type: ElementType
  parentId: string | null
  children: string[]
  content: Record<string, unknown>
  classList: string[]
  inlineStyle?: Record<string, string>
  a11y?: Record<string, string>
}

export interface StyleRule {
  id: string
  selector: string
  declarations: Record<string, string>
  order: number
}

export interface InteractionBinding {
  id: string
  elementId: string
  eventType: 'click' | 'keydown' | 'submit' | 'change'
  presetKey: string
  config: Record<string, unknown>
}

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  rootNodeId: string
  nodes: Record<string, CanvasElement>
  styles: Record<string, StyleRule>
  interactions: InteractionBinding[]
  version: number
}

export interface ProjectMetadata {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  version: number
}

export interface ProjectRegistry {
  activeProjectId: string | null
  projects: Record<string, ProjectMetadata>
  schemaVersion: number
  lastOpenedAt?: string
}

export type OperationState = 'idle' | 'running' | 'success' | 'error'

export interface OperationStatus {
  key: 'autosave' | 'restore' | 'snapshot' | 'reset' | 'export' | 'validation'
  state: OperationState
  message?: string
  updatedAt: string
}
