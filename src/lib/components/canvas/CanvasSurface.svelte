<script lang="ts">
  import type { RichProject } from '../../domain/schemas/projectSchema'
  import type { RenderModel } from '../../services/editor/renderModel'
  import { buildRenderModel } from '../../services/editor/renderModel'
  import type { RenderNode } from '../../services/editor/renderModel'

  export let project: RichProject
  export let selectedNodeId: string | null
  export let onSelect: (id: string) => void

  $: renderModel = (() => {
    try {
      return buildRenderModel(project)
    } catch {
      return null
    }
  })()

  function getNodeStyle(node: RenderNode): string {
    const parts: string[] = []
    if (node.style.textColor) parts.push(`color: ${node.style.textColor}`)
    const spacing = node.style.spacing
    if (spacing['padding']) parts.push(`padding: ${spacing['padding']}`)
    if (spacing['margin']) parts.push(`margin: ${spacing['margin']}`)
    return parts.join('; ')
  }
</script>

<section class="canvas-surface" aria-label="Visual editor canvas">
  <h2>Canvas</h2>
  <div class="canvas-frame" data-testid="canvas-frame">
    {#if renderModel}
      {#each renderModel.tree.children as sectionNode}
        {#if sectionNode.visible}
          <div
            class="canvas-section"
            class:selected={selectedNodeId === sectionNode.id}
            data-node-id={sectionNode.id}
            data-testid={`canvas-node-${sectionNode.id}`}
            style={getNodeStyle(sectionNode)}
            tabindex="0"
            role="group"
            aria-label={`Section: ${sectionNode.id}`}
            onclick={() => onSelect(sectionNode.id)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(sectionNode.id) }}
          >
            {#each sectionNode.children as childNode}
              {#if childNode.visible}
                {#if childNode.type === 'header'}
                  {@const hp = childNode.props as { level: string; text: string }}
                  <button
                    type="button"
                    class="canvas-node canvas-header"
                    class:selected={selectedNodeId === childNode.id}
                    data-node-id={childNode.id}
                    data-testid={`canvas-node-${childNode.id}`}
                    style={getNodeStyle(childNode)}
                    onclick|stopPropagation={() => onSelect(childNode.id)}
                  >
                    <svelte:element this={hp.level} class="header-inner">{hp.text || 'Heading'}</svelte:element>
                  </button>
                {:else if childNode.type === 'text'}
                  {@const tp = childNode.props as { content: string; href?: string }}
                  <button
                    type="button"
                    class="canvas-node canvas-text"
                    class:selected={selectedNodeId === childNode.id}
                    data-node-id={childNode.id}
                    data-testid={`canvas-node-${childNode.id}`}
                    style={getNodeStyle(childNode)}
                    onclick|stopPropagation={() => onSelect(childNode.id)}
                  >
                    {tp.content || 'Text'}
                  </button>
                {:else if childNode.type === 'columns'}
                  {@const cp = childNode.props as { columnCount: number; gap: string }}
                  <button
                    type="button"
                    class="canvas-node canvas-columns"
                    class:selected={selectedNodeId === childNode.id}
                    data-node-id={childNode.id}
                    data-testid={`canvas-node-${childNode.id}`}
                    style="display: grid; grid-template-columns: repeat({cp.columnCount}, 1fr); gap: {cp.gap}; {getNodeStyle(childNode)}"
                    onclick|stopPropagation={() => onSelect(childNode.id)}
                    aria-label={`${cp.columnCount}-column layout`}
                  >
                    {#each { length: cp.columnCount } as _, i}
                      <div class="column-placeholder" aria-label={`Column ${i + 1}`}>Col {i + 1}</div>
                    {/each}
                  </button>
                {:else if childNode.type === 'picture'}
                  {@const pp = childNode.props as { src: string; alt: string; caption?: string }}
                  <button
                    type="button"
                    class="canvas-node canvas-picture"
                    class:selected={selectedNodeId === childNode.id}
                    data-node-id={childNode.id}
                    data-testid={`canvas-node-${childNode.id}`}
                    onclick|stopPropagation={() => onSelect(childNode.id)}
                  >
                    {#if pp.src}
                      <img src={pp.src} alt={pp.alt} class="canvas-img" />
                    {:else}
                      <div class="picture-placeholder" aria-label="Picture placeholder">🖼 {pp.alt || 'Picture'}</div>
                    {/if}
                    {#if pp.caption}
                      <figcaption class="picture-caption">{pp.caption}</figcaption>
                    {/if}
                  </button>
                {/if}
              {/if}
            {/each}
          </div>
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
  }

  .canvas-frame {
    min-height: 16rem;
    border: 1px dashed #9ca3af;
    border-radius: 0.75rem;
    background: #ffffff;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .canvas-section {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: #f9fafb;
    cursor: pointer;
  }

  .canvas-section.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
  }

  .canvas-node {
    text-align: left;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    width: 100%;
    cursor: pointer;
  }

  .canvas-node.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
  }

  .canvas-header {
    font-weight: 600;
  }

  .header-inner {
    margin: 0;
    font-size: inherit;
  }

  .canvas-columns {
    padding: 0.5rem;
  }

  .column-placeholder {
    min-height: 2rem;
    border: 1px dashed #d1d5db;
    border-radius: 0.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 0.8rem;
  }

  .canvas-picture {
    padding: 0.4rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .canvas-img {
    max-width: 100%;
    max-height: 12rem;
    object-fit: contain;
    border-radius: 0.4rem;
  }

  .picture-placeholder {
    color: #9ca3af;
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .picture-caption {
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
  }

  .empty-canvas {
    color: #9ca3af;
    text-align: center;
    margin: auto;
  }
</style>
