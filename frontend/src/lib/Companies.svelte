<script lang="ts">
  import { api } from "./api";
  import { companies, setActiveCompany, activeCompanyId, user } from "./store";

  let name = $state("");
  let code = $state("");
  let error = $state("");
  let info = $state("");
  let loading = $state(false);

  async function refresh() {
    error = "";
    try {
      const res = await api.myCompanies();
      companies.set(res.data);
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function create() {
    loading = true;
    error = "";
    info = "";
    try {
      const res = await api.createCompany({ name, code });
      name = "";
      code = "";
      await refresh();
      info = `Company ${res.data.name} dibuat + modul dasar ter-install.`;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function activate(id: number) {
    error = "";
    try {
      const res = await api.setDefaultCompany(id);
      setActiveCompany(res.data.companyId, res.data.token);
      const me = await api.myCompanies();
      companies.set(me.data);
      const u = $user;
      if (u) {
        const updated = { ...u, companies: me.data };
        localStorage.setItem("ophe_user", JSON.stringify(updated));
        user.set(updated);
      }
    } catch (e) {
      error = (e as Error).message;
    }
  }
</script>

<div class="space-y-4">
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="page-title">Companies</h1>
      <p class="page-subtitle">Kelola company & company aktif</p>
    </div>
    <button class="link" onclick={refresh}>Muat ulang daftar</button>
  </div>

  {#if error}<p class="alert-error">{error}</p>{/if}
  {#if info}<p class="alert-success">{info}</p>{/if}

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    {#each $companies as c}
      <div class="card flex items-center justify-between">
        <div>
          <p class="text-base font-semibold text-gray-900 dark:text-white">{c.name}</p>
          <p class="text-sm font-light text-gray-500 dark:text-gray-400">{c.code}</p>
        </div>
        {#if c.id === $activeCompanyId}
          <span class="badge-green">Aktif</span>
        {:else}
          <button class="btn-primary !px-3 !py-1.5 !text-xs" onclick={() => activate(c.id)}>Aktifkan</button>
        {/if}
      </div>
    {/each}
  </div>

  <div class="card">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Buat company baru</h2>
    <form class="flex flex-wrap items-end gap-3" onsubmit={(e) => { e.preventDefault(); create(); }}>
      <div>
        <label class="label" for="cname">Nama company</label>
        <input id="cname" class="input sm:w-56" bind:value={name} required />
      </div>
      <div>
        <label class="label" for="ccode">Kode (unik)</label>
        <input id="ccode" class="input sm:w-36" bind:value={code} required />
      </div>
      <button class="btn-primary" disabled={loading} type="submit">Buat company</button>
    </form>
  </div>
</div>
