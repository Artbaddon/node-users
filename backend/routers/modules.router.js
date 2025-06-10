import { Router } from "express";
import ModulesController from "../controllers/modules.controller.js";
const router = Router();
const name = "/modules";

router.post(name, ModulesController.register);
router.get(name + "/", ModulesController.show);
router.get(name + "/:id", ModulesController.findById);
router.put(name + "/:id", ModulesController.update);
router.delete(name + "/:id", ModulesController.delete);

export default router;
