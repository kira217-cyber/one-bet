import express from "express";
import mongoose from "mongoose";
import WeeklyBonusSetting from "../models/WeeklyBonusSetting.js";
import WeeklyBonusClaim from "../models/WeeklyBonusClaim.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const num = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

// GET /api/weekly-bonus/admin/settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await WeeklyBonusSetting.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get weekly bonus settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load weekly bonus settings",
    });
  }
});

// POST /api/weekly-bonus/admin/settings
router.post("/settings", async (req, res) => {
  try {
    const {
      title,
      periodDays = 7,
      amount = 0,
      isActive = true,
      order = 0,
    } = req.body;

    const setting = await WeeklyBonusSetting.create({
      title: {
        bn: title?.bn || "",
        en: title?.en || "",
      },
      periodDays: Math.max(1, num(periodDays)),
      amount: Math.max(0, num(amount)),
      isActive: Boolean(isActive),
      order: num(order),
    });

    return res.status(201).json({
      success: true,
      message: "Weekly bonus setting created successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Create weekly bonus setting error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create weekly bonus setting",
    });
  }
});

// PUT /api/weekly-bonus/admin/settings/:id
router.put("/settings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting id",
      });
    }

    const update = {};

    if (req.body.title) {
      update.title = {
        bn: req.body.title?.bn || "",
        en: req.body.title?.en || "",
      };
    }

    if (req.body.periodDays !== undefined) {
      update.periodDays = Math.max(1, num(req.body.periodDays));
    }

    if (req.body.amount !== undefined) {
      update.amount = Math.max(0, num(req.body.amount));
    }

    if (req.body.isActive !== undefined) {
      update.isActive = Boolean(req.body.isActive);
    }

    if (req.body.order !== undefined) {
      update.order = num(req.body.order);
    }

    const setting = await WeeklyBonusSetting.findByIdAndUpdate(id, update, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Weekly bonus setting not found",
      });
    }

    return res.json({
      success: true,
      message: "Weekly bonus setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Update weekly bonus setting error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update weekly bonus setting",
    });
  }
});

// DELETE /api/weekly-bonus/admin/settings/:id
router.delete("/settings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting id",
      });
    }

    const setting = await WeeklyBonusSetting.findByIdAndDelete(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Weekly bonus setting not found",
      });
    }

    return res.json({
      success: true,
      message: "Weekly bonus setting deleted successfully",
    });
  } catch (error) {
    console.error("Delete weekly bonus setting error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete weekly bonus setting",
    });
  }
});

// GET /api/weekly-bonus/admin/claims
router.get("/claims", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      q = "",
      status = "",
      settingId = "",
      from = "",
      to = "",
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 15));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status) filter.status = status;

    if (settingId && isValidObjectId(settingId)) {
      filter.setting = settingId;
    }

    if (q) {
      filter.userId = { $regex: String(q).trim(), $options: "i" };
    }

    if (from || to) {
      filter.claimedAt = {};
      if (from) filter.claimedAt.$gte = new Date(from);

      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.claimedAt.$lte = toDate;
      }
    }

    const [claims, total] = await Promise.all([
      WeeklyBonusClaim.find(filter)
        .populate("user", "userId phone email firstName lastName balance role")
        .populate("setting", "title periodDays amount")
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      WeeklyBonusClaim.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: claims,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get weekly bonus claims error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load weekly bonus claims",
    });
  }
});

// GET /api/weekly-bonus/admin/users/:userId/claims
router.get("/users/:userId/claims", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 15 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 15));
    const skip = (pageNum - 1) * limitNum;

    const filter = { userId };

    const [claims, total] = await Promise.all([
      WeeklyBonusClaim.find(filter)
        .populate("setting", "title periodDays amount")
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      WeeklyBonusClaim.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: claims,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get single user weekly bonus claims error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user weekly bonus claims",
    });
  }
});

export default router;