# Prisma (Database)

## Generate Prisma Client

Wajib dijalankan setelah mengubah `prisma/schema.prisma`:

```powershell
npm.cmd run prisma:generate
```

Atau terintegrasi otomatis saat `migrate`.

## Migrasi (membuat/mengubah tabel)

```powershell
npm.cmd run prisma:migrate
# lalu isi nama migrasi, mis. "init", "add_category"
```

File SQL hasilnya ada di `prisma/migrations/<timestamp>_<nama>/migration.sql`.

## Prisma Studio (GUI)

Melihat & mengedit data langsung di browser:

```powershell
npx.cmd prisma studio
```

## Reset database (development saja)

Menghapus semua data & menjalankan ulang semua migrasi:

```powershell
npx.cmd prisma migrate reset
```

## Membuat user ADMIN pertama

Registrasi selalu membuat role `USER`. Ubah jadi ADMIN:

```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'email@kamu.com';
```

Atau via Prisma Studio.
