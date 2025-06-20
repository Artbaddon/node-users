import ApiUserModel from "../models/apiUser.model.js";
import ApiTokenModel from "../models/apiToken.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { encryptPassword, comparePassword } from "../library/appBcrypt.js";

dotenv.config();

class ApiUserController {
  async register(req, res) {
    try {
      const {
        username,
        email,
        password,
        description,
        status_id = 1,
      } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          error: "Username, email, and password are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: "Password must be at least 8 characters long",
        });
      }

      // Check if username exists
      const existingUser = await ApiUserModel.findByName(username);
      if (existingUser && existingUser.id && !existingUser.error) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Check if email exists
      const existingEmail = await ApiUserModel.findByEmail(email);
      if (existingEmail && existingEmail.id && !existingEmail.error) {
        return res.status(409).json({ error: "Email already exists" });
      } // Encrypt password
      const passwordHash = await encryptPassword(password);

      // Create API user
      const userId = await ApiUserModel.create({
        username,
        email,
        password_hash: passwordHash,
        description: description || null,
        status_id: parseInt(status_id),
      });

      if (userId.error) {
        return res.status(500).json({ error: userId.error });
      }

      // 🎯 AUTO-ASSIGN DEFAULT ROLE (role_id = 2 for "user")
      const roleAssignment = await ApiUserModel.assignRole(userId, 2);
      if (roleAssignment.error) {
        console.log(
          "Warning: Could not assign default role:",
          roleAssignment.error
        );
      }

      res.status(201).json({
        message: "API user created successfully",
        userId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const users = await ApiUserModel.show();
      if (users.error) {
        return res.status(500).json({ error: users.error });
      }
      res.status(200).json({
        message: "API users retrieved successfully",
        users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const user = await ApiUserModel.findById(id);

      if (!user) {
        return res.status(404).json({ error: "API user not found" });
      }

      res.status(200).json({
        message: "API user found successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { username, email, description, status_id } = req.body;

      if (!username || !email || !status_id) {
        return res.status(400).json({
          error: "Username, email, and status_id are required",
        });
      }

      const result = await ApiUserModel.update(id, {
        username,
        email,
        description,
        status_id: parseInt(status_id),
      });

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      if (result === 0) {
        return res.status(404).json({ error: "API user not found" });
      }

      res.status(200).json({
        message: "API user updated successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ApiUserModel.delete(id);

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      if (result === 0) {
        return res.status(404).json({ error: "API user not found" });
      }

      res.status(200).json({
        message: "API user deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }  async login(req, res) {
    try {
      const { username, email, password } = req.body;

      if ((!username && !email) || !password) {
        return res.status(400).json({
          error: "Username or email and password are required",
        });
      }

      // Find API user by username or email with comprehensive information
      const { connect } = await import("../config/db/connectMysql.js");
      const userQuery = `
        SELECT au.id, au.username, au.email, au.password_hash, au.description, 
               au.status_id, us.name as status_name, us.description as status_description
        FROM api_users au
        LEFT JOIN user_status us ON au.status_id = us.id
        WHERE ${username ? 'au.username = ?' : 'au.email = ?'}
      `;
      
      const [userRows] = await connect.query(userQuery, [username || email]);
      
      if (userRows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const user = userRows[0];

      // Check if user is active
      if (user.status_id !== 1) {
        return res.status(401).json({ 
          error: "Account is not active. Please contact administrator." 
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Get user roles and permissions
      const rolesQuery = `
        SELECT r.id as role_id, r.name as role_name, r.description as role_description,
               GROUP_CONCAT(DISTINCT p.name) as permissions
        FROM api_user_roles aur
        JOIN roles r ON aur.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE aur.api_user_id = ? AND r.is_active = TRUE
        GROUP BY r.id, r.name, r.description
      `;
      
      const [roleRows] = await connect.query(rolesQuery, [user.id]);
      
      if (roleRows.length === 0) {
        return res.status(401).json({ 
          error: "No active roles assigned. Please contact administrator." 
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

      // Update last login
      await ApiUserModel.updateLastLogin(user.id);

      // Generate JWT with enhanced payload
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          type: "api",
          roles: roles.map(r => ({ id: r.id, name: r.name }))
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Create or update API token in database
      const tokenResult = await ApiTokenModel.createOrUpdate({
        user_id: user.id,
        token: token,
      });

      if (tokenResult.error) {
        return res.status(500).json({ error: "Failed to create API token" });
      }

      // Prepare comprehensive user response (excluding password_hash)
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        description: user.description,
        status: {
          id: user.status_id,
          name: user.status_name,
          description: user.status_description
        },
        roles: roles,
        permissions: allPermissions,
        loginTime: new Date().toISOString()
      };

      res.status(200).json({
        message: "Login successful",
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('API Login error:', error);
      res.status(500).json({ error: "Internal server error during login" });
    }
  }

  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Current password and new password are required",
        });
      }

      // Find user
      const user = await ApiUserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: "API user not found" });
      }

      // Verify current password
      const isValidPassword = await comparePassword(
        currentPassword,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Encrypt new password
      const newPasswordHash = await encryptPassword(newPassword);

      // Update password
      const result = await ApiUserModel.updatePassword(id, newPasswordHash);
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async forgotPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Email is required",
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          error: "New password is required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "New password must be at least 8 characters long",
        });
      }

      // Find user by email
      const user = await ApiUserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Encrypt new password
      const newPasswordHash = await encryptPassword(newPassword);

      // Update password
      const result = await ApiUserModel.updatePassword(
        user.id,
        newPasswordHash
      );
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({
        message: "Password reset successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // New secure methods for current user
  async getMyInfo(req, res) {
    try {
      const userId = req.userId; // From JWT token

      const user = await ApiUserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Remove password hash from response
      const { password_hash, ...userInfo } = user;

      res.status(200).json(userInfo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async updateMyInfo(req, res) {
    try {
      const userId = req.userId; // From JWT token
      const { username, email, description } = req.body;

      // Check if new username/email already exists (excluding current user)
      if (username) {
        const existingUser = await ApiUserModel.findByName(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: "Username already exists" });
        }
      }

      if (email) {
        const existingEmail = await ApiUserModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(409).json({ error: "Email already exists" });
        }
      }

      // Update user info
      const result = await ApiUserModel.update(userId, {
        username,
        email,
        description,
        status_id: undefined // Don't allow users to change their own status
      });

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMyPassword(req, res) {
    try {
      const userId = req.userId; // From JWT token
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Current password and new password are required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "New password must be at least 8 characters long",
        });
      }

      // Find user
      const user = await ApiUserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await comparePassword(
        currentPassword,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Encrypt new password
      const newPasswordHash = await encryptPassword(newPassword);

      // Update password
      const result = await ApiUserModel.updatePassword(userId, newPasswordHash);
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteMyAccount(req, res) {
    try {
      const userId = req.userId; // From JWT token
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          error: "Password confirmation is required to delete account",
        });
      }

      // Find user
      const user = await ApiUserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password
      const isValidPassword = await comparePassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Password is incorrect" });
      }

      // Delete user and all related tokens
      const result = await ApiUserModel.delete(userId);
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  // Admin create API user with role assignment
  async adminCreate(req, res) {
    try {
      const { username, email, password, description, role_id, status_id } =
        req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          error: "Username, email, and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await ApiUserModel.findByName(username);
      if (existingUser && existingUser.id) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await ApiUserModel.findByEmail(email);
      if (existingEmail && existingEmail.id) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password using the correct import
      const passwordHash = await encryptPassword(password);

      // Create user
      const userId = await ApiUserModel.create({
        username,
        email,
        password_hash: passwordHash,
        description,
        status_id: status_id || 1,
      });

      if (userId.error) {
        return res.status(500).json({ error: userId.error });
      }

      // Assign role if provided
      if (role_id) {
        await ApiUserModel.assignRole(userId, role_id);
      }

      res.status(201).json({
        message: "API user created successfully",
        userId: userId,
      });
    } catch (error) {
      console.error("Error creating API user:", error);
      res.status(500).json({ error: "Failed to create API user" });
    }
  }

  // Assign role to API user
  async assignRole(req, res) {
    try {
      const { id } = req.params;
      const { roleId } = req.body;

      // Check if user exists
      const user = await ApiUserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Assign role
      const result = await ApiUserModel.assignRole(id, roleId);

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: "Role assigned successfully",
        assignmentId: result,
      });
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ error: "Failed to assign role" });
    }
  }

  // Update API user's role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { role_id } = req.body;

      // Check if user exists
      const user = await ApiUserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update role
      const result = await ApiUserModel.updateRole(id, role_id);

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: "Role updated successfully",
        assignmentId: result,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Failed to update role" });
    }
  }

  // Get API user's roles
  async getUserRoles(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await ApiUserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user roles
      const roles = await ApiUserModel.getUserRoles(id);

      if (roles.error) {
        return res.status(500).json({ error: roles.error });
      }

      res.json({
        userId: id,
        username: user.username,
        roles: roles,
      });
    } catch (error) {
      console.error("Error getting user roles:", error);
      res.status(500).json({ error: "Failed to get user roles" });
    }
  }
}

export default new ApiUserController();
