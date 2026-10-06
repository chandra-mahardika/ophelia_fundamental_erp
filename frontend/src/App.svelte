<script lang="ts">
  /**
   * Root komponen: routing sisi client berdasar `store.view` + `store.token`.
   * - Belum login → Login.svelte
   * - Login → Panel (grid kartu modul) atau modul/sistem (Header + Menu + konten).
   * Bootstrap: pasca-load ambil companies + modul ter-install utk company aktif.
   */
  import { onMount } from "svelte";
  import Login from "./lib/Login.svelte";
  import Header from "./lib/Header.svelte";
  import Panel from "./lib/Panel.svelte";
  import Companies from "./lib/Companies.svelte";
  import Users from "./lib/Users.svelte";
  import Roles from "./lib/Roles.svelte";
  import Modules from "./lib/Modules.svelte";
  import PlaceholderPage from "./lib/PlaceholderPage.svelte";
  import { api } from "./lib/api";
  import { moduleDef } from "./lib/modules";
  import {
    token,
    user,
    companies,
    activeCompanyId,
    installedModules,
    view,
    saveSession,
  } from "./lib/store";

  /**
   * Bootstrap pasca-mount (hanya bila sudah login):
   * 1. Ambil company milik user → isi store `companies`.
   * 2. Tentukan company aktif (pakai yg tersimpan, fallback defaultCompanyId).
   * 3. Ambil modul ter-install utk company aktif → `installedModules`.
   * Bila token invalid → diam (tunggu login ulang manual).
   */
  async function bootstrap() {
    if (!$token) return;
    try {
      const me = await api.myCompanies();
      companies.set(me.data);
      let cid = $activeCompanyId;
      if (!cid || !me.data.some((c) => c.id === cid)) {
        cid = $user?.defaultCompanyId ?? me.data[0]?.id ?? null;
        if ($user && cid) saveSession($token, { ...$user, companies: me.data }, cid);
      }
      if (cid) {
        const mods = await api.modules(cid);
        installedModules.set(mods.data);
      }
    } catch {
      // Token invalid/kadaluarsa — user bisa login ulang manual
    }
  }

  onMount(bootstrap);

  /**
   * Reactive: tiap ganti `activeCompanyId` (switch company) → refresh modul ter-install.
   * `$activeCompanyId` dummy read → trigger effect.
   */
  $effect(() => {
    void $activeCompanyId;
    if ($token && $activeCompanyId) {
      api.modules($activeCompanyId).then(
        (r) => installedModules.set(r.data),
        () => {},
      );
    }
  });
</script>

{#if !$token}
  <!-- Belum login → halaman login -->
  <Login />
{:else}
  <!-- Sudah login → shell aplikasi (header + konten) -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <!-- Header fixed h-16 → padding-top pt-16 utk konten -->
    <div class="pt-16">
      {#if $view.name === "panel"}
        <!-- Landing: grid kartu modul + sistem -->
        <Panel />
      {:else}
        <!-- Di dalam modul/sistem: header sudah ada, render konten per view -->
        <main class="mx-auto max-w-screen-2xl p-4">
          {#if $view.name === "system" && $view.page === "companies"}
            <Companies />
          {:else if $view.name === "system" && $view.page === "users"}
            <Users />
          {:else if $view.name === "system" && $view.page === "roles"}
            <Roles />
          {:else if $view.name === "system" && $view.page === "modules"}
            <Modules />
          {:else if $view.name === "module"}
            {@const def = moduleDef($view.code)}
            {@const label = def.menus.find((m) => m.id === $view.page)?.label ?? $view.page}
            <PlaceholderPage code={$view.code} pageLabel={label} />
          {/if}
        </main>
      {/if}
    </div>
  </div>
{/if}
