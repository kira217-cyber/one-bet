import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import FeaturedGame from "../models/FeaturedGame.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "featured-games");
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
 * GET /api/featured-games
 */
router.get("/featured-games", async (_req, res) => {
  try {
    const items = await FeaturedGame.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Featured games fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /featured-games error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured games",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: list all ---------------- */
/**
 * GET /api/admin/featured-games
 */
router.get("/admin/featured-games", async (_req, res) => {
  try {
    const items = await FeaturedGame.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Featured games fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /admin/featured-games error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured games",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: create ---------------- */
/**
 * POST /api/admin/featured-games
 */
router.post(
  "/admin/featured-games",
  upload.single("bannerImage"),
  async (req, res) => {
    try {
      const gameId = normalizeText(req.body?.gameId);
      const isActive = String(req.body?.isActive) !== "false";
      const order = Number(req.body?.order || 0);

      if (!gameId) {
        return res.status(400).json({
          success: false,
          message: "gameId is required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Banner image is required",
        });
      }

      const bannerImage = `/uploads/featured-games/${req.file.filename}`;

      const created = await FeaturedGame.create({
        bannerImage,
        gameId,
        isActive,
        order: Number.isFinite(order) ? order : 0,
      });

      return res.status(201).json({
        success: true,
        message: "Featured game created successfully",
        data: created,
      });
    } catch (error) {
      console.error("POST /admin/featured-games error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create featured game",
        error: error.message,
      });
    }
  },
);

/* ---------------- ADMIN: update ---------------- */
/**
 * PUT /api/admin/featured-games/:id
 */
router.put(
  "/admin/featured-games/:id",
  upload.single("bannerImage"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid featured game id",
        });
      }

      const item = await FeaturedGame.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Featured game not found",
        });
      }

      const gameId = normalizeText(req.body?.gameId);
      const isActive = String(req.body?.isActive) !== "false";
      const order = Number(req.body?.order || 0);

      if (!gameId) {
        return res.status(400).json({
          success: false,
          message: "gameId is required",
        });
      }

      item.gameId = gameId;
      item.isActive = isActive;
      item.order = Number.isFinite(order) ? order : 0;

      if (req.file) {
        removeFileIfExists(item.bannerImage);
        item.bannerImage = `/uploads/featured-games/${req.file.filename}`;
      }

      await item.save();

      return res.status(200).json({
        success: true,
        message: "Featured game updated successfully",
        data: item,
      });
    } catch (error) {
      console.error("PUT /admin/featured-games/:id error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update featured game",
        error: error.message,
      });
    }
  },
);

/* ---------------- ADMIN: delete ---------------- */
/**
 * DELETE /api/admin/featured-games/:id
 */
router.delete("/admin/featured-games/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid featured game id",
      });
    }

    const item = await FeaturedGame.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Featured game not found",
      });
    }

    removeFileIfExists(item.bannerImage);
    await FeaturedGame.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Featured game deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /admin/featured-games/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete featured game",
      error: error.message,
    });
  }
});

export default router;