import { writable, derived } from 'svelte/store'

export type DragPhase = 'IDLE' | 'DRAGGING' | 'DROPPED' | 'CANCELLED'

export interface DragState {
  phase: DragPhase
  draggedNodeId: string | null
  sourceParentId: string | null
  sourceIndex: number | null
  currentTargetParentId: string | null
  currentDropIndex: number | null
  dropIndicatorType: 'between' | 'none'
  isValidTarget: boolean
  isCancelled: boolean
}

function createInitialDragState(): DragState {
  return {
    phase: 'IDLE',
    draggedNodeId: null,
    sourceParentId: null,
    sourceIndex: null,
    currentTargetParentId: null,
    currentDropIndex: null,
    dropIndicatorType: 'none',
    isValidTarget: true,
    isCancelled: false,
  }
}

export const dragStateStore = writable<DragState>(createInitialDragState())

export const isDraggingStore = derived(dragStateStore, ($state) => $state.phase === 'DRAGGING')

export const dragPositionStore = derived(dragStateStore, ($state) => ({
  targetParentId: $state.currentTargetParentId,
  dropIndex: $state.currentDropIndex,
  isValid: $state.isValidTarget,
}))

export function startDrag(
  draggedNodeId: string,
  sourceParentId: string,
  sourceIndex: number,
): void {
  dragStateStore.set({
    phase: 'DRAGGING',
    draggedNodeId,
    sourceParentId,
    sourceIndex,
    currentTargetParentId: null,
    currentDropIndex: null,
    dropIndicatorType: 'none',
    isValidTarget: true,
    isCancelled: false,
  })
}

export function updateDragPosition(
  targetParentId: string | null,
  targetIndex: number | null,
  isValid: boolean,
): void {
  dragStateStore.update((state) => {
    if (state.phase !== 'DRAGGING') return state
    return {
      ...state,
      currentTargetParentId: targetParentId,
      currentDropIndex: targetIndex,
      dropIndicatorType: targetParentId !== null ? 'between' : 'none',
      isValidTarget: isValid,
    }
  })
}

export function completeDrag(): void {
  dragStateStore.update((state) => {
    if (state.phase !== 'DRAGGING') return state
    return { ...state, phase: 'DROPPED' }
  })
}

export function cancelDrag(): void {
  dragStateStore.set({
    ...createInitialDragState(),
    phase: 'CANCELLED',
    isCancelled: true,
  })
}

export function resetDragState(): void {
  dragStateStore.set(createInitialDragState())
}