import { Router } from "express";
import RolePermissionsController from "../controllers/rolePermissions.controller.js";
const router = Router();
const name = "/roles-permissions";

router.post(name, RolePermissionsController.register);
router.get(name + "/", RolePermissionsController.show);
router.get(name + "/:id", RolePermissionsController.findById);
router.put(name + "/:id", RolePermissionsController.update);
router.delete(name + "/:id", RolePermissionsController.delete);

export default router;
