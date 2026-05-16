import express from "express";
import ReferRedeemSetting from "../models/ReferRedeemSetting.js";
import ReferRedeemHistory from "../models/ReferRedeemHistory.js";
import User from "../models/User.js";

const router = express.Router();

const getAdminIdFromReq = (req) => {
  return req.user?.id || req.user?._id || req.admin?.id || req.admin?._id || null;
};

const getOrCreateSetting = async () => {
  let setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

  if (!setting) {
    setting = await ReferRedeemSetting.create({});
  }

  return setting;
};

/**
 * GET /api/admin/refer-redeem/settings
 */
router.get("/settings", async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    return res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("GET ADMIN REFER REDEEM SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/refer-redeem/settings
 */
router.put("/settings", async (req, res) => {
  try {
    const {
      referAmountForAllUsers,
      minimumRedeemAmount,
      maximumRedeemAmount,
      redeemPoint,
      redeemMoney,
      isActive,
    } = req.body;

    const payload = {
      referAmountForAllUsers: Number(referAmountForAllUsers || 0),
      minimumRedeemAmount: Number(minimumRedeemAmount || 0),
      maximumRedeemAmount: Number(maximumRedeemAmount || 0),
      redeemPoint: Number(redeemPoint || 0),
      redeemMoney: Number(redeemMoney || 0),
      isActive: Boolean(isActive),
      updatedBy: getAdminIdFromReq(req),
    };

    if (payload.referAmountForAllUsers < 0) {
      return res.status(400).json({
        success: false,
        message: "Refer amount cannot be negative",
      });
    }

    if (payload.minimumRedeemAmount < 0 || payload.maximumRedeemAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Minimum and maximum redeem amount cannot be negative",
      });
    }

    if (
      payload.maximumRedeemAmount > 0 &&
      payload.maximumRedeemAmount < payload.minimumRedeemAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Maximum redeem amount must be greater than minimum amount",
      });
    }

    if (payload.redeemPoint <= 0 || payload.redeemMoney <= 0) {
      return res.status(400).json({
        success: false,
        message: "Redeem point and redeem money must be greater than 0",
      });
    }

    let setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

    if (!setting) {
      setting = await ReferRedeemSetting.create(payload);
    } else {
      Object.assign(setting, payload);
      await setting.save();
    }

    return res.json({
      success: true,
      message: "Refer redeem settings updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("UPDATE ADMIN REFER REDEEM SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/refer-redeem/apply-to-users
 *
 * This will set referCommission for all normal users.
 */
router.post("/apply-to-users", async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const referAmount = Number(setting.referAmountForAllUsers || 0);

    if (referAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid refer amount",
      });
    }

    const result = await User.updateMany(
      {
        role: "user",
      },
      {
        $set: {
          referCommission: referAmount,
        },
      },
    );

    return res.json({
      success: true,
      message: "Refer amount applied to all users successfully",
      data: {
        referAmount,
        matchedCount: result.matchedCount || 0,
        modifiedCount: result.modifiedCount || 0,
      },
    });
  } catch (error) {
    console.error("APPLY REFER AMOUNT TO USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/refer-redeem/histories?page=1&limit=20&q=
 */
router.get("/histories", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;
    const q = String(req.query.q || "").trim();

    const filter = {};

    if (q) {
      filter.$or = [
        { userId: { $regex: q, $options: "i" } },
        { note: { $regex: q, $options: "i" } },
        { status: { $regex: q, $options: "i" } },
      ];
    }

    const [histories, total] = await Promise.all([
      ReferRedeemHistory.find(filter)
        .populate("user", "userId phone email role isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReferRedeemHistory.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: histories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET ADMIN REFER REDEEM HISTORIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;