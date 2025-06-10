import { connect } from "../config/db/connectMysql.js";

class PermissionsModel {
  static async create({ name, description, action }) {
    try {
      let sqlQuery = `INSERT INTO permissions (name, description, action) VALUES (?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [
        name,
        description,
        action,
      ]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `permissions` ORDER BY `id` ";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { name, description, action }) {
    try {
      let sqlQuery =
        "UPDATE permissions SET name = ?, description = ?, action = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;";
      const [result] = await connect.query(sqlQuery, [
        name,
        description,
        action,
        id,
      ]);
      if (result.affectedRows === 0) {
        return { error: "Permission not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM permissions WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, id);

      if (result.affectedRows === 0) {
        return { error: "Permission not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM permissions WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, id);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default PermissionsModel;
