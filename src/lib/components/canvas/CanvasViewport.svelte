<script lang="ts">
  import { buildInlineStyleText } from '../../services/editor/style-engine'
  import type { Project } from '../../domain/types'

  export let project: Project
  export let selectedElementId: string | null
  export let onSelect: (id: string) => void

  function styleText(nodeId: string): string {
    const node = project.nodes[nodeId]
    return buildInlineStyleText(node?.inlineStyle)
  }
</script>

<section class="canvas-viewport" aria-label="Visual editor canvas">
  <h2>Canvas</h2>
  <div class="canvas-frame" data-testid="canvas-frame">
    {#if project.nodes[project.rootNodeId]}
      {#each project.nodes[project.rootNodeId].children as nodeId}
        {@const node = project.nodes[nodeId]}
        {#if node}
          <button
            type="button"
            class:selected={selectedElementId === node.id}
            class="node"
            onclick={() => onSelect(node.id)}
            style={styleText(node.id)}
            data-node-id={node.id}
            data-testid={`canvas-node-${node.id}`}
          >
            {String(node.content.text ?? node.type)}
          </button>
        {/if}
      {/each}
    {/if}
  </div>
</section>

<style>
  .canvas-viewport {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .canvas-frame {
    min-height: 16rem;
    border: 1px dashed #9ca3af;
    border-radius: 0.75rem;
    background: #ffffff;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .node {
    text-align: left;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
  }

  .node.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
  }
</style>
