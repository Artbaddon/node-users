import ProfileModel from "../models/profile.model.js";

class ProfileController {
  async register(req, res) {
    try {
      const {
        web_user_id,  
        first_name,
        last_name,
        address,
        phone,
        document_type_id,
        document_number,
        photo_url,
        birth_date,
      } = req.body;
      
      if (!web_user_id || !first_name || !last_name || !document_type_id || !document_number) {
        return res.status(400).json({
          error: "web_user_id, first_name, last_name, document_type_id, and document_number are required",
        });
      }
      
      const profileId = await ProfileModel.create({
        web_user_id, 
        first_name,
        last_name,
        address,
        phone,
        document_type_id,
        document_number,
        photo_url,
        birth_date,
      });
      
      res
        .status(201)
        .json({ message: "Profile created successfully", id: profileId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async show(req, res) {
    try {
      const profiles = await ProfileModel.show();
      if (!profiles) {
        return res.status(409).json({ error: "No profiles found" });
      }
      res
        .status(200)
        .json({ message: "Profiles retrieved successfully", profiles });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const id = req.params.id;
      const {
        user_id,
        first_name,
        last_name,
        address,
        phone,
        document_type_id,
        document_number,
        photo_url,
        birth_date,
      } = req.body;
      if (
        !user_id ||
        !first_name ||
        !last_name ||
        !document_type_id ||
        !document_number ||
        !id
      ) {
        return res
          .status(409)
          .json({
            error:
              "user_id, first_name, last_name, document_type_id, document_number, and ID are required",
          });
      }
      const updateProfile = await ProfileModel.update(id, {
        user_id,
        first_name,
        last_name,
        address,
        phone,
        document_type_id,
        document_number,
        photo_url,
        birth_date,
      });
      if (!updateProfile || updateProfile.error) {
        return res
          .status(409)
          .json({ error: updateProfile?.error || "Profile not found" });
      }
      res
        .status(200)
        .json({ message: "Profile updated successfully", id: updateProfile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async delete(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const deleteProfile = await ProfileModel.delete(id);
      if (!deleteProfile || deleteProfile.error) {
        return res
          .status(404)
          .json({ error: deleteProfile?.error || "Profile not found" });
      }
      res
        .status(200)
        .json({ message: "Profile deleted successfully", id: deleteProfile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async findById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const profile = await ProfileModel.findById(id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.status(200).json({ message: "Profile found successfully", profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProfileController();
