<script lang="ts">
  import { api } from "./api";
  import { saveSession } from "./store";
  import Icon from "./Icon.svelte";

  let username = $state("admin");
  let password = $state("password123");
  let showPassword = $state(false);
  let mode: "login" | "register" = $state("login");
  let name = $state("");
  let email = $state("");
  let error = $state("");
  let loading = $state(false);

  async function submit() {
    loading = true;
    error = "";
    try {
      if (mode === "register") {
        await api.register({ name, username, email, password });
      }
      const login = await api.login(username, password);
      saveSession(login.data.token, login.data.user, login.data.user.defaultCompanyId);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 pt-8 sm:pt-0 dark:bg-gray-900">
  <button class="mb-6 flex items-center" onclick={() => (mode = "login")}>
    <span class="mr-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-lg font-bold text-white">O</span>
    <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Ophelia ERP</span>
  </button>

  <div class="w-full max-w-xl space-y-8 rounded-lg border border-gray-200 bg-white p-6 shadow-xl sm:p-8 dark:border-gray-700 dark:bg-gray-800">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      {mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}
    </h2>

    <div class="mb-2 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
      <button
        class="flex-1 rounded-md py-2 text-sm font-medium transition {mode === 'login' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}"
        onclick={() => (mode = "login")}>Masuk</button
      >
      <button
        class="flex-1 rounded-md py-2 text-sm font-medium transition {mode === 'register' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}"
        onclick={() => (mode = "register")}>Daftar</button
      >
    </div>

    <form class="space-y-6" onsubmit={(e) => { e.preventDefault(); submit(); }}>
      {#if mode === "register"}
        <div>
          <label class="label" for="name">Nama lengkap</label>
          <input id="name" class="input" placeholder="Nama Anda" bind:value={name} required />
        </div>
        <div>
          <label class="label" for="email">Email</label>
          <input id="email" class="input" placeholder="nama@perusahaan.com" type="email" bind:value={email} required />
        </div>
      {/if}
      <div>
        <label class="label" for="username">Username</label>
        <input id="username" class="input" placeholder="username" bind:value={username} required />
      </div>
      <div>
        <label class="label" for="password">Password</label>
        <div class="relative">
          <input
            id="password"
            class="input pr-11"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            bind:value={password}
            required
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
      {#if error}<p class="alert-error">{error}</p>{/if}
      <button class="btn-primary w-full" disabled={loading} type="submit">
        {loading ? "Memproses..." : mode === "login" ? "Masuk ke dashboard" : "Daftar + buat company"}
      </button>
      <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
        {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
        <button type="button" class="link" onclick={() => (mode = mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
        </button>
      </div>
    </form>
    {#if mode === "register"}
      <p class="text-xs text-gray-400">Pendaftaran otomatis membuat personal company + modul dasar.</p>
    {/if}
  </div>
</div>
