import UserStatusModel from "../models/userStatus.model.js";

class UserStatusController {
  async register(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res
          .status(400)
          .json({ error: "Name and description are required" });
      }

      const UserStatusModelId = await UserStatusModel.create({
        name,
        description,
      });

      res.status(201).json({
        message: "Document type created successfully",
        id: UserStatusModelId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async show(req, res) {
    try {
      const showUserStatusModel = await UserStatusModel.show();

      if (!showUserStatusModel) {
        return res.status(409).json({ error: "No document types found" });
      }
      res.status(200).json({
        message: "Document types retrieved successfully",
        documentTypes: showUserStatusModel,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const id = req.params.id;
      const { name, description } = req.body;

      if (!name || !description || !id) {
        return res
          .status(409)
          .json({ error: "Name, description, and ID are required" });
      }

      const updateUserStatusModel = await UserStatusModel.update(id, {
        name,
        description,
      });

      if (!updateUserStatusModel || updateUserStatusModel.error) {
      return res.status(409).json({ error: updateUserStatusModel?.error || "User status not found" });
    }

      res.status(201).json({
        message: "Document type updated successfully",
        id: updateUserStatusModel,
      });
    } catch (error) {
      console.error("Error updating document type:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const deleteUserStatusModel = await UserStatusModel.delete(id);

      if (!deleteUserStatusModel || deleteUserStatusModel.error) {
        return res.status(404).json({ error: deleteUserStatusModel?.error || "User status not found" });
      }

      res.status(200).json({
        message: "User status deleted successfully",
        id: deleteUserStatusModel,
      });
    } catch (error) {
      console.error("Error deleting document type:", error);
      res.status(500).json({ error: error.message });
    }
  }
  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const existingUserStatusModel = await UserStatusModel.findById(id);

      if (!existingUserStatusModel) {
        return res.status(404).json({ error: "User status not found" });
      }

      res.status(200).json({
        message: "User status found successfully",
        userStatus: existingUserStatusModel,
      });
    } catch (error) {
      console.error("Error finding document type by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserStatusController();