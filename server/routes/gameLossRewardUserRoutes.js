import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import GameHistory from "../models/gameHistory.js";
import GameLossRewardSetting from "../models/GameLossRewardSetting.js";
import GameLossRewardClaim from "../models/GameLossRewardClaim.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const n = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
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
  return GameLossRewardClaim.findOne({
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

  periodEnd.setDate(periodEnd.getDate() + Number(setting.periodDays || 1));

  // periodEnd.setMinutes( periodEnd.getMinutes() + Number(setting.periodDays || 1), );

  const canClaimByDate = now >= periodEnd;

  return {
    periodStart,
    periodEnd,
    canClaimByDate,
    nextClaimAt: periodEnd,
    lastClaim,
  };
};

const calculateLoss = async ({ userId, periodStart, periodEnd }) => {
  const result = await GameHistory.aggregate([
    {
      $match: {
        userId,
        createdAt: {
          $gte: periodStart,
          $lt: periodEnd,
        },
      },
    },
    {
      $group: {
        _id: null,

        totalBet: {
          $sum: {
            $cond: [{ $eq: ["$bet_type", "BET"] }, "$amount", 0],
          },
        },

        totalWin: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$bet_type", "SETTLE"] },
                  { $eq: ["$status", "won"] },
                  { $eq: ["$status", "settled"] },
                ],
              },
              {
                $cond: [{ $gt: ["$win_amount", 0] }, "$win_amount", "$amount"],
              },
              0,
            ],
          },
        },

        totalRefund: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$bet_type", "CANCEL"] },
                  { $eq: ["$bet_type", "REFUND"] },
                  { $eq: ["$status", "cancelled"] },
                  { $eq: ["$status", "refunded"] },
                  { $eq: ["$status", "void"] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
      },
    },
  ]);

  const row = result?.[0] || {};

  const totalBet = n(row.totalBet);
  const totalWin = n(row.totalWin);
  const totalRefund = n(row.totalRefund);

  const netLoss = Math.max(0, totalBet - totalWin - totalRefund);

  return {
    totalBet,
    totalWin,
    totalRefund,
    netLoss,
  };
};

const calculateClaimPreview = async ({ user, setting }) => {
  const period = await getPeriod({ user, setting });

  const loss = await calculateLoss({
    userId: user.userId,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
  });

  const eligibleByLoss = loss.netLoss >= n(setting.minimumLoss);

  const claimAmount = eligibleByLoss
    ? Number(((loss.netLoss * n(setting.bonusPercent)) / 100).toFixed(2))
    : 0;

  return {
    setting,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    nextClaimAt: period.nextClaimAt,
    canClaimByDate: period.canClaimByDate,
    eligibleByLoss,
    canClaim: period.canClaimByDate && eligibleByLoss && claimAmount > 0,
    totalBet: loss.totalBet,
    totalWin: loss.totalWin,
    totalRefund: loss.totalRefund,
    netLoss: loss.netLoss,
    minimumLoss: n(setting.minimumLoss),
    bonusPercent: n(setting.bonusPercent),
    claimAmount,
  };
};

router.get("/available", requireAuth, async (req, res) => {
  try {
    const settings = await GameLossRewardSetting.find({ isActive: true })
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
    console.error("Get user available rewards error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load rewards",
    });
  }
});

router.post("/claim/:settingId", requireAuth, async (req, res) => {
  try {
    const { settingId } = req.params;

    if (!isValidObjectId(settingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid setting id",
      });
    }

    const setting = await GameLossRewardSetting.findOne({
      _id: settingId,
      isActive: true,
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Reward setting not found or inactive",
      });
    }

    const preview = await calculateClaimPreview({
      user: req.user,
      setting,
    });

    if (!preview.canClaimByDate) {
      return res.status(400).json({
        success: false,
        message: "Reward period is not completed yet",
        data: {
          periodStart: preview.periodStart,
          periodEnd: preview.periodEnd,
          nextClaimAt: preview.nextClaimAt,
        },
      });
    }

    if (!preview.eligibleByLoss) {
      return res.status(400).json({
        success: false,
        message: "Minimum loss requirement not reached",
        data: {
          netLoss: preview.netLoss,
          minimumLoss: preview.minimumLoss,
        },
      });
    }

    if (preview.claimAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Claim amount must be greater than 0",
      });
    }

    const alreadyClaimed = await GameLossRewardClaim.findOne({
      user: req.user._id,
      setting: setting._id,
      periodStart: preview.periodStart,
      periodEnd: preview.periodEnd,
    });

    if (alreadyClaimed) {
      return res.status(409).json({
        success: false,
        message: "Reward already claimed for this period",
      });
    }

    const claim = await GameLossRewardClaim.create({
      user: req.user._id,
      userId: req.user.userId,
      setting: setting._id,
      settingTitle: setting.title,
      periodDays: setting.periodDays,
      periodStart: preview.periodStart,
      periodEnd: preview.periodEnd,
      totalBet: preview.totalBet,
      totalWin: preview.totalWin,
      netLoss: preview.netLoss,
      minimumLoss: preview.minimumLoss,
      bonusPercent: preview.bonusPercent,
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
      message: "Reward claimed successfully",
      data: {
        claim,
        user: updatedUser,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Reward already claimed for this period",
      });
    }

    console.error("Claim reward error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to claim reward",
    });
  }
});

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
      data: history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get user reward history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load reward history",
    });
  }
});

export default router;
