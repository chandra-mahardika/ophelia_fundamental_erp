<script lang="ts">
  export interface SelectOption {
    value: string;
    label: string;
  }

  let {
    value = $bindable(""),
    options = [],
    id = "",
    label = "",
    placeholder = "Pilih...",
    cls = "",
    onchange = undefined,
  }: {
    value: string;
    options: SelectOption[];
    id?: string;
    label?: string;
    placeholder?: string;
    cls?: string;
    onchange?: (() => void) | undefined;
  } = $props();

  let open = $state(false);
  let root: HTMLDivElement | null = $state(null);

  const selected = $derived(options.find((o) => o.value === value) ?? null);

  function toggle() {
    open = !open;
  }

  function choose(v: string) {
    if (v !== value) {
      value = v;
      onchange?.();
    }
    open = false;
  }

  function onWindowClick(e: MouseEvent) {
    if (open && root && !root.contains(e.target as Node)) open = false;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") open = false;
  }
</script>

<svelte:window onclick={onWindowClick} onkeydown={onKey} />

<div class={cls} bind:this={root}>
  {#if label}
    <label class="label" for={id}>{label}</label>
  {/if}
  <div class="relative">
    <button
      type="button"
      {id}
      aria-haspopup="listbox"
      aria-expanded={open}
      onclick={toggle}
      class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-left text-sm transition outline-none focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 {value
        ? 'text-gray-900 dark:text-white'
        : 'text-gray-400 dark:text-gray-500'}"
    >
      <span class="truncate">{selected?.label ?? placeholder}</span>
      <svg
        class="h-4 w-4 shrink-0 text-gray-400 transition-transform dark:text-gray-500 {open ? 'rotate-180' : ''}"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>

    {#if open}
      <ul
        role="listbox"
        class="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-700"
      >
        {#if !selected && placeholder}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              class="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-600"
              onclick={() => choose("")}
            >
              {placeholder}
            </button>
          </li>
        {/if}
        {#each options as o}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={o.value === value}
              class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 {o.value === value
                ? 'font-medium text-primary-700 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300'}"
              onclick={() => choose(o.value)}
            >
              <span class="truncate">{o.label}</span>
              {#if o.value === value}
                <svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              {/if}
            </button>
          </li>
        {:else}
          <li class="px-4 py-2 text-sm text-gray-400">Tidak ada pilihan.</li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
