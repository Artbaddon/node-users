import { connect } from "../config/db/connectMysql.js";

class DocumentTypeModel {
  static async create({ name, description }) {
    try {
      let sqlQuery = `INSERT INTO document_type (name, description) VALUES (?, ?)`;
      const [result] = await connect.query(sqlQuery, [name, description]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `document_type` ORDER BY `id` ";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async update(id, { name, description }) {
    try {
      let sqlQuery =
        "UPDATE document_type SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id =?;";
      const [result] = await connect.query(sqlQuery, [name, description, id]);
      if (result.affectedRows === 0) {
        return { error: "Document type not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message};
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM document_type WHERE id = ?`;
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
      let sqlQuery = `SELECT * FROM document_type WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, id);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default DocumentTypeModel;
