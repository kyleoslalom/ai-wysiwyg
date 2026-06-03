<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import type { RichProject } from '../../domain/schemas/projectSchema'
  import type { RenderModel, RenderNode } from '../../services/editor/renderModel'
  import { buildRenderModel } from '../../services/editor/renderModel'
  import { reorderLayer, moveLayer } from '../../services/editor/layerOperations'
  import { dragStateStore, completeDrag, cancelDrag, resetDragState } from '../../stores/dragState'
  import CanvasElementRenderer from './CanvasElementRenderer.svelte'
  import DropIndicator from './DropIndicator.svelte'

  export let project: RichProject
  export let selectedNodeId: string | null
  export let onSelect: (id: string) => void
  export let onProjectChange: ((project: RichProject) => void) | undefined = undefined

  $: renderModel = (() => {
    try {
      return buildRenderModel(project)
    } catch {
      return null
    }
  })()

  let canvasEl: HTMLElement

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      const dragState = get(dragStateStore)
      if (dragState.phase === 'DRAGGING') {
        cancelDrag()
        resetDragState()
      }
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  function handleDrop(e: DragEvent): void {
    e.preventDefault()
    const dt = e.dataTransfer
    if (!dt) return

    const dragState = get(dragStateStore)
    if (!dragState || dragState.phase !== 'DRAGGING' || !dragState.draggedNodeId) {
      resetDragState()
      return
    }

    if (dragState.isCancelled || !dragState.isValidTarget || !dragState.currentTargetParentId || dragState.currentDropIndex === null) {
      cancelDrag()
      return
    }

    const draggedNodeId = dragState.draggedNodeId
    const sourceParentId = dragState.sourceParentId!
    const targetParentId = dragState.currentTargetParentId
    const targetIndex = dragState.currentDropIndex

    if (sourceParentId === targetParentId) {
      // Same-parent reorder
      const result = reorderLayer(project, sourceParentId, draggedNodeId, targetIndex)
      if (!result.error && onProjectChange) {
        completeDrag()
        onProjectChange(result.project)
      }
    } else {
      // Cross-parent move
      const result = moveLayer(project, draggedNodeId, targetParentId, targetIndex)
      if (!result.error && onProjectChange) {
        completeDrag()
        onProjectChange(result.project)
      }
    }

    resetDragState()
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault()
    if (!e.dataTransfer) return
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDragLeave(e: DragEvent): void {
    const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect()
    if (!rect) return
    const { clientX, clientY } = e
    if (
      clientX <= rect.left || clientX >= rect.right ||
      clientY <= rect.top || clientY >= rect.bottom
    ) {
      // Left the canvas area
    }
  }
</script>

<section
  class="canvas-surface"
  aria-label="Visual editor canvas"
  ondrop={handleDrop}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
>
  <DropIndicator />
  <div class="canvas-frame-inner">
    {#if renderModel}
      {#each renderModel.tree.children as sectionNode, sectionIdx}
        {#if sectionNode.visible}
          <CanvasElementRenderer
            node={sectionNode}
            isSelected={selectedNodeId === sectionNode.id}
            onSelect={onSelect}
            parentId={renderModel.tree.id}
            siblingIndex={sectionIdx}
          >
            {#each sectionNode.children as childNode, childIdx}
              {#if childNode.visible}
                <CanvasElementRenderer
                  node={childNode}
                  isSelected={selectedNodeId === childNode.id}
                  onSelect={onSelect}
                  parentId={sectionNode.id}
                  siblingIndex={childIdx}
                />
              {/if}
            {/each}
          </CanvasElementRenderer>
        {/if}
      {/each}
    {:else}
      <p class="empty-canvas">No content yet. Add a section to get started.</p>
    {/if}
  </div>
</section>

<style>
  .canvas-surface {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    background: var(--canvas-bg, #ffffff);
    color: var(--canvas-text, #1f2937);
  }

  .canvas-frame-inner {
    min-height: 16rem;
    border: 1px dashed var(--color-muted, #9ca3af);
    border-radius: 0.5rem;
    background: var(--surface-bg, #ffffff);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .empty-canvas {
    color: var(--color-muted, #9ca3af);
    text-align: center;
    margin: auto;
    font-style: italic;
  }
</style>
