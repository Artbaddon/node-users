import ProfileModel from "../models/profile.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create profile upload function
const createProfileUpload = () => {
  // Ensure directory exists
  const uploadDir = "uploads/profiles/";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `profile-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files allowed!"), false);
      }
    },
  }).single("profile_photo");
};

class ProfileController {
  async register(req, res) {
    const profileUpload = createProfileUpload();

    profileUpload(req, res, async (err) => {
      // Handle upload errors
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const {
          web_user_id,
          first_name,
          last_name,
          address,
          phone,
          document_type_id,
          document_number,
          birth_date,
        } = req.body;

        // Only set photo_url if user actually uploaded a file
        const photo_url = req.file
          ? `/uploads/profiles/${req.file.filename}`
          : null;

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

        const response = {
          message: "Profile created successfully",
          id: profileId,
        };

        // Only include photo_url in response if file was uploaded
        if (photo_url) {
          response.photo_url = photo_url;
        }

        res.status(201).json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
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
    const profileUpload = createProfileUpload();

    profileUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Map web_user_id to user_id for the model
        if (updateData.web_user_id) {
          updateData.user_id = updateData.web_user_id;
          delete updateData.web_user_id;
        }

        // Only update photo_url if new file was uploaded
        if (req.file) {
          updateData.photo_url = `/uploads/profiles/${req.file.filename}`;
        }
        // If no file uploaded, don't change existing photo_url

        console.log("📝 Profile update data:", updateData);

        const result = await ProfileModel.update(id, updateData);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Profile not found" });
        }

        const response = { message: "Profile updated successfully" };

        // Include new photo URL if uploaded
        if (req.file) {
          response.photo_url = updateData.photo_url;
        }

        res.json(response);
      } catch (error) {
        console.error("❌ Profile update error:", error);
        res.status(500).json({ error: error.message });
      }
    });
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
