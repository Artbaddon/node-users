import RolePermission from "../models/rolePermissions.model.js";
import RoleModel from "../models/roles.model.js";
import Permissions from "../models/permissions.model.js";
class RolePermissionsController {
  async register(req, res) {
    try {
      const { roleId, permissionId } = req.body;

      if (!roleId || !permissionId) {
        return res
          .status(400)
          .json({ error: "roleId, permissionId are required" });
      }
      const existingRole = await RoleModel.findById(roleId);
      const existingPermission = await Permissions.findById(permissionId);

      if (!existingRole) {
        return res.status(404).json({ error: "Role not found" });
      }
      if (!existingPermission) {
        return res.status(404).json({ error: "Permission not found" });
      }
      const RolePermissionId = await RolePermission.create({
        roleId,
        permissionId,
      });

      res.status(201).json({
        message: "Role-Permission created successfully",
        id: RolePermissionId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const showRolePermission = await RolePermission.show();

      if (!showRolePermission) {
        return res.status(409).json({ error: "No RolePermissions found" });
      }
      res.status(200).json({
        message: "RolePermissions retrieved successfully",
        RolePermissions: showRolePermission,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { roleId, permissionId } = req.body;

      if (!roleId || !permissionId || !id) {
        return res
          .status(409)
          .json({ error: "roleId, permissionId and ID are required" });
      }

      const updateRolePermission = await RolePermission.update(id, {
        roleId,
        permissionId,
      });

      if (!updateRolePermission || updateRolePermission.error) {
        return res.status(409).json({
          error: updateRolePermission?.error || "RolePermission not found",
        });
      }

      res.status(201).json({
        message: "RolePermission updated successfully",
        id: updateRolePermission,
      });
    } catch (error) {
      console.error("Error updating RolePermission:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const deleteRolePermission = await RolePermission.delete(id);

      if (!deleteRolePermission || deleteRolePermission.error) {
        return res.status(404).json({
          error: deleteRolePermission?.error || "RolePermission not found",
        });
      }

      res.status(200).json({
        message: "RolePermission deleted successfully",
        id: deleteRolePermission,
      });
    } catch (error) {
      console.error("Error deleting RolePermission:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const existingRolePermission = await RolePermission.findById(id);

      if (!existingRolePermission) {
        return res.status(404).json({ error: "RolePermission not found" });
      }

      res.status(200).json({
        message: "RolePermission found successfully",
        documentType: existingRolePermission,
      });
    } catch (error) {
      console.error("Error finding RolePermission by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new RolePermissionsController();
