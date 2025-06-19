import { connect } from "../config/db/connectMysql.js";

class WebUserModel {
  static async create({ username, email, password_hash, status_id }) {
    try {
      let sqlQuery = `INSERT INTO web_users (username, email, password_hash, status_id) VALUES (?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [username, email, password_hash, status_id]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByName(username) {
    try {
      let sqlQuery = `SELECT * FROM web_users WHERE username = ?`;
      const [result] = await connect.query(sqlQuery, [username]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByEmail(email) {
    try {
      let sqlQuery = `SELECT * FROM web_users WHERE email = ?`;
      const [result] = await connect.query(sqlQuery, [email]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }  static async show() {
    try {
      const [result] = await connect.query(`CALL sp_get_all_web_users()`);
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM web_users WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      const user = result[0];
      
      if (user) {
        // Get roles for this user
        try {
          const roles = await this.getUserRoles(user.id);
          user.roles = roles;
          // For compatibility with frontend, add primary role info
          if (roles && roles.length > 0) {
            user.role_id = roles[0].id;
            user.role_name = roles[0].name;
          }
        } catch (roleError) {
          console.error(`Error getting roles for user ${user.id}:`, roleError);
          user.roles = [];
        }

        // Get profile information for this user
        try {
          const ProfileModel = (await import('./profile.model.js')).default;
          const profile = await ProfileModel.findByWebUserId(user.id);
          if (profile) {
            // Add profile fields to the user object
            user.first_name = profile.first_name;
            user.last_name = profile.last_name;
            user.address = profile.address;
            user.phone = profile.phone;
            user.document_type_id = profile.document_type_id;
            user.document_number = profile.document_number;
            user.photo_url = profile.photo_url;
            user.birth_date = profile.birth_date;
          }
        } catch (profileError) {
          console.error(`Error getting profile for user ${user.id}:`, profileError);
        }
      }
      
      return user || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { username, email, status_id }) {
    try {
      let sqlQuery = `UPDATE web_users SET username = ?, email = ?, status_id = ? WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [username, email, status_id, id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM web_users WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updatePassword(id, newPasswordHash) {
    try {
      let sqlQuery = `UPDATE web_users SET password_hash = ? WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [newPasswordHash, id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updateLastLogin(id) {
    try {
      let sqlQuery = `UPDATE web_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Assign a role to a user
  static async assignRole(userId, roleId) {
    try {
      let sqlQuery = `INSERT INTO web_user_roles (user_id, role_id) VALUES (?, ?)`;
      const [result] = await connect.query(sqlQuery, [userId, roleId]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get user's roles
  static async getUserRoles(userId) {
    try {
      let sqlQuery = `
        SELECT r.id, r.name 
        FROM web_user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [userId]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Update user's role (remove old, assign new)
  static async updateRole(userId, newRoleId) {
    try {
      // Remove existing roles
      await connect.query(`DELETE FROM web_user_roles WHERE user_id = ?`, [userId]);
      
      // Assign new role
      let sqlQuery = `INSERT INTO web_user_roles (user_id, role_id) VALUES (?, ?)`;
      const [result] = await connect.query(sqlQuery, [userId, newRoleId]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default WebUserModel;
