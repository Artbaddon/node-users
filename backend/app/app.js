import express from "express";
import cors from "cors";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  requireAdmin,
  requirePermission,
} from "../middleware/permissionMiddleware.js";

// Import controllers for public routes
import WebUserController from "../controllers/webUser.controller.js";
import ApiUserController from "../controllers/apiUser.controller.js";

// Import routers for protected routes
import profileRouter from "../routers/profile.router.js";
import rolesRouter from "../routers/roles.router.js";
import permissionsRouter from "../routers/permissions.router.js";
import rolePermissionsRouter from "../routers/rolesPermissions.js";
import documentTypeRouter from "../routers/documentType.router.js";
import userStatusRouter from "../routers/userStatus.router.js";
import modulesRouter from "../routers/modules.router.js";

const name = "/api_v1";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no authentication required)
app.post(name + "/web-users/register", WebUserController.register);
app.post(name + "/web-users/login", WebUserController.login);
app.post(name + "/web-users/forgot-password", WebUserController.forgotPassword);
app.post(name + "/api-users/register", ApiUserController.register);
app.post(name + "/api-users/login", ApiUserController.login);
app.post(name + "/api-users/forgot-password", ApiUserController.forgotPassword);

// Protected routes (authentication required)
app.use(verifyToken);

// Personal routes (token only - users access their own data)
app.get(name + "/web-users/me", verifyToken, WebUserController.getMyInfo);
app.put(name + "/web-users/me", verifyToken, WebUserController.updateMyInfo);
app.put(name + "/web-users/me/password", verifyToken, WebUserController.updateMyPassword);
app.delete(name + "/web-users/me", verifyToken, WebUserController.deleteMyAccount);

// Admin routes (require specific permissions)
app.get(name + "/web-users", verifyToken, requirePermission("users.read"), WebUserController.show);
app.get(name + "/web-users/:id", verifyToken, requirePermission("users.read"), WebUserController.findById);
app.put(name + "/web-users/:id", verifyToken, requirePermission("users.update"), WebUserController.update);
app.delete(name + "/web-users/:id", verifyToken, requirePermission("users.delete"), WebUserController.delete);

// Protected API user routes - Current user operations
app.get(name + "/api-users/me", ApiUserController.getMyInfo);
app.put(name + "/api-users/me", ApiUserController.updateMyInfo);
app.put(name + "/api-users/me/password", ApiUserController.updateMyPassword);
app.delete(name + "/api-users/me", ApiUserController.deleteMyAccount);

// Protected API user routes - Admin operations
app.get(name + "/api-users", ApiUserController.show);
app.get(name + "/api-users/:id", ApiUserController.findById);
app.put(name + "/api-users/:id", ApiUserController.update);
app.put(name + "/api-users/:id/password", ApiUserController.updatePassword);
app.delete(name + "/api-users/:id", ApiUserController.delete);

// Role management routes (admin only)
app.post(
  name + "/web-users/admin/create",
  verifyToken,
  requirePermission("users.create"),
  WebUserController.adminCreate
);
app.post(
  name + "/web-users/:id/assign-role",
  verifyToken,
  requirePermission("roles.assign"),
  WebUserController.assignRole
);
app.put(
  name + "/web-users/:id/role",
  verifyToken,
  requirePermission("roles.update"),
  WebUserController.updateRole
);
app.get(
  name + "/web-users/:id/roles",
  verifyToken,
  requirePermission("roles.read"),
  WebUserController.getUserRoles
);

// Same for API users
app.post(
  name + "/api-users/admin/create",
  verifyToken,
  requirePermission("users.create"),
  ApiUserController.adminCreate
);
app.post(
  name + "/api-users/:id/assign-role",
  verifyToken,
  requirePermission("roles.assign"),
  ApiUserController.assignRole
);
app.put(
  name + "/api-users/:id/role",
  verifyToken,
  requirePermission("roles.update"),
  ApiUserController.updateRole
);
app.get(
  name + "/api-users/:id/roles",
  verifyToken,
  requirePermission("roles.read"),
  ApiUserController.getUserRoles

);

// Other protected routes
app.use(name, profileRouter);
app.use(name, rolesRouter);
app.use(name, permissionsRouter);
app.use(name, rolePermissionsRouter);
app.use(name, documentTypeRouter);
app.use(name, userStatusRouter);
app.use(name, modulesRouter);

app.use((rep, res, nex) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

export default app;
