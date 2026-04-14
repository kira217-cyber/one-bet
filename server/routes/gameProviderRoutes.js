// routes/gameProviderRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import GameProvider from "../models/GameProvider.js";
import GameCategory from "../models/GameCategory.js";
import upload from "../config/multer.js";

const router = express.Router();

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatProvider = (req, doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    providerIconUrl: obj.providerIcon ? buildFileUrl(req, obj.providerIcon) : "",
  };
};

const deleteLocalFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// =========================
// CREATE PROVIDER
// =========================
router.post("/", upload.single("providerIcon"), async (req, res) => {
  try {
    const { categoryId, providerId, status } = req.body;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      if (req.file) deleteLocalFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);
    if (!categoryExists) {
      if (req.file) deleteLocalFile(req.file.path);
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
      if (req.file) deleteLocalFile(req.file.path);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const newProvider = new GameProvider({
      categoryId,
      providerId: providerId.trim(),
      providerIcon: req.file ? req.file.path : "",
      status: status === "inactive" ? "inactive" : "active",
    });

    await newProvider.save();

    const populated = await GameProvider.findById(newProvider._id).populate(
      "categoryId",
      "categoryName categoryTitle status"
    );

    return res.status(201).json({
      success: true,
      message: "Provider added successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    return res.status(500).json({
      success: false,
      message: "Failed to add provider",
      error: error.message,
    });
  }
});

// =========================
// GET PROVIDERS
// query: ?categoryId=xxx
// =========================
router.get("/", async (req, res) => {
  try {
    const { categoryId, status } = req.query;

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
      "categoryName categoryTitle status"
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
router.put("/:id", upload.single("providerIcon"), async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);

    if (!provider) {
      if (req.file) deleteLocalFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const { categoryId, providerId, status, removeOldIcon } = req.body;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      if (req.file) deleteLocalFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      if (req.file) deleteLocalFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);
    if (!categoryExists) {
      if (req.file) deleteLocalFile(req.file.path);
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
      if (req.file) deleteLocalFile(req.file.path);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const oldIconPath = provider.providerIcon;

    provider.categoryId = categoryId;
    provider.providerId = providerId.trim();
    provider.status = status === "inactive" ? "inactive" : "active";

    if (req.file) {
      provider.providerIcon = req.file.path;
    } else if (removeOldIcon === "true") {
      provider.providerIcon = "";
    }

    await provider.save();

    if (req.file && oldIconPath) {
      deleteLocalFile(oldIconPath);
    }

    if (removeOldIcon === "true" && !req.file && oldIconPath) {
      deleteLocalFile(oldIconPath);
    }

    const populated = await GameProvider.findById(provider._id).populate(
      "categoryId",
      "categoryName categoryTitle status"
    );

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
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

    await GameProvider.findByIdAndDelete(req.params.id);

    if (oldIconPath) {
      deleteLocalFile(oldIconPath);
    }

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