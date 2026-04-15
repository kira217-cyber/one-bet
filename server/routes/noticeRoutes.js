import express from "express";
import mongoose from "mongoose";
import Notice from "../models/Notice.js";

const router = express.Router();

const normalizeText = (v) => String(v || "").trim();

/* ---------------- PUBLIC: client notices ---------------- */
/**
 * GET /api/notices
 */
router.get("/notices", async (_req, res) => {
  try {
    const items = await Notice.find({ status: "active" })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Notices fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /notices error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: list all ---------------- */
/**
 * GET /api/admin/notices
 */
router.get("/admin/notices", async (_req, res) => {
  try {
    const items = await Notice.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Notices fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("GET /admin/notices error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: create ---------------- */
/**
 * POST /api/admin/notices
 */
router.post("/admin/notices", async (req, res) => {
  try {
    const textBn = normalizeText(req.body?.text_bn);
    const textEn = normalizeText(req.body?.text_en);
    const status = normalizeText(req.body?.status) || "active";
    const order = Number(req.body?.order || 0);

    if (!textBn || !textEn) {
      return res.status(400).json({
        success: false,
        message: "Bangla and English notice are required",
      });
    }

    const created = await Notice.create({
      text: {
        bn: textBn,
        en: textEn,
      },
      status: ["active", "inactive"].includes(status) ? status : "active",
      order: Number.isFinite(order) ? order : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: created,
    });
  } catch (error) {
    console.error("POST /admin/notices error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notice",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: update ---------------- */
/**
 * PUT /api/admin/notices/:id
 */
router.put("/admin/notices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice id",
      });
    }

    const item = await Notice.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    const textBn = normalizeText(req.body?.text_bn);
    const textEn = normalizeText(req.body?.text_en);
    const status = normalizeText(req.body?.status) || "active";
    const order = Number(req.body?.order || 0);

    if (!textBn || !textEn) {
      return res.status(400).json({
        success: false,
        message: "Bangla and English notice are required",
      });
    }

    item.text = {
      bn: textBn,
      en: textEn,
    };
    item.status = ["active", "inactive"].includes(status) ? status : "active";
    item.order = Number.isFinite(order) ? order : 0;

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("PUT /admin/notices/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notice",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN: delete ---------------- */
/**
 * DELETE /api/admin/notices/:id
 */
router.delete("/admin/notices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice id",
      });
    }

    const item = await Notice.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    await Notice.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /admin/notices/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notice",
      error: error.message,
    });
  }
});

export default router;