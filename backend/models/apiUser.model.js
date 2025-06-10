import { connect } from "../config/db/connectMysql.js";

class ApiUserModel {
  static async create({ username, email, password_hash, description, status_id }) {
    try {
      let sqlQuery = `INSERT INTO api_users (username, email, password_hash, description, status_id) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [
        username,
        email,
        password_hash,
        description,
        status_id,
      ]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByName(username) {
    try {
      let sqlQuery = `SELECT * FROM api_users WHERE username = ?`;
      const [result] = await connect.query(sqlQuery, [username]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async show() {
    try {
      const [result] = await connect.query(`CALL sp_get_all_api_users()`);
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM api_users WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByEmail(email) {
    try {
      let sqlQuery = `SELECT * FROM api_users WHERE email = ?`;
      const [result] = await connect.query(sqlQuery, [email]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { username, email, description, status_id }) {
    try {
      let sqlQuery = `UPDATE api_users SET username = ?, email = ?, description = ?, status_id = ? WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [
        username,
        email,
        description,
        status_id,
        id,
      ]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM api_users WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updatePassword(id, newPasswordHash) {
    try {
      let sqlQuery = `UPDATE api_users SET password_hash = ? WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [newPasswordHash, id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updateLastLogin(id) {
    try {
      let sqlQuery = `UPDATE api_users SET last_login = NOW() WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Assign a role to an API user
  static async assignRole(userId, roleId) {
    try {
      let sqlQuery = `INSERT INTO api_user_roles (user_id, role_id) VALUES (?, ?)`;
      const [result] = await connect.query(sqlQuery, [userId, roleId]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get API user's roles
  static async getUserRoles(userId) {
    try {
      let sqlQuery = `
        SELECT r.id, r.name 
        FROM api_user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [userId]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Update API user's role (remove old, assign new)
  static async updateRole(userId, newRoleId) {
    try {
      // Remove existing roles
      await connect.query(`DELETE FROM api_user_roles WHERE user_id = ?`, [userId]);
      
      // Assign new role
      let sqlQuery = `INSERT INTO api_user_roles (user_id, role_id) VALUES (?, ?)`;
      const [result] = await connect.query(sqlQuery, [userId, newRoleId]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ApiUserModel;