/**
 * Route modul. Semua butuh `authenticate`; install/uninstall butuh `modules:manage`.
 * Katalog publik untuk user login.
 */
import { Router } from "express";
import * as appModuleController from "./appModule.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/", appModuleController.listCatalog);
router.get("/company/:companyId", appModuleController.listInstalled);
router.post(
  "/company/:companyId/:code/install",
  requirePermission("modules:manage"),
  appModuleController.install,
);
router.post(
  "/company/:companyId/:code/uninstall",
  requirePermission("modules:manage"),
  appModuleController.uninstall,
);

export default router;
