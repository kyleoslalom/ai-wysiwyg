<script lang="ts">
  export let visible = false
  export let message = 'Storage is full. Autosave paused until you free browser storage.'
  export let onRetry: () => void
</script>

{#if visible}
  <aside class="storage-status" role="status" aria-live="polite">
    <p>{message}</p>
    <button type="button" onclick={onRetry}>Retry Autosave</button>
  </aside>
{/if}

<style>
  .storage-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border: 1px solid #dc2626;
    background: #fef2f2;
    color: #991b1b;
    border-radius: 0.6rem;
    padding: 0.6rem 0.8rem;
    margin: 0.8rem 1rem 0;
  }

  .storage-status button {
    border: 1px solid #b91c1c;
    background: #fff;
    color: #991b1b;
    border-radius: 0.5rem;
    padding: 0.35rem 0.55rem;
  }
</style>
