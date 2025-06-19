import { connect } from "../config/db/connectMysql.js";

class ProfileModel {
  static async create({
    web_user_id,
    first_name,
    last_name,
    address,
    phone,
    document_type_id,
    document_number,
    photo_url,
    birth_date,
  }) {
    try {
      // Change from 'user_id' to 'web_user_id'
      let sqlQuery = `INSERT INTO profiles (web_user_id, first_name, last_name, address, phone, document_type_id, document_number, photo_url, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [
        web_user_id, // Changed parameter name
        first_name,
        last_name,
        address,
        phone,
        document_type_id,
        document_number,
        photo_url,
        birth_date,
      ]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `Profile` ORDER BY `id` ";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async update(
    id,
    {
      user_id,
      first_name,
      last_name,
      address,
      phone,
      document_type_id,
      document_number,
      photo_url,
      birth_date,
    }
  ) {
    try {
      let sqlQuery = `CALL p_update_profile(? , ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      const [result] = await connect.query(sqlQuery, [
        user_id,
        first_name,
        last_name,
        address,
        phone,
        document_type_id,
        document_number,
        photo_url,
        birth_date,
        id,
      ]);
      if (result.affectedRows === 0) {
        return { error: "Profile not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }
  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM Profile WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, id);
      if (result.affectedRows === 0) {
        return { error: "Profile not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }
  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM Profile WHERE id = ?`;
      const [result] = await connect.query(sqlQuery, id);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async getUserProfile(userId) {
    try {
      let sqlQuery =
        "SELECT * FROM Profile INNER JOIN user ON Profile.user_id = user.id WHERE user_id = ? ";
      const [result] = await connect.query(sqlQuery, userId);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async findByWebUserId(web_user_id) {
    try {
      let sqlQuery = `SELECT * FROM profiles WHERE web_user_id = ?`;
      const [result] = await connect.query(sqlQuery, [web_user_id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updateByWebUserId(
    web_user_id,
    {
      first_name,
      last_name,
      address,
      phone,
      document_type_id,
      document_number,
      photo_url,
      birth_date,
    }
  ) {
    try {
      let sqlQuery = `UPDATE profiles SET first_name = ?, last_name = ?, address = ?, phone = ?, document_type_id = ?, document_number = ?, photo_url = ?, birth_date = ? WHERE web_user_id = ?`;
      const [result] = await connect.query(sqlQuery, [
        first_name,
        last_name,
        address,
        phone,
        document_type_id,
        document_number,
        photo_url,
        birth_date,
        web_user_id,
      ]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ProfileModel;
