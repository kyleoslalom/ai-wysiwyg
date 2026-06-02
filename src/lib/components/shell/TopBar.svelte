<script lang="ts">
  export let projectName: string
  export let isExporting = false
  export let onExport: () => void
</script>

<header class="topbar">
  <h1>{projectName}</h1>
  <button type="button" onclick={onExport} disabled={isExporting} aria-label="Export static zip">
    {#if isExporting}
      Exporting...
    {:else}
      Export ZIP
    {/if}
  </button>
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

  .topbar button {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #ffffff;
    border-radius: 0.55rem;
    padding: 0.5rem 0.75rem;
    font-weight: 600;
  }

  .topbar button:disabled {
    opacity: 0.65;
  }
</style>
