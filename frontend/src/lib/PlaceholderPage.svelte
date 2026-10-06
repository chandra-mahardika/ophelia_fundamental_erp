<script lang="ts">
  import { moduleDef } from "./modules";
  import Icon from "./Icon.svelte";

  let { code, pageLabel }: { code: string; pageLabel: string } = $props();
  const def = $derived(moduleDef(code));
</script>

<div class="card mx-auto max-w-xl py-12 text-center">
  <span class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full {def.tint} {def.solid}">
    <Icon name={def.icon} size={30} />
  </span>
  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{def.name} — {pageLabel}</h2>
  <p class="mx-auto mt-2 max-w-sm text-sm font-light text-gray-500 dark:text-gray-400">
    Modul <span class="font-medium">{def.name}</span> sudah ter-install di company ini.
    Halaman {pageLabel} masih dalam pengembangan — endpoint backend menyusul.
  </p>
</div>
