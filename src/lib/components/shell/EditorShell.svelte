<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Project } from '../../domain/types'
  import { updateElementContent, updateElementInlineStyle } from '../../domain/project/canvas-element'
  import { createSampleProject } from '../../domain/project/sample-project'
  import CanvasViewport from '../canvas/CanvasViewport.svelte'
  import LayersTree from '../layers/LayersTree.svelte'
  import PropertiesPanel from '../inspector/PropertiesPanel.svelte'
  import TopBar from './TopBar.svelte'
  import StorageStatusBanner from './StorageStatusBanner.svelte'
  import OperationStatus from './OperationStatus.svelte'
  import { operationStatusStore } from '../../stores/status'
  import { setOperationStatus } from '../../stores/status'
  import { exportProjectZip } from '../../services/export/exporter'
  import { markDirty, markSaved } from '../../stores/editor'
  import { createAutosaveCoordinator } from '../../services/persistence/autosave'
  import { bootstrapRestore } from '../../services/persistence/restore'
  import { moveFocusToNextPanel } from '../../services/a11y/focus-manager'
  import { registerGlobalShortcuts } from '../../services/editor/shortcuts'
  import {
    editorActionHistoryStore,
    recordProjectSnapshot,
    redo,
    undo,
  } from '../../stores/editor-actions'

  const autosave = createAutosaveCoordinator(500)

  let project: Project = createSampleProject()

  let selectedElementId: string | null = 'text-1'
  let isExporting = false
  let activePanel = 'layers'
  let unregisterShortcuts: (() => void) | null = null

  $: statuses = $operationStatusStore
  $: actionHistory = $editorActionHistoryStore
  $: selectedElement = selectedElementId ? project.nodes[selectedElementId] ?? null : null
  $: storageBannerVisible = statuses.autosave.state === 'error'

  onMount(() => {
    const restored = bootstrapRestore()
    project = restored.project
    selectedElementId = restored.project.nodes['text-1'] ? 'text-1' : restored.project.rootNodeId

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

  function selectElement(id: string): void {
    selectedElementId = id
  }

  function updateSelectedText(value: string): void {
    if (!selectedElementId) return
    recordProjectSnapshot(project)
    project = updateElementContent(project, selectedElementId, { text: value })
    autosave.schedule(project)
    markDirty()
  }

  function updateSelectedColor(value: string): void {
    if (!selectedElementId) return
    recordProjectSnapshot(project)
    project = updateElementInlineStyle(project, selectedElementId, { color: value })
    autosave.schedule(project)
    markDirty()
  }

  function retryAutosave(): void {
    autosave.flush(project)
  }

  function undoAction(): void {
    const previous = undo(project)
    if (!previous) return

    project = previous
    autosave.schedule(project)
    setOperationStatus('validation', 'success', 'Undo applied')
  }

  function redoAction(): void {
    const next = redo(project)
    if (!next) return

    project = next
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
    setOperationStatus('export', 'running', 'Building ZIP...')

    try {
      const bytes = exportProjectZip(project)
      triggerDownload(bytes, `${project.name}.zip`)
      setOperationStatus('export', 'success', 'Static ZIP ready')
      markSaved()
    } catch {
      setOperationStatus('export', 'error', 'Export failed')
    } finally {
      isExporting = false
    }
  }
</script>

<div class="editor-shell" role="application" aria-label="WYSIWYG editor shell">
  <TopBar projectName={project.name} {isExporting} onExport={exportZip} />
  <StorageStatusBanner visible={storageBannerVisible} message={statuses.autosave.message ?? ''} onRetry={retryAutosave} />

  <main class="workspace">
    <div
      class="panel"
      tabindex="-1"
      data-editor-panel
      data-panel-focusable="true"
      data-panel-id="layers"
      data-testid="panel-layers"
      onfocus={() => {
        activePanel = 'layers'
      }}
    >
      <LayersTree {project} {selectedElementId} onSelect={selectElement} />
    </div>

    <div
      class="canvas"
      tabindex="-1"
      data-editor-panel
      data-panel-focusable="true"
      data-panel-id="canvas"
      data-testid="panel-canvas"
      onfocus={() => {
        activePanel = 'canvas'
      }}
    >
      <CanvasViewport {project} {selectedElementId} onSelect={selectElement} />
    </div>

    <div
      class="panel"
      tabindex="-1"
      data-editor-panel
      data-panel-focusable="true"
      data-panel-id="inspector"
      data-testid="panel-inspector"
      onfocus={() => {
        activePanel = 'inspector'
      }}
    >
      <PropertiesPanel
        {selectedElement}
        onContentChange={updateSelectedText}
        onColorChange={updateSelectedColor}
      />
    </div>
  </main>

  <footer class="status" aria-live="polite">
    <span>Autosave: {statuses.autosave.state}</span>
    <span>Restore: {statuses.restore.state}</span>
    <span>Export: {statuses.export.state}</span>
    <span>History: {actionHistory.past.length} undo / {actionHistory.future.length} redo</span>
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
    gap: 1rem;
    grid-template-columns: minmax(12rem, 18rem) 1fr minmax(12rem, 18rem);
    padding: 1rem;
  }

  .panel,
  .canvas {
    border: 1px solid #d1d5db;
    border-radius: 0.75rem;
    padding: 0.75rem;
    background: #fff;
  }

  .status {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid #d1d5db;
    background: #ffffffcc;
  }

  @media (max-width: 920px) {
    .workspace {
      grid-template-columns: 1fr;
    }
  }
</style>
