<script lang="ts">
  import { onMount } from 'svelte'
  import EditorShell from '../lib/components/shell/EditorShell.svelte'
  import { bootstrapRestore } from '../lib/services/persistence/restore'

  onMount(() => {
    bootstrapRestore()
  })
</script>

<EditorShell />
