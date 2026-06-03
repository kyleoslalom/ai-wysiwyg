<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { LayerNode } from '../../domain/schemas/layerNodeSchema'
  import type { RichProject } from '../../domain/schemas/projectSchema'
  import { createRichSampleProject } from '../../domain/project/rich-sample-project'
  import CanvasSurface from '../canvas/CanvasSurface.svelte'
  import InspectorPanel from '../inspector/InspectorPanel.svelte'
  import LayersPanel from '../layers/LayersPanel.svelte'
  import StorageStatusBanner from './StorageStatusBanner.svelte'
  import OperationStatus from './OperationStatus.svelte'
  import { exportRichProjectZip } from '../../services/export/richExporter'
  import { moveFocusToNextPanel } from '../../services/a11y/focus-manager'
  import { registerGlobalShortcuts } from '../../services/editor/shortcuts'
  import { createAutosaveCoordinator } from '../../services/persistence/autosave'
  import { bootstrapRichRestore } from '../../services/persistence/restore'
  import { activeRichProjectStore } from '../../stores/editorStore'
  import { editorActionHistoryStore, clearActionHistory, recordProjectSnapshot, redo, undo } from '../../stores/editor-actions'
  import { operationStatusStore, setOperationStatus } from '../../stores/status'
  import { activeThemeStore, applyThemeToDom } from '../../stores/themeStore'
  import Toolbar from './Toolbar.svelte'
  import TopBar from './TopBar.svelte'

  const autosave = createAutosaveCoordinator<RichProject>(500)

  function getInitialSelection(project: RichProject): string {
    const firstSectionId = project.nodes[project.rootNodeId]?.children[0]
    if (!firstSectionId) return project.rootNodeId
    const firstChildId = project.nodes[firstSectionId]?.children[0]
    return firstChildId ?? firstSectionId
  }

  let project: RichProject = createRichSampleProject()
  let selectedNodeId: string | null = getInitialSelection(project)
  let isExporting = false
  let activePanel = 'layers'
  let unregisterShortcuts: (() => void) | null = null
  let mounted = false
  let leftPanelCollapsed = false
  let rightPanelCollapsed = false

  $: activeTheme = $activeThemeStore
  $: statuses = $operationStatusStore
  $: actionHistory = $editorActionHistoryStore
  $: selectedNode = selectedNodeId ? project.nodes[selectedNodeId] ?? null : null
  $: storageBannerVisible = statuses.autosave.state === 'error'
  $: applyThemeToDom(activeTheme.tokens)
  $: if (mounted && (project.theme.id !== activeTheme.id || project.theme.label !== activeTheme.label)) {
    applyProjectChange({
      ...project,
      theme: {
        id: activeTheme.id,
        label: activeTheme.label,
      },
    })
  }

  onMount(() => {
    const restored = bootstrapRichRestore()
    project = withActiveTheme(restored.project)
    activeRichProjectStore.set(project)
    selectedNodeId = getValidSelection(project)
    clearActionHistory()
    applyThemeToDom(activeTheme.tokens)
    mounted = true

    unregisterShortcuts = registerGlobalShortcuts({
      undo: () => undoAction(),
      redo: () => redoAction(),
      exportZip: () => {
        void exportZip()
      },
      focusNextPanel: () => {
        moveFocusToNextPanel()
      },
    })
  })

  onDestroy(() => {
    autosave.stop()
    unregisterShortcuts?.()
  })

  function withActiveTheme(nextProject: RichProject): RichProject {
    return {
      ...nextProject,
      theme: {
        id: activeTheme.id,
        label: activeTheme.label,
      },
    }
  }

  function getValidSelection(nextProject: RichProject): string {
    if (selectedNodeId && nextProject.nodes[selectedNodeId]) {
      return selectedNodeId
    }

    return getInitialSelection(nextProject)
  }

  function applyProjectChange(nextProject: RichProject, options?: { recordHistory?: boolean; autosave?: boolean }): void {
    if (options?.recordHistory ?? true) {
      recordProjectSnapshot(project)
    }

    project = {
      ...withActiveTheme(nextProject),
      updatedAt: new Date().toISOString(),
    }
    activeRichProjectStore.set(project)
    selectedNodeId = getValidSelection(project)

    if (options?.autosave ?? true) {
      autosave.schedule(project)
    }
  }

  function selectNode(id: string): void {
    selectedNodeId = id
  }

  function handleProjectChange(nextProject: RichProject): void {
    applyProjectChange(nextProject)
  }

  function handleNodeChange(updatedNode: LayerNode): void {
    applyProjectChange({
      ...project,
      nodes: {
        ...project.nodes,
        [updatedNode.id]: updatedNode,
      },
    })
  }

  function retryAutosave(): void {
    autosave.flush(project)
  }

  function undoAction(): void {
    const previous = undo(project)
    if (!previous) return

    project = withActiveTheme(previous)
    activeRichProjectStore.set(project)
    selectedNodeId = getValidSelection(project)
    autosave.schedule(project)
    setOperationStatus('validation', 'success', 'Undo applied')
  }

  function redoAction(): void {
    const next = redo(project)
    if (!next) return

    project = withActiveTheme(next)
    activeRichProjectStore.set(project)
    selectedNodeId = getValidSelection(project)
    autosave.schedule(project)
    setOperationStatus('validation', 'success', 'Redo applied')
  }

  function triggerDownload(bytes: Uint8Array, filename: string): void {
    const data = new Uint8Array(bytes.byteLength)
    data.set(bytes)
    const blob = new Blob([data.buffer], { type: 'application/zip' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => {
      URL.revokeObjectURL(href)
    }, 0)
  }

  async function exportZip(): Promise<void> {
    isExporting = true
    setOperationStatus('export', 'running', 'Building rich ZIP...')

    try {
      const bytes = exportRichProjectZip(project)
      triggerDownload(bytes, `${project.name}.zip`)
      setOperationStatus('export', 'success', 'Static ZIP ready')
    } catch {
      setOperationStatus('export', 'error', 'Export failed')
    } finally {
      isExporting = false
    }
  }
</script>

<div class="editor-shell" role="application" aria-label="WYSIWYG editor shell">
  <TopBar
    projectName={project.name}
    {isExporting}
    canUndo={actionHistory.past.length > 0}
    canRedo={actionHistory.future.length > 0}
    onUndo={undoAction}
    onRedo={redoAction}
    onExport={exportZip}
  />
  <Toolbar />
  <StorageStatusBanner visible={storageBannerVisible} message={statuses.autosave.message ?? ''} onRetry={retryAutosave} />

  <main class="workspace">
    <div
      class="panel panel-left"
      class:panel-collapsed={leftPanelCollapsed}
      tabindex="-1"
      data-editor-panel
      data-panel-focusable="true"
      data-panel-id="layers"
      data-testid="panel-layers"
      onfocus={() => {
        activePanel = 'layers'
      }}
    >
      {#if !leftPanelCollapsed}
        <LayersPanel {project} {selectedNodeId} onSelect={selectNode} onProjectChange={handleProjectChange} />
      {:else}
        <div class="panel-icon-bar" aria-label="Layers panel collapsed">
          <button type="button" class="panel-toggle-btn" onclick={() => { leftPanelCollapsed = false }} title="Expand layers panel">
            ☰
          </button>
        </div>
      {/if}
    </div>

    <div
      class="canvas"
      tabindex="-1"
      data-editor-panel
      data-panel-focusable="true"
      data-panel-id="canvas"
      data-testid="panel-canvas"
      data-test-canvas-container
      onfocus={() => {
        activePanel = 'canvas'
      }}
    >
      <div class="canvas-frame" data-testid="canvas-frame">
        <CanvasSurface {project} {selectedNodeId} onSelect={selectNode} onProjectChange={handleProjectChange} />
      </div>
    </div>

    <div
      class="panel panel-right"
      class:panel-collapsed={rightPanelCollapsed}
      tabindex="-1"
      data-editor-panel
      data-panel-focusable="true"
      data-panel-id="inspector"
      data-testid="panel-inspector"
      onfocus={() => {
        activePanel = 'inspector'
      }}
    >
      {#if !rightPanelCollapsed}
        <InspectorPanel {selectedNode} onNodeChange={handleNodeChange} />
      {:else}
        <div class="panel-icon-bar" aria-label="Inspector panel collapsed">
          <button type="button" class="panel-toggle-btn" onclick={() => { rightPanelCollapsed = false }} title="Expand inspector panel">
            ☰
          </button>
        </div>
      {/if}
    </div>
  </main>

  <footer class="status" aria-live="polite">
    <span>Autosave: {statuses.autosave.state}</span>
    <span>Restore: {statuses.restore.state}</span>
    <span>Export: {statuses.export.state}</span>
    <span>History: {actionHistory.past.length} undo / {actionHistory.future.length} redo</span>
    <span>Selected: {selectedNode?.name ?? 'None'}</span>
    <span>Panel: {activePanel}</span>
    <OperationStatus />
  </footer>
</div>

<style>
  .editor-shell {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    color: #1f2937;
    background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
  }

  .workspace {
    display: grid;
    gap: 0;
    grid-template-columns: var(--panel-width, 280px) 1fr var(--panel-width, 280px);
    padding: 0;
    overflow: hidden;
    height: 100%;
  }

  .panel {
    border: 1px solid #d1d5db;
    border-radius: 0;
    padding: 0.75rem;
    overflow-y: auto;
    background: var(--color-surface, #ffffff);
    transition: width 0.2s ease;
    min-width: 0;
  }

  .panel-left {
    border-right: 1px solid #d1d5db;
  }

  .panel-right {
    border-left: 1px solid #d1d5db;
  }

  .panel-collapsed {
    width: 48px;
    min-width: 48px;
    overflow: hidden;
    padding: 0;
  }

  .panel-icon-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 0;
    gap: 0.5rem;
  }

  .panel-toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0.5rem;
    border-radius: 0.375rem;
    color: var(--color-text, #1f2937);
  }

  .panel-toggle-btn:hover {
    background: var(--color-accent-bg, rgba(170, 59, 255, 0.1));
  }

  /* Responsive: at <1024px panels collapse to icon-only by default */
  @media (max-width: 1023px) {
    .workspace {
      grid-template-columns: 48px 1fr 48px;
    }
    .panel :not(.panel-icon-bar) {
      display: none;
    }
  }

  /* Responsive: at <768px only one panel visible at a time via toggle */
  @media (max-width: 767px) {
    .workspace {
      grid-template-columns: 0px 1fr 0px;
    }
  }

  .canvas {
    border: none;
    border-radius: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: var(--canvas-bg, #f9fafb);
    overflow: hidden;
  }

  .canvas-frame {
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 1rem;
  }

  .status {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid #d1d5db;
    background: #ffffffcc;
  }
</style>
