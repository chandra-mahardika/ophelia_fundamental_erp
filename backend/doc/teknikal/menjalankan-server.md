# Menjalankan Server

Pastikan `.env` sudah diisi (lihat `.env.example`) dan dependencies ter-install (`npm install`).

## Development (hot reload)

```powershell
npm.cmd run dev
```

Server berjalan di `http://localhost:3000` dan otomatis restart saat file di `src/` berubah.

## Build (production)

```powershell
npm.cmd run build
npm.cmd start
```

Hasil kompilasi ada di `dist/`.

## Cek server jalan

```powershell
curl http://localhost:3000/health
```

(Endpoint `/health` mengembalikan `{"status":"ok"}` — artinya server sudah menyala.)
