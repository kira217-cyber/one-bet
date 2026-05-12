import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import WeeklyBonusSetting from "../models/WeeklyBonusSetting.js";
import WeeklyBonusClaim from "../models/WeeklyBonusClaim.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const num = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
};

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id || !isValidObjectId(id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

const getLastClaim = async ({ userId, settingId }) => {
  return WeeklyBonusClaim.findOne({
    userId,
    setting: settingId,
    status: "claimed",
  })
    .sort({ periodEnd: -1, claimedAt: -1 })
    .lean();
};

const getPeriod = async ({ user, setting }) => {
  const now = new Date();

  const lastClaim = await getLastClaim({
    userId: user.userId,
    settingId: setting._id,
  });

  const periodStart = lastClaim?.periodEnd
    ? new Date(lastClaim.periodEnd)
    : new Date(setting.createdAt);

  const periodEnd = new Date(periodStart);
  // live
  periodEnd.setDate(periodEnd.getDate() + Number(setting.periodDays || 1));
  //test
// periodEnd.setMinutes(periodEnd.getMinutes() + Number(setting.periodDays || 1));

  const canClaimByDate = now >= periodEnd;

  return {
    periodStart,
    periodEnd,
    canClaimByDate,
    nextClaimAt: periodEnd,
    lastClaim,
  };
};

const calculateClaimPreview = async ({ user, setting }) => {
  const period = await getPeriod({ user, setting });
  const claimAmount = Math.max(0, num(setting.amount));

  return {
    setting,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    nextClaimAt: period.nextClaimAt,
    canClaimByDate: period.canClaimByDate,
    claimAmount,
    canClaim: period.canClaimByDate && claimAmount > 0,
  };
};

// GET /api/weekly-bonus/user/available
router.get("/available", requireAuth, async (req, res) => {
  try {
    const settings = await WeeklyBonusSetting.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const data = await Promise.all(
      settings.map((setting) =>
        calculateClaimPreview({
          user: req.user,
          setting,
        }),
      ),
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get user weekly bonuses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load weekly bonuses",
    });
  }
});

// POST /api/weekly-bonus/user/claim/:settingId
router.post("/claim/:settingId", requireAuth, async (req, res) => {
  try {
    const { settingId } = req.params;

    if (!isValidObjectId(settingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting id",
      });
    }

    const setting = await WeeklyBonusSetting.findOne({
      _id: settingId,
      isActive: true,
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Weekly bonus setting not found or inactive",
      });
    }

    const preview = await calculateClaimPreview({
      user: req.user,
      setting,
    });

    if (!preview.canClaimByDate) {
      return res.status(400).json({
        success: false,
        message: "Bonus period is not completed yet",
        data: {
          periodStart: preview.periodStart,
          periodEnd: preview.periodEnd,
          nextClaimAt: preview.nextClaimAt,
        },
      });
    }

    if (preview.claimAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Claim amount must be greater than 0",
      });
    }

    const alreadyClaimed = await WeeklyBonusClaim.findOne({
      user: req.user._id,
      setting: setting._id,
      periodStart: preview.periodStart,
      periodEnd: preview.periodEnd,
    });

    if (alreadyClaimed) {
      return res.status(409).json({
        success: false,
        message: "Weekly bonus already claimed for this period",
      });
    }

    const claim = await WeeklyBonusClaim.create({
      user: req.user._id,
      userId: req.user.userId,
      setting: setting._id,
      settingTitle: setting.title,
      periodDays: setting.periodDays,
      periodStart: preview.periodStart,
      periodEnd: preview.periodEnd,
      claimAmount: preview.claimAmount,
      status: "claimed",
      claimedAt: new Date(),
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          balance: preview.claimAmount,
        },
      },
      {
        returnDocument: "after",
      },
    ).select("userId phone balance");

    return res.json({
      success: true,
      message: "Weekly bonus claimed successfully",
      data: {
        claim,
        user: updatedUser,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Weekly bonus already claimed for this period",
      });
    }

    console.error("Claim weekly bonus error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to claim weekly bonus",
    });
  }
});

// GET /api/weekly-bonus/user/history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 15));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      user: req.user._id,
    };

    const [history, total] = await Promise.all([
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
      data: history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get user weekly bonus history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load weekly bonus history",
    });
  }
});

export default router;