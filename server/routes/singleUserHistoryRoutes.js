import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import GameHistory from "../models/gameHistory.js";
import DepositRequest from "../models/DepositRequests.js";
import AutoDeposit from "../models/AutoDeposit.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

const router = express.Router();

const getPagination = (page, limit) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.max(Number(limit) || 15, 1);
  const skip = (currentPage - 1) * perPage;

  return { currentPage, perPage, skip };
};

const buildSearchRegex = (search) => ({
  $regex: String(search || "").trim(),
  $options: "i",
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      type = "all",
      page = 1,
      limit = 15,
      search = "",
      status = "",
    } = req.query;

    const { currentPage, perPage, skip } = getPagination(page, limit);
    const cleanSearch = String(search || "").trim();
    const cleanStatus = String(status || "").trim();

    const userOr = [{ userId }, { phone: userId }];

    if (mongoose.Types.ObjectId.isValid(userId)) {
      userOr.unshift({ _id: userId });
    }

    const user = await User.findOne({ $or: userOr }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(user._id);

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

    const responseData = {
      success: true,
      user: {
        _id: user._id,
        userId: user.userId,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    const [
      totalBetAgg,
      totalWinAgg,
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
            userId: user.userId,
            bet_type: "BET",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      GameHistory.aggregate([
        {
          $match: {
            userId: user.userId,
            bet_type: "SETTLE",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $cond: [{ $gt: ["$win_amount", 0] }, "$win_amount", "$amount"],
              },
            },
            count: { $sum: 1 },
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
            total: { $sum: "$amount" },
            creditedTotal: { $sum: "$calc.creditedAmount" },
            bonusTotal: { $sum: "$calc.totalBonus" },
            count: { $sum: 1 },
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
            total: { $sum: "$amount" },
            creditedTotal: { $sum: "$calc.creditedAmount" },
            bonusTotal: { $sum: "$calc.bonusAmount" },
            count: { $sum: 1 },
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
            total: { $sum: "$amount" },
            count: { $sum: 1 },
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

    responseData.summary = {
      totalLoss: totalBetAgg?.[0]?.total || 0,
      totalBetCount: totalBetAgg?.[0]?.count || 0,

      totalWin: totalWinAgg?.[0]?.total || 0,
      totalWinCount: totalWinAgg?.[0]?.count || 0,

      totalDeposit:
        (totalManualDepositAgg?.[0]?.total || 0) +
        (totalAutoDepositAgg?.[0]?.total || 0),

      totalManualDeposit: totalManualDepositAgg?.[0]?.total || 0,
      totalAutoDeposit: totalAutoDepositAgg?.[0]?.total || 0,

      totalManualCredited: totalManualDepositAgg?.[0]?.creditedTotal || 0,
      totalAutoCredited: totalAutoDepositAgg?.[0]?.creditedTotal || 0,

      totalManualBonus: totalManualDepositAgg?.[0]?.bonusTotal || 0,
      totalAutoBonus: totalAutoDepositAgg?.[0]?.bonusTotal || 0,

      totalWithdraw: totalWithdrawAgg?.[0]?.total || 0,

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

    if (type === "game") {
      const query = {
        userId: user.userId,
      };

      if (cleanStatus) {
        query.status = cleanStatus;
      }

      if (cleanSearch) {
        const rx = buildSearchRegex(cleanSearch);

        query.$or = [
          { provider_code: rx },
          { game_code: rx },
          { bet_type: rx },
          { transaction_id: rx },
          { round_id: rx },
          { verification_key: rx },
          { status: rx },
          { times: rx },
        ];
      }

      const [data, total] = await Promise.all([
        GameHistory.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),

        GameHistory.countDocuments(query),
      ]);

      responseData.history = data;
      responseData.pagination = {
        total,
        currentPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
        limit: perPage,
      };
    }

    if (type === "manual-deposit") {
      const query = {
        user: userObjectId,
      };

      if (cleanStatus) {
        query.status = cleanStatus;
      }

      if (cleanSearch) {
        const rx = buildSearchRegex(cleanSearch);

        query.$or = [
          { methodId: rx },
          { channelId: rx },
          { promoId: rx },
          { adminNote: rx },
          { "display.methodName": rx },
          { "display.channelName": rx },
        ];
      }

      const [data, total] = await Promise.all([
        DepositRequest.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),

        DepositRequest.countDocuments(query),
      ]);

      responseData.history = data;
      responseData.pagination = {
        total,
        currentPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
        limit: perPage,
      };
    }

    if (type === "auto-deposit") {
      const query = {
        ...autoDepositUserQuery,
      };

      if (cleanStatus) {
        query.status = cleanStatus.toUpperCase();
      }

      if (cleanSearch) {
        const rx = buildSearchRegex(cleanSearch);

        query.$or = [
          { invoiceNumber: rx },
          { transactionId: rx },
          { sessionCode: rx },
          { bank: rx },
          { footprint: rx },
          { "selectedBonus.title.bn": rx },
          { "selectedBonus.title.en": rx },
          { "checkoutItems.selectedBonusTitleBn": rx },
          { "checkoutItems.selectedBonusTitleEn": rx },
        ];
      }

      const [data, total] = await Promise.all([
        AutoDeposit.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),

        AutoDeposit.countDocuments(query),
      ]);

      responseData.history = data;
      responseData.pagination = {
        total,
        currentPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
        limit: perPage,
      };
    }

    if (type === "withdraw") {
      const query = {
        user: userObjectId,
      };

      if (cleanStatus) {
        query.status = cleanStatus;
      }

      if (cleanSearch) {
        const rx = buildSearchRegex(cleanSearch);

        query.$or = [
          { methodId: rx },
          { adminNote: rx },
          { "fields.accountNumber": rx },
          { "fields.phone": rx },
          { "fields.wallet": rx },
          { "fields.name": rx },
        ];
      }

      const [data, total] = await Promise.all([
        WithdrawRequest.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),

        WithdrawRequest.countDocuments(query),
      ]);

      responseData.history = data;
      responseData.pagination = {
        total,
        currentPage,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
        limit: perPage,
      };
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
