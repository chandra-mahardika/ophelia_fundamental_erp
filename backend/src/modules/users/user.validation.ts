/**
 * Schema input users (dipakai `validate()` di user.routes.ts).
 * `password` opsional saat update: kosong = tidak diubah.
 */
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  roleIds: z.array(z.number().int().positive()).optional(),
  companyId: z.number().int().positive().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  roleId: z.number().int().positive().optional(),
});

export const setRolesSchema = z.object({
  roleIds: z.array(z.number().int().positive()),
});
