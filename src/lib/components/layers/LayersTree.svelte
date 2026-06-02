<script lang="ts">
  import type { Project } from '../../domain/types'

  export let project: Project
  export let selectedElementId: string | null
  export let onSelect: (id: string) => void

  const rootLabel = 'Root'
</script>

<aside class="layers-tree" aria-label="Layer tree">
  <h2>Layers</h2>
  <ul>
    <li>
      <strong>{rootLabel}</strong>
      <ul>
        {#each project.nodes[project.rootNodeId].children as nodeId}
          {@const node = project.nodes[nodeId]}
          {#if node}
            <li>
              <button
                type="button"
                class:selected={selectedElementId === node.id}
                onclick={() => onSelect(node.id)}
                data-testid={`layer-${node.id}`}
              >
                {node.type} {node.id}
              </button>
            </li>
          {/if}
        {/each}
      </ul>
    </li>
  </ul>
</aside>

<style>
  .layers-tree ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .layers-tree li {
    margin: 0.25rem 0;
  }

  .layers-tree button {
    width: 100%;
    text-align: left;
    border: 1px solid #d1d5db;
    background: #f8fafc;
    border-radius: 0.5rem;
    padding: 0.4rem 0.55rem;
  }

  .layers-tree button.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
  }
</style>
