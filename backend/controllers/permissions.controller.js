import Permission from "../models/permissions.model.js";

class PermissionsController {
  async register(req, res) {
    try {
      const { name, description, action } = req.body;

      if (!name || !description || !action) {
        return res
          .status(400)
          .json({ error: "Name, description and action are required" });
      }

      const PermissionId = await Permission.create({
        name,
        description,
        action,
      });

      res.status(201).json({
        message: "Permission created successfully",
        id: PermissionId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const showPermission = await Permission.show();

      if (!showPermission) {
        return res.status(409).json({ error: "No Permissions found" });
      }
      res.status(200).json({
        message: "Permissions retrieved successfully",
        permissions: showPermission,
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
          .json({ error: "Name, description, action and ID are required" });
      }

      const updatePermission = await Permission.update(id, {
        name,
        description,
      });

      if (!updatePermission || updatePermission.error) {
        return res.status(409).json({
          error: updatePermission?.error || "Permission not found",
        });
      }

      res.status(201).json({
        message: "Permission updated successfully",
        id: updatePermission,
      });
    } catch (error) {
      console.error("Error updating Permission:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const deletePermission = await Permission.delete(id);

      if (!deletePermission || deletePermission.error) {
        return res
          .status(404)
          .json({ error: deletePermission?.error || "Permission not found" });
      }

      res.status(200).json({
        message: "Permission deleted successfully",
        id: deletePermission,
      });
    } catch (error) {
      console.error("Error deleting Permission:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const existingPermission = await Permission.findById(id);

      if (!existingPermission) {
        return res.status(404).json({ error: "Permission not found" });
      }

      res.status(200).json({
        message: "Permission found successfully",
        documentType: existingPermission,
      });
    } catch (error) {
      console.error("Error finding Permission by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PermissionsController();
