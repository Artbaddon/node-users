import Module from "../models/modules.model.js";

class ModulesController {
  async register(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res
          .status(400)
          .json({ error: "Name and description are required" });
      }

      const ModuleId = await Module.create({
        name,
        description,
      });

      res.status(201).json({
        message: "Modele created successfully",
        id: ModuleId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async show(req, res) {
    try {
      const showModule = await Module.show();

      if (!showModule) {
        return res.status(409).json({ error: "No Modeles found" });
      }
      res.status(200).json({
        message: "Modeles retrieved successfully",
        documentTypes: showModule,
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

      const updateModule = await Module.update(id, {
        name,
        description,
      });

      if (!updateModule || updateModule.error) {
        return res.status(409).json({
          error: updateModule?.error || "Modele not found",
        });
      }

      res.status(201).json({
        message: "Modele updated successfully",
        id: updateModule,
      });
    } catch (error) {
      console.error("Error updating Modele:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const deleteModule = await Module.delete(id);

      if (!deleteModule || deleteModule.error) {
        return res
          .status(404)
          .json({ error: deleteModule?.error || "Modele not found" });
      }

      res.status(200).json({
        message: "Modele deleted successfully",
        id: deleteModule,
      });
    } catch (error) {
      console.error("Error deleting Modele:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const existingModule = await Module.findById(id);

      if (!existingModule) {
        return res.status(404).json({ error: "Modele not found" });
      }

      res.status(200).json({
        message: "Modele found successfully",
        documentType: existingModule,
      });
    } catch (error) {
      console.error("Error finding Modele by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ModulesController();
