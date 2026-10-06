import { NextFunction, Request, Response } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware autentikasi. Gate pertama di semua route privat:
 * membaca `Authorization: Bearer <token>`, memverifikasi via
 * `verifyToken` (utils/jwt.ts), lalu menempelkan payload ke `req.user`.
 * Gagal → 401 (tanpa token / token invalid).
 * Berpasangan dengan `requirePermission`/`authorize` (rbac.middleware.ts).
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/** Tempel `req.user` dari JWT. Pasang sebelum middleware otorisasi apa pun. */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Token tidak ditemukan"));
  }
  try {
    const payload = verifyToken(header.split(" ")[1]);
    (req as AuthRequest).user = payload;
    next();
  } catch {
    next(new ApiError(401, "Token tidak valid"));
  }
};
