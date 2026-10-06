<script lang="ts">
  import { api, type ManagedUser, type Role } from "./api";
  import { user as currentUser, companies } from "./store";
  import Icon from "./Icon.svelte";
  import Select from "./Select.svelte";

  let users: ManagedUser[] = $state([]);
  let roles: Role[] = $state([]);
  let error = $state("");
  let info = $state("");

  // filter
  let search = $state("");
  let roleFilter = $state("");
  let debounce: ReturnType<typeof setTimeout> | null = null;

  // edit roles inline
  let editing: number | null = $state(null);
  let draftRoles: number[] = $state([]);

  // modal edit user
  let modalUser: ManagedUser | null = $state(null);
  let fName = $state("");
  let fUsername = $state("");
  let fEmail = $state("");
  let fPassword = $state("");
  let showPassword = $state(false);
  let saving = $state(false);

  // modal create user
  let createModalOpen = $state(false);
  let cName = $state("");
  let cUsername = $state("");
  let cEmail = $state("");
  let cPassword = $state("");
  let cShowPassword = $state(false);
  let cSaving = $state(false);
  let cRoleIds: number[] = $state([]);
  let cCompanyId = $state("");
  let cError = $state("");
  let cInfo = $state("");

  async function load() {
    error = "";
    try {
      const [u, r] = await Promise.all([
        api.users({ search: search.trim() || undefined, role: roleFilter || undefined }),
        api.roles(),
      ]);
      users = u.data;
      roles = r.data;
    } catch (e) {
      error = (e as Error).message;
    }
  }

  function onFilterInput() {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(load, 300);
  }

  function startEdit(u: ManagedUser) {
    editing = u.id;
    draftRoles = u.userRoles.map((ur) => ur.role.id);
    info = "";
  }

  function toggleRole(id: number) {
    draftRoles = draftRoles.includes(id)
      ? draftRoles.filter((r) => r !== id)
      : [...draftRoles, id];
  }

  async function saveRoles(id: number) {
    error = "";
    info = "";
    try {
      await api.setUserRoles(id, draftRoles);
      editing = null;
      await load();
      info = "Role user diperbarui.";
    } catch (e) {
      error = (e as Error).message;
    }
  }

  function openModal(u: ManagedUser) {
    modalUser = u;
    fName = u.name;
    fUsername = u.username;
    fEmail = u.email;
    fPassword = "";
    showPassword = false;
    error = "";
  }

  function closeModal() {
    modalUser = null;
  }

  function openCreateModal() {
    cName = "";
    cUsername = "";
    cEmail = "";
    cPassword = "";
    cShowPassword = false;
    cRoleIds = [];
    cCompanyId = "";
    cError = "";
    cInfo = "";
    createModalOpen = true;
  }

  function closeCreateModal() {
    createModalOpen = false;
  }

  async function saveCreateModal() {
    cSaving = true;
    cError = "";
    cInfo = "";
    try {
      await api.createUser({
        name: cName.trim(),
        username: cUsername.trim(),
        email: cEmail.trim(),
        password: cPassword,
        roleIds: cRoleIds,
        companyId: cCompanyId ? Number(cCompanyId) : undefined,
      });
      closeCreateModal();
      await load();
      info = "User berhasil dibuat.";
    } catch (e) {
      cError = (e as Error).message;
    } finally {
      cSaving = false;
    }
  }

  async function saveModal() {
    if (!modalUser) return;
    saving = true;
    error = "";
    info = "";
    try {
      const payload: { name: string; username: string; email: string; password?: string } = {
        name: fName.trim(),
        username: fUsername.trim(),
        email: fEmail.trim(),
      };
      if (fPassword) payload.password = fPassword;
      await api.updateUser(modalUser.id, payload);
      closeModal();
      await load();
      info = "User diperbarui.";
    } catch (e) {
      error = (e as Error).message;
    } finally {
      saving = false;
    }
  }

  async function remove(u: ManagedUser) {
    if (u.id === $currentUser?.id) {
      error = "Tidak bisa menghapus akun sendiri.";
      return;
    }
    error = "";
    info = "";
    try {
      await api.deleteUser(u.id);
      await load();
      info = `User ${u.username} dihapus.`;
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
    <h1 class="page-title">Users</h1>
    <p class="page-subtitle">Kelola user, role, & data akun. User baru berasal dari halaman registrasi.</p>
  </div>

  {#if error}<p class="alert-error">{error}</p>{/if}
  {#if info}<p class="alert-success">{info}</p>{/if}

  <!-- filter + tombol tambah -->
  <div class="card flex flex-col gap-3 sm:flex-row sm:items-end">
    <div class="flex-1">
      <label class="label" for="q">Cari nama / username / email</label>
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg class="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <input
          id="q"
          class="input pl-10"
          placeholder="Cari user..."
          bind:value={search}
          oninput={onFilterInput}
        />
      </div>
    </div>
    <div class="sm:w-56">
      <Select
        id="rolefilter"
        label="Filter role"
        placeholder="Semua role"
        bind:value={roleFilter}
        options={roles.map((r) => ({ value: String(r.id), label: r.name }))}
        onchange={load}
      />
    </div>
    <div class="sm:w-auto">
      <button class="btn-primary" onclick={openCreateModal}>Tambah User</button>
    </div>
  </div>

  <div class="card !p-0 overflow-hidden">
    <div class="table-wrap !rounded-none !border-0">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Nama</th><th scope="col">Username</th><th scope="col">Email</th>
            <th scope="col">Roles</th><th scope="col"><span class="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          {#each users as u}
            <tr>
              <th scope="row" class="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">{u.name}</th>
              <td class="px-4 py-3">{u.username}</td>
              <td class="px-4 py-3">{u.email}</td>
              <td class="px-4 py-3">
                {#if editing === u.id}
                  <div class="flex flex-wrap gap-2">
                    {#each roles as r}
                      <label class="flex cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600">
                        <input
                          type="checkbox"
                          class="h-3.5 w-3.5 rounded"
                          checked={draftRoles.includes(r.id)}
                          onchange={() => toggleRole(r.id)}
                        />
                        {r.name}
                      </label>
                    {/each}
                  </div>
                {:else}
                  <div class="flex flex-wrap gap-1">
                    {#each u.userRoles as ur}
                      <span class="badge-blue">{ur.role.name}</span>
                    {:else}
                      <span class="badge-gray">tanpa role</span>
                    {/each}
                  </div>
                {/if}
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                {#if editing === u.id}
                  <button class="btn-primary mr-2 !px-3 !py-1.5 !text-xs" onclick={() => saveRoles(u.id)}>Simpan</button>
                  <button class="btn-default !px-3 !py-1.5 !text-xs" onclick={() => (editing = null)}>Batal</button>
                {:else}
                  <button class="link mr-3" onclick={() => openModal(u)}>Edit</button>
                  <button class="link mr-3" onclick={() => startEdit(u)}>Role</button>
                  <button class="btn-danger" onclick={() => remove(u)}>Hapus</button>
                {/if}
              </td>
            </tr>
          {:else}
            <tr><td colspan="5" class="px-4 py-8 text-center text-gray-400">Tidak ada user yang cocok.</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- modal edit user -->
{#if modalUser}
  <div class="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4" role="dialog" aria-modal="true">
    <div class="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-start justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Edit user — {modalUser.username}</h3>
        <button
          type="button"
          class="icon-btn"
          onclick={closeModal}
        >
          <span class="sr-only">Tutup</span>
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <form
        class="space-y-4 p-6"
        onsubmit={(e) => { e.preventDefault(); saveModal(); }}
      >
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="m-name">Nama</label>
            <input id="m-name" class="input" bind:value={fName} required minlength={3} />
          </div>
          <div>
            <label class="label" for="m-username">Username</label>
            <input id="m-username" class="input" bind:value={fUsername} required minlength={3} />
          </div>
        </div>
        <div>
          <label class="label" for="m-email">Email</label>
          <input id="m-email" class="input" type="email" bind:value={fEmail} required />
        </div>
        <div>
          <label class="label" for="m-password">Password baru (kosongkan bila tidak diubah)</label>
          <div class="relative">
            <input
              id="m-password"
              class="input pr-11"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              bind:value={fPassword}
              minlength={6}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onclick={() => (showPassword = !showPassword)}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 rounded-b border-t border-gray-200 pt-4 dark:border-gray-700">
          <button type="button" class="btn-default" onclick={closeModal}>Batal</button>
          <button type="submit" class="btn-primary" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- modal create user -->
{#if createModalOpen}
  <div class="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4" role="dialog" aria-modal="true">
    <div class="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div class="flex items-start justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Buat User Baru</h3>
        <button
          type="button"
          class="icon-btn"
          onclick={closeCreateModal}
        >
          <span class="sr-only">Tutup</span>
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <form
        class="space-y-4 p-6"
        onsubmit={(e) => { e.preventDefault(); saveCreateModal(); }}
      >
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="c-name">Nama</label>
            <input id="c-name" class="input" bind:value={cName} required minlength={3} />
          </div>
          <div>
            <label class="label" for="c-username">Username</label>
            <input id="c-username" class="input" bind:value={cUsername} required minlength={3} />
          </div>
        </div>
        <div>
          <label class="label" for="c-email">Email</label>
          <input id="c-email" class="input" type="email" bind:value={cEmail} required />
        </div>
        <div>
          <label class="label" for="c-password">Password</label>
          <div class="relative">
            <input
              id="c-password"
              class="input pr-11"
              placeholder="••••••••"
              type={cShowPassword ? "text" : "password"}
              bind:value={cPassword}
              minlength={6}
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title={cShowPassword ? "Sembunyikan password" : "Tampilkan password"}
              onclick={() => (cShowPassword = !cShowPassword)}
            >
              <Icon name={cShowPassword ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
        </div>
        <div>
          <label class="label" for="c-roles">Role(s)</label>
          <div class="flex flex-wrap gap-2">
            {#each roles as r}
              <label class="flex cursor-pointer items-center gap-1.5 rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600">
                <input
                  type="checkbox"
                  class="h-3.5 w-3.5 rounded"
                  checked={cRoleIds.includes(r.id)}
                  onchange={() => {
                    cRoleIds = cRoleIds.includes(r.id)
                      ? cRoleIds.filter((id) => id !== r.id)
                      : [...cRoleIds, r.id];
                  }}
                />
                {r.name}
              </label>
            {/each}
          </div>
        </div>
        <div>
          <label class="label" for="c-company">Company (opsional)</label>
          <Select
            id="c-company"
            placeholder="Pilih company"
            bind:value={cCompanyId}
            options={[
              { value: "", label: "— Tanpa company —" },
              ...$companies.map((c: { id: number; name: string }) => ({ value: String(c.id), label: c.name }))
            ]}
          />
        </div>
        <div class="flex items-center justify-end gap-2 rounded-b border-t border-gray-200 pt-4 dark:border-gray-700">
          {#if cError}<p class="alert-error mr-auto text-sm">{cError}</p>{/if}
          {#if cInfo}<p class="alert-success mr-auto text-sm">{cInfo}</p>{/if}
          <button type="button" class="btn-default" onclick={closeCreateModal}>Batal</button>
          <button type="submit" class="btn-primary" disabled={cSaving}>
            {cSaving ? "Membuat..." : "Buat user"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
