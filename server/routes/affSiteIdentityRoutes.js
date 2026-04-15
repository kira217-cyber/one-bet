import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import AffSiteIdentity from "../models/AffSiteIdentity.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "aff-site-identity");
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
  "image/x-icon",
  "image/vnd.microsoft.icon",
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

/* ---------------- PUBLIC: get affiliate site identity ---------------- */
/**
 * GET /api/aff-site-identity
 */
router.get("/aff-site-identity", async (_req, res) => {
  try {
    const item = await AffSiteIdentity.findOne({}).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: "Affiliate site identity fetched successfully",
      data: item || null,
    });
  } catch (error) {
    console.error("GET /aff-site-identity error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch affiliate site identity",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: get affiliate site identity ---------------- */
/**
 * GET /api/admin/aff-site-identity
 */
router.get("/admin/aff-site-identity", async (_req, res) => {
  try {
    const item = await AffSiteIdentity.findOne({}).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: "Affiliate site identity fetched successfully",
      data: item || null,
    });
  } catch (error) {
    console.error("GET /admin/aff-site-identity error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch affiliate site identity",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: create or update ---------------- */
/**
 * POST /api/admin/aff-site-identity
 */
router.post(
  "/admin/aff-site-identity",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const titleBn = normalizeText(req.body?.title_bn);
      const titleEn = normalizeText(req.body?.title_en);

      let item = await AffSiteIdentity.findOne({}).sort({ createdAt: -1 });

      const newLogo = req.files?.logo?.[0]
        ? `/uploads/aff-site-identity/${req.files.logo[0].filename}`
        : "";
      const newFavicon = req.files?.favicon?.[0]
        ? `/uploads/aff-site-identity/${req.files.favicon[0].filename}`
        : "";

      if (!item) {
        item = await AffSiteIdentity.create({
          logo: newLogo,
          favicon: newFavicon,
          title: {
            bn: titleBn,
            en: titleEn,
          },
        });

        return res.status(201).json({
          success: true,
          message: "Affiliate site identity created successfully",
          data: item,
        });
      }

      if (newLogo) {
        removeFileIfExists(item.logo);
        item.logo = newLogo;
      }

      if (newFavicon) {
        removeFileIfExists(item.favicon);
        item.favicon = newFavicon;
      }

      item.title = {
        bn: titleBn,
        en: titleEn,
      };

      await item.save();

      return res.status(200).json({
        success: true,
        message: "Affiliate site identity updated successfully",
        data: item,
      });
    } catch (error) {
      console.error("POST /admin/aff-site-identity error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save affiliate site identity",
        error: error.message,
      });
    }
  }
);

/* ---------------- ADMIN: delete logo ---------------- */
/**
 * DELETE /api/admin/aff-site-identity/logo
 */
router.delete("/admin/aff-site-identity/logo", async (_req, res) => {
  try {
    const item = await AffSiteIdentity.findOne({}).sort({ createdAt: -1 });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Affiliate site identity not found",
      });
    }

    removeFileIfExists(item.logo);
    item.logo = "";
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Affiliate logo deleted successfully",
      data: item,
    });
  } catch (error) {
    console.error("DELETE /admin/aff-site-identity/logo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete affiliate logo",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: delete favicon ---------------- */
/**
 * DELETE /api/admin/aff-site-identity/favicon
 */
router.delete("/admin/aff-site-identity/favicon", async (_req, res) => {
  try {
    const item = await AffSiteIdentity.findOne({}).sort({ createdAt: -1 });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Affiliate site identity not found",
      });
    }

    removeFileIfExists(item.favicon);
    item.favicon = "";
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Affiliate favicon deleted successfully",
      data: item,
    });
  } catch (error) {
    console.error("DELETE /admin/aff-site-identity/favicon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete affiliate favicon",
      error: error.message,
    });
  }
});

export default router;