import WebUserModel from "../models/webUser.model.js";
import ProfileModel from "../models/profile.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { encryptPassword, comparePassword } from "../library/appBcrypt.js";
import { uploadImage } from "../utils/fileUpload.js";

dotenv.config();

class WebUserController {
  async register(req, res) {
    uploadImage(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }      try {
        const {
          username, email, password, status_id = 1,
          first_name, last_name, address, phone,
          document_type_id, document_number, birth_date
        } = req.body;

        // Validate user fields
        if (!username || !email || !password) {
          return res.status(400).json({
            error: "Username, email, and password are required",
          });
        }

        // Validate profile fields
        if (!first_name || !last_name || !document_type_id || !document_number) {
          return res.status(400).json({
            error: "first_name, last_name, document_type_id, and document_number are required",
          });
        }

        // Check if user exists
        const existingUser = await WebUserModel.findByName(username);
        if (existingUser && existingUser.id) {
          return res.status(409).json({ error: "Username already exists" });
        }

        // Check if email exists
        const existingEmail = await WebUserModel.findByEmail(email);
        if (existingEmail && existingEmail.id) {
          return res.status(409).json({ error: "Email already exists" });
        }        // Encrypt password
        const passwordHash = await encryptPassword(password);

        // Create user
        const userId = await WebUserModel.create({
          username,
          email,
          password_hash: passwordHash,
          status_id: parseInt(status_id),
        });

        if (userId.error) {
          return res.status(500).json({ error: userId.error });
        }

        // Create profile
        const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const profileId = await ProfileModel.create({
          web_user_id: userId,
          first_name,
          last_name,
          address,
          phone,
          document_type_id: parseInt(document_type_id),
          document_number,
          photo_url,
          birth_date,
        });

        if (profileId.error) {
          return res.status(500).json({ error: profileId.error });
        }

        // 🎯 AUTO-ASSIGN DEFAULT ROLE (role_id = 2 for "user")
        const roleAssignment = await WebUserModel.assignRole(userId, 2);
        if (roleAssignment.error) {
          console.log("Warning: Could not assign default role:", roleAssignment.error);
        }

        res.status(201).json({
          message: "Web user and profile created successfully",
          userId,
          profileId,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async show(req, res) {
    try {
      const users = await WebUserModel.show();
      if (users.error) {
        return res.status(500).json({ error: users.error });
      }
      res.status(200).json({
        message: "Web users retrieved successfully",
        users
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const user = await WebUserModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: "Web user not found" });
      }
      
      res.status(200).json({
        message: "Web user found successfully",
        user
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { username, email, status_id } = req.body;

      if (!username || !email || !status_id) {
        return res.status(400).json({
          error: "Username, email, and status_id are required"
        });
      }

      const result = await WebUserModel.update(id, {
        username,
        email,
        status_id: parseInt(status_id)
      });

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      if (result === 0) {
        return res.status(404).json({ error: "Web user not found" });
      }

      res.status(200).json({
        message: "Web user updated successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await WebUserModel.delete(id);

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      if (result === 0) {
        return res.status(404).json({ error: "Web user not found" });
      }

      res.status(200).json({
        message: "Web user deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: "Username and password are required"
        });
      }

      // Find user
      const user = await WebUserModel.findByName(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await WebUserModel.updateLastLogin(user.id);

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get user ID from JWT token only
      const userId = req.userId; // From verifyToken middleware
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Current password and new password are required"
        });
      }

      // Find user (always the authenticated user)
      const user = await WebUserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Encrypt new password
      const newPasswordHash = await encryptPassword(newPassword);

      // Update password
      const result = await WebUserModel.updatePassword(userId, newPasswordHash);
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({
        message: "Password updated successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({
          error: "Email and new password are required"
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "New password must be at least 8 characters long"
        });
      }

      // Find user by email
      const user = await WebUserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Encrypt new password
      const newPasswordHash = await encryptPassword(newPassword);

      // Update password
      const result = await WebUserModel.updatePassword(user.id, newPasswordHash);
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({
        message: "Password reset successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // New secure methods for current user
  async getMyInfo(req, res) {
    try {
      const userId = req.userId; // From JWT token
      
      const user = await WebUserModel.findById(userId);
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
      const { username, email, first_name, last_name, phone, address } = req.body;

      // Check if new username/email already exists (excluding current user)
      if (username) {
        const existingUser = await WebUserModel.findByName(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: "Username already exists" });
        }
      }

      if (email) {
        const existingEmail = await WebUserModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(409).json({ error: "Email already exists" });
        }
      }

      // Update user info
      const result = await WebUserModel.update(userId, {
        username,
        email,
        first_name,
        last_name,
        phone,
        address
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
          error: "Current password and new password are required"
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "New password must be at least 8 characters long"
        });
      }

      // Find user
      const user = await WebUserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Encrypt new password
      const newPasswordHash = await encryptPassword(newPassword);

      // Update password
      const result = await WebUserModel.updatePassword(userId, newPasswordHash);
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
          error: "Password confirmation is required to delete account"
        });
      }

      // Find user
      const user = await WebUserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Password is incorrect" });
      }

      // Delete user
      const result = await WebUserModel.delete(userId);
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Assign role to a user (admin only)
  async assignRole(req, res) {
    try {
      const { id } = req.params;  // user ID
      const { roleId } = req.body;

      if (!roleId) {
        return res.status(400).json({ error: "Role ID is required" });
      }

      const result = await WebUserModel.assignRole(id, roleId);
      
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({ 
        message: "Role assigned successfully",
        assignmentId: result 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user's roles
  async getUserRoles(req, res) {
    try {
      const { id } = req.params;

      const roles = await WebUserModel.getUserRoles(id);
      
      if (roles.error) {
        return res.status(500).json({ error: roles.error });
      }

      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // NEW: Admin creates user with chosen role
  async adminCreate(req, res) {
    try {
      const { username, email, password, first_name, last_name, status_id = 1, role_id = 2 } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          error: "Username, email, and password are required",
        });
      }

      // Encrypt password
      const passwordHash = await encryptPassword(password);

      // Create user
      const userId = await WebUserModel.create({
        username,
        email,
        password_hash: passwordHash,
        status_id: parseInt(status_id),
      });

      if (userId.error) {
        return res.status(500).json({ error: userId.error });
      }

      // 🎯 ASSIGN CHOSEN ROLE
      const roleAssignment = await WebUserModel.assignRole(userId, parseInt(role_id));
      if (roleAssignment.error) {
        return res.status(500).json({ error: "Failed to assign role" });
      }

      res.status(201).json({
        message: "User created successfully by admin",
        userId,
        assignedRole: role_id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update user role (admin only)
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { role_id } = req.body;

      if (!role_id) {
        return res.status(400).json({ error: "Role ID is required" });
      }

      const result = await WebUserModel.updateRole(id, parseInt(role_id));
      
      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.status(200).json({ 
        message: "User role updated successfully",
        assignmentId: result 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new WebUserController();