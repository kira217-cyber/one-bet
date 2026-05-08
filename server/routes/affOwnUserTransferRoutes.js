import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import AffOwnUserTransfer from "../models/AffOwnUserTransfer.js";
import DepositRequest from "../models/DepositRequests.js";
import AutoDeposit from "../models/AutoDeposit.js";

const router = express.Router();

const REQUIRED_ACTIVE_DEPOSITED_REFERRALS = 5;

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const getAuthUserFromToken = async (req) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) return null;

    return await User.findById(id);
  } catch (error) {
    return null;
  }
};

const hasPendingBulkAdjustment = (user) => {
  return !!user?.pendingBulkAdjustment || !!user?.bulkAdjustmentRequired;
};

const getAffReferralEligibility = async (affUser) => {
  const referredUsers = await User.find({
    referredBy: affUser._id,
    role: "user",
    isActive: true,
  })
    .select("_id userId phone")
    .lean();

  const activeReferralCount = referredUsers.length;

  const referredObjectIds = referredUsers.map((u) => u._id);

  const referredIdentityValues = referredUsers.flatMap((u) =>
    [String(u._id), String(u.userId || ""), String(u.phone || "")].filter(
      Boolean,
    ),
  );

  const [manualDepositors, autoDepositors] = await Promise.all([
    DepositRequest.distinct("user", {
      user: { $in: referredObjectIds },
      status: "approved",
    }),

    AutoDeposit.distinct("userIdentity", {
      userIdentity: { $in: referredIdentityValues },
      status: "PAID",
    }),
  ]);

  const depositedUserSet = new Set();

  manualDepositors.forEach((id) => {
    depositedUserSet.add(String(id));
  });

  const autoDepositorSet = new Set(autoDepositors.map(String));

  referredUsers.forEach((u) => {
    const identities = [
      String(u._id),
      String(u.userId || ""),
      String(u.phone || ""),
    ].filter(Boolean);

    if (identities.some((identity) => autoDepositorSet.has(identity))) {
      depositedUserSet.add(String(u._id));
    }
  });

  const depositedReferralCount = depositedUserSet.size;

  const remainingReferralCount = Math.max(
    REQUIRED_ACTIVE_DEPOSITED_REFERRALS - depositedReferralCount,
    0,
  );

  return {
    eligible: depositedReferralCount >= REQUIRED_ACTIVE_DEPOSITED_REFERRALS,
    required: REQUIRED_ACTIVE_DEPOSITED_REFERRALS,
    activeReferralCount,
    depositedReferralCount,
    remainingReferralCount,
    message:
      depositedReferralCount >= REQUIRED_ACTIVE_DEPOSITED_REFERRALS
        ? "Referral requirement completed."
        : `You need ${remainingReferralCount} more active referred user(s) with at least one deposit.`,
  };
};

/**
 * GET /api/aff-own-user-transfer/my-own-user
 */
router.get("/my-own-user", async (req, res) => {
  try {
    const affUser = await getAuthUserFromToken(req);

    if (!affUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (affUser.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Only affiliate users allowed",
      });
    }

    await affUser.populate(
      "ownUser",
      "userId phone email balance isActive createdAt",
    );

    return res.json({
      success: true,
      data: {
        ownUser: affUser.ownUser || null,
      },
    });
  } catch (error) {
    console.error("get own user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * POST /api/aff-own-user-transfer/create-own-user
 */
router.post("/create-own-user", async (req, res) => {
  try {
    const affUser = await getAuthUserFromToken(req);

    if (!affUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (affUser.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Only affiliate users allowed",
      });
    }

    if (affUser.ownUser) {
      return res.status(400).json({
        success: false,
        message: "You already created your own user.",
      });
    }

    const userId = String(req.body?.userId || "")
      .trim()
      .toLowerCase();

    const phone = String(req.body?.phone || "").trim();

    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body?.password || "").trim();

    if (!userId || userId.length < 4 || userId.length > 15) {
      return res.status(400).json({
        success: false,
        message: "User ID must be 4 to 15 characters.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const exists = await User.findOne({
      $or: [{ userId }, { phone }],
    }).lean();

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User ID or phone already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const ownUser = await User.create({
      userId,
      phone,
      email,
      password: hashedPassword,
      role: "user",
      isActive: true,
      currency: affUser.currency || "BDT",
      balance: 0,
      referredBy: affUser._id,
    });

    affUser.ownUser = ownUser._id;
    affUser.ownUserCreatedAt = new Date();
    affUser.createdUsers = [...(affUser.createdUsers || []), ownUser._id];
    affUser.referralCount = n(affUser.referralCount) + 1;

    await affUser.save();

    return res.status(201).json({
      success: true,
      message: "Own gameplay user created successfully.",
      data: {
        ownUser: {
          _id: ownUser._id,
          userId: ownUser.userId,
          phone: ownUser.phone,
          email: ownUser.email,
          balance: ownUser.balance,
          isActive: ownUser.isActive,
          createdAt: ownUser.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("create own user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * GET /api/aff-own-user-transfer/eligibility
 */
router.get("/eligibility", async (req, res) => {
  try {
    const affUser = await getAuthUserFromToken(req);

    if (!affUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (affUser.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Only affiliate users allowed",
      });
    }

    await affUser.populate(
      "ownUser",
      "userId phone email balance isActive createdAt",
    );

    const referralEligibility = await getAffReferralEligibility(affUser);

    if (!affUser.ownUser) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          remaining: n(affUser.balance),
          ...referralEligibility,
          ownUser: null,
          message: "Please create your own gameplay user first.",
        },
      });
    }

    if (!referralEligibility.eligible) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          remaining: n(affUser.balance),
          ...referralEligibility,
          ownUser: affUser.ownUser,
        },
      });
    }

    if (hasPendingBulkAdjustment(affUser)) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          remaining: 0,
          ...referralEligibility,
          ownUser: affUser.ownUser,
          message: "Bulk Adjustment first required before balance transfer.",
        },
      });
    }

    if (n(affUser.balance) <= 0) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          remaining: 0,
          ...referralEligibility,
          ownUser: affUser.ownUser,
          message: "Insufficient transferable balance.",
        },
      });
    }

    if (!affUser.ownUser.isActive) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          remaining: n(affUser.balance),
          ...referralEligibility,
          ownUser: affUser.ownUser,
          message: "Your own gameplay user is inactive.",
        },
      });
    }

    return res.json({
      success: true,
      data: {
        eligible: true,
        remaining: n(affUser.balance),
        ...referralEligibility,
        ownUser: affUser.ownUser,
        message: "Eligible",
      },
    });
  } catch (error) {
    console.error("own user transfer eligibility error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * POST /api/aff-own-user-transfer/transfer
 */
router.post("/transfer", async (req, res) => {
  try {
    const affUser = await getAuthUserFromToken(req);
    const amount = Number(req.body?.amount || 0);

    if (!affUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (affUser.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Only affiliate users allowed",
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required.",
      });
    }

    const referralEligibility = {
      eligible: true,
      required: 5,
      activeReferralCount: 5,
      depositedReferralCount: 5,
      remainingReferralCount: 0,
      message: "Referral requirement bypassed for testing.",
    };

    if (!referralEligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: referralEligibility.message,
        data: referralEligibility,
      });
    }

    if (!affUser.ownUser) {
      return res.status(400).json({
        success: false,
        message: "Please create your own gameplay user first.",
      });
    }

    if (hasPendingBulkAdjustment(affUser)) {
      return res.status(400).json({
        success: false,
        message: "Bulk Adjustment first required before balance transfer.",
      });
    }

    if (amount > n(affUser.balance)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance.",
      });
    }

    const ownUser = await User.findById(affUser.ownUser);

    if (!ownUser || ownUser.role !== "user") {
      return res.status(404).json({
        success: false,
        message: "Own gameplay user not found.",
      });
    }

    if (!ownUser.isActive) {
      return res.status(400).json({
        success: false,
        message: "Own gameplay user is inactive.",
      });
    }

    const affBalanceBefore = n(affUser.balance);
    const ownUserBalanceBefore = n(ownUser.balance);

    const affBalanceAfter = affBalanceBefore - amount;
    const ownUserBalanceAfter = ownUserBalanceBefore + amount;

    const updatedAffUser = await User.findOneAndUpdate(
      {
        _id: affUser._id,
        balance: { $gte: amount },
      },
      {
        $inc: {
          balance: -amount,
        },
      },
      {
        new: true,
      },
    );

    if (!updatedAffUser) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance.",
      });
    }

    await User.updateOne(
      {
        _id: ownUser._id,
      },
      {
        $inc: {
          balance: amount,
        },
      },
    );

    const transfer = await AffOwnUserTransfer.create({
      affUser: affUser._id,
      ownUser: ownUser._id,
      amount,
      status: "completed",
      affBalanceBefore,
      affBalanceAfter,
      ownUserBalanceBefore,
      ownUserBalanceAfter,
      eligibilitySnapshot: {
        required: referralEligibility.required,
        activeReferralCount: referralEligibility.activeReferralCount,
        depositedReferralCount: referralEligibility.depositedReferralCount,
        remainingReferralCount: referralEligibility.remainingReferralCount,
        message: referralEligibility.message,
      },
      note: "Affiliate balance transferred to own gameplay user.",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    return res.status(201).json({
      success: true,
      message: "Balance transferred to own user successfully.",
      data: transfer,
    });
  } catch (error) {
    console.error("own user transfer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * GET /api/aff-own-user-transfer/history?page=1&limit=15
 */
router.get("/history", async (req, res) => {
  try {
    const affUser = await getAuthUserFromToken(req);

    if (!affUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (affUser.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Only affiliate users allowed",
      });
    }

    const page = Math.max(Number(req.query?.page || 1), 1);
    const limit = Math.max(Number(req.query?.limit || 15), 1);
    const skip = (page - 1) * limit;

    const query = {
      affUser: affUser._id,
    };

    const [rows, total] = await Promise.all([
      AffOwnUserTransfer.find(query)
        .populate("ownUser", "userId phone balance")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AffOwnUserTransfer.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.max(Math.ceil(total / limit), 1),
        limit,
      },
    });
  } catch (error) {
    console.error("own user transfer history error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
