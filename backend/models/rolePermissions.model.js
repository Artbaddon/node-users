import { connect } from "../config/db/connectMysql.js";

class RolePermissionModel {
  static async create({ roleId, permissionId }) {
    try {
      let sqlQuery = `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`;
      const [result] = await connect.query(sqlQuery, [roleId, permissionId]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery =
        "SELECT * FROM `role_permissions` ORDER BY `id` ";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { roleId, permissionId }) {
    try {
      let sqlQuery =
        "UPDATE role_permissions SET role_id = ?, permission_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id =?;";
      const [result] = await connect.query(sqlQuery, [roleId, permissionId, id]);
      if (result.affectedRows === 0) {
        return { error: "Document type not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM role_permissions WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, id);

      if (result.affectedRows === 0) {
        return { error: "Document type not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM role_permissions WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, id);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default RolePermissionModel;
