/**
 * Modul auth: registrasi, login (JWT + konteks company), dan ganti company aktif.
 * Alur: routes → controller (terima req) → service (logika + Prisma) → response.
 * Token dibuat di sini via `signToken`; dibaca di `authenticate`.
 */
import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

/** POST /api/auth/register → user + personal company + modul dasar. */
export const register = async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json({ message: "Registrasi berhasil", data: user });
};

/** POST /api/auth/login → `{ token, user }` (token membawa companyId default). */
export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json({ message: "Login berhasil", data: result });
};

/** POST /api/auth/switch-company/:id → token baru (user harus member). */
export const switchCompany = async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  const result = await authService.switchCompany(user.id, Number(req.params.id));
  res.json({ message: "Company aktif diganti", data: result });
};
