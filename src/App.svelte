<script lang="ts">
  import EditorShell from './lib/components/shell/EditorShell.svelte'
  import { initializeRegistry } from './lib/stores/projects'

  initializeRegistry()
</script>

<EditorShell />
