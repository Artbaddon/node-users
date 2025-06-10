import { Router } from "express";
import PermissionsController from "../controllers/permissions.controller.js";
const router = Router();
const name = "/permissions";

router.post(name, PermissionsController.register);
router.get(name + "/", PermissionsController.show);
router.get(name + "/:id", PermissionsController.findById);
router.put(name + "/:id", PermissionsController.update);
router.delete(name + "/:id", PermissionsController.delete);

export default router;
