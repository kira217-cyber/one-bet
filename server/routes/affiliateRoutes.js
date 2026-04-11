import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/**
 * auth middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/**
 * only affiliate user
 */
const affiliateOnly = async (req, res, next) => {
  try {
    const affiliate = await User.findById(req.user._id);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (affiliate.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Affiliate access only",
      });
    }

    if (!affiliate.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your affiliate account is not active yet",
      });
    }

    req.affiliate = affiliate;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

/**
 * helper: generate date labels for chart
 */
const formatDateLabel = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * GET /api/affiliate/dashboard/me
 */
router.get("/dashboard/me", authMiddleware, affiliateOnly, async (req, res) => {
  try {
    const affiliate = req.affiliate;

    const totalReferrals = await User.countDocuments({
      referredBy: affiliate._id,
    });

    const activeReferrals = await User.countDocuments({
      referredBy: affiliate._id,
      isActive: true,
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthNewReferrals = await User.countDocuments({
      referredBy: affiliate._id,
      createdAt: { $gte: startOfMonth },
    });

    const recentReferrals = await User.find({
      referredBy: affiliate._id,
    })
      .select("userId phone balance currency isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(8);

    const thisMonthReferrals = await User.countDocuments({
      referredBy: affiliate._id,
      createdAt: { $gte: startOfMonth },
    });

    const referCommissionPerUser = Number(affiliate.referCommission || 0);
    const thisMonthEarnings = thisMonthReferrals * referCommissionPerUser;

    return res.status(200).json({
      success: true,
      data: {
        affiliate: {
          _id: affiliate._id,
          userId: affiliate.userId,
          firstName: affiliate.firstName,
          lastName: affiliate.lastName,
          fullName: `${affiliate.firstName || ""} ${affiliate.lastName || ""}`.trim(),
          email: affiliate.email,
          phone: affiliate.phone,
          referralCode: affiliate.referralCode,
          currency: affiliate.currency || "BDT",
          isActive: affiliate.isActive,
          balance: affiliate.balance || 0,
          commissionBalance: affiliate.commissionBalance || 0,
          referCommission: affiliate.referCommission || 0,
          gameLossCommission: affiliate.gameLossCommission || 0,
          depositCommission: affiliate.depositCommission || 0,
          gameWinCommission: affiliate.gameWinCommission || 0,
        },
        stats: {
          totalReferrals,
          activeReferrals,
          thisMonthNewReferrals,
          totalCommissionEarned: Number(affiliate.commissionBalance || 0),
          thisMonthEarnings,
        },
        recentReferrals,
      },
    });
  } catch (error) {
    console.error("AFFILIATE DASHBOARD ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate dashboard",
      error: error.message,
    });
  }
});

/**
 * GET /api/affiliate/dashboard/earnings?days=30
 */
router.get(
  "/dashboard/earnings",
  authMiddleware,
  affiliateOnly,
  async (req, res) => {
    try {
      const affiliate = req.affiliate;

      let days = Number(req.query.days || 30);

      if (![7, 14, 30, 60].includes(days)) {
        days = 30;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      const referrals = await User.find({
        referredBy: affiliate._id,
        createdAt: { $gte: startDate, $lte: endDate },
      }).select("createdAt");

      const referCommissionPerUser = Number(affiliate.referCommission || 0);

      const dateMap = new Map();

      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);

        const key = d.toISOString().slice(0, 10);
        dateMap.set(key, 0);
      }

      referrals.forEach((user) => {
        const key = new Date(user.createdAt).toISOString().slice(0, 10);

        if (dateMap.has(key)) {
          dateMap.set(key, dateMap.get(key) + referCommissionPerUser);
        }
      });

      const labels = [];
      const dailyEarnings = [];
      const cumulativeEarnings = [];

      let runningTotal = 0;

      for (const [key, value] of dateMap.entries()) {
        labels.push(formatDateLabel(key));
        dailyEarnings.push(value);

        runningTotal += value;
        cumulativeEarnings.push(runningTotal);
      }

      return res.status(200).json({
        success: true,
        data: {
          days,
          labels,
          dailyEarnings,
          cumulativeEarnings,
        },
      });
    } catch (error) {
      console.error("AFFILIATE EARNINGS CHART ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load earnings chart",
        error: error.message,
      });
    }
  }
);

/**
 * optional: balance API for sidebar/navbar
 * GET /api/affiliate/me/balance
 */
router.get("/me/balance", authMiddleware, affiliateOnly, async (req, res) => {
  try {
    const affiliate = req.affiliate;

    return res.status(200).json({
      success: true,
      balance: Number(affiliate.commissionBalance || 0),
      currency: affiliate.currency || "BDT",
    });
  } catch (error) {
    console.error("AFFILIATE BALANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load balance",
    });
  }
});



/**
 * GET MY USERS
 * /api/affiliate/my-users
 */
router.get("/my-users", authMiddleware, affiliateOnly, async (req, res) => {
  try {
    const affiliateId = req.affiliate._id;

    const users = await User.find({
      referredBy: affiliateId,
    })
      .select("userId phone email isActive balance currency createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET MY USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load referred users",
      error: error.message,
    });
  }
});

/**
 * TOGGLE MY USER ACTIVE / INACTIVE
 * /api/affiliate/my-users/:id/toggle-status
 */
router.patch(
  "/my-users/:id/toggle-status",
  authMiddleware,
  affiliateOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const targetUser = await User.findOne({
        _id: id,
        referredBy: req.affiliate._id,
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "User not found or not assigned to you",
        });
      }

      targetUser.isActive = !!isActive;
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: targetUser.isActive
          ? "User activated successfully"
          : "User deactivated successfully",
        user: {
          _id: targetUser._id,
          userId: targetUser.userId,
          phone: targetUser.phone,
          email: targetUser.email,
          isActive: targetUser.isActive,
        },
      });
    } catch (error) {
      console.error("TOGGLE MY USER STATUS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user status",
        error: error.message,
      });
    }
  }
);

/**
 * GET PROFILE
 * /api/affiliate/profile
 */
router.get("/profile", authMiddleware, affiliateOnly, async (req, res) => {
  try {
    const affiliate = req.affiliate;

    return res.status(200).json({
      success: true,
      user: {
        _id: affiliate._id,
        userId: affiliate.userId,
        firstName: affiliate.firstName || "",
        lastName: affiliate.lastName || "",
        phone: affiliate.phone || "",
        email: affiliate.email || "",
        role: affiliate.role,
        isActive: affiliate.isActive,
      },
    });
  } catch (error) {
    console.error("GET AFFILIATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message,
    });
  }
});

/**
 * UPDATE PROFILE
 * /api/affiliate/profile
 */
router.patch("/profile", authMiddleware, affiliateOnly, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { userId, password, firstName, lastName, phone, email } = req.body;

    if (!userId || !firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: "userId, firstName, lastName and phone are required",
      });
    }

    const trimmedUserId = userId.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email ? email.trim().toLowerCase() : "";

    if (trimmedUserId.length < 4 || trimmedUserId.length > 20) {
      return res.status(400).json({
        success: false,
        message: "User ID must be between 4 and 20 characters",
      });
    }

    const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
    if (!userIdRegex.test(trimmedUserId)) {
      return res.status(400).json({
        success: false,
        message:
          "User ID can contain only letters, numbers, @, dot, underscore and hyphen",
      });
    }

    if (password && (password.length < 8 || password.length > 20)) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 20 characters",
      });
    }

    const existingUserId = await User.findOne({
      userId: trimmedUserId,
      _id: { $ne: affiliate._id },
    });

    if (existingUserId) {
      return res.status(400).json({
        success: false,
        message: "This User ID already exists",
      });
    }

    const existingPhone = await User.findOne({
      phone: trimmedPhone,
      _id: { $ne: affiliate._id },
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "This phone number already exists",
      });
    }

    affiliate.userId = trimmedUserId;
    affiliate.firstName = trimmedFirstName;
    affiliate.lastName = trimmedLastName;
    affiliate.phone = trimmedPhone;
    affiliate.email = trimmedEmail;

    if (password && password.trim()) {
      affiliate.password = await bcrypt.hash(password, 10);
    }

    await affiliate.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: affiliate._id,
        userId: affiliate.userId,
        firstName: affiliate.firstName || "",
        lastName: affiliate.lastName || "",
        phone: affiliate.phone || "",
        email: affiliate.email || "",
        role: affiliate.role,
        isActive: affiliate.isActive,
      },
    });
  } catch (error) {
    console.error("UPDATE AFFILIATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});




export default router;