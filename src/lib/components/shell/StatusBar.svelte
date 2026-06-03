<script lang="ts">
  import { parityStatusStore, clearParityExceptions } from '../../stores/statusStore'

  $: status = $parityStatusStore

  const kindClass: Record<string, string> = {
    info: 'status-info',
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error',
  }
</script>

{#if status}
  <div
    class="status-bar {kindClass[status.kind] ?? 'status-info'}"
    role="status"
    aria-live="polite"
    aria-label="Status notification"
  >
    <span class="status-message">{status.message}</span>
    <button
      type="button"
      class="dismiss-btn"
      onclick={clearParityExceptions}
      aria-label="Dismiss status"
    >
      ✕
    </button>
  </div>
{/if}

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.75rem;
    border-radius: 0.4rem;
    font-size: 0.82rem;
    gap: 0.5rem;
  }

  .status-info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
  }

  .status-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .status-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
  }

  .status-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .status-message {
    flex: 1;
  }

  .dismiss-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    color: inherit;
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
    opacity: 0.7;
  }

  .dismiss-btn:hover {
    opacity: 1;
  }
</style>
