import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import GameHistory from "../models/gameHistory.js";
import DepositRequest from "../models/DepositRequests.js";
import AutoDeposit from "../models/AutoDeposit.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import NineWicketWallet from "../models/NineWicketWallet.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const getPagination = (page, limit) => {
  const currentPage = Math.max(Number.parseInt(page || "1", 10), 1);

  const perPage = Math.min(
    Math.max(Number.parseInt(limit || "15", 10), 1),
    100,
  );

  const skip = (currentPage - 1) * perPage;

  return {
    currentPage,
    perPage,
    skip,
  };
};

const toNumber = (value = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const money = (value = 0) => {
  return Math.trunc(toNumber(value) * 100) / 100;
};

const clean = (value = "") => {
  return String(value || "").trim();
};

const escapeRegex = (value = "") => {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildSearchRegex = (search = "") => {
  return {
    $regex: escapeRegex(clean(search)),
    $options: "i",
  };
};

const buildPaginationResponse = ({ total, currentPage, perPage }) => {
  const totalPages = Math.max(Math.ceil(total / perPage), 1);

  return {
    total,
    currentPage,
    totalPages,
    limit: perPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

/* -------------------------------------------------------------------------- */
/*                      NORMALIZE GAME HISTORY RESPONSE                       */
/* -------------------------------------------------------------------------- */

const normalizeGameHistoryRow = (item = {}) => {
  const obj = item?.toObject ? item.toObject() : item;

  const provider =
    obj?.provider ||
    obj?.rawPayload?.provider ||
    obj?.rawPayload?.provider_code ||
    obj?.rawPayload?.providerCode ||
    "oracle";

  const normalizedProvider = String(provider || "oracle").toLowerCase();

  return {
    ...obj,

    provider: normalizedProvider,

    provider_code:
      normalizedProvider === "ninewicket"
        ? "NINEWICKET"
        : String(provider || "ORACLE").toUpperCase(),

    game_code:
      obj?.game_uid ||
      obj?.rawPayload?.game_code ||
      obj?.rawPayload?.gameCode ||
      "—",

    bet_type:
      obj?.rawPayload?.bet_type ||
      obj?.rawPayload?.betType ||
      (normalizedProvider === "ninewicket" ? "NINE_WICKET" : "BET"),

    status: obj?.resultType || "push",

    amount: money(obj?.bet_amount),

    bet_amount: money(obj?.bet_amount),

    win_amount: money(obj?.win_amount),

    net_amount: money(obj?.net_amount),

    balance_before: money(obj?.balance_before),

    balance_after: money(obj?.balance_after),

    transaction_id: obj?.serial_number || "—",

    verification_key: obj?.game_round || "—",

    round_id: obj?.game_round || "—",

    userGamePlayName: obj?.userGamePlayName || "",

    nineWicketUsername: obj?.nineWicketUsername || "",

    nineWicketBetId: obj?.nineWicketBetId || "",

    nineWicketBetStatus: obj?.nineWicketBetStatus || "",

    matchStake: money(obj?.matchStake),

    profitLoss: money(obj?.profitLoss),

    eventTypeName: obj?.eventTypeName || "",

    eventName: obj?.eventName || "",

    marketName: obj?.marketName || "",

    competitionName: obj?.competitionName || "",

    exposureChange: money(obj?.exposureChange),

    exposureAfter: Math.max(0, money(obj?.exposureAfter)),

    affiliateInfo: obj?.affiliateInfo || null,
  };
};

/* -------------------------------------------------------------------------- */
/*                        BUILD GAME HISTORY QUERY                            */
/* -------------------------------------------------------------------------- */

const buildGameHistoryQuery = ({
  user,
  userId,
  search = "",
  status = "",
  provider = "",
  gameUId = "",
  gameRound = "",
  serialNumber = "",
  nineWicketBetStatus = "",
  hasExposure = "",
}) => {
  const query = {};

  if (user) {
    query.user = user;
  }

  if (userId) {
    query.userId = clean(userId);
  }

  const cleanStatus = clean(status).toLowerCase();

  if (
    cleanStatus &&
    cleanStatus !== "all" &&
    ["win", "loss", "push"].includes(cleanStatus)
  ) {
    query.resultType = cleanStatus;
  }

  const cleanProvider = clean(provider).toLowerCase();

  if (
    cleanProvider &&
    cleanProvider !== "all" &&
    ["oracle", "ninewicket"].includes(cleanProvider)
  ) {
    query.provider = cleanProvider;
  }

  if (clean(gameUId)) {
    query.game_uid = buildSearchRegex(gameUId);
  }

  if (clean(gameRound)) {
    query.game_round = buildSearchRegex(gameRound);
  }

  if (clean(serialNumber)) {
    query.serial_number = buildSearchRegex(serialNumber);
  }

  if (clean(nineWicketBetStatus)) {
    query.nineWicketBetStatus = buildSearchRegex(nineWicketBetStatus);
  }

  const cleanExposure = clean(hasExposure).toLowerCase();

  if (cleanExposure === "true") {
    query.exposureAfter = {
      $gt: 0,
    };
  }

  if (cleanExposure === "false") {
    query.exposureAfter = {
      $lte: 0,
    };
  }

  const cleanSearch = clean(search);

  if (cleanSearch) {
    const rx = buildSearchRegex(cleanSearch);

    query.$or = [
      {
        userId: rx,
      },
      {
        phone: rx,
      },
      {
        userGamePlayName: rx,
      },
      {
        nineWicketUsername: rx,
      },
      {
        member_account: rx,
      },
      {
        provider: rx,
      },
      {
        game_uid: rx,
      },
      {
        game_round: rx,
      },
      {
        serial_number: rx,
      },
      {
        resultType: rx,
      },
      {
        nineWicketBetId: rx,
      },
      {
        nineWicketBetStatus: rx,
      },
      {
        eventTypeName: rx,
      },
      {
        eventName: rx,
      },
      {
        marketName: rx,
      },
      {
        competitionName: rx,
      },
      {
        oracleTimestamp: rx,
      },
    ];
  }

  return query;
};

/* -------------------------------------------------------------------------- */
/*                     SINGLE USER COMPLETE HISTORY                           */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/.../:userId
 *
 * Supported type:
 *
 * all
 * game
 * manual-deposit
 * auto-deposit
 * withdraw
 *
 * Game query examples:
 *
 * ?type=game
 * &page=1
 * &limit=15
 * &search=football
 * &status=win
 * &provider=ninewicket
 * &game_uid=48341a3bf62b6dd0814d7129e7e0834b
 * &game_round=12345
 * &serial_number=abc
 * &nineWicketBetStatus=Settled
 * &hasExposure=true
 */

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      type = "all",
      page = 1,
      limit = 15,
      search = "",
      status = "",
      provider = "",
      game_uid = "",
      game_round = "",
      serial_number = "",
      nineWicketBetStatus = "",
      hasExposure = "",
    } = req.query || {};

    const { currentPage, perPage, skip } = getPagination(page, limit);

    const cleanType = clean(type).toLowerCase();

    const cleanSearch = clean(search);

    const cleanStatus = clean(status);

    const cleanProvider = clean(provider).toLowerCase();

    /* ---------------------------------------------------------------------- */
    /*                               FIND USER                                */
    /* ---------------------------------------------------------------------- */

    const userOr = [
      {
        userId,
      },
      {
        phone: userId,
      },
      {
        userGamePlayName: userId,
      },
      {
        nineWicketUsername: userId,
      },
    ];

    if (mongoose.Types.ObjectId.isValid(userId)) {
      userOr.unshift({
        _id: userId,
      });
    }

    const user = await User.findOne({
      $or: userOr,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(user._id);

    /* ---------------------------------------------------------------------- */
    /*                        AUTO DEPOSIT USER IDENTITY                       */
    /* ---------------------------------------------------------------------- */

    const autoDepositIdentityValues = [
      String(user._id),
      String(user.userId || ""),
      String(user.phone || ""),
    ].filter(Boolean);

    const autoDepositUserQuery = {
      userIdentity: {
        $in: autoDepositIdentityValues,
      },
    };

    /* ---------------------------------------------------------------------- */
    /*                         NINE WICKET WALLET                              */
    /* ---------------------------------------------------------------------- */

    const nineWicketWallet = await NineWicketWallet.findOne({
      user: userObjectId,
    }).lean();

    /* ---------------------------------------------------------------------- */
    /*                           BASE RESPONSE                                 */
    /* ---------------------------------------------------------------------- */

    const responseData = {
      success: true,

      user: {
        _id: user._id,

        userId: user.userId,

        phone: user.phone,

        email: user.email || "",

        firstName: user.firstName || "",

        lastName: user.lastName || "",

        role: user.role || "user",

        isActive: user.isActive === true,

        currency: user.currency || "BDT",

        balance: money(user.balance),

        userGamePlayName: user.userGamePlayName || null,

        nineWicketUsername: user.nineWicketUsername || null,
      },

      nineWicketWallet: {
        username: nineWicketWallet?.username || user.nineWicketUsername || null,

        totalTransferred: money(nineWicketWallet?.totalTransferred),

        totalReturned: money(nineWicketWallet?.totalReturned),

        exposureBalance: Math.max(0, money(nineWicketWallet?.exposureBalance)),

        lastTransferAmount: money(nineWicketWallet?.lastTransferAmount),

        lastReturnedAmount: money(nineWicketWallet?.lastReturnedAmount),

        lastTransferAt: nineWicketWallet?.lastTransferAt || null,

        lastReturnedAt: nineWicketWallet?.lastReturnedAt || null,

        lastSyncAt: nineWicketWallet?.lastSyncAt || null,

        status: nineWicketWallet?.status || "idle",
      },
    };

    /* ---------------------------------------------------------------------- */
    /*                       COMPLETE USER SUMMARY                             */
    /* ---------------------------------------------------------------------- */

    const [
      totalGameAgg,
      totalManualDepositAgg,
      totalAutoDepositAgg,
      totalWithdrawAgg,

      pendingManualDeposit,
      approvedManualDeposit,
      rejectedManualDeposit,

      pendingWithdraw,
      approvedWithdraw,
      rejectedWithdraw,

      pendingAutoDeposit,
      paidAutoDeposit,
      failedAutoDeposit,
    ] = await Promise.all([
      GameHistory.aggregate([
        {
          $match: {
            user: userObjectId,
          },
        },
        {
          $group: {
            _id: null,

            totalBet: {
              $sum: "$bet_amount",
            },

            totalWin: {
              $sum: "$win_amount",
            },

            totalNet: {
              $sum: "$net_amount",
            },

            totalRecords: {
              $sum: 1,
            },

            winCount: {
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

            lossCount: {
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

            pushCount: {
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

            oracleCount: {
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

            nineWicketCount: {
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

            totalMatchStake: {
              $sum: "$matchStake",
            },

            totalExposureChange: {
              $sum: "$exposureChange",
            },

            highestExposure: {
              $max: "$exposureAfter",
            },
          },
        },
      ]),

      DepositRequest.aggregate([
        {
          $match: {
            user: userObjectId,

            status: "approved",
          },
        },
        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },

            creditedTotal: {
              $sum: "$calc.creditedAmount",
            },

            bonusTotal: {
              $sum: "$calc.totalBonus",
            },

            count: {
              $sum: 1,
            },
          },
        },
      ]),

      AutoDeposit.aggregate([
        {
          $match: {
            ...autoDepositUserQuery,

            status: "PAID",
          },
        },
        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },

            creditedTotal: {
              $sum: "$calc.creditedAmount",
            },

            bonusTotal: {
              $sum: "$calc.bonusAmount",
            },

            count: {
              $sum: 1,
            },
          },
        },
      ]),

      WithdrawRequest.aggregate([
        {
          $match: {
            user: userObjectId,

            status: "approved",
          },
        },
        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },

            count: {
              $sum: 1,
            },
          },
        },
      ]),

      DepositRequest.countDocuments({
        user: userObjectId,

        status: "pending",
      }),

      DepositRequest.countDocuments({
        user: userObjectId,

        status: "approved",
      }),

      DepositRequest.countDocuments({
        user: userObjectId,

        status: "rejected",
      }),

      WithdrawRequest.countDocuments({
        user: userObjectId,

        status: "pending",
      }),

      WithdrawRequest.countDocuments({
        user: userObjectId,

        status: "approved",
      }),

      WithdrawRequest.countDocuments({
        user: userObjectId,

        status: "rejected",
      }),

      AutoDeposit.countDocuments({
        ...autoDepositUserQuery,

        status: "PENDING",
      }),

      AutoDeposit.countDocuments({
        ...autoDepositUserQuery,

        status: "PAID",
      }),

      AutoDeposit.countDocuments({
        ...autoDepositUserQuery,

        status: "FAILED",
      }),
    ]);

    const gameTotals = totalGameAgg?.[0] || {};

    responseData.summary = {
      totalLoss: money(gameTotals.totalBet),

      totalBet: money(gameTotals.totalBet),

      totalBetCount: Number(gameTotals.totalRecords || 0),

      totalWin: money(gameTotals.totalWin),

      totalWinCount: Number(gameTotals.winCount || 0),

      totalNet: money(gameTotals.totalNet),

      winCount: Number(gameTotals.winCount || 0),

      lossCount: Number(gameTotals.lossCount || 0),

      pushCount: Number(gameTotals.pushCount || 0),

      oracleCount: Number(gameTotals.oracleCount || 0),

      nineWicketCount: Number(gameTotals.nineWicketCount || 0),

      totalMatchStake: money(gameTotals.totalMatchStake),

      totalExposureChange: money(gameTotals.totalExposureChange),

      highestExposure: Math.max(0, money(gameTotals.highestExposure)),

      currentExposure: Math.max(0, money(nineWicketWallet?.exposureBalance)),

      totalNineWicketTransferred: money(nineWicketWallet?.totalTransferred),

      totalNineWicketReturned: money(nineWicketWallet?.totalReturned),

      totalDeposit: money(
        toNumber(totalManualDepositAgg?.[0]?.total) +
          toNumber(totalAutoDepositAgg?.[0]?.total),
      ),

      totalManualDeposit: money(totalManualDepositAgg?.[0]?.total),

      totalAutoDeposit: money(totalAutoDepositAgg?.[0]?.total),

      totalManualCredited: money(totalManualDepositAgg?.[0]?.creditedTotal),

      totalAutoCredited: money(totalAutoDepositAgg?.[0]?.creditedTotal),

      totalManualBonus: money(totalManualDepositAgg?.[0]?.bonusTotal),

      totalAutoBonus: money(totalAutoDepositAgg?.[0]?.bonusTotal),

      totalWithdraw: money(totalWithdrawAgg?.[0]?.total),

      manualDeposit: {
        pending: pendingManualDeposit,

        approved: approvedManualDeposit,

        rejected: rejectedManualDeposit,
      },

      autoDeposit: {
        pending: pendingAutoDeposit,

        approved: paidAutoDeposit,

        paid: paidAutoDeposit,

        failed: failedAutoDeposit,
      },

      withdraw: {
        pending: pendingWithdraw,

        approved: approvedWithdraw,

        rejected: rejectedWithdraw,
      },
    };

    /* ---------------------------------------------------------------------- */
    /*                            GAME HISTORY                                */
    /* ---------------------------------------------------------------------- */

    if (cleanType === "game") {
      const query = buildGameHistoryQuery({
        user: userObjectId,

        search: cleanSearch,

        status: cleanStatus,

        provider: cleanProvider,

        gameUId: game_uid,

        gameRound: game_round,

        serialNumber: serial_number,

        nineWicketBetStatus,

        hasExposure,
      });

      const [data, total, gameSummaryAgg] = await Promise.all([
        GameHistory.find(query)
          .sort({
            createdAt: -1,

            _id: -1,
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        GameHistory.countDocuments(query),

        GameHistory.aggregate([
          {
            $match: query,
          },
          {
            $group: {
              _id: null,

              totalBet: {
                $sum: "$bet_amount",
              },

              totalWin: {
                $sum: "$win_amount",
              },

              totalNet: {
                $sum: "$net_amount",
              },

              totalRecords: {
                $sum: 1,
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

              winCount: {
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

              lossCount: {
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

              pushCount: {
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

              oracleCount: {
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

              nineWicketCount: {
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
            },
          },
        ]),
      ]);

      const gameSummary = gameSummaryAgg?.[0] || {};

      responseData.history = data.map(normalizeGameHistoryRow);

      responseData.summary = {
        ...responseData.summary,

        totalLoss: money(gameSummary.totalBet),

        totalBet: money(gameSummary.totalBet),

        totalBetCount: Number(gameSummary.totalRecords || 0),

        totalWin: money(gameSummary.totalWin),

        totalWinCount: Number(gameSummary.winCount || 0),

        totalNet: money(gameSummary.totalNet),

        totalMatchStake: money(gameSummary.totalMatchStake),

        totalProfitLoss: money(gameSummary.totalProfitLoss),

        totalExposureChange: money(gameSummary.totalExposureChange),

        highestExposure: Math.max(0, money(gameSummary.highestExposure)),

        currentExposure: Math.max(0, money(nineWicketWallet?.exposureBalance)),

        winCount: Number(gameSummary.winCount || 0),

        lossCount: Number(gameSummary.lossCount || 0),

        pushCount: Number(gameSummary.pushCount || 0),

        oracleCount: Number(gameSummary.oracleCount || 0),

        nineWicketCount: Number(gameSummary.nineWicketCount || 0),
      };

      responseData.filters = {
        type: cleanType,

        search: cleanSearch,

        status: cleanStatus,

        provider: cleanProvider,

        game_uid: clean(game_uid),

        game_round: clean(game_round),

        serial_number: clean(serial_number),

        nineWicketBetStatus: clean(nineWicketBetStatus),

        hasExposure: clean(hasExposure),
      };

      responseData.pagination = buildPaginationResponse({
        total,

        currentPage,

        perPage,
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                         MANUAL DEPOSIT HISTORY                          */
    /* ---------------------------------------------------------------------- */

    if (cleanType === "manual-deposit") {
      const query = {
        user: userObjectId,
      };

      if (cleanStatus && cleanStatus.toLowerCase() !== "all") {
        query.status = cleanStatus.toLowerCase();
      }

      if (cleanSearch) {
        const rx = buildSearchRegex(cleanSearch);

        query.$or = [
          {
            methodId: rx,
          },
          {
            channelId: rx,
          },
          {
            promoId: rx,
          },
          {
            adminNote: rx,
          },
          {
            "display.methodName": rx,
          },
          {
            "display.channelName": rx,
          },
        ];
      }

      const [data, total] = await Promise.all([
        DepositRequest.find(query)
          .sort({
            createdAt: -1,

            _id: -1,
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        DepositRequest.countDocuments(query),
      ]);

      responseData.history = data;

      responseData.filters = {
        type: cleanType,

        search: cleanSearch,

        status: cleanStatus,
      };

      responseData.pagination = buildPaginationResponse({
        total,

        currentPage,

        perPage,
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                          AUTO DEPOSIT HISTORY                            */
    /* ---------------------------------------------------------------------- */

    if (cleanType === "auto-deposit") {
      const query = {
        ...autoDepositUserQuery,
      };

      if (cleanStatus && cleanStatus.toLowerCase() !== "all") {
        query.status = cleanStatus.toUpperCase();
      }

      if (cleanSearch) {
        const rx = buildSearchRegex(cleanSearch);

        query.$or = [
          {
            invoiceNumber: rx,
          },
          {
            transactionId: rx,
          },
          {
            sessionCode: rx,
          },
          {
            bank: rx,
          },
          {
            footprint: rx,
          },
          {
            "selectedBonus.title.bn": rx,
          },
          {
            "selectedBonus.title.en": rx,
          },
          {
            "checkoutItems.selectedBonusTitleBn": rx,
          },
          {
            "checkoutItems.selectedBonusTitleEn": rx,
          },
        ];
      }

      const [data, total] = await Promise.all([
        AutoDeposit.find(query)
          .sort({
            createdAt: -1,

            _id: -1,
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        AutoDeposit.countDocuments(query),
      ]);

      responseData.history = data;

      responseData.filters = {
        type: cleanType,

        search: cleanSearch,

        status: cleanStatus,
      };

      responseData.pagination = buildPaginationResponse({
        total,

        currentPage,

        perPage,
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                           WITHDRAW HISTORY                              */
    /* ---------------------------------------------------------------------- */

    if (cleanType === "withdraw") {
      const query = {
        user: userObjectId,
      };

      if (cleanStatus && cleanStatus.toLowerCase() !== "all") {
        query.status = cleanStatus.toLowerCase();
      }

      if (cleanSearch) {
        const rx = buildSearchRegex(cleanSearch);

        query.$or = [
          {
            methodId: rx,
          },
          {
            adminNote: rx,
          },
          {
            "fields.accountNumber": rx,
          },
          {
            "fields.phone": rx,
          },
          {
            "fields.wallet": rx,
          },
          {
            "fields.name": rx,
          },
        ];
      }

      const [data, total] = await Promise.all([
        WithdrawRequest.find(query)
          .sort({
            createdAt: -1,

            _id: -1,
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        WithdrawRequest.countDocuments(query),
      ]);

      responseData.history = data;

      responseData.filters = {
        type: cleanType,

        search: cleanSearch,

        status: cleanStatus,
      };

      responseData.pagination = buildPaginationResponse({
        total,

        currentPage,

        perPage,
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                              ALL TYPE                                  */
    /* ---------------------------------------------------------------------- */

    if (cleanType === "all") {
      responseData.history = [];

      responseData.pagination = {
        total: 0,

        currentPage,

        totalPages: 1,

        limit: perPage,

        hasNextPage: false,

        hasPreviousPage: false,
      };
    }

    /* ---------------------------------------------------------------------- */
    /*                          INVALID HISTORY TYPE                           */
    /* ---------------------------------------------------------------------- */

    const validTypes = [
      "all",
      "game",
      "manual-deposit",
      "auto-deposit",
      "withdraw",
    ];

    if (!validTypes.includes(cleanType)) {
      return res.status(400).json({
        success: false,

        message: "Invalid history type",

        allowedTypes: validTypes,
      });
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Single User History Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch user history",

      error: error.message,
    });
  }
});

export default router;
