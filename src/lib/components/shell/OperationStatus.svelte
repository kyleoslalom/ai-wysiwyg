<script lang="ts">
  import { operationStatusStore } from '../../stores/status'

  $: statuses = $operationStatusStore
  $: latestMessage = [
    statuses.autosave.message,
    statuses.restore.message,
    statuses.export.message,
    statuses.validation.message,
  ]
    .filter((entry): entry is string => Boolean(entry))
    .at(-1) ?? 'Ready'
</script>

<div class="operation-status" aria-live="polite" aria-atomic="true" role="status" data-testid="operation-status">
  {latestMessage}
</div>

<style>
  .operation-status {
    font-size: 0.85rem;
    color: #334155;
    padding: 0.35rem 0.5rem;
    border-radius: 0.4rem;
    background: #f1f5f9;
  }
</style>
