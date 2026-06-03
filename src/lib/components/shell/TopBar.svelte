<script lang="ts">
  export let projectName: string
  export let isExporting = false
  export let canUndo = false
  export let canRedo = false
  export let onUndo: () => void = () => {}
  export let onRedo: () => void = () => {}
  export let onExport: () => void
</script>

<header class="topbar">
  <h1>{projectName}</h1>
  <div class="actions">
    <button type="button" onclick={onUndo} disabled={!canUndo} aria-label="Undo last change">Undo</button>
    <button type="button" onclick={onRedo} disabled={!canRedo} aria-label="Redo last undone change">Redo</button>
    <button type="button" class="export" onclick={onExport} disabled={isExporting} aria-label="Export static zip">
      {#if isExporting}
        Exporting...
      {:else}
        Export ZIP
      {/if}
    </button>
  </div>
</header>

<style>
  .topbar {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #d1d5db;
    background: #ffffffcc;
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .topbar h1 {
    margin: 0;
    font-size: 1.2rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .topbar button {
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #0f172a;
    border-radius: 0.55rem;
    padding: 0.5rem 0.75rem;
    font-weight: 600;
  }

  .topbar .export {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #ffffff;
  }

  .topbar button:disabled {
    opacity: 0.65;
  }
</style>
