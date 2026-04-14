import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import DepositRequest from "../models/DepositRequests.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import AutoDeposit from "../models/AutoDeposit.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/gameHistory.js";
import { authMiddleware } from "./userRoutes.js";


const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

const parseNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (req) => {
  const page = Math.max(1, parseNumber(req.query.page, 1));
  const limit = Math.max(1, Math.min(100, parseNumber(req.query.limit, 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildDateFilter = (query) => {
  const filter = {};
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;

  if (from && !Number.isNaN(from.getTime())) {
    filter.$gte = from;
  }

  if (to && !Number.isNaN(to.getTime())) {
    filter.$lte = to;
  }

  return Object.keys(filter).length ? filter : null;
};




const getLoggedInUserMongoId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const getLoggedInUserIdentity = async (req) => {
  /**
   * AutoDeposit.userIdentity string type
   * তাই আমরা user._id এবং user.userId দুটোই consider করবো
   */
  const userId = getLoggedInUserMongoId(req);
  if (!userId) return null;

  const user = await User.findById(userId).select("_id userId phone email");
  if (!user) return null;

  return {
    mongoId: user._id,
    mongoIdString: String(user._id),
    userId: user.userId || "",
    phone: user.phone || "",
    email: user.email || "",
  };
};

const buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});


/* -------------------------------------------------------------------------- */
/*                          ADMIN: TURNOVER HISTORY                           */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/history/admin/turnovers
 */
router.get("/admin/turnovers", async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { status, sourceType, userId, search = "" } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = {};

    if (status) {
      query.status = status;
    }

    if (sourceType) {
      query.sourceType = sourceType;
    }

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = userId;
    }

    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");

      const matchedUsers = await User.find({
        $or: [{ userId: regex }, { phone: regex }, { email: regex }],
      }).select("_id");

      const userIds = matchedUsers.map((u) => u._id);

      if (query.user) {
        if (!userIds.some((id) => String(id) === String(query.user))) {
          return res.status(200).json({
            success: true,
            message: "Turnover history fetched successfully.",
            data: [],
            meta: buildMeta(page, limit, 0),
          });
        }
      } else {
        query.user = {
          $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
        };
      }
    }

    const [items, total] = await Promise.all([
      TurnOver.find(query)
        .populate(
          "user",
          "userId phone email firstName lastName balance role isActive referralCode",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Turnover history fetched successfully.",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /admin/turnovers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch turnover history.",
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                         ADMIN: GAME HISTORY                                */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/history/admin/games
 */
router.get("/admin/games", async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const {
      userId = "",
      provider_code = "",
      game_code = "",
      bet_type = "",
      status = "",
      transaction_id = "",
      verification_key = "",
    } = req.query;

    const dateFilter = buildDateFilter(req.query);

    const query = {};

    if (userId.trim()) {
      query.userId = new RegExp(`^${escapeRegex(userId.trim())}$`, "i");
    }

    if (provider_code.trim()) {
      query.provider_code = new RegExp(
        `^${escapeRegex(provider_code.trim())}$`,
        "i",
      );
    }

    if (game_code.trim()) {
      query.game_code = new RegExp(escapeRegex(game_code.trim()), "i");
    }

    if (bet_type.trim()) {
      query.bet_type = new RegExp(`^${escapeRegex(bet_type.trim())}$`, "i");
    }

    if (status.trim()) {
      query.status = status.trim();
    }

    if (transaction_id.trim()) {
      query.transaction_id = new RegExp(
        escapeRegex(transaction_id.trim()),
        "i",
      );
    }

    if (verification_key.trim()) {
      query.verification_key = new RegExp(
        escapeRegex(verification_key.trim()),
        "i",
      );
    }

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      GameHistory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GameHistory.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Game history fetched successfully.",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /admin/games error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch game history.",
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                    MY PROFILE / MY ALL HISTORY ROUTES                      */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/history/me/profile
 * logged-in user নিজের profile + summary
 */
router.get("/me/profile", async (req, res) => {
  try {
    const authUserId = getLoggedInUserMongoId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const user = await User.findById(authUserId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const [
      depositCount,
      withdrawCount,
      autoDepositCount,
      turnoverCount,
      gameCount,
    ] = await Promise.all([
      DepositRequest.countDocuments({ user: user._id }),
      WithdrawRequest.countDocuments({ user: user._id }),
      AutoDeposit.countDocuments({
        $or: [
          { userIdentity: String(user._id) },
          { userIdentity: user.userId },
        ],
      }),
      TurnOver.countDocuments({ user: user._id }),
      GameHistory.countDocuments({ userId: user.userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "My profile fetched successfully.",
      data: {
        user,
        summary: {
          depositCount,
          withdrawCount,
          autoDepositCount,
          turnoverCount,
          gameCount,
        },
      },
    });
  } catch (error) {
    console.error("GET /me/profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
});

/**
 * GET /api/history/me/deposits
 */
router.get("/me/deposits", authMiddleware, async (req, res) => {
  try {
    const authUserId = getLoggedInUserMongoId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = {
      user: authUserId,
    };

    if (status) {
      query.status = status;
    }

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      DepositRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "My deposit history fetched successfully.",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /me/deposits error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my deposit history.",
      error: error.message,
    });
  }
});

/**
 * GET /api/history/me/withdraws
 */
router.get("/me/withdraws",authMiddleware, async (req, res) => {
  try {
    const authUserId = getLoggedInUserMongoId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = {
      user: authUserId,
    };

    if (status) {
      query.status = status;
    }

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      WithdrawRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WithdrawRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "My withdraw history fetched successfully.",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /me/withdraws error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my withdraw history.",
      error: error.message,
    });
  }
});

/**
 * GET /api/history/me/auto-deposits
 */
router.get("/me/auto-deposits", authMiddleware, async (req, res) => {
  try {
    const identity = await getLoggedInUserIdentity(req);

    if (!identity?.mongoId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = {
      $or: [
        { userIdentity: identity.mongoIdString },
        { userIdentity: identity.userId },
      ],
    };

    if (status) {
      query.status = status;
    }

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      AutoDeposit.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AutoDeposit.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "My auto deposit history fetched successfully.",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /me/auto-deposits error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my auto deposit history.",
      error: error.message,
    });
  }
});

/**
 * GET /api/history/me/turnovers
 */
router.get("/me/turnovers", authMiddleware, async (req, res) => {
  try {
    const authUserId = getLoggedInUserMongoId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status, sourceType } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = {
      user: authUserId,
    };

    if (status) {
      query.status = status;
    }

    if (sourceType) {
      query.sourceType = sourceType;
    }

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      TurnOver.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "My turnover history fetched successfully.",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /me/turnovers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my turnover history.",
      error: error.message,
    });
  }
});

/**
 * GET /api/history/me/games
 */
router.get("/me/games", authMiddleware, async (req, res) => {
  try {
    const authUserId = getLoggedInUserMongoId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const authUser = await User.findById(authUserId).select("userId");

    if (!authUser || !authUser.userId) {
      return res.status(404).json({
        success: false,
        message: "Logged in user not found.",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const {
      provider_code = "",
      game_code = "",
      bet_type = "",
      status = "",
      transaction_id = "",
      verification_key = "",
    } = req.query;

    const dateFilter = buildDateFilter(req.query);

    const query = {
      userId: authUser.userId,
    };

    if (provider_code.trim()) {
      query.provider_code = new RegExp(
        `^${escapeRegex(provider_code.trim())}$`,
        "i",
      );
    }

    if (game_code.trim()) {
      query.game_code = new RegExp(escapeRegex(game_code.trim()), "i");
    }

    if (bet_type.trim()) {
      query.bet_type = new RegExp(`^${escapeRegex(bet_type.trim())}$`, "i");
    }

    if (status.trim()) {
      query.status = status.trim();
    }

    if (transaction_id.trim()) {
      query.transaction_id = new RegExp(
        escapeRegex(transaction_id.trim()),
        "i",
      );
    }

    if (verification_key.trim()) {
      query.verification_key = new RegExp(
        escapeRegex(verification_key.trim()),
        "i",
      );
    }

    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    const [items, total] = await Promise.all([
      GameHistory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GameHistory.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "My game history fetched successfully.",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /me/games error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my game history.",
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                         MY ALL HISTORY SUMMARY                             */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/history/me/all
 * সব history একসাথে summary আকারে
 */
router.get("/me/all", async (req, res) => {
  try {
    const authUserId = getLoggedInUserMongoId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const user = await User.findById(authUserId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const autoDepositIdentityQuery = {
      $or: [{ userIdentity: String(user._id) }, { userIdentity: user.userId }],
    };

    const [
      deposits,
      withdraws,
      autoDeposits,
      turnovers,
      games,
      depositCount,
      withdrawCount,
      autoDepositCount,
      turnoverCount,
      gameCount,
    ] = await Promise.all([
      DepositRequest.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      WithdrawRequest.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      AutoDeposit.find(autoDepositIdentityQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      TurnOver.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      GameHistory.find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      DepositRequest.countDocuments({ user: user._id }),
      WithdrawRequest.countDocuments({ user: user._id }),
      AutoDeposit.countDocuments(autoDepositIdentityQuery),
      TurnOver.countDocuments({ user: user._id }),
      GameHistory.countDocuments({ userId: user.userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "My all history fetched successfully.",
      data: {
        user,
        summary: {
          depositCount,
          withdrawCount,
          autoDepositCount,
          turnoverCount,
          gameCount,
        },
        latest: {
          deposits,
          withdraws,
          autoDeposits,
          turnovers,
          games,
        },
      },
    });
  } catch (error) {
    console.error("GET /me/all error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my all history.",
      error: error.message,
    });
  }
});


export default router;
