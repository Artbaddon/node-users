import { Router } from "express";
import ApiUserController from "../controllers/apiUser.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Personal routes (token only - users access their own data)
router.get("/api-users/me", ApiUserController.getMyInfo);
router.put("/api-users/me", ApiUserController.updateMyInfo);
router.put("/api-users/me/password", ApiUserController.updateMyPassword);
router.delete("/api-users/me", ApiUserController.deleteMyAccount);

// Admin routes (require specific permissions)
router.get("/api-users", requirePermission("users:read"), ApiUserController.show);
router.get("/api-users/:id", requirePermission("users:read"), ApiUserController.findById);
router.put("/api-users/:id", requirePermission("users:update"), ApiUserController.update);
router.put("/api-users/:id/password", requirePermission("users:update"), ApiUserController.updatePassword);
router.delete("/api-users/:id", requirePermission("users:delete"), ApiUserController.delete);

// Admin user creation and role management routes
router.post("/api-users/admin/create", requirePermission("users:create"), ApiUserController.adminCreate);
router.post("/api-users/:id/assign-role", requirePermission("roles:assign"), ApiUserController.assignRole);
router.put("/api-users/:id/role", requirePermission("roles:update"), ApiUserController.updateRole);
router.get("/api-users/:id/roles", requirePermission("roles:read"), ApiUserController.getUserRoles);

export default router;
