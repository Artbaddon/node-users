import { Router } from "express";
import WebUserController from "../controllers/webUser.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Personal routes (token only - users access their own data)
router.get("/web-users/me", WebUserController.getMyInfo);
router.put("/web-users/me", WebUserController.updateMyInfo);
router.put("/web-users/me/password", WebUserController.updateMyPassword);
router.delete("/web-users/me", WebUserController.deleteMyAccount);

// Admin routes (require specific permissions)
router.get("/web-users", requirePermission("users:read"), WebUserController.show);
router.get("/web-users/:id", requirePermission("users:read"), WebUserController.findById);
router.put("/web-users/:id", requirePermission("users:update"), WebUserController.update);
router.delete("/web-users/:id", requirePermission("users:delete"), WebUserController.delete);

// Admin user creation and role management routes
router.post("/web-users/admin/create", requirePermission("users:create"), WebUserController.adminCreate);
router.post("/web-users/:id/assign-role", requirePermission("roles:assign"), WebUserController.assignRole);
router.put("/web-users/:id/role", requirePermission("roles:update"), WebUserController.updateRole);
router.get("/web-users/:id/roles", requirePermission("roles:read"), WebUserController.getUserRoles);

export default router;