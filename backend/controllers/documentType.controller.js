import DocumentTypeModel from "../models/documentType.model.js";

class DocumentTypeController {
  async register(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res
          .status(400)
          .json({ error: "Name and description are required" });
      }

      const DocumentTypeModelId = await DocumentTypeModel.create({
        name,
        description,
      });

      res.status(201).json({
        message: "Document type created successfully",
        id: DocumentTypeModelId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async show(req, res) {
    try {
      const showDocumentTypeModel = await DocumentTypeModel.show();

      if (!showDocumentTypeModel) {
        return res.status(409).json({ error: "No document types found" });
      }
      res.status(200).json({
        message: "Document types retrieved successfully",
        documentTypes: showDocumentTypeModel,
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

      const updateDocumentTypeModel = await DocumentTypeModel.update(id, {
        name,
        description,
      });

      if (!updateDocumentTypeModel || updateDocumentTypeModel.error) {
        return res.status(409).json({
          error: updateDocumentTypeModel?.error || "Document Type not found",
        });
      }

      res.status(201).json({
        message: "Document type updated successfully",
        id: updateDocumentTypeModel,
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
      console.log("Deleting document type with ID:", id);

      const deleteDocumentTypeModel = await DocumentTypeModel.delete(id);
      console.log("Delete result:", deleteDocumentTypeModel);

      if (!deleteDocumentTypeModel || deleteDocumentTypeModel.error) {
        return res
          .status(404)
          .json({
            error: deleteDocumentTypeModel?.error || "Document type not found",
          });
      }

      res.status(200).json({
        message: "Document type deleted successfully",
        id,
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

      const existingDocumentTypeModel = await DocumentTypeModel.findById(id);

      if (!existingDocumentTypeModel) {
        return res.status(404).json({ error: "Document type not found" });
      }

      res.status(200).json({
        message: "Document type found successfully",
        documentType: existingDocumentTypeModel,
      });
    } catch (error) {
      console.error("Error finding document type by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new DocumentTypeController();
