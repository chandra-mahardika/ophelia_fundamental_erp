<script lang="ts">
  import { api, type AppModule } from "./api";
  import { user, activeCompany, installedModules, view, enterModule } from "./store";
  import { moduleDef } from "./modules";
  import Icon from "./Icon.svelte";

  let catalog: AppModule[] = $state([]);
  let error = $state("");

  async function loadCatalog() {
    try {
      const res = await api.catalog();
      catalog = res.data.filter((c) => c.code !== "base");
    } catch (e) {
      error = (e as Error).message;
    }
  }

  function isInstalled(code: string) {
    return $installedModules.some((m) => m.code === code && m.isInstalled);
  }

  function openModule(code: string) {
    if (isInstalled(code)) {
      const def = moduleDef(code);
      enterModule(code, def.menus[0].id);
    } else {
      // Install hanya lewat Pengaturan -> Modul
      view.set({ name: "system", page: "modules" });
    }
  }

  function openSystem(page: "companies" | "users" | "roles" | "modules") {
    view.set({ name: "system", page });
  }

  $effect(() => {
    loadCatalog();
  });
</script>

<main class="mx-auto max-w-screen-2xl p-4">
  <div class="mb-6">
    <h1 class="page-title">Panel</h1>
    <p class="page-subtitle">
      Selamat datang, <span class="font-medium">{$user?.name}</span> —
      company aktif <span class="font-medium">{$activeCompany?.name}</span>. Klik kartu modul untuk masuk.
    </p>
  </div>

  {#if error}<p class="alert-error mx-auto mb-4 max-w-2xl">{error}</p>{/if}

  <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
    {#each catalog as c}
      {@const def = moduleDef(c.code)}
      {@const installed = isInstalled(c.code)}
      <button
        class="card flex cursor-pointer flex-col items-center py-7 text-center transition hover:shadow-md {installed ? '' : 'opacity-75'}"
        onclick={() => openModule(c.code)}
        title={installed ? `Masuk ke ${def.name}` : `${def.name} belum di-install — kelola di Pengaturan Modul`}
      >
        <span class="mb-3 flex h-16 w-16 items-center justify-center rounded-full {def.tint} {def.solid}">
          <Icon name={def.icon} size={30} />
        </span>
        <div class="text-base font-semibold text-gray-900 dark:text-white">{def.name}</div>
        <div class="mt-1 mb-3 text-sm font-light text-gray-500 dark:text-gray-400">{c.description ?? def.subtitle}</div>
        <span class="badge-green">Modul</span>
      </button>
    {/each}

    <button
      class="card flex cursor-pointer flex-col items-center py-7 text-center transition hover:shadow-md"
      onclick={() => openSystem("companies")}
    >
      <span class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
        <Icon name="building" size={30} />
      </span>
      <div class="text-base font-semibold text-gray-900 dark:text-white">Companies</div>
      <div class="mt-1 mb-3 text-sm font-light text-gray-500 dark:text-gray-400">Multi-company & akses</div>
      <span class="badge-blue">Sistem</span>
    </button>

    <button
      class="card flex cursor-pointer flex-col items-center py-7 text-center transition hover:shadow-md"
      onclick={() => openSystem("users")}
    >
      <span class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
        <Icon name="users" size={30} />
      </span>
      <div class="text-base font-semibold text-gray-900 dark:text-white">Users</div>
      <div class="mt-1 mb-3 text-sm font-light text-gray-500 dark:text-gray-400">User & Role Management</div>
      <span class="badge-blue">Sistem</span>
    </button>

    <button
      class="card flex cursor-pointer flex-col items-center py-7 text-center transition hover:shadow-md"
      onclick={() => openSystem("modules")}
    >
      <span class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        <Icon name="gear" size={30} />
      </span>
      <div class="text-base font-semibold text-gray-900 dark:text-white">Pengaturan</div>
      <div class="mt-1 mb-3 text-sm font-light text-gray-500 dark:text-gray-400">Install & modul</div>
      <span class="badge-blue">Sistem</span>
    </button>
  </div>
</main>
