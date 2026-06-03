<script lang="ts">
  import type { RenderNode } from '../../services/editor/renderModel'
  import { DEFAULT_INTERACTION_BORDER, getInteractionBorderCss } from '../../domain/interactionBorderConfig'
  import { startDrag, updateDragPosition, cancelDrag, dragStateStore, isDraggingStore } from '../../stores/dragState'

  export let node: RenderNode
  export let isSelected: boolean = false
  export let isDragging: boolean = false
  export let onSelect: (id: string) => void
  export let parentId: string | null = null
  export let siblingIndex: number = -1

  let isHovered = false
  let dragCounter = 0

  function getNodeInlineStyle(node: RenderNode): string {
    const parts: string[] = []
    if (node.style.textColor) parts.push(`color: ${node.style.textColor}`)
    const s = node.style.spacing
    if (s['padding']) parts.push(`padding: ${s['padding']}`)
    if (s['margin']) parts.push(`margin: ${s['margin']}`)
    if (s['gap']) parts.push(`gap: ${s['gap']}`)
    const bg = node.style.background
    if (bg['background-color']) parts.push(`background-color: ${bg['background-color']}`)
    if (bg['background-image']) parts.push(`background-image: ${bg['background-image']}`)
    const al = node.style.alignment
    if (al['text-align']) parts.push(`text-align: ${al['text-align']}`)
    return parts.join('; ')
  }

  function getInteractiveWrapStyle(): string {
    const border = getInteractionBorderCss(DEFAULT_INTERACTION_BORDER)
    if (isSelected || isHovered) {
      return `outline: ${border}; outline-offset: 2px;`
    }
    return 'outline: none;'
  }

  function handleDragStart(e: DragEvent): void {
    if (!parentId) return
    const dt = e.dataTransfer
    if (!dt) return
    dt.effectAllowed = 'move'
    dt.setData('text/plain', node.id)
    // Set a custom drag image that's subtle
    if (dt.setDragImage && e.currentTarget instanceof HTMLElement) {
      dt.setDragImage(e.currentTarget, 0, 0)
    }
    startDrag(node.id, parentId, siblingIndex)
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault()
    if (!e.dataTransfer) return
    e.dataTransfer.dropEffect = 'move'

    // Determine insertion index: above or below this element based on cursor Y
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const insertionIndex = e.clientY < midY ? siblingIndex : siblingIndex + 1

    if (parentId) {
      updateDragPosition(parentId, insertionIndex, true)
    }
  }

  function handleDragEnter(e: DragEvent): void {
    e.preventDefault()
    dragCounter++
  }

  function handleDragLeave(e: DragEvent): void {
    e.preventDefault()
    dragCounter--
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="canvas-interactive-wrap"
  class:selected={isSelected}
  class:dragging={isDragging}
  data-node-id={node.id}
  data-testid="canvas-node-{node.id}"
  role="button"
  tabindex="0"
  draggable={true}
  style={getInteractiveWrapStyle()}
  onmouseenter={() => { isHovered = true }}
  onmouseleave={() => { isHovered = false }}
  onclick={(e) => { e.stopPropagation(); onSelect(node.id); }}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(node.id); } }}
  ondragstart={handleDragStart}
  ondragover={handleDragOver}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
>
  {#if node.type === 'header'}
    {@const hp = node.props as { level: string; text: string }}
    <svelte:element this={hp.level} data-node-id={node.id} style={getNodeInlineStyle(node)}>
      {hp.text || ''}
    </svelte:element>
  {:else if node.type === 'text'}
    {@const tp = node.props as { content: string; href?: string; linkTarget?: string }}
    {#if tp.href}
      <p data-node-id={node.id} style={getNodeInlineStyle(node)}>
        <a href={tp.href} target={tp.linkTarget || '_self'}>{tp.content || ''}</a>
      </p>
    {:else}
      <p data-node-id={node.id} style={getNodeInlineStyle(node)}>{tp.content || ''}</p>
    {/if}
  {:else if node.type === 'columns'}
    {@const cp = node.props as { columnCount: number; gap: string; widths?: number[]; collapseBreakpointPx?: number }}
    <div
      class="columns-layout"
      data-node-id={node.id}
      style="display: grid; grid-template-columns: repeat({cp.columnCount}, 1fr); gap: {cp.gap}; {getNodeInlineStyle(node)}"
    >
      {#each { length: cp.columnCount } as _, i}
        <div class="col-slot" data-col={i + 1} style="min-height: 2rem;"></div>
      {/each}
    </div>
  {:else if node.type === 'picture'}
    {@const pp = node.props as { src: string; alt: string; caption?: string }}
    <figure data-node-id={node.id} style={getNodeInlineStyle(node)}>
      {#if pp.src}
        <!-- svelte-ignore a11y-missing-attribute -->
        <img src={pp.src} alt={pp.alt || ''} style="max-width: 100%; max-height: 12rem; object-fit: contain;" />
      {:else}
        <div style="min-height: 4rem; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
          {pp.alt || 'Image'}
        </div>
      {/if}
      {#if pp.caption}
        <figcaption>{pp.caption}</figcaption>
      {/if}
    </figure>
  {:else}
    <section data-node-id={node.id} style={getNodeInlineStyle(node)}>
      <slot />
    </section>
  {/if}
</div>

<style>
  .canvas-interactive-wrap {
    border-radius: 0.25rem;
    cursor: pointer;
    transition: outline 0.15s ease;
    position: relative;
  }

  .canvas-interactive-wrap.selected {
    outline-offset: 2px;
  }

  .canvas-interactive-wrap.dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  .canvas-interactive-wrap :global(.columns-layout) {
    min-height: 3rem;
  }

  .canvas-interactive-wrap :global(.col-slot) {
    border: 1px dashed #d1d5db;
    border-radius: 0.25rem;
    min-height: 2rem;
  }
</style>