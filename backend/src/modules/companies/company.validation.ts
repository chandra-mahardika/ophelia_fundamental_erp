/**
 * Schema input company (dipakai `validate()` di company.routes.ts).
 * Kode unik case-insensitive; logoUrl opsional.
 */
import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  code: z
    .string()
    .min(2, "Kode minimal 2 karakter")
    .regex(/^[A-Z0-9_-]+$/i, "Kode hanya boleh alfanumerik, - dan _"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(3).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional(),
  logoUrl: z.string().url("Logo harus URL valid").optional(),
  isActive: z.boolean().optional(),
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive("userId tidak valid"),
  isDefault: z.boolean().optional(),
});
