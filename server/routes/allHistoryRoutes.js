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
  const from =
    query.from || query.startDate
      ? new Date(query.from || query.startDate)
      : null;
  const to =
    query.to || query.endDate ? new Date(query.to || query.endDate) : null;

  if (from && !Number.isNaN(from.getTime())) {
    filter.$gte = from;
  }

  if (to && !Number.isNaN(to.getTime())) {
    to.setHours(23, 59, 59, 999);
    filter.$lte = to;
  }

  return Object.keys(filter).length ? filter : null;
};

const getLoggedInUserMongoId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const getLoggedInUserIdentity = async (req) => {
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
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

/* ------------------------- V3 GameHistory Helpers ------------------------- */

const normalizeGameHistoryRow = (item = {}) => {
  const obj = item.toObject ? item.toObject() : item;

  return {
    ...obj,

    provider_code:
      obj?.rawPayload?.provider_code ||
      obj?.rawPayload?.provider ||
      obj?.rawPayload?.providerCode ||
      "ORACLE",

    game_code: obj?.game_uid || obj?.rawPayload?.game_code || "—",

    bet_type: obj?.rawPayload?.bet_type || "BET",

    status: obj?.resultType || "push",

    amount: Number(obj?.bet_amount || 0),

    win_amount: Number(obj?.win_amount || 0),

    balance_after: Number(obj?.balance_after || 0),

    transaction_id: obj?.serial_number || "—",

    verification_key: obj?.game_round || "—",

    round_id: obj?.game_round || "—",
  };
};

const buildV3GameHistoryQuery = ({
  user,
  userId = "",
  phone = "",
  game_code = "",
  status = "",
  transaction_id = "",
  verification_key = "",
  search = "",
  dateFilter = null,
}) => {
  const query = {};

  if (user) query.user = user;

  if (userId.trim()) {
    query.userId = new RegExp(`^${escapeRegex(userId.trim())}$`, "i");
  }

  if (phone.trim()) {
    query.phone = new RegExp(escapeRegex(phone.trim()), "i");
  }

  if (game_code.trim()) {
    query.game_uid = new RegExp(escapeRegex(game_code.trim()), "i");
  }

  if (status.trim() && status.trim() !== "all") {
    query.resultType = status.trim().toLowerCase();
  }

  if (transaction_id.trim()) {
    query.serial_number = new RegExp(escapeRegex(transaction_id.trim()), "i");
  }

  if (verification_key.trim()) {
    query.game_round = new RegExp(escapeRegex(verification_key.trim()), "i");
  }

  if (search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), "i");

    query.$or = [
      { userId: rx },
      { phone: rx },
      { userGamePlayName: rx },
      { member_account: rx },
      { game_uid: rx },
      { game_round: rx },
      { serial_number: rx },
      { resultType: rx },
    ];
  }

  if (dateFilter) {
    query.createdAt = dateFilter;
  }

  return query;
};

/* -------------------------------------------------------------------------- */
/*                          ADMIN: TURNOVER HISTORY                           */
/* -------------------------------------------------------------------------- */

router.get("/admin/turnovers", async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { status, sourceType, userId, search = "" } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = {};

    if (status) query.status = status;
    if (sourceType) query.sourceType = sourceType;
    if (dateFilter) query.createdAt = dateFilter;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) query.user = userId;

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
/*                         ADMIN: GAME HISTORY V3                             */
/* -------------------------------------------------------------------------- */

router.get("/admin/games", async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const dateFilter = buildDateFilter(req.query);

    const query = buildV3GameHistoryQuery({
      userId: String(req.query.userId || ""),
      phone: String(req.query.phone || ""),
      game_code: String(req.query.game_code || ""),
      status: String(req.query.status || ""),
      transaction_id: String(req.query.transaction_id || ""),
      verification_key: String(req.query.verification_key || ""),
      search: String(req.query.search || ""),
      dateFilter,
    });

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
      data: items.map(normalizeGameHistoryRow),
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
      GameHistory.countDocuments({ user: user._id }),
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

    const query = { user: authUserId };

    if (status) query.status = status;
    if (dateFilter) query.createdAt = dateFilter;

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

router.get("/me/withdraws", authMiddleware, async (req, res) => {
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

    const query = { user: authUserId };

    if (status) query.status = status;
    if (dateFilter) query.createdAt = dateFilter;

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

    if (status) query.status = status;
    if (dateFilter) query.createdAt = dateFilter;

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

    const query = { user: authUserId };

    if (status) query.status = status;
    if (sourceType) query.sourceType = sourceType;
    if (dateFilter) query.createdAt = dateFilter;

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

/* -------------------------------------------------------------------------- */
/*                         LOGGED-IN USER: GAME HISTORY V3                    */
/* -------------------------------------------------------------------------- */

router.get("/me/games", authMiddleware, async (req, res) => {
  try {
    const authUserId = getLoggedInUserMongoId(req);

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const dateFilter = buildDateFilter(req.query);

    const query = buildV3GameHistoryQuery({
      user: authUserId,
      game_code: String(req.query.game_code || ""),
      status: String(req.query.status || ""),
      transaction_id: String(req.query.transaction_id || ""),
      verification_key: String(req.query.verification_key || ""),
      search: String(req.query.search || ""),
      dateFilter,
    });

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
      data: items.map(normalizeGameHistoryRow),
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
      gamesRaw,
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

      GameHistory.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      DepositRequest.countDocuments({ user: user._id }),
      WithdrawRequest.countDocuments({ user: user._id }),
      AutoDeposit.countDocuments(autoDepositIdentityQuery),
      TurnOver.countDocuments({ user: user._id }),
      GameHistory.countDocuments({ user: user._id }),
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
          games: gamesRaw.map(normalizeGameHistoryRow),
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
