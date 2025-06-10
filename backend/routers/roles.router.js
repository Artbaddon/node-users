import { Router } from "express";
import RolesController from "../controllers/roles.controller.js";
const router = Router();
const name = "/roles";

//Public Route

router.post(name, RolesController.register);
router.get(name + "/", RolesController.show);
router.get(name + "/:id", RolesController.findById);
router.put(name + "/:id", RolesController.update);
router.delete(name + "/:id", RolesController.delete);

export default router;
