/**
 * Route users. Semua butuh `authenticate` + permission `users:manage`.
 * Create/update/setRoles memakai schema Zod (`validate`).
 */
import { Router } from "express";
import * as userController from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createUserSchema, updateUserSchema, setRolesSchema } from "./user.validation";

const router = Router();

router.use(authenticate, requirePermission("users:manage"));

router.get("/", userController.getAll);
router.post("/", validate(createUserSchema), userController.create);
router.get("/:id", userController.getById);
router.put("/:id", validate(updateUserSchema), userController.update);
router.delete("/:id", userController.remove);
router.put("/:id/roles", validate(setRolesSchema), userController.setRoles);

export default router;
