import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import Slider from "../models/Slider.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "sliders");
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

/* ---------------- helper ---------------- */
const removeFileIfExists = (relativePath = "") => {
  if (!relativePath) return;
  const cleaned = relativePath.replace(/^\/+/, "");
  const abs = path.join(process.cwd(), cleaned);
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
  }
};

/* ---------------- PUBLIC: client sliders ---------------- */
/**
 * GET /api/sliders
 */
router.get("/sliders", async (_req, res) => {
  try {
    const items = await Slider.find({ status: "active" })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Sliders fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /sliders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: list all ---------------- */
/**
 * GET /api/admin/sliders
 */
router.get("/admin/sliders", async (_req, res) => {
  try {
    const items = await Slider.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Sliders fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /admin/sliders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: create ---------------- */
/**
 * POST /api/admin/sliders
 */
router.post(
  "/admin/sliders",
  upload.single("image"),
  async (req, res) => {
    try {
      const { order, status } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      const created = await Slider.create({
        image: `/uploads/sliders/${req.file.filename}`,
        order: Number(order || 0),
        status: status || "active",
      });

      return res.status(201).json({
        success: true,
        message: "Slider created successfully",
        data: created,
      });
    } catch (error) {
      console.error("POST /admin/sliders error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create slider",
        error: error.message,
      });
    }
  }
);

/* ---------------- ADMIN: update ---------------- */
/**
 * PUT /api/admin/sliders/:id
 */
router.put(
  "/admin/sliders/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid slider id",
        });
      }

      const item = await Slider.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Slider not found",
        });
      }

      const { order, status } = req.body;

      item.order = Number(order || 0);
      item.status = status || "active";

      if (req.file) {
        removeFileIfExists(item.image);
        item.image = `/uploads/sliders/${req.file.filename}`;
      }

      await item.save();

      return res.status(200).json({
        success: true,
        message: "Slider updated successfully",
        data: item,
      });
    } catch (error) {
      console.error("PUT /admin/sliders/:id error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update slider",
        error: error.message,
      });
    }
  }
);

/* ---------------- ADMIN: delete ---------------- */
/**
 * DELETE /api/admin/sliders/:id
 */
router.delete("/admin/sliders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slider id",
      });
    }

    const item = await Slider.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    removeFileIfExists(item.image);
    await Slider.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /admin/sliders/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete slider",
      error: error.message,
    });
  }
});

export default router;