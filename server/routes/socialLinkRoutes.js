import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import SocialLink from "../models/SocialLink.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "social");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

const removeFileIfExists = (filePath = "") => {
  if (!filePath) return;
  const full = path.join(process.cwd(), filePath.replace(/^\/+/, ""));
  if (fs.existsSync(full)) fs.unlinkSync(full);
};

/* ---------------- PUBLIC ---------------- */
router.get("/social-link", async (_req, res) => {
  try {
    const doc = await SocialLink.findOne({}).lean();

    const items =
      doc?.items
        ?.filter((i) => i.isActive)
        ?.sort((a, b) => a.order - b.order) || [];

    res.json({
      success: true,
      data: items,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------- ADMIN GET ---------------- */
router.get("/admin/social-link", async (_req, res) => {
  try {
    const doc = await SocialLink.findOne({}).lean();

    res.json({
      success: true,
      data: doc || { items: [] },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ---------------- ADD ITEM ---------------- */
router.post(
  "/admin/social-link",
  upload.single("icon"),
  async (req, res) => {
    try {
      const url = req.body?.url;
      const order = Number(req.body?.order || 0);

      if (!url || !req.file) {
        return res.status(400).json({
          success: false,
          message: "icon and url required",
        });
      }

      let doc = await SocialLink.findOne({});
      if (!doc) {
        doc = await SocialLink.create({ items: [] });
      }

      doc.items.push({
        iconUrl: `/uploads/social/${req.file.filename}`,
        url,
        order,
        isActive: true,
      });

      await doc.save();

      res.json({ success: true, message: "Added" });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  }
);

/* ---------------- UPDATE ITEM ---------------- */
router.put(
  "/admin/social-link/:itemId",
  upload.single("icon"),
  async (req, res) => {
    try {
      const { itemId } = req.params;

      const doc = await SocialLink.findOne({});
      const item = doc.items.id(itemId);

      if (!item) return res.status(404).json({ success: false });

      item.url = req.body?.url || item.url;
      item.order = Number(req.body?.order || item.order);
      item.isActive = String(req.body?.isActive) !== "false";

      if (req.file) {
        removeFileIfExists(item.iconUrl);
        item.iconUrl = `/uploads/social/${req.file.filename}`;
      }

      await doc.save();

      res.json({ success: true, message: "Updated" });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  }
);

/* ---------------- DELETE ---------------- */
router.delete("/admin/social-link/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    const doc = await SocialLink.findOne({});
    const item = doc.items.id(itemId);

    if (!item) return res.status(404).json({ success: false });

    removeFileIfExists(item.iconUrl);
    item.deleteOne();

    await doc.save();

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;