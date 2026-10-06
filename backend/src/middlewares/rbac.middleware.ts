import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "./auth.middleware";

/**
 * Middleware otorisasi RBAC global (berbasis permission di JWT).
 * Dipasang SETELAH `authenticate` (butuh `req.user`).
 * - `authorize(...roles)`: lolos bila user punya SALAH SATU role (legacy).
 * - `requirePermission(...perms)`: lolos bila user punya SEMUA permission (utama).
 * Gagal → 401/403. Untuk konteks company/modul lihat company.middleware.ts.
 */
export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user || !roles.some((r) => user.roles?.includes(r))) {
      return next(new ApiError(403, "Akses ditolak"));
    }
    next();
  };

export const requirePermission =
  (...permissions: string[]) =>
  /** Tolak bila `req.user` tidak membawa SEMUA permission yang diminta. */
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      return next(new ApiError(401, "Tidak terautentikasi"));
    }
    const hasAll = permissions.every((p) => user.permissions?.includes(p));
    if (!hasAll) {
      return next(new ApiError(403, "Akses ditolak: permission tidak cukup"));
    }
    next();
  };
