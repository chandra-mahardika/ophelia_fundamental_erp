/**
 * Util JWT. Dipakai dua arah:
 * - `signToken`: auth.service.ts (login/register/switch-company) + company.service.ts (set-default)
 * - `verifyToken`: auth.middleware.ts (`authenticate`)
 */
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

/** Isi token. `companyId` = company aktif; opsional agar token lama tetap valid. */
export interface JwtPayload {
  id: number;
  roles: string[];
  permissions: string[];
  /** Company aktif user. Opsional agar token lama tetap valid. */
  companyId?: number;
}

/** Buat token login. Dipanggil setelah kredensial/membership terverifikasi. */
export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });

/** Verifikasi token → payload. Throw bila tanda tangan salah/kadaluarsa. */
export const verifyToken = (token: string) =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
