<script lang="ts">
  import { operationStatusStore } from '../../stores/status'

  $: statuses = $operationStatusStore
</script>

<div class="editor-shell" role="application" aria-label="WYSIWYG editor shell">
  <header class="toolbar">
    <h1>ai-wysiwyg</h1>
  </header>

  <main class="workspace">
    <aside class="panel" aria-label="Layer tree">
      <h2>Layers</h2>
      <p>Layer tree coming in user story implementation.</p>
    </aside>

    <section class="canvas" aria-label="Visual editor canvas">
      <h2>Canvas</h2>
      <p>Canvas rendering foundation is initialized.</p>
    </section>

    <aside class="panel" aria-label="Properties inspector">
      <h2>Inspector</h2>
      <p>Properties panel foundation is initialized.</p>
    </aside>
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

  .toolbar {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #d1d5db;
    background: #ffffffcc;
    backdrop-filter: blur(6px);
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
