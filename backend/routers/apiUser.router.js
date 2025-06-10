import { Router } from "express";
import ApiUserController from "../controllers/apiUser.controller.js";

const router = Router();
const name = "/api-users";

// Public routes
router.post(name + "/register", ApiUserController.register);
router.post(name + "/login", ApiUserController.login);

// Protected routes (add authentication middleware later)
router.get(name + "/", ApiUserController.show);
router.get(name + "/:id", ApiUserController.findById);
router.put(name + "/:id", ApiUserController.update);
router.put(name + "/:id/password", ApiUserController.updatePassword);
router.delete(name + "/:id", ApiUserController.delete);

export default router;
