<script lang="ts">
  /**
   * Header aplikasi (Flowbite stacked layout):
   * - Fixed top (h-16), logo + company switcher + menu horizontal (di modul/sistem)
   * + notifikasi, theme toggle, apps grid, avatar dropdown, mobile hamburger.
   * State UI: dropdown open/close, mobile menu.
   * Logic: switch company, buka modul, toggle theme, logout.
   */
  import {
    user,
    companies,
    activeCompany,
    activeCompanyId,
    installedModules,
    setActiveCompany,
    logout,
    view,
    backToPanel,
    theme,
    toggleTheme,
    type Theme,
  } from "./store";
  import { api } from "./api";
  import { moduleDef, SYSTEM_MENUS } from "./modules";
  import Icon from "./Icon.svelte";

  let companyOpen = $state(false);
  let userOpen = $state(false);
  let appsOpen = $state(false);
  let mobileOpen = $state(false);
  let error = $state("");

  function goModulePage(page: string) {
    const v = $view;
    if (v.name === "module") view.set({ ...v, page });
    else if (v.name === "system")
      view.set({ ...v, page: page as "companies" | "users" | "roles" | "modules" });
    mobileOpen = false;
  }

  const isActive = (id: string) => {
    const v = $view;
    return (v.name === "module" || v.name === "system") && v.page === id;
  };

  function openModule(code: string) {
    const def = moduleDef(code);
    view.set({ name: "module", code, page: def.menus[0].id });
    appsOpen = mobileOpen = false;
  }

  function initial(name?: string | null) {
    return (name ?? "?").trim().charAt(0).toUpperCase();
  }

  async function switchTo(id: number) {
    error = "";
    companyOpen = false;
    try {
      const res = await api.switchCompany(id);
      setActiveCompany(res.data.companyId, res.data.token);
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<header>
  <nav class="fixed top-0 z-30 h-16 w-full border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto flex h-16 max-w-screen-2xl items-center justify-between">
      <div class="flex items-center justify-start">
        <!-- Logo: klik → kembali ke Panel -->
        <button class="mr-6 flex items-center" onclick={backToPanel} title="Ke Panel">
          <span class="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-lg font-bold text-white">O</span>
          <span class="hidden self-center text-2xl font-semibold whitespace-nowrap sm:flex dark:text-white">Ophelia</span>
        </button>

        <!-- Company switcher (dropdown) -->
        <div class="relative mr-4 hidden md:block">
          <button
            class="input flex w-auto items-center gap-2 !py-1.5"
            onclick={() => { companyOpen = !companyOpen; userOpen = appsOpen = false; }}
          >
            <span class="max-w-44 truncate font-medium">{$activeCompany?.name ?? "Pilih company"}</span>
            <span class="text-xs text-gray-400">▾</span>
          </button>
          {#if companyOpen}
            <!-- Dropdown daftar company (klik → switchTo) -->
            <div class="dropdown left-0 w-64 py-1">
              {#each $companies as c}
                <button class="dropdown-item flex items-center justify-between" onclick={() => switchTo(c.id)}>
                  <span class="truncate">{c.name} <span class="text-gray-400">· {c.code}</span></span>
                  {#if c.id === $activeCompanyId}<span class="text-green-600">●</span>{/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Desktop menu horizontal (hanya di dalam modul/sistem, bukan Panel) -->
        {#if $view.name !== "panel"}
          <div class="hidden w-full items-center justify-between lg:flex lg:w-auto">
            <ul class="mt-4 flex flex-col space-x-6 text-sm font-medium lg:mt-0 lg:flex-row xl:space-x-8">
              {#if $view.name === "module"}
                {#each moduleDef($view.code).menus as m}
                  <li>
                    <button
                      class="menu-link {isActive(m.id) ? 'menu-link-active' : ''}"
                      aria-current={isActive(m.id) ? "page" : undefined}
                      onclick={() => goModulePage(m.id)}>{m.label}</button
                    >
                  </li>
                {/each}
              {:else if $view.name === "system"}
                {#each SYSTEM_MENUS as m}
                  <li>
                    <button
                      class="menu-link {isActive(m.id) ? 'menu-link-active' : ''}"
                      aria-current={isActive(m.id) ? "page" : undefined}
                      onclick={() => goModulePage(m.id)}>{m.label}</button
                    >
                  </li>
                {/each}
              {/if}
            </ul>
          </div>
        {/if}
      </div>

      <div class="flex items-center justify-between">
        {#if error}<span class="mr-2 hidden text-xs text-red-600 xl:block">{error}</span>{/if}

        <!-- notifikasi -->
        <button type="button" class="icon-btn" title="Notifikasi">
          <span class="sr-only">Lihat notifikasi</span>
          <svg aria-hidden="true" class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
          </svg>
        </button>

        <!-- theme toggle -->
        <button type="button" class="icon-btn" title="Ganti tema gelap/terang" onclick={toggleTheme}>
          {#if $theme === "dark"}
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
          {:else}
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
          {/if}
        </button>

        <!-- apps / pindah modul -->
        <div class="relative">
          <button type="button" class="icon-btn" title="Pindah modul" onclick={() => { appsOpen = !appsOpen; companyOpen = userOpen = false; }}>
            <span class="sr-only">Lihat modul</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </button>
          {#if appsOpen}
            <div class="dropdown right-0 w-72 overflow-hidden">
              <div class="dropdown-header">Modul</div>
              <div class="grid grid-cols-3 gap-2 p-3">
                <button class="block rounded-lg p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-600" onclick={backToPanel}>
                  <Icon name="grid" size={28} cls="mx-auto mb-1 text-gray-400" />
                  <div class="text-xs text-gray-900 dark:text-white">Panel</div>
                </button>
                {#each $installedModules.filter((m) => m.isInstalled && m.code !== "base") as m}
                  {@const def = moduleDef(m.code)}
                  <button class="block rounded-lg p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-600" onclick={() => openModule(m.code)}>
                    <Icon name={def.icon} size={28} cls="mx-auto mb-1 text-gray-400" />
                    <div class="text-xs text-gray-900 dark:text-white">{def.name}</div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- user -->
        <div class="relative">
          <button
            type="button"
            class="mx-3 flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-300 md:mr-0 dark:focus:ring-gray-600"
            onclick={() => { userOpen = !userOpen; companyOpen = appsOpen = false; }}
          >
            <span class="sr-only">Buka menu user</span>
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-sm font-semibold text-white">
              {initial($user?.name)}
            </span>
          </button>
          {#if userOpen}
            <div class="dropdown right-0 w-56">
              <div class="px-4 py-3">
                <span class="block text-sm font-semibold text-gray-900 dark:text-white">{$user?.name}</span>
                <span class="block truncate text-sm font-light text-gray-500 dark:text-gray-400">{$user?.email}</span>
                <span class="mt-1 block text-xs text-gray-400">{$user?.roles.join(", ")}</span>
              </div>
              <ul class="py-1 font-light text-gray-500 dark:text-gray-400">
                <li><button class="dropdown-item" onclick={() => (userOpen = false)}>Profil saya</button></li>
                <li>
                  <button
                    class="dropdown-item"
                    onclick={() => { userOpen = false; view.set({ name: "system", page: "companies" }); }}
                  >
                    Company saya
                  </button>
                </li>
              </ul>
              <ul class="py-1 font-light text-gray-500 dark:text-gray-400">
                <li><button class="dropdown-item" onclick={logout}>Keluar</button></li>
              </ul>
            </div>
          {/if}
        </div>

        <!-- hamburger mobile -->
        <button
          type="button"
          class="icon-btn ml-1 lg:hidden"
          onclick={() => (mobileOpen = !mobileOpen)}
        >
          <span class="sr-only">Buka menu</span>
          <svg class="h-6 w-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- mobile menu -->
  {#if mobileOpen && $view.name !== "panel"}
    <nav class="fixed top-16 z-20 w-full bg-white lg:hidden dark:bg-gray-900">
      <ul class="w-full text-sm font-medium">
        <li class="border-b dark:border-gray-700">
          <button class="menu-link-mobile w-full text-left" onclick={backToPanel}>← Panel</button>
        </li>
        {#if $view.name === "module"}
          {#each moduleDef($view.code).menus as m}
            <li class="border-b dark:border-gray-700">
              <button
                class="menu-link-mobile w-full text-left {isActive(m.id) ? 'menu-link-active' : ''}"
                onclick={() => goModulePage(m.id)}>{m.label}</button
              >
            </li>
          {/each}
        {:else if $view.name === "system"}
          {#each SYSTEM_MENUS as m}
            <li class="border-b dark:border-gray-700">
              <button
                class="menu-link-mobile w-full text-left {isActive(m.id) ? 'menu-link-active' : ''}"
                onclick={() => goModulePage(m.id)}>{m.label}</button
              >
            </li>
          {/each}
        {/if}
        <li class="border-b px-4 py-3 dark:border-gray-700">
          <p class="mb-1 text-xs text-gray-400">Company aktif</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{$activeCompany?.name}</p>
        </li>
      </ul>
    </nav>
  {/if}
</header>
