import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import Sports from "../models/Sports.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "sports");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMime = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

const normalizeText = (v) => String(v || "").trim();

const removeFileIfExists = (relativePath = "") => {
  if (!relativePath) return;
  const cleaned = relativePath.replace(/^\/+/, "");
  const abs = path.join(process.cwd(), cleaned);
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
  }
};

/* ---------------- PUBLIC: client list ---------------- */
/**
 * GET /api/sports
 */
router.get("/sports", async (_req, res) => {
  try {
    const items = await Sports.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Sports fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /sports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sports",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: list all ---------------- */
/**
 * GET /api/admin/sports
 */
router.get("/admin/sports", async (_req, res) => {
  try {
    const items = await Sports.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Sports fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /admin/sports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sports",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: create ---------------- */
/**
 * POST /api/admin/sports
 */
router.post(
  "/admin/sports",
  upload.single("iconImage"),
  async (req, res) => {
    try {
      const nameBn = normalizeText(req.body?.name_bn);
      const nameEn = normalizeText(req.body?.name_en);
      const gameId = normalizeText(req.body?.gameId);
      const isActive = String(req.body?.isActive) !== "false";
      const order = Number(req.body?.order || 0);

      if (!nameBn || !nameEn || !gameId) {
        return res.status(400).json({
          success: false,
          message: "Bangla name, English name and gameId are required",
        });
      }

      const iconImage = req.file
        ? `/uploads/sports/${req.file.filename}`
        : "";

      const created = await Sports.create({
        name: {
          bn: nameBn,
          en: nameEn,
        },
        iconImage,
        gameId,
        isActive,
        order: Number.isFinite(order) ? order : 0,
      });

      return res.status(201).json({
        success: true,
        message: "Sport created successfully",
        data: created,
      });
    } catch (error) {
      console.error("POST /admin/sports error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create sport",
        error: error.message,
      });
    }
  },
);

/* ---------------- ADMIN: update ---------------- */
/**
 * PUT /api/admin/sports/:id
 */
router.put(
  "/admin/sports/:id",
  upload.single("iconImage"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sport id",
        });
      }

      const item = await Sports.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Sport not found",
        });
      }

      const nameBn = normalizeText(req.body?.name_bn);
      const nameEn = normalizeText(req.body?.name_en);
      const gameId = normalizeText(req.body?.gameId);
      const isActive = String(req.body?.isActive) !== "false";
      const order = Number(req.body?.order || 0);

      if (!nameBn || !nameEn || !gameId) {
        return res.status(400).json({
          success: false,
          message: "Bangla name, English name and gameId are required",
        });
      }

      item.name = {
        bn: nameBn,
        en: nameEn,
      };
      item.gameId = gameId;
      item.isActive = isActive;
      item.order = Number.isFinite(order) ? order : 0;

      if (req.file) {
        removeFileIfExists(item.iconImage);
        item.iconImage = `/uploads/sports/${req.file.filename}`;
      }

      await item.save();

      return res.status(200).json({
        success: true,
        message: "Sport updated successfully",
        data: item,
      });
    } catch (error) {
      console.error("PUT /admin/sports/:id error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update sport",
        error: error.message,
      });
    }
  },
);

/* ---------------- ADMIN: delete ---------------- */
/**
 * DELETE /api/admin/sports/:id
 */
router.delete("/admin/sports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sport id",
      });
    }

    const item = await Sports.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Sport not found",
      });
    }

    removeFileIfExists(item.iconImage);
    await Sports.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Sport deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /admin/sports/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete sport",
      error: error.message,
    });
  }
});

export default router;