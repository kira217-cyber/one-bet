import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import Promotion from "../models/Promotion.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "promotions");
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

/* ---------------- PUBLIC: get active promotions ---------------- */
/**
 * GET /api/promotions
 * GET /api/promotions?category=Casino
 */
router.get("/promotions", async (req, res) => {
  try {
    const category = normalizeText(req.query?.category);
    const query = { status: "active" };

    if (category) {
      query.category = category;
    }

    const items = await Promotion.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Promotions fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /promotions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch promotions",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: get all promotions ---------------- */
/**
 * GET /api/admin/promotions
 */
router.get("/admin/promotions", async (_req, res) => {
  try {
    const items = await Promotion.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Promotions fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /admin/promotions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch promotions",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: create promotion ---------------- */
/**
 * POST /api/admin/promotions
 */
router.post(
  "/admin/promotions",
  upload.single("image"),
  async (req, res) => {
    try {
      const category = normalizeText(req.body?.category);
      const titleBn = normalizeText(req.body?.title_bn);
      const titleEn = normalizeText(req.body?.title_en);
      const descriptionBn = String(req.body?.description_bn || "").trim();
      const descriptionEn = String(req.body?.description_en || "").trim();
      const status = normalizeText(req.body?.status) || "active";

      if (!category || !titleBn || !titleEn || !req.file) {
        return res.status(400).json({
          success: false,
          message: "Category, title Bangla, title English and image are required",
        });
      }

      const created = await Promotion.create({
        category,
        title: {
          bn: titleBn,
          en: titleEn,
        },
        description: {
          bn: descriptionBn,
          en: descriptionEn,
        },
        image: `/uploads/promotions/${req.file.filename}`,
        status: ["active", "inactive"].includes(status) ? status : "active",
      });

      return res.status(201).json({
        success: true,
        message: "Promotion created successfully",
        data: created,
      });
    } catch (error) {
      console.error("POST /admin/promotions error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create promotion",
        error: error.message,
      });
    }
  }
);

/* ---------------- ADMIN: update promotion ---------------- */
/**
 * PUT /api/admin/promotions/:id
 */
router.put(
  "/admin/promotions/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid promotion id",
        });
      }

      const item = await Promotion.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Promotion not found",
        });
      }

      const category = normalizeText(req.body?.category);
      const titleBn = normalizeText(req.body?.title_bn);
      const titleEn = normalizeText(req.body?.title_en);
      const descriptionBn = String(req.body?.description_bn || "").trim();
      const descriptionEn = String(req.body?.description_en || "").trim();
      const status = normalizeText(req.body?.status) || "active";

      if (!category || !titleBn || !titleEn) {
        return res.status(400).json({
          success: false,
          message: "Category, title Bangla and title English are required",
        });
      }

      item.category = category;
      item.title = {
        bn: titleBn,
        en: titleEn,
      };
      item.description = {
        bn: descriptionBn,
        en: descriptionEn,
      };
      item.status = ["active", "inactive"].includes(status) ? status : "active";

      if (req.file) {
        removeFileIfExists(item.image);
        item.image = `/uploads/promotions/${req.file.filename}`;
      }

      await item.save();

      return res.status(200).json({
        success: true,
        message: "Promotion updated successfully",
        data: item,
      });
    } catch (error) {
      console.error("PUT /admin/promotions/:id error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update promotion",
        error: error.message,
      });
    }
  }
);

/* ---------------- ADMIN: delete promotion ---------------- */
/**
 * DELETE /api/admin/promotions/:id
 */
router.delete("/admin/promotions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotion id",
      });
    }

    const item = await Promotion.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    removeFileIfExists(item.image);
    await Promotion.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /admin/promotions/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete promotion",
      error: error.message,
    });
  }
});

export default router;