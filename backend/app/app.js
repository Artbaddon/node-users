import express from "express";
import cors from "cors";
import { verifyToken } from "../middleware/authMiddleware.js";

// Import routers
import authRouter from "../routers/auth.router.js";
import webUserRouter from "../routers/webUser.router.js";
import apiUserRouter from "../routers/apiUser.router.js";
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
app.use(name, authRouter);

// Protected routes (authentication required)
app.use(name, verifyToken, webUserRouter);
app.use(name, verifyToken, apiUserRouter);
app.use(name, verifyToken, profileRouter);
app.use(name, verifyToken, rolesRouter);
app.use(name, verifyToken, permissionsRouter);
app.use(name, verifyToken, rolePermissionsRouter);
app.use(name, verifyToken, documentTypeRouter);
app.use(name, verifyToken, userStatusRouter);
app.use(name, verifyToken, modulesRouter);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

export default app;
