import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import GameProvider from "../models/GameProvider.js";
import GameCategory from "../models/GameCategory.js";
import upload from "../config/multer.js";

const router = express.Router();

const providerUpload = upload.fields([
  { name: "providerIcon", maxCount: 1 },
  { name: "providerImage", maxCount: 1 },
]);

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatProvider = (req, doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    providerIconUrl: obj.providerIcon
      ? buildFileUrl(req, obj.providerIcon)
      : "",
    providerImageUrl: obj.providerImage
      ? buildFileUrl(req, obj.providerImage)
      : "",
  };
};

const deleteLocalFile = (filePath) => {
  if (!filePath) return;

  const fullPath = path.resolve(filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const deleteUploadedFiles = (files = {}) => {
  const iconFile = files?.providerIcon?.[0];
  const imageFile = files?.providerImage?.[0];

  if (iconFile?.path) deleteLocalFile(iconFile.path);
  if (imageFile?.path) deleteLocalFile(imageFile.path);
};

const toBoolean = (value) => {
  return value === true || value === "true" || value === "1" || value === 1;
};

// =========================
// CREATE PROVIDER
// =========================
router.post("/", providerUpload, async (req, res) => {
  try {
    const { categoryId, providerId, status, isHome } = req.body;

    const iconFile = req.files?.providerIcon?.[0];
    const imageFile = req.files?.providerImage?.[0];

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);
    if (!categoryExists) {
      deleteUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existing = await GameProvider.findOne({
      categoryId,
      providerId: providerId.trim(),
    });

    if (existing) {
      deleteUploadedFiles(req.files);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const newProvider = new GameProvider({
      categoryId,
      providerId: providerId.trim(),
      providerIcon: iconFile ? iconFile.path : "",
      providerImage: imageFile ? imageFile.path : "",
      isHome: toBoolean(isHome),
      status: status === "inactive" ? "inactive" : "active",
    });

    await newProvider.save();

    const populated = await GameProvider.findById(newProvider._id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    return res.status(201).json({
      success: true,
      message: "Provider added successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    deleteUploadedFiles(req.files);

    return res.status(500).json({
      success: false,
      message: "Failed to add provider",
      error: error.message,
    });
  }
});

// =========================
// GET PROVIDERS
// query: ?categoryId=xxx&status=active&isHome=true
// =========================
router.get("/", async (req, res) => {
  try {
    const { categoryId, status, isHome } = req.query;

    const filter = {};

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      filter.categoryId = categoryId;
    }

    if (status && ["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    if (isHome === "true" || isHome === "false") {
      filter.isHome = isHome === "true";
    }

    const providers = await GameProvider.find(filter)
      .populate("categoryId", "categoryName categoryTitle status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers.map((item) => formatProvider(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
      error: error.message,
    });
  }
});

// =========================
// GET SINGLE PROVIDER
// =========================
router.get("/:id", async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatProvider(req, provider),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider",
      error: error.message,
    });
  }
});

// =========================
// UPDATE PROVIDER
// =========================
router.put("/:id", providerUpload, async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);

    const iconFile = req.files?.providerIcon?.[0];
    const imageFile = req.files?.providerImage?.[0];

    if (!provider) {
      deleteUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const {
      categoryId,
      providerId,
      status,
      isHome,
      removeOldIcon,
      removeOldImage,
    } = req.body;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);
    if (!categoryExists) {
      deleteUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const duplicate = await GameProvider.findOne({
      _id: { $ne: provider._id },
      categoryId,
      providerId: providerId.trim(),
    });

    if (duplicate) {
      deleteUploadedFiles(req.files);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const oldIconPath = provider.providerIcon;
    const oldImagePath = provider.providerImage;

    provider.categoryId = categoryId;
    provider.providerId = providerId.trim();
    provider.status = status === "inactive" ? "inactive" : "active";
    provider.isHome = toBoolean(isHome);

    if (iconFile) {
      provider.providerIcon = iconFile.path;
    } else if (removeOldIcon === "true") {
      provider.providerIcon = "";
    }

    if (imageFile) {
      provider.providerImage = imageFile.path;
    } else if (removeOldImage === "true") {
      provider.providerImage = "";
    }

    await provider.save();

    if (iconFile && oldIconPath) {
      deleteLocalFile(oldIconPath);
    }

    if (imageFile && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    if (removeOldIcon === "true" && !iconFile && oldIconPath) {
      deleteLocalFile(oldIconPath);
    }

    if (removeOldImage === "true" && !imageFile && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    const populated = await GameProvider.findById(provider._id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    deleteUploadedFiles(req.files);

    return res.status(500).json({
      success: false,
      message: "Failed to update provider",
      error: error.message,
    });
  }
});

// =========================
// DELETE PROVIDER
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const oldIconPath = provider.providerIcon;
    const oldImagePath = provider.providerImage;

    await GameProvider.findByIdAndDelete(req.params.id);

    if (oldIconPath) deleteLocalFile(oldIconPath);
    if (oldImagePath) deleteLocalFile(oldImagePath);

    return res.status(200).json({
      success: true,
      message: "Provider deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete provider",
      error: error.message,
    });
  }
});

export default router;
