/**
 * Route companies. Semua butuh `authenticate`; tulis sensitif butuh permission:
 * update → `companies:update`, members → `companies:manage`.
 * Baca (me/detail/create) terbuka untuk user login mana pun.
 */
import { Router } from "express";
import * as companyController from "./company.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requirePermission } from "../../middlewares/rbac.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  addMemberSchema,
  createCompanySchema,
  updateCompanySchema,
} from "./company.validation";

const router = Router();

router.use(authenticate);

router.get("/me", companyController.getMine);
router.post("/", validate(createCompanySchema), companyController.create);
router.get("/:id", companyController.getById);
router.put(
  "/:id",
  requirePermission("companies:update"),
  validate(updateCompanySchema),
  companyController.update,
);
router.post(
  "/:id/members",
  requirePermission("companies:manage"),
  validate(addMemberSchema),
  companyController.addMember,
);
router.delete(
  "/:id/members/:userId",
  requirePermission("companies:manage"),
  companyController.removeMember,
);
router.post("/:id/set-default", companyController.setDefault);

export default router;
