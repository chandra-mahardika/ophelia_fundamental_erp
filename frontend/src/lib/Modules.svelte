<script lang="ts">
  import { api, type AppModule } from "./api";
  import { activeCompany, activeCompanyId, installedModules } from "./store";
  import { moduleDef } from "./modules";
  import Icon from "./Icon.svelte";

  let mods: AppModule[] = $state([]);
  let error = $state("");
  let busy: string | null = $state(null);

  async function load() {
    error = "";
    const cid = $activeCompanyId;
    if (!cid) {
      error = "Pilih company aktif dulu.";
      return;
    }
    try {
      const res = await api.modules(cid);
      mods = res.data;
      installedModules.set(res.data);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function toggle(m: AppModule) {
    const cid = $activeCompanyId;
    if (!cid) return;
    busy = m.code;
    try {
      if (m.isInstalled) await api.uninstallModule(cid, m.code);
      else await api.installModule(cid, m.code);
      await load();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = null;
    }
  }

  $effect(() => {
    void $activeCompanyId;
    load();
  });
</script>

<div class="space-y-4">
  <div>
    <h1 class="page-title">Modul</h1>
    <p class="page-subtitle">Install / uninstall modul di {$activeCompany?.name}</p>
  </div>

  {#if error}<p class="alert-error">{error}</p>{/if}

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    {#each mods as m}
      {@const def = moduleDef(m.code)}
      <div class="card flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full {def.tint} {def.solid}">
            <Icon name={def.icon} size={24} />
          </span>
          <div>
            <p class="text-base font-semibold text-gray-900 dark:text-white">
              {m.name} <span class="text-xs font-normal text-gray-400">v{m.version}</span>
            </p>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">{m.description}</p>
            <p class="mt-0.5">
              {#if m.isInstalled}
                <span class="badge-green">Ter-install</span>
              {:else}
                <span class="badge-gray">Belum di-install</span>
              {/if}
            </p>
          </div>
        </div>
        <button
          class={m.isInstalled ? "btn-default !px-3 !py-1.5 !text-xs" : "btn-primary !px-3 !py-1.5 !text-xs"}
          disabled={busy === m.code || m.code === "base"}
          title={m.code === "base" ? "Modul base tidak bisa di-uninstall" : ""}
          onclick={() => toggle(m)}
        >
          {busy === m.code ? "..." : m.isInstalled ? "Uninstall" : "Install"}
        </button>
      </div>
    {/each}
  </div>
</div>
