<script lang="ts">
  import EditorShell from './lib/components/shell/EditorShell.svelte'
  import { bootstrapRestore } from './lib/services/persistence/restore'

  bootstrapRestore()
</script>

<EditorShell />
