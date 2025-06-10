import RoleModel from "../models/roles.model.js";

class RolesController { // Also fix class name
  async register(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res
          .status(400)
          .json({ error: "Name and description are required" });
      }      const RoleModelId = await RoleModel.create({
        name,
        description,
      });

      res.status(201).json({
        message: "Role created successfully",
        id: RoleModelId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }  async show(req, res) {
    try {
      const showRoleModel = await RoleModel.show();

      if (!showRoleModel) {
        return res.status(409).json({ error: "No roles found" });
      }
      res.status(200).json({
        message: "Roles retrieved successfully",
        roles: showRoleModel,
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

      const updateRoleModel = await RoleModel.update(id, {
        name,
        description,
      });

      if (!updateRoleModel || updateRoleModel.error) {
        return res
          .status(409)
          .json({
            error: updateRoleModel?.error || "Role not found",
          });
      }

      res.status(201).json({
        message: "Role updated successfully",
        id: updateRoleModel,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const deleteRoleModel = await RoleModel.delete(id);

      if (!deleteRoleModel || deleteRoleModel.error) {
        return res.status(404).json({ error: deleteRoleModel?.error || "Role not found" });
      }

      res.status(200).json({
        message: "Role deleted successfully",
        id: deleteRoleModel,
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: error.message });
    }
  }
  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const existingRoleModel = await RoleModel.findById(id);

      if (!existingRoleModel) {
        return res.status(404).json({ error: "Role not found" });
      }

      res.status(200).json({
        message: "Role found successfully",
        role: existingRoleModel,
      });
    } catch (error) {
      console.error("Error finding role by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new RolesController();
