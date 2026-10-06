import { PrismaClient as AuthPrismaClient } from "../generated/auth";
import { PrismaClient as TxPrismaClient } from "../generated/transactions";

/**
 * Dua Prisma Client (satu per database, lihat dokumentasi/04-database.md).
 * - `prismaAuth`: DB admin — user, role, permission, company, modul.
 * - `prismaTx`: DB system — tabel transaksional modul ERP.
 * Tidak ada join lintas DB: relasi lintas DB berupa kolom angka + query terpisah.
 */
export const prismaAuth = new AuthPrismaClient();
export const prismaTx = new TxPrismaClient();
