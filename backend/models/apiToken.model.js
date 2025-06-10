import { connect } from "../config/db/connectMysql.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

class ApiTokenModel {
  static async create({ api_user_id, created_by, expires_at }) {
    try {
      // Generate secure token
      const token = crypto.randomBytes(64).toString('hex');
      
      let sqlQuery = `INSERT INTO api_tokens (api_user_id, token, expires_at, created_by) VALUES (?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [
        api_user_id,
        token,
        expires_at,
        created_by
      ]);
      
      return { insertId: result.insertId, token };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByToken(token) {
    try {
      let sqlQuery = `
        SELECT at.*, au.username, au.email, au.status_id 
        FROM api_tokens at
        INNER JOIN api_users au ON au.id = at.api_user_id
        WHERE at.token = ? AND at.is_active = TRUE AND at.expires_at > NOW()
      `;
      const [result] = await connect.query(sqlQuery, [token]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByUserId(api_user_id) {
    try {
      let sqlQuery = `
        SELECT * FROM api_tokens 
        WHERE api_user_id = ? AND is_active = TRUE 
        ORDER BY created_at DESC
      `;
      const [result] = await connect.query(sqlQuery, [api_user_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async createOrUpdate({ user_id, token }) {
    try {
      console.log('Creating token for user:', user_id);
      
      // Delete any existing tokens for this user (single session approach)
      await connect.query(
        'DELETE FROM api_tokens WHERE api_user_id = ?',
        [user_id]
      );

      // Create new token entry without created_by field
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      let sqlQuery = `INSERT INTO api_tokens (api_user_id, token, expires_at, is_active) VALUES (?, ?, ?, TRUE)`;
      const [result] = await connect.query(sqlQuery, [
        user_id,
        token,
        expiresAt
      ]);
      
      console.log('Token created successfully:', result.insertId);
      return { insertId: result.insertId, token };
    } catch (error) {
      console.error('Token creation error:', error);
      return { error: error.message };
    }
  }

  static async deactivate(tokenId) {
    try {
      let sqlQuery = `UPDATE api_tokens SET is_active = FALSE WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, [tokenId]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async deactivateByToken(token) {
    try {
      let sqlQuery = `UPDATE api_tokens SET is_active = FALSE WHERE token = ?`;
      const [result] = await connect.query(sqlQuery, [token]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async deleteExpired() {
    try {
      let sqlQuery = `DELETE FROM api_tokens WHERE expires_at < NOW()`;
      const [result] = await connect.query(sqlQuery);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT 
          at.id,
          at.token,
          at.expires_at,
          at.is_active,
          at.created_at,
          au.username as api_user_name,
          wu.username as created_by_name
        FROM api_tokens at
        INNER JOIN api_users au ON au.id = at.api_user_id
        INNER JOIN web_users wu ON wu.id = at.created_by
        ORDER BY at.created_at DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ApiTokenModel;