/**
 * Komposisi aplikasi Express (di-run oleh server.ts).
 * Urutan: hardening (helmet, cors, json) → rate-limit auth → route
 * per modul (`/api/*`) → `errorHandler` global paling akhir.
 * Modul baru didaftarkan di sini: `app.use("/api/xxx", xxxRoutes)`.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import roleRoutes from "./modules/roles/role.routes";
import companyRoutes from "./modules/companies/company.routes";
import appModuleRoutes from "./modules/app-modules/appModule.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { env } from "./config/env";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.nodeEnv === "production" ? env.corsOrigins : true,
  }),
);
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Terlalu banyak percobaan, coba lagi nanti" },
});

app.get("/", (_req, res) => {
  res.json({ message: "ophelia_express ERP API (multi-company, modular)" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/modules", appModuleRoutes);

app.use(errorHandler);

export default app;
