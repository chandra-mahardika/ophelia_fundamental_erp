<script lang="ts">
  import { api, type Role, type Permission } from "./api";

  let roles: Role[] = $state([]);
  let permissions: Permission[] = $state([]);
  let error = $state("");
  let info = $state("");
  let newName = $state("");
  let editing: number | null = $state(null);
  let editName = $state("");
  let permEditing: number | null = $state(null);
  let draftPerms: number[] = $state([]);
  let busy = $state(false);

  async function load() {
    error = "";
    try {
      const [r, p] = await Promise.all([api.roles(), api.permissions()]);
      roles = r.data;
      permissions = p.data;
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function create() {
    if (!newName.trim()) return;
    busy = true;
    error = "";
    info = "";
    try {
      await api.createRole(newName.trim().toUpperCase());
      newName = "";
      await load();
      info = "Role dibuat.";
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }

  function startRename(r: Role) {
    editing = r.id;
    editName = r.name;
  }

  async function saveRename(id: number) {
    try {
      await api.updateRole(id, editName.trim().toUpperCase());
      editing = null;
      await load();
      info = "Role diperbarui.";
    } catch (e) {
      error = (e as Error).message;
    }
  }

  async function remove(r: Role) {
    error = "";
    info = "";
    try {
      await api.deleteRole(r.id);
      await load();
      info = `Role ${r.name} dihapus.`;
    } catch (e) {
      error = (e as Error).message;
    }
  }

  function startPerms(r: Role) {
    permEditing = r.id;
    draftPerms = r.permissions.map((p) => p.id);
  }

  function togglePerm(id: number) {
    draftPerms = draftPerms.includes(id)
      ? draftPerms.filter((p) => p !== id)
      : [...draftPerms, id];
  }

  async function savePerms(id: number) {
    try {
      await api.setRolePermissions(id, draftPerms);
      permEditing = null;
      await load();
      info = "Permission role diperbarui. User terkait perlu login ulang agar token-nya refresh.";
    } catch (e) {
      error = (e as Error).message;
    }
  }

  $effect(() => {
    load();
  });
</script>

<div class="space-y-4">
  <div>
    <h1 class="page-title">Roles & Permissions</h1>
    <p class="page-subtitle">Kelola role dan permission-nya (RBAC).</p>
  </div>

  {#if error}<p class="alert-error">{error}</p>{/if}
  {#if info}<p class="alert-success">{info}</p>{/if}

  <div class="card">
    <form class="flex flex-wrap items-end gap-3" onsubmit={(e) => { e.preventDefault(); create(); }}>
      <div>
        <label class="label" for="rname">Nama role baru (kapital, cth. MANAGER)</label>
        <input id="rname" class="input sm:w-64" bind:value={newName} placeholder="NAMA_ROLE" required />
      </div>
      <button class="btn-primary" disabled={busy} type="submit">Buat role</button>
    </form>
  </div>

  <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
    {#each roles as r}
      <div class="card">
        <div class="flex items-center justify-between gap-2">
          {#if editing === r.id}
            <input class="input !w-48" bind:value={editName} />
            <div class="flex gap-2">
              <button class="btn-primary !px-3 !py-1.5 !text-xs" onclick={() => saveRename(r.id)}>Simpan</button>
              <button class="btn-default !px-3 !py-1.5 !text-xs" onclick={() => (editing = null)}>Batal</button>
            </div>
          {:else}
            <div class="flex items-center gap-2">
              <p class="text-base font-semibold text-gray-900 dark:text-white">{r.name}</p>
              <span class="badge-gray">{r.userCount} user</span>
            </div>
            <div class="flex gap-2">
              <button class="link" onclick={() => startRename(r)}>Ubah nama</button>
              <button class="btn-danger" onclick={() => remove(r)}>Hapus</button>
            </div>
          {/if}
        </div>

        <div class="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions ({r.permissions.length})</p>
            {#if permEditing === r.id}
              <div class="flex gap-2">
                <button class="btn-primary !px-3 !py-1.5 !text-xs" onclick={() => savePerms(r.id)}>Simpan</button>
                <button class="btn-default !px-3 !py-1.5 !text-xs" onclick={() => (permEditing = null)}>Batal</button>
              </div>
            {:else}
              <button class="link" onclick={() => startPerms(r)}>Ubah</button>
            {/if}
          </div>
          {#if permEditing === r.id}
            <div class="flex flex-wrap gap-2">
              {#each permissions as p}
                <label class="flex cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    class="h-3.5 w-3.5 rounded"
                    checked={draftPerms.includes(p.id)}
                    onchange={() => togglePerm(p.id)}
                  />
                  {p.name}
                </label>
              {/each}
            </div>
          {:else}
            <div class="flex flex-wrap gap-1">
              {#each r.permissions as p}
                <span class="badge-blue">{p.name}</span>
              {:else}
                <span class="text-xs text-gray-400">Belum ada permission.</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
