/**
 * Route auth. Register/login publik (validasi Zod + rate-limit dari app.ts);
 * switch-company wajib `authenticate`.
 */
import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/switch-company/:id",
  authenticate,
  authController.switchCompany,
);

export default router;
