import dotenv from "dotenv";

dotenv.config();

/**
 * Konfigurasi aplikasi dari `.env`. Satu-satunya tempat membaca
 * `process.env` — modul lain wajib lewat objek ini (lihat `.env.example`).
 */
export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173").split(","),
};
