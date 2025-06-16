import { Router } from "express";
import WebUserController from "../controllers/webUser.controller.js";
import ApiUserController from "../controllers/apiUser.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { connect } from "../config/db/connectMysql.js";

const router = Router();

// Web user public routes
router.post("/web-users/login", WebUserController.login);
router.post("/web-users/forgot-password", WebUserController.forgotPassword);

// API user public routes
router.post("/api-users/login", ApiUserController.login);
router.post("/api-users/forgot-password", ApiUserController.forgotPassword);

// Token validation endpoint with comprehensive user verification
router.get("/validate-token", verifyToken, async (req, res) => {  try {
    // Token is valid (verifyToken middleware passed)
    const userId = req.user.userId;
    
    // Get comprehensive user data with roles and permissions
    const userQuery = `
      SELECT wu.id, wu.username, wu.email, wu.status_id, 
             us.name as status_name, us.description as status_description,
             p.first_name, p.last_name, p.photo_url, p.phone, p.address,
             dt.name as document_type_name
      FROM web_users wu
      LEFT JOIN user_status us ON wu.status_id = us.id
      LEFT JOIN profiles p ON wu.id = p.web_user_id
      LEFT JOIN document_type dt ON p.document_type_id = dt.id
      WHERE wu.id = ?
    `;
    
    const [userRows] = await connect.query(userQuery, [userId]);
    
    if (userRows.length === 0) {
      return res.status(401).json({
        valid: false,
        message: "User not found in database"
      });
    }
    
    const user = userRows[0];
    
    // Check if user is still active
    if (user.status_id !== 1) {
      return res.status(401).json({
        valid: false,
        message: "User account is no longer active"
      });
    }

    // Get user roles and permissions
    const rolesQuery = `
      SELECT r.id as role_id, r.name as role_name, r.description as role_description,
             GROUP_CONCAT(DISTINCT p.name) as permissions
      FROM web_user_roles wur
      JOIN roles r ON wur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE wur.user_id = ? AND r.is_active = TRUE
      GROUP BY r.id, r.name, r.description
    `;
    
    const [roleRows] = await connect.query(rolesQuery, [userId]);
    
    if (roleRows.length === 0) {
      return res.status(401).json({
        valid: false,
        message: "User has no active roles assigned"
      });
    }

    // Process roles and permissions
    const roles = roleRows.map(role => ({
      id: role.role_id,
      name: role.role_name,
      description: role.role_description,
      permissions: role.permissions ? role.permissions.split(',').map(p => p.trim()) : []
    }));

    // Get all unique permissions
    const allPermissions = [...new Set(roles.flatMap(role => role.permissions))];

    // Prepare comprehensive user response
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      status: {
        id: user.status_id,
        name: user.status_name,
        description: user.status_description
      },
      profile: {
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
        photoUrl: user.photo_url,
        phone: user.phone,
        address: user.address,
        documentType: user.document_type_name
      },
      roles: roles,
      permissions: allPermissions,
      validationTime: new Date().toISOString()
    };
    
    res.status(200).json({
      valid: true,
      message: "Token and user are valid",
      user: userResponse,
      token: {
        userId: req.user.userId,
        iat: req.user.iat,
        exp: req.user.exp,
        expiresAt: new Date(req.user.exp * 1000).toISOString()
      }
    });
    
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      valid: false,
      message: "Token validation failed due to server error"
    });
  }
});

export default router;
