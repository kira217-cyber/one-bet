import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import AffSocialLink from "../models/AffSocialLink.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "aff-social");
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

/* ---------------- PUBLIC: client active list ---------------- */
/**
 * GET /api/aff-social-link
 */
router.get("/aff-social-link", async (_req, res) => {
  try {
    const doc = await AffSocialLink.findOne({}).lean();

    const items =
      doc?.items
        ?.filter((item) => item.isActive)
        ?.sort((a, b) => a.order - b.order) || [];

    return res.status(200).json({
      success: true,
      message: "Affiliate social links fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /aff-social-link error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch affiliate social links",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: get all ---------------- */
/**
 * GET /api/admin/aff-social-link
 */
router.get("/admin/aff-social-link", async (_req, res) => {
  try {
    const doc = await AffSocialLink.findOne({}).lean();

    return res.status(200).json({
      success: true,
      message: "Affiliate social links fetched successfully",
      data: doc || { items: [] },
    });
  } catch (error) {
    console.error("GET /admin/aff-social-link error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch affiliate social links",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: add item ---------------- */
/**
 * POST /api/admin/aff-social-link
 */
router.post(
  "/admin/aff-social-link",
  upload.single("icon"),
  async (req, res) => {
    try {
      const url = normalizeText(req.body?.url);
      const order = Number(req.body?.order || 0);
      const isActive = String(req.body?.isActive) !== "false";

      if (!url || !req.file) {
        return res.status(400).json({
          success: false,
          message: "Icon and URL are required",
        });
      }

      let doc = await AffSocialLink.findOne({});
      if (!doc) {
        doc = await AffSocialLink.create({ items: [] });
      }

      doc.items.push({
        iconUrl: `/uploads/aff-social/${req.file.filename}`,
        url,
        isActive,
        order: Number.isFinite(order) ? order : 0,
      });

      await doc.save();

      return res.status(201).json({
        success: true,
        message: "Affiliate social link added successfully",
        data: doc,
      });
    } catch (error) {
      console.error("POST /admin/aff-social-link error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add affiliate social link",
        error: error.message,
      });
    }
  },
);

/* ---------------- ADMIN: update item ---------------- */
/**
 * PUT /api/admin/aff-social-link/:itemId
 */
router.put(
  "/admin/aff-social-link/:itemId",
  upload.single("icon"),
  async (req, res) => {
    try {
      const { itemId } = req.params;

      const doc = await AffSocialLink.findOne({});
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Affiliate social link document not found",
        });
      }

      const item = doc.items.id(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Affiliate social link item not found",
        });
      }

      const url = normalizeText(req.body?.url);
      const order = Number(req.body?.order || 0);
      const isActive = String(req.body?.isActive) !== "false";

      if (!url) {
        return res.status(400).json({
          success: false,
          message: "URL is required",
        });
      }

      item.url = url;
      item.order = Number.isFinite(order) ? order : 0;
      item.isActive = isActive;

      if (req.file) {
        removeFileIfExists(item.iconUrl);
        item.iconUrl = `/uploads/aff-social/${req.file.filename}`;
      }

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Affiliate social link updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("PUT /admin/aff-social-link/:itemId error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update affiliate social link",
        error: error.message,
      });
    }
  },
);

/* ---------------- ADMIN: delete item ---------------- */
/**
 * DELETE /api/admin/aff-social-link/:itemId
 */
router.delete("/admin/aff-social-link/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    const doc = await AffSocialLink.findOne({});
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Affiliate social link document not found",
      });
    }

    const item = doc.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Affiliate social link item not found",
      });
    }

    removeFileIfExists(item.iconUrl);
    item.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Affiliate social link deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("DELETE /admin/aff-social-link/:itemId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete affiliate social link",
      error: error.message,
    });
  }
});

export default router;
