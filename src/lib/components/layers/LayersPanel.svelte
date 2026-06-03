<script lang="ts">
  import type { RichProject } from '../../domain/schemas/projectSchema'
  import type { LayerNode } from '../../domain/schemas/layerNodeSchema'
  import type { LayerType } from '../../domain/project/layerTypeDefinitions'
  import { getAllowedChildTypes, getLayerTypeDefinition } from '../../domain/project/layerTypeDefinitions'
  import { addLayer, deleteLayer, renameLayer, reorderLayer, duplicateLayer } from '../../services/editor/layerOperations'

  export let project: RichProject
  export let selectedNodeId: string | null
  export let onSelect: (id: string) => void
  export let onProjectChange: (project: RichProject) => void

  function getIcon(type: LayerType): string {
    return getLayerTypeDefinition(type).icon
  }

  function getAllowedForParent(parentId: string): LayerType[] {
    const parent = project.nodes[parentId]
    if (!parent) return []
    const effectiveType = parent.parentId === null ? 'root' : parent.type
    return getAllowedChildTypes(effectiveType as LayerType | 'root')
  }

  function handleAddLayer(parentId: string, type: LayerType): void {
    const result = addLayer(project, parentId, type)
    if (result.error) {
      console.warn('Add layer error:', result.error)
      return
    }
    onProjectChange(result.project)
    if (result.newNodeId) onSelect(result.newNodeId)
  }

  function handleDelete(nodeId: string): void {
    const result = deleteLayer(project, nodeId)
    if (result.error) {
      console.warn('Delete layer error:', result.error)
      return
    }
    onProjectChange(result.project)
    if (selectedNodeId === nodeId) onSelect(result.project.rootNodeId)
  }

  function handleDuplicate(nodeId: string): void {
    const result = duplicateLayer(project, nodeId)
    if (result.error) {
      console.warn('Duplicate layer error:', result.error)
      return
    }
    onProjectChange(result.project)
    if (result.newNodeId) onSelect(result.newNodeId)
  }

  function handleRename(nodeId: string): void {
    const node = project.nodes[nodeId]
    if (!node) return
    const newName = prompt('Rename layer:', node.name)
    if (!newName) return
    const result = renameLayer(project, nodeId, newName)
    if (result.error) {
      console.warn('Rename error:', result.error)
      return
    }
    onProjectChange(result.project)
  }

  function handleMoveUp(nodeId: string): void {
    const node = project.nodes[nodeId]
    if (!node?.parentId) return
    const parent = project.nodes[node.parentId]
    if (!parent) return
    const idx = parent.children.indexOf(nodeId)
    if (idx <= 0) return
    const result = reorderLayer(project, node.parentId, nodeId, idx - 1)
    if (!result.error) onProjectChange(result.project)
  }

  function handleMoveDown(nodeId: string): void {
    const node = project.nodes[nodeId]
    if (!node?.parentId) return
    const parent = project.nodes[node.parentId]
    if (!parent) return
    const idx = parent.children.indexOf(nodeId)
    if (idx >= parent.children.length - 1) return
    const result = reorderLayer(project, node.parentId, nodeId, idx + 1)
    if (!result.error) onProjectChange(result.project)
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<aside
  class="layers-panel"
  aria-label="Layer tree"
  role="region"
  tabindex="-1"
  onkeydown={(e) => {
    if (e.altKey && e.key === 'ArrowUp' && selectedNodeId) {
      e.preventDefault()
      handleMoveUp(selectedNodeId)
    } else if (e.altKey && e.key === 'ArrowDown' && selectedNodeId) {
      e.preventDefault()
      handleMoveDown(selectedNodeId)
    }
  }}
>
  <h2>Layers</h2>
  <ul class="layer-list" role="tree">
    {#each project.nodes[project.rootNodeId]?.children ?? [] as sectionId}
      {@const section = project.nodes[sectionId]}
      {#if section}
        <li role="treeitem" aria-expanded="true" aria-selected={selectedNodeId === section.id}>
          <button
            type="button"
            class="layer-item layer-section"
            class:selected={selectedNodeId === section.id}
            onclick={() => onSelect(section.id)}
            data-testid={`layer-${section.id}`}
          >
            <span class="icon" aria-hidden="true">{getIcon(section.type)}</span>
            <span class="label">{section.name}</span>
            <span class="type-badge">{section.type}</span>
          </button>
          <div class="layer-actions" aria-label={`Actions for ${section.name}`}>
            <button type="button" class="action-btn" onclick={() => handleMoveUp(section.id)} title="Move up" aria-label="Move section up">↑</button>
            <button type="button" class="action-btn" onclick={() => handleMoveDown(section.id)} title="Move down" aria-label="Move section down">↓</button>
            <button type="button" class="action-btn" onclick={() => handleRename(section.id)} title="Rename" aria-label="Rename section">✏️</button>
            <button type="button" class="action-btn" onclick={() => handleDuplicate(section.id)} title="Duplicate" aria-label="Duplicate section">⧉</button>
            <button type="button" class="action-btn danger" onclick={() => handleDelete(section.id)} title="Delete" aria-label="Delete section">✕</button>
          </div>

          <!-- Section children -->
          {#if section.children.length > 0}
            <ul class="layer-children" role="group">
              {#each section.children as childId}
                {@const child = project.nodes[childId]}
                {#if child}
                  <li role="treeitem" aria-selected={selectedNodeId === child.id}>
                    <button
                      type="button"
                      class="layer-item layer-child"
                      class:selected={selectedNodeId === child.id}
                      onclick={() => onSelect(child.id)}
                      data-testid={`layer-${child.id}`}
                    >
                      <span class="icon" aria-hidden="true">{getIcon(child.type)}</span>
                      <span class="label">{child.name}</span>
                      <span class="type-badge">{child.type}</span>
                    </button>
                    <div class="layer-actions">
                      <button type="button" class="action-btn" onclick={() => handleMoveUp(child.id)} title="Move up" aria-label="Move up">↑</button>
                      <button type="button" class="action-btn" onclick={() => handleMoveDown(child.id)} title="Move down" aria-label="Move down">↓</button>
                      <button type="button" class="action-btn" onclick={() => handleRename(child.id)} title="Rename" aria-label="Rename">✏️</button>
                      <button type="button" class="action-btn" onclick={() => handleDuplicate(child.id)} title="Duplicate" aria-label="Duplicate">⧉</button>
                      <button type="button" class="action-btn danger" onclick={() => handleDelete(child.id)} title="Delete" aria-label="Delete">✕</button>
                    </div>
                  </li>
                {/if}
              {/each}
            </ul>
          {/if}

          <!-- Add child layer -->
          <div class="add-child-controls">
            {#each getAllowedForParent(section.id) as type}
              <button
                type="button"
                class="add-btn"
                onclick={() => handleAddLayer(section.id, type)}
                title={`Add ${type}`}
                aria-label={`Add ${type} to ${section.name}`}
              >
                + {getIcon(type)} {type}
              </button>
            {/each}
          </div>
        </li>
      {/if}
    {/each}
  </ul>

  <!-- Add top-level section -->
  <div class="add-section-controls">
    <button
      type="button"
      class="add-section-btn"
      onclick={() => handleAddLayer(project.rootNodeId, 'section')}
      aria-label="Add section"
    >
      + ▭ Add Section
    </button>
  </div>
</aside>

<style>
  .layers-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
    max-height: 100%;
  }

  .layer-list,
  .layer-children {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .layer-children {
    padding-left: 1rem;
    border-left: 2px solid #e5e7eb;
    margin-left: 0.5rem;
  }

  .layer-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    text-align: left;
    border: 1px solid #d1d5db;
    background: #f8fafc;
    border-radius: 0.5rem;
    padding: 0.4rem 0.55rem;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .layer-item.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #bfdbfe;
    background: #eff6ff;
  }

  .layer-section {
    font-weight: 600;
  }

  .layer-child {
    margin-top: 0.2rem;
  }

  .icon {
    font-size: 0.9rem;
    min-width: 1rem;
  }

  .label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .type-badge {
    font-size: 0.7rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
    flex-shrink: 0;
  }

  .layer-actions {
    display: flex;
    gap: 0.2rem;
    padding: 0.15rem 0.4rem;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 0.1rem 0.35rem;
    font-size: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.35rem;
    background: #fff;
    cursor: pointer;
  }

  .action-btn.danger {
    border-color: #fca5a5;
    color: #dc2626;
  }

  .add-child-controls {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    padding: 0.2rem 0.4rem;
  }

  .add-btn {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border: 1px dashed #9ca3af;
    border-radius: 0.4rem;
    background: #f9fafb;
    cursor: pointer;
    color: #374151;
  }

  .add-section-controls {
    margin-top: 0.5rem;
    padding: 0 0.25rem;
  }

  .add-section-btn {
    width: 100%;
    padding: 0.45rem;
    border: 1px dashed #6b7280;
    border-radius: 0.5rem;
    background: #f3f4f6;
    cursor: pointer;
    font-size: 0.85rem;
    color: #374151;
    font-weight: 500;
  }
</style>
