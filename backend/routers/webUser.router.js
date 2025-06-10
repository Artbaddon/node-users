import { Router } from "express";
import WebUserController from "../controllers/webUser.controller.js";

const router = Router();
const name = "/web-users";

// Public routes
router.post(name + "/register", WebUserController.register);
router.post(name + "/login", WebUserController.login);

// Protected routes (add authentication middleware later)
router.get(name + "/", WebUserController.show);
router.get(name + "/:id", WebUserController.findById);
router.put(name + "/:id", WebUserController.update);
router.put(name + "/:id/password", WebUserController.updatePassword);
router.delete(name + "/:id", WebUserController.delete);

export default router;