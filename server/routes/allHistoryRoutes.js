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

const money = (value = 0) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.trunc(amount * 100) / 100;
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
/*                         ADMIN: GAME HISTORY V3                              */
/* -------------------------------------------------------------------------- */


router.get("/admin/games", async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const dateFilter = buildDateFilter(req.query);

    const {
      userId = "",
      phone = "",
      game_code = "",
      game_uid = "",
      game_round = "",
      serial_number = "",
      provider = "",
      status = "",
      resultType = "",
      transaction_id = "",
      verification_key = "",
      nineWicketBetId = "",
      nineWicketBetStatus = "",
      eventTypeName = "",
      eventName = "",
      marketName = "",
      competitionName = "",
      hasExposure = "",
      search = "",
    } = req.query || {};

    /* ----------------------------------------------------------------------
       EXISTING V3 QUERY
    ---------------------------------------------------------------------- */

    const query = buildV3GameHistoryQuery({
      userId: String(userId || "").trim(),

      phone: String(phone || "").trim(),

      game_code: String(game_code || game_uid || "").trim(),

      status: String(status || resultType || "").trim(),

      transaction_id: String(
        transaction_id || serial_number || "",
      ).trim(),

      verification_key: String(verification_key || "").trim(),

      search: "",

      dateFilter,
    });

    /* ----------------------------------------------------------------------
       DIRECT FILTERS
    ---------------------------------------------------------------------- */

    const providerValue = String(provider || "")
      .trim()
      .toLowerCase();

    if (["oracle", "ninewicket"].includes(providerValue)) {
      query.provider = providerValue;
    }

    const resultTypeValue = String(resultType || status || "")
      .trim()
      .toLowerCase();

    if (["win", "loss", "push"].includes(resultTypeValue)) {
      query.resultType = resultTypeValue;
    }

    if (game_uid) {
      query.game_uid = {
        $regex: String(game_uid).trim(),
        $options: "i",
      };
    }

    if (game_round) {
      query.game_round = {
        $regex: String(game_round).trim(),
        $options: "i",
      };
    }

    if (serial_number) {
      query.serial_number = {
        $regex: String(serial_number).trim(),
        $options: "i",
      };
    }

    if (nineWicketBetId) {
      query.nineWicketBetId = {
        $regex: String(nineWicketBetId).trim(),
        $options: "i",
      };
    }

    if (nineWicketBetStatus) {
      query.nineWicketBetStatus = {
        $regex: `^${String(nineWicketBetStatus).trim()}$`,
        $options: "i",
      };
    }

    if (eventTypeName) {
      query.eventTypeName = {
        $regex: String(eventTypeName).trim(),
        $options: "i",
      };
    }

    if (eventName) {
      query.eventName = {
        $regex: String(eventName).trim(),
        $options: "i",
      };
    }

    if (marketName) {
      query.marketName = {
        $regex: String(marketName).trim(),
        $options: "i",
      };
    }

    if (competitionName) {
      query.competitionName = {
        $regex: String(competitionName).trim(),
        $options: "i",
      };
    }

    const exposureFilter = String(hasExposure || "")
      .trim()
      .toLowerCase();

    if (exposureFilter === "true") {
      query.exposureAfter = {
        $gt: 0,
      };
    }

    if (exposureFilter === "false") {
      query.exposureAfter = {
        $lte: 0,
      };
    }

    /* ----------------------------------------------------------------------
       GLOBAL SEARCH
    ---------------------------------------------------------------------- */

    const searchText = String(search || "").trim();

    if (searchText) {
      const escapedSearch = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      const searchConditions = [
        {
          userId: searchRegex,
        },

        {
          phone: searchRegex,
        },

        {
          userGamePlayName: searchRegex,
        },

        {
          nineWicketUsername: searchRegex,
        },

        {
          member_account: searchRegex,
        },

        {
          provider: searchRegex,
        },

        {
          game_uid: searchRegex,
        },

        {
          game_round: searchRegex,
        },

        {
          serial_number: searchRegex,
        },

        {
          resultType: searchRegex,
        },

        {
          nineWicketBetId: searchRegex,
        },

        {
          nineWicketBetStatus: searchRegex,
        },

        {
          eventTypeName: searchRegex,
        },

        {
          eventName: searchRegex,
        },

        {
          marketName: searchRegex,
        },

        {
          competitionName: searchRegex,
        },

        {
          oracleTimestamp: searchRegex,
        },
      ];

      if (Array.isArray(query.$and)) {
        query.$and.push({
          $or: searchConditions,
        });
      } else if (query.$or) {
        const existingOr = query.$or;

        delete query.$or;

        query.$and = [
          {
            $or: existingOr,
          },

          {
            $or: searchConditions,
          },
        ];
      } else {
        query.$or = searchConditions;
      }
    }

    /* ----------------------------------------------------------------------
       FETCH HISTORY
    ---------------------------------------------------------------------- */

    const [items, total, summaryResult] = await Promise.all([
      GameHistory.find(query)
        .populate(
          "user",
          [
            "userId",
            "phone",
            "email",
            "role",
            "balance",
            "currency",
            "isActive",
            "userGamePlayName",
            "nineWicketUsername",
          ].join(" "),
        )
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(query),

      GameHistory.aggregate([
        {
          $match: query,
        },

        {
          $group: {
            _id: null,

            totalBetAmount: {
              $sum: "$bet_amount",
            },

            totalWinAmount: {
              $sum: "$win_amount",
            },

            totalNetAmount: {
              $sum: "$net_amount",
            },

            totalExposureChange: {
              $sum: "$exposureChange",
            },

            latestExposure: {
              $max: "$exposureAfter",
            },

            totalRecords: {
              $sum: 1,
            },

            oracleRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "oracle"],
                  },
                  1,
                  0,
                ],
              },
            },

            nineWicketRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "ninewicket"],
                  },
                  1,
                  0,
                ],
              },
            },

            winRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "win"],
                  },
                  1,
                  0,
                ],
              },
            },

            lossRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "loss"],
                  },
                  1,
                  0,
                ],
              },
            },

            pushRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "push"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const summary = summaryResult[0] || {
      totalBetAmount: 0,
      totalWinAmount: 0,
      totalNetAmount: 0,
      totalExposureChange: 0,
      latestExposure: 0,
      totalRecords: 0,
      oracleRecords: 0,
      nineWicketRecords: 0,
      winRecords: 0,
      lossRecords: 0,
      pushRecords: 0,
    };

    /* ----------------------------------------------------------------------
       RESPONSE
    ---------------------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message: "Game history fetched successfully.",

      data: items.map((item) => {
        const normalizedRow = normalizeGameHistoryRow(item);

        return {
          ...normalizedRow,

          _id: item._id,

          user: item.user || null,

          userId: item.userId || item.user?.userId || "",

          phone: item.phone || item.user?.phone || "",

          userGamePlayName:
            item.userGamePlayName ||
            item.user?.userGamePlayName ||
            "",

          nineWicketUsername:
            item.nineWicketUsername ||
            item.user?.nineWicketUsername ||
            "",

          provider: item.provider || "oracle",

          member_account: item.member_account || "",

          game_uid: item.game_uid || "",

          game_round: item.game_round || "",

          serial_number: item.serial_number || "",

          bet_amount: Number(item.bet_amount || 0),

          win_amount: Number(item.win_amount || 0),

          net_amount: Number(item.net_amount || 0),

          resultType: item.resultType || "push",

          balance_before: Number(item.balance_before || 0),

          balance_after: Number(item.balance_after || 0),

          nineWicketBetId: item.nineWicketBetId || "",

          nineWicketBetStatus: item.nineWicketBetStatus || "",

          matchStake: Number(item.matchStake || 0),

          profitLoss: Number(item.profitLoss || 0),

          eventTypeName: item.eventTypeName || "",

          eventName: item.eventName || "",

          marketName: item.marketName || "",

          competitionName: item.competitionName || "",

          exposureChange: Number(item.exposureChange || 0),

          exposureAfter: Number(item.exposureAfter || 0),

          affiliateInfo: item.affiliateInfo || null,

          oracleTimestamp: item.oracleTimestamp || "",

          createdAt: item.createdAt,

          updatedAt: item.updatedAt,
        };
      }),

      summary: {
        totalRecords: Number(summary.totalRecords || 0),

        totalBetAmount: money(summary.totalBetAmount),

        totalWinAmount: money(summary.totalWinAmount),

        totalNetAmount: money(summary.totalNetAmount),

        totalExposureChange: money(
          summary.totalExposureChange,
        ),

        latestExposure: Math.max(
          0,
          money(summary.latestExposure),
        ),

        oracleRecords: Number(summary.oracleRecords || 0),

        nineWicketRecords: Number(
          summary.nineWicketRecords || 0,
        ),

        winRecords: Number(summary.winRecords || 0),

        lossRecords: Number(summary.lossRecords || 0),

        pushRecords: Number(summary.pushRecords || 0),
      },

      filters: {
        search: searchText,

        userId: String(userId || ""),

        phone: String(phone || ""),

        provider: providerValue,

        game_uid: String(game_uid || ""),

        game_round: String(game_round || ""),

        serial_number: String(serial_number || ""),

        resultType: resultTypeValue,

        nineWicketBetId: String(nineWicketBetId || ""),

        nineWicketBetStatus: String(
          nineWicketBetStatus || "",
        ),

        eventTypeName: String(eventTypeName || ""),

        eventName: String(eventName || ""),

        marketName: String(marketName || ""),

        competitionName: String(competitionName || ""),

        hasExposure: exposureFilter,
      },

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
/*                         LOGGED-IN USER: GAME HISTORY V3                     */
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

    const {
      game_code = "",
      game_uid = "",
      game_round = "",
      serial_number = "",
      status = "",
      provider = "",
      transaction_id = "",
      verification_key = "",
      nineWicketBetStatus = "",
      hasExposure = "",
      search = "",
    } = req.query || {};

    /* ---------------------------------------------------------------------- */
    /*                        EXISTING BASE QUERY                              */
    /* ---------------------------------------------------------------------- */

    const query = buildV3GameHistoryQuery({
      user: authUserId,

      game_code: String(game_code || game_uid || "").trim(),

      status: String(status || "").trim(),

      transaction_id: String(
        transaction_id || serial_number || "",
      ).trim(),

      verification_key: String(
        verification_key || game_round || "",
      ).trim(),

      /**
       * Search নিচে আলাদাভাবে যোগ করা হচ্ছে।
       */
      search: "",

      dateFilter,
    });

    /* ---------------------------------------------------------------------- */
    /*                           PROVIDER FILTER                               */
    /* ---------------------------------------------------------------------- */

    const providerValue = String(provider || "")
      .trim()
      .toLowerCase();

    if (
      providerValue &&
      providerValue !== "all" &&
      ["oracle", "ninewicket"].includes(providerValue)
    ) {
      query.provider = providerValue;
    }

    /* ---------------------------------------------------------------------- */
    /*                         RESULT TYPE FILTER                              */
    /* ---------------------------------------------------------------------- */

    const resultTypeValue = String(status || "")
      .trim()
      .toLowerCase();

    if (
      resultTypeValue &&
      resultTypeValue !== "all" &&
      ["win", "loss", "push"].includes(resultTypeValue)
    ) {
      query.resultType = resultTypeValue;
    }

    /* ---------------------------------------------------------------------- */
    /*                         DIRECT GAME FILTERS                             */
    /* ---------------------------------------------------------------------- */

    if (String(game_uid || "").trim()) {
      query.game_uid = {
        $regex: String(game_uid).trim(),
        $options: "i",
      };
    }

    if (String(game_round || "").trim()) {
      query.game_round = {
        $regex: String(game_round).trim(),
        $options: "i",
      };
    }

    if (String(serial_number || "").trim()) {
      query.serial_number = {
        $regex: String(serial_number).trim(),
        $options: "i",
      };
    }

    if (String(nineWicketBetStatus || "").trim()) {
      query.nineWicketBetStatus = {
        $regex: `^${String(nineWicketBetStatus).trim()}$`,
        $options: "i",
      };
    }

    /* ---------------------------------------------------------------------- */
    /*                           EXPOSURE FILTER                               */
    /* ---------------------------------------------------------------------- */

    const exposureFilter = String(hasExposure || "")
      .trim()
      .toLowerCase();

    if (exposureFilter === "true") {
      query.exposureAfter = {
        $gt: 0,
      };
    }

    if (exposureFilter === "false") {
      query.exposureAfter = {
        $lte: 0,
      };
    }

    /* ---------------------------------------------------------------------- */
    /*                            GLOBAL SEARCH                                */
    /* ---------------------------------------------------------------------- */

    const searchText = String(search || "").trim();

    if (searchText) {
      const escapedSearch = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      const searchConditions = [
        {
          userId: searchRegex,
        },
        {
          phone: searchRegex,
        },
        {
          userGamePlayName: searchRegex,
        },
        {
          nineWicketUsername: searchRegex,
        },
        {
          member_account: searchRegex,
        },
        {
          provider: searchRegex,
        },
        {
          game_uid: searchRegex,
        },
        {
          game_round: searchRegex,
        },
        {
          serial_number: searchRegex,
        },
        {
          resultType: searchRegex,
        },
        {
          nineWicketBetId: searchRegex,
        },
        {
          nineWicketBetStatus: searchRegex,
        },
        {
          eventTypeName: searchRegex,
        },
        {
          eventName: searchRegex,
        },
        {
          marketName: searchRegex,
        },
        {
          competitionName: searchRegex,
        },
        {
          oracleTimestamp: searchRegex,
        },
      ];

      /**
       * Base query-তে আগে থেকেই $or থাকলে,
       * সেটি destroy না করে $and দিয়ে combine করবে।
       */
      if (query.$or) {
        const existingOr = query.$or;

        delete query.$or;

        query.$and = [
          {
            $or: existingOr,
          },
          {
            $or: searchConditions,
          },
        ];
      } else if (Array.isArray(query.$and)) {
        query.$and.push({
          $or: searchConditions,
        });
      } else {
        query.$or = searchConditions;
      }
    }

    /* ---------------------------------------------------------------------- */
    /*                         FETCH HISTORY + SUMMARY                         */
    /* ---------------------------------------------------------------------- */

    const [items, total, summaryAgg] = await Promise.all([
      GameHistory.find(query)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(query),

      GameHistory.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: null,

            totalBetAmount: {
              $sum: "$bet_amount",
            },

            totalWinAmount: {
              $sum: "$win_amount",
            },

            totalNetAmount: {
              $sum: "$net_amount",
            },

            totalMatchStake: {
              $sum: "$matchStake",
            },

            totalProfitLoss: {
              $sum: "$profitLoss",
            },

            totalExposureChange: {
              $sum: "$exposureChange",
            },

            highestExposure: {
              $max: "$exposureAfter",
            },

            totalRecords: {
              $sum: 1,
            },

            oracleRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "oracle"],
                  },
                  1,
                  0,
                ],
              },
            },

            nineWicketRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "ninewicket"],
                  },
                  1,
                  0,
                ],
              },
            },

            winRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "win"],
                  },
                  1,
                  0,
                ],
              },
            },

            lossRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "loss"],
                  },
                  1,
                  0,
                ],
              },
            },

            pushRecords: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "push"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] || {
      totalBetAmount: 0,
      totalWinAmount: 0,
      totalNetAmount: 0,
      totalMatchStake: 0,
      totalProfitLoss: 0,
      totalExposureChange: 0,
      highestExposure: 0,
      totalRecords: 0,
      oracleRecords: 0,
      nineWicketRecords: 0,
      winRecords: 0,
      lossRecords: 0,
      pushRecords: 0,
    };

    const safeMoney = (value = 0) => {
      const number = Number(value);

      if (!Number.isFinite(number)) {
        return 0;
      }

      return Math.trunc(number * 100) / 100;
    };

    /* ---------------------------------------------------------------------- */
    /*                               RESPONSE                                  */
    /* ---------------------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      message: "My game history fetched successfully.",

      data: items.map((item) => {
        const normalized = normalizeGameHistoryRow(item);

        return {
          ...normalized,

          provider: item.provider || "oracle",

          userId: item.userId || "",

          userGamePlayName: item.userGamePlayName || "",

          nineWicketUsername: item.nineWicketUsername || "",

          member_account: item.member_account || "",

          game_uid: item.game_uid || "",

          game_round: item.game_round || "",

          serial_number: item.serial_number || "",

          bet_amount: safeMoney(item.bet_amount),

          win_amount: safeMoney(item.win_amount),

          net_amount: safeMoney(item.net_amount),

          resultType: item.resultType || "push",

          balance_before: safeMoney(item.balance_before),

          balance_after: safeMoney(item.balance_after),

          nineWicketBetId: item.nineWicketBetId || "",

          nineWicketBetStatus:
            item.nineWicketBetStatus || "",

          matchStake: safeMoney(item.matchStake),

          profitLoss: safeMoney(item.profitLoss),

          eventTypeName: item.eventTypeName || "",

          eventName: item.eventName || "",

          marketName: item.marketName || "",

          competitionName: item.competitionName || "",

          exposureChange: safeMoney(item.exposureChange),

          exposureAfter: Math.max(
            0,
            safeMoney(item.exposureAfter),
          ),

          affiliateInfo: item.affiliateInfo || null,

          oracleTimestamp: item.oracleTimestamp || "",

          createdAt: item.createdAt,

          updatedAt: item.updatedAt,
        };
      }),

      summary: {
        totalRecords: Number(summary.totalRecords || 0),

        totalBetAmount: safeMoney(
          summary.totalBetAmount,
        ),

        totalWinAmount: safeMoney(
          summary.totalWinAmount,
        ),

        totalNetAmount: safeMoney(
          summary.totalNetAmount,
        ),

        totalMatchStake: safeMoney(
          summary.totalMatchStake,
        ),

        totalProfitLoss: safeMoney(
          summary.totalProfitLoss,
        ),

        totalExposureChange: safeMoney(
          summary.totalExposureChange,
        ),

        highestExposure: Math.max(
          0,
          safeMoney(summary.highestExposure),
        ),

        oracleRecords: Number(
          summary.oracleRecords || 0,
        ),

        nineWicketRecords: Number(
          summary.nineWicketRecords || 0,
        ),

        winRecords: Number(
          summary.winRecords || 0,
        ),

        lossRecords: Number(
          summary.lossRecords || 0,
        ),

        pushRecords: Number(
          summary.pushRecords || 0,
        ),
      },

      filters: {
        search: searchText,

        status: resultTypeValue,

        provider: providerValue,

        game_code: String(game_code || ""),

        game_uid: String(game_uid || ""),

        game_round: String(game_round || ""),

        serial_number: String(serial_number || ""),

        transaction_id: String(transaction_id || ""),

        verification_key: String(verification_key || ""),

        nineWicketBetStatus: String(
          nineWicketBetStatus || "",
        ),

        hasExposure: exposureFilter,
      },

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
