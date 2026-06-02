<script lang="ts">
  import type { Project } from '../../domain/types'
  import { updateElementContent, updateElementInlineStyle } from '../../domain/project/canvas-element'
  import CanvasViewport from '../canvas/CanvasViewport.svelte'
  import LayersTree from '../layers/LayersTree.svelte'
  import PropertiesPanel from '../inspector/PropertiesPanel.svelte'
  import TopBar from './TopBar.svelte'
  import { operationStatusStore } from '../../stores/status'
  import { setOperationStatus } from '../../stores/status'
  import { exportProjectZip } from '../../services/export/exporter'
  import { markDirty, markSaved } from '../../stores/editor'

  const now = new Date().toISOString()

  let project: Project = {
    id: 'project-1',
    name: 'ai-wysiwyg',
    createdAt: now,
    updatedAt: now,
    rootNodeId: 'root',
    version: 1,
    interactions: [
      {
        id: 'interaction-1',
        elementId: 'button-1',
        eventType: 'click',
        presetKey: 'toggle-class',
        config: { className: 'is-active' },
      },
    ],
    styles: {
      headingStyle: {
        id: 'headingStyle',
        selector: '[data-node-id="heading-1"]',
        declarations: {
          fontSize: '1.4rem',
          fontWeight: '700',
          color: '#111827',
        },
        order: 1,
      },
      textStyle: {
        id: 'textStyle',
        selector: '[data-node-id="text-1"]',
        declarations: {
          lineHeight: '1.6',
          color: '#334155',
        },
        order: 2,
      },
    },
    nodes: {
      root: {
        id: 'root',
        type: 'container',
        parentId: null,
        children: ['heading-1', 'text-1', 'button-1'],
        content: {},
        classList: ['page-root'],
      },
      'heading-1': {
        id: 'heading-1',
        type: 'heading',
        parentId: 'root',
        children: [],
        content: { text: 'Welcome to ai-wysiwyg' },
        classList: ['hero-heading'],
      },
      'text-1': {
        id: 'text-1',
        type: 'text',
        parentId: 'root',
        children: [],
        content: { text: 'Edit this copy and export a static page.' },
        classList: ['hero-copy'],
      },
      'button-1': {
        id: 'button-1',
        type: 'button',
        parentId: 'root',
        children: [],
        content: { text: 'Primary Action' },
        classList: ['hero-cta'],
      },
    },
  }

  let selectedElementId: string | null = 'text-1'
  let isExporting = false

  $: statuses = $operationStatusStore
  $: selectedElement = selectedElementId ? project.nodes[selectedElementId] ?? null : null

  function selectElement(id: string): void {
    selectedElementId = id
  }

  function updateSelectedText(value: string): void {
    if (!selectedElementId) return
    project = updateElementContent(project, selectedElementId, { text: value })
    markDirty()
  }

  function updateSelectedColor(value: string): void {
    if (!selectedElementId) return
    project = updateElementInlineStyle(project, selectedElementId, { color: value })
    markDirty()
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
    URL.revokeObjectURL(href)
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

  <main class="workspace">
    <div class="panel">
      <LayersTree {project} {selectedElementId} onSelect={selectElement} />
    </div>

    <div class="canvas">
      <CanvasViewport {project} {selectedElementId} onSelect={selectElement} />
    </div>

    <div class="panel">
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
