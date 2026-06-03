import { writable, derived } from 'svelte/store'
import type { RichProject } from '../domain/schemas/projectSchema'
import type { LayerNode } from '../domain/schemas/layerNodeSchema'
import { validateLayerTree } from '../services/validator/layerTreeValidator'
import { buildRenderModel } from '../services/editor/renderModel'
import type { RenderModel } from '../services/editor/renderModel'
import type { TreeValidationResult } from '../services/validator/layerTreeValidator'
import { validateNodeProps } from '../services/validator/inspectorValidator'
import type { InspectorValidationResult } from '../services/validator/inspectorValidator'
import { validateColumnWidths } from '../services/editor/columnsLayout'
import type { WidthValidationResult } from '../services/editor/columnsLayout'

export interface RichEditorState {
  activeProjectId: string | null
  selectedNodeId: string | null
  isDirty: boolean
  lastSavedAt: string | null
  inspectorNotices: string[]
}

export const richEditorStateStore = writable<RichEditorState>({
  activeProjectId: null,
  selectedNodeId: null,
  isDirty: false,
  lastSavedAt: null,
  inspectorNotices: [],
})

export const activeRichProjectStore = writable<RichProject | null>(null)

export const renderModelStore = derived<typeof activeRichProjectStore, RenderModel | null>(
  activeRichProjectStore,
  ($project) => {
    if (!$project) return null
    try {
      return buildRenderModel($project)
    } catch {
      return null
    }
  },
)

export const treeValidationStore = derived<typeof activeRichProjectStore, TreeValidationResult | null>(
  activeRichProjectStore,
  ($project) => {
    if (!$project) return null
    return validateLayerTree($project.nodes, $project.rootNodeId)
  },
)

export function setRichEditorProject(projectId: string | null): void {
  richEditorStateStore.update((state) => ({
    ...state,
    activeProjectId: projectId,
    selectedNodeId: null,
  }))
}

export function selectNode(nodeId: string | null): void {
  richEditorStateStore.update((state) => ({ ...state, selectedNodeId: nodeId }))
}

export function markRichDirty(): void {
  richEditorStateStore.update((state) => ({ ...state, isDirty: true }))
}

export function markRichSaved(): void {
  richEditorStateStore.update((state) => ({
    ...state,
    isDirty: false,
    lastSavedAt: new Date().toISOString(),
  }))
}

export function addInspectorNotice(message: string): void {
  richEditorStateStore.update((state) => ({
    ...state,
    inspectorNotices: [...state.inspectorNotices, message],
  }))
}

export function clearInspectorNotices(): void {
  richEditorStateStore.update((state) => ({ ...state, inspectorNotices: [] }))
}

export function updateRichProjectNode(update: (prev: RichProject) => RichProject): void {
  activeRichProjectStore.update((project) => {
    if (!project) return project
    const updated = update(project)
    markRichDirty()
    return updated
  })
}

export function getSelectedNode(
  project: RichProject | null,
  selectedNodeId: string | null,
): LayerNode | null {
  if (!project || !selectedNodeId) return null
  return project.nodes[selectedNodeId] ?? null
}

export function getInspectorValidationForNode(node: LayerNode | null): InspectorValidationResult {
  if (!node) return { valid: true, errors: [] }
  return validateNodeProps(node)
}

export function getColumnsWidthNotice(
  node: LayerNode | null,
): WidthValidationResult {
  if (!node || node.type !== 'columns') return { valid: true }
  const props = node.props as { manualWidths?: number[] | null }
  if (!props.manualWidths || props.manualWidths.length === 0) return { valid: true }
  return validateColumnWidths(props.manualWidths)
}

