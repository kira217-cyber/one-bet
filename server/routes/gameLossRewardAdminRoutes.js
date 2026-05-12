import express from "express";
import mongoose from "mongoose";
import GameLossRewardSetting from "../models/GameLossRewardSetting.js";
import GameLossRewardClaim from "../models/GameLossRewardClaim.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const n = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

// GET /api/game-loss-rewards/admin/settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await GameLossRewardSetting.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get reward settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load reward settings",
    });
  }
});

// POST /api/game-loss-rewards/admin/settings
router.post("/settings", async (req, res) => {
  try {
    const {
      title,
      periodDays,
      minimumLoss,
      bonusPercent,
      isActive = true,
      order = 0,
    } = req.body;

    const setting = await GameLossRewardSetting.create({
      title: {
        bn: title?.bn || "",
        en: title?.en || "",
      },
      periodDays: Math.max(1, n(periodDays)),
      minimumLoss: Math.max(0, n(minimumLoss)),
      bonusPercent: Math.min(100, Math.max(0, n(bonusPercent))),
      isActive: Boolean(isActive),
      order: n(order),
    });

    return res.status(201).json({
      success: true,
      message: "Reward setting created successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Create reward setting error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create reward setting",
    });
  }
});

// PUT /api/game-loss-rewards/admin/settings/:id
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
      update.periodDays = Math.max(1, n(req.body.periodDays));
    }

    if (req.body.minimumLoss !== undefined) {
      update.minimumLoss = Math.max(0, n(req.body.minimumLoss));
    }

    if (req.body.bonusPercent !== undefined) {
      update.bonusPercent = Math.min(
        100,
        Math.max(0, n(req.body.bonusPercent))
      );
    }

    if (req.body.isActive !== undefined) {
      update.isActive = Boolean(req.body.isActive);
    }

    if (req.body.order !== undefined) {
      update.order = n(req.body.order);
    }

    const setting = await GameLossRewardSetting.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Reward setting not found",
      });
    }

    return res.json({
      success: true,
      message: "Reward setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Update reward setting error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update reward setting",
    });
  }
});

// DELETE /api/game-loss-rewards/admin/settings/:id
router.delete("/settings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting id",
      });
    }

    const setting = await GameLossRewardSetting.findByIdAndDelete(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Reward setting not found",
      });
    }

    return res.json({
      success: true,
      message: "Reward setting deleted successfully",
    });
  } catch (error) {
    console.error("Delete reward setting error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete reward setting",
    });
  }
});

// GET /api/game-loss-rewards/admin/claims
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
      GameLossRewardClaim.find(filter)
        .populate("user", "userId phone firstName lastName balance role")
        .populate("setting", "title periodDays minimumLoss bonusPercent")
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      GameLossRewardClaim.countDocuments(filter),
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
    console.error("Get reward claims error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load reward claims",
    });
  }
});

// GET /api/game-loss-rewards/admin/users/:userId/claims
router.get("/users/:userId/claims", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 15 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 15));
    const skip = (pageNum - 1) * limitNum;

    const filter = { userId };

    const [claims, total] = await Promise.all([
      GameLossRewardClaim.find(filter)
        .populate("setting", "title periodDays minimumLoss bonusPercent")
        .sort({ claimedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      GameLossRewardClaim.countDocuments(filter),
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
    console.error("Get single user reward claims error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user reward claims",
    });
  }
});

export default router;