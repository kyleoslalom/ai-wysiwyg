<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerNode } from '../../domain/schemas/layerNodeSchema'
  import type { RichProject } from '../../domain/schemas/projectSchema'
  import { createRichSampleProject } from '../../domain/project/rich-sample-project'
  import CanvasSurface from '../canvas/CanvasSurface.svelte'
  import InspectorPanel from '../inspector/InspectorPanel.svelte'
  import LayersPanel from '../layers/LayersPanel.svelte'
  import { exportRichProjectZip } from '../../services/export/richExporter'
  import { activeThemeStore, applyThemeToDom } from '../../stores/themeStore'
  import Toolbar from './Toolbar.svelte'
  import TopBar from './TopBar.svelte'

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

  $: activeTheme = $activeThemeStore
  $: selectedNode = selectedNodeId ? project.nodes[selectedNodeId] ?? null : null
  $: applyThemeToDom(activeTheme.tokens)
  $: if (project.theme.id !== activeTheme.id || project.theme.label !== activeTheme.label) {
    project = {
      ...project,
      theme: {
        id: activeTheme.id,
        label: activeTheme.label,
      },
    }
  }

  onMount(() => {
    applyThemeToDom(activeTheme.tokens)
  })

  function selectNode(id: string): void {
    selectedNodeId = id
  }

  function handleProjectChange(nextProject: RichProject): void {
    project = {
      ...nextProject,
      theme: {
        id: activeTheme.id,
        label: activeTheme.label,
      },
    }
  }

  function handleNodeChange(updatedNode: LayerNode): void {
    project = {
      ...project,
      updatedAt: new Date().toISOString(),
      nodes: {
        ...project.nodes,
        [updatedNode.id]: updatedNode,
      },
    }
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

    try {
      const bytes = exportRichProjectZip(project)
      triggerDownload(bytes, `${project.name}.zip`)
    } finally {
      isExporting = false
    }
  }
</script>

<div class="editor-shell" role="application" aria-label="WYSIWYG editor shell">
  <TopBar projectName={project.name} {isExporting} onExport={exportZip} />
  <Toolbar />

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
      <LayersPanel {project} {selectedNodeId} onSelect={selectNode} onProjectChange={handleProjectChange} />
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
      <CanvasSurface {project} {selectedNodeId} onSelect={selectNode} />
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
      <InspectorPanel {selectedNode} onNodeChange={handleNodeChange} />
    </div>
  </main>

  <footer class="status" aria-live="polite">
    <span>Selected: {selectedNode?.name ?? 'None'}</span>
    <span>Type: {selectedNode?.type ?? 'n/a'}</span>
    <span>Theme: {activeTheme.label}</span>
    <span>Nodes: {Object.keys(project.nodes).length}</span>
    <span>Panel: {activePanel}</span>
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
