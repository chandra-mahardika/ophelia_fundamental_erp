/**
 * Route roles. Semua butuh `authenticate` + permission `roles:manage`.
 * Urutan penting: `/permissions` (katalog) didaftarkan SEBELUM `/:id`
 * agar tidak tertangkap sebagai id.
 */
import { Router } from "express";
import * as roleController from "./role.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createRoleSchema,
  setPermissionsSchema,
  updateRoleSchema,
} from "./role.validation";

const router = Router();

router.use(authenticate, requirePermission("roles:manage"));

router.get("/permissions", roleController.getPermissions);
router.get("/", roleController.getAll);
router.get("/:id", roleController.getById);
router.post("/", validate(createRoleSchema), roleController.create);
router.put("/:id", validate(updateRoleSchema), roleController.update);
router.delete("/:id", roleController.remove);
router.put(
  "/:id/permissions",
  validate(setPermissionsSchema),
  roleController.setPermissions,
);

export default router;
