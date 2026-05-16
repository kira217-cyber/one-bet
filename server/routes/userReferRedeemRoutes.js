import express from "express";
import ReferRedeemSetting from "../models/ReferRedeemSetting.js";
import ReferRedeemHistory from "../models/ReferRedeemHistory.js";
import User from "../models/User.js";

const router = express.Router();

const getUserIdFromReq = (req) => {
  return req.user?.id || req.user?._id || req.user?.userId || null;
};

const getOrCreateSetting = async () => {
  let setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

  if (!setting) {
    setting = await ReferRedeemSetting.create({});
  }

  return setting;
};

const calcRedeemAmount = ({ points, redeemPoint, redeemMoney }) => {
  const p = Number(points || 0);
  const rp = Number(redeemPoint || 0);
  const rm = Number(redeemMoney || 0);

  if (p <= 0 || rp <= 0 || rm <= 0) return 0;

  return (p / rp) * rm;
};

const calcNeededPoints = ({ amount, redeemPoint, redeemMoney }) => {
  const a = Number(amount || 0);
  const rp = Number(redeemPoint || 0);
  const rm = Number(redeemMoney || 0);

  if (a <= 0 || rp <= 0 || rm <= 0) return 0;

  return (a / rm) * rp;
};

/**
 * GET /api/user/refer-redeem/info
 */
router.get("/info", async (req, res) => {
  try {
    const userMongoId = getUserIdFromReq(req);

    if (!userMongoId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [user, setting] = await Promise.all([
      User.findById(userMongoId).select(
        "userId phone referralCode balance currency referCommission referCommissionBalance referralCount",
      ),
      getOrCreateSetting(),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const points = Number(user.referCommissionBalance || 0);

    const estimatedRedeemAmount = calcRedeemAmount({
      points,
      redeemPoint: setting.redeemPoint,
      redeemMoney: setting.redeemMoney,
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          phone: user.phone,
          referralCode: user.referralCode,
          balance: user.balance,
          currency: user.currency,
          referCommission: user.referCommission,
          referCommissionBalance: user.referCommissionBalance,
          referralCount: user.referralCount,
        },
        setting,
        calculation: {
          points,
          estimatedRedeemAmount,
        },
      },
    });
  } catch (error) {
    console.error("GET USER REFER REDEEM INFO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/user/refer-redeem/referred-users
 */
router.get("/referred-users", async (req, res) => {
  try {
    const userMongoId = getUserIdFromReq(req);

    if (!userMongoId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const users = await User.find({ referredBy: userMongoId })
      .select("userId phone createdAt isActive referCommissionBalance")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET REFERRED USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * POST /api/user/refer-redeem/redeem
 * body: { redeemAmount: 100 }
 */
router.post("/redeem", async (req, res) => {
  try {
    const userMongoId = getUserIdFromReq(req);

    if (!userMongoId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const redeemAmount = Number(req.body?.redeemAmount || 0);

    if (!redeemAmount || redeemAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Redeem amount is required",
      });
    }

    const setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

    if (!setting || !setting.isActive) {
      return res.status(400).json({
        success: false,
        message: "Redeem system is currently inactive",
      });
    }

    if (redeemAmount < Number(setting.minimumRedeemAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum redeem amount is ${setting.minimumRedeemAmount}`,
      });
    }

    if (
      Number(setting.maximumRedeemAmount || 0) > 0 &&
      redeemAmount > Number(setting.maximumRedeemAmount || 0)
    ) {
      return res.status(400).json({
        success: false,
        message: `Maximum redeem amount is ${setting.maximumRedeemAmount}`,
      });
    }

    const pointsNeeded = calcNeededPoints({
      amount: redeemAmount,
      redeemPoint: setting.redeemPoint,
      redeemMoney: setting.redeemMoney,
    });

    if (pointsNeeded <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid redeem calculation",
      });
    }

    const userBeforeUpdate = await User.findOneAndUpdate(
      {
        _id: userMongoId,
        isActive: true,
        referCommissionBalance: { $gte: pointsNeeded },
      },
      {
        $inc: {
          referCommissionBalance: -pointsNeeded,
          balance: redeemAmount,
        },
      },
      {
        new: false,
      },
    );

    if (!userBeforeUpdate) {
      const existingUser = await User.findById(userMongoId).select(
        "userId balance referCommissionBalance isActive",
      );

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!existingUser.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Insufficient refer points",
        data: {
          availablePoints: Number(existingUser.referCommissionBalance || 0),
          requiredPoints: pointsNeeded,
        },
      });
    }

    const pointsBefore = Number(userBeforeUpdate.referCommissionBalance || 0);
    const balanceBefore = Number(userBeforeUpdate.balance || 0);

    const pointsAfter = pointsBefore - pointsNeeded;
    const balanceAfter = balanceBefore + redeemAmount;

    const history = await ReferRedeemHistory.create({
      user: userBeforeUpdate._id,
      userId: userBeforeUpdate.userId,
      pointsUsed: pointsNeeded,
      redeemAmount,
      rateSnapshot: {
        redeemPoint: setting.redeemPoint,
        redeemMoney: setting.redeemMoney,
        minimumRedeemAmount: setting.minimumRedeemAmount,
        maximumRedeemAmount: setting.maximumRedeemAmount,
      },
      balanceBefore,
      balanceAfter,
      pointsBefore,
      pointsAfter,
      status: "SUCCESS",
      note: "Refer points redeemed to main balance",
    });

    return res.json({
      success: true,
      message: "Redeem successful",
      data: {
        user: {
          id: userBeforeUpdate._id,
          userId: userBeforeUpdate.userId,
          balance: balanceAfter,
          referCommissionBalance: pointsAfter,
        },
        redeem: {
          redeemAmount,
          pointsUsed: pointsNeeded,
          pointsBefore,
          pointsAfter,
          balanceBefore,
          balanceAfter,
        },
        history,
      },
    });
  } catch (error) {
    console.error("USER REFER REDEEM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/user/refer-redeem/histories
 */
router.get("/histories", async (req, res) => {
  try {
    const userMongoId = getUserIdFromReq(req);

    if (!userMongoId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const histories = await ReferRedeemHistory.find({ user: userMongoId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      data: histories,
    });
  } catch (error) {
    console.error("GET USER REFER REDEEM HISTORIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;