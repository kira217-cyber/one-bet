import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";
import NineWicketWallet from "../models/NineWicketWallet.js";

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

const getTokenFromHeader = (req) => {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
};

const getDecodedUserId = (decoded = {}) => {
  return (
    decoded?.id ||
    decoded?._id ||
    decoded?.userId ||
    decoded?.user?._id ||
    decoded?.user?.id ||
    null
  );
};

const safeNumber = (value = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.trunc(number * 100) / 100;
};

/* =========================================================
   USER AUTHENTICATION
========================================================= */

const requireUser = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = getDecodedUserId(decoded);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(userId).select(
      [
        "userId",
        "phone",
        "email",
        "role",
        "isActive",
        "currency",
        "balance",
        "userGamePlayName",
        "nineWicketUsername",
      ].join(" "),
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only normal user allowed",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

/**
 * তোমার User model-এ admin role নেই।
 *
 * তাই admin token তৈরি করার সময় payload-এ নিচের কোনো একটি role
 * থাকতে হবে:
 *
 * admin
 * mother
 * master
 */

const requireAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const adminRole =
      decoded?.role || decoded?.admin?.role || decoded?.user?.role || "";

    if (!["admin", "mother", "master"].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = {
      id: getDecodedUserId(decoded),
      role: adminRole,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

/* =========================================================
   DEFAULT WALLET RESPONSE
========================================================= */

const getDefaultWallet = (user) => {
  return {
    user: user?._id || null,

    username: user?.nineWicketUsername || null,

    totalTransferred: 0,

    totalReturned: 0,

    exposureBalance: 0,

    lastTransferAmount: 0,

    lastReturnedAmount: 0,

    lastTransferAt: null,

    lastReturnedAt: null,

    lastSyncAt: null,

    status: "idle",
  };
};

/* =========================================================
   USER: OWN NINE WICKET WALLET
   GET /api/nine-wicket-wallet/me
========================================================= */

router.get("/me", requireUser, async (req, res) => {
  try {
    const wallet = await NineWicketWallet.findOne({
      user: req.user._id,
    }).lean();

    const walletData = wallet || getDefaultWallet(req.user);

    return res.status(200).json({
      success: true,

      data: {
        ...walletData,

        totalTransferred: safeNumber(walletData.totalTransferred),

        totalReturned: safeNumber(walletData.totalReturned),

        exposureBalance: Math.max(0, safeNumber(walletData.exposureBalance)),

        lastTransferAmount: safeNumber(walletData.lastTransferAmount),

        lastReturnedAmount: safeNumber(walletData.lastReturnedAmount),

        userInfo: {
          _id: req.user._id,

          userId: req.user.userId,

          phone: req.user.phone,

          email: req.user.email,

          currency: req.user.currency || "BDT",

          mainBalance: safeNumber(req.user.balance),

          userGamePlayName: req.user.userGamePlayName || null,

          nineWicketUsername: req.user.nineWicketUsername || null,
        },
      },
    });
  } catch (error) {
    console.error("Get Own NineWicket Wallet Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get NineWicket wallet",
      error: error.message,
    });
  }
});

/* =========================================================
   ADMIN: WALLET SUMMARY
   GET /api/nine-wicket-wallet/admin/summary
========================================================= */

router.get("/admin/summary", requireAdmin, async (req, res) => {
  try {
    const [
      totalWallets,
      playingWallets,
      exposureWallets,
      settledWallets,
      totals,
    ] = await Promise.all([
      NineWicketWallet.countDocuments(),

      NineWicketWallet.countDocuments({
        status: "playing",
      }),

      NineWicketWallet.countDocuments({
        exposureBalance: {
          $gt: 0,
        },
      }),

      NineWicketWallet.countDocuments({
        status: "settled",
      }),

      NineWicketWallet.aggregate([
        {
          $group: {
            _id: null,

            totalTransferred: {
              $sum: "$totalTransferred",
            },

            totalReturned: {
              $sum: "$totalReturned",
            },

            totalExposure: {
              $sum: "$exposureBalance",
            },
          },
        },
      ]),
    ]);

    const summary = totals[0] || {
      totalTransferred: 0,
      totalReturned: 0,
      totalExposure: 0,
    };

    return res.status(200).json({
      success: true,

      data: {
        totalWallets,

        playingWallets,

        exposureWallets,

        settledWallets,

        totalTransferred: safeNumber(summary.totalTransferred),

        totalReturned: safeNumber(summary.totalReturned),

        totalExposure: safeNumber(summary.totalExposure),
      },
    });
  } catch (error) {
    console.error("NineWicket Wallet Summary Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get NineWicket wallet summary",
      error: error.message,
    });
  }
});

/* =========================================================
   ADMIN: LIST ALL NINE WICKET WALLETS

   GET /api/nine-wicket-wallet
   GET /api/nine-wicket-wallet?page=1&limit=20
   GET /api/nine-wicket-wallet?search=test
   GET /api/nine-wicket-wallet?status=exposure
   GET /api/nine-wicket-wallet?hasExposure=true
========================================================= */

router.get("/", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "20", 10), 1),
      100,
    );

    const skip = (page - 1) * limit;

    const search = String(req.query.search || "").trim();

    const status = String(req.query.status || "").trim();

    const hasExposure = String(req.query.hasExposure || "")
      .trim()
      .toLowerCase();

    const query = {};

    /* -----------------------------------------------------
       STATUS FILTER
    ----------------------------------------------------- */

    if (status && ["idle", "playing", "exposure", "settled"].includes(status)) {
      query.status = status;
    }

    /* -----------------------------------------------------
       EXPOSURE FILTER
    ----------------------------------------------------- */

    if (hasExposure === "true") {
      query.exposureBalance = {
        $gt: 0,
      };
    }

    if (hasExposure === "false") {
      query.exposureBalance = {
        $lte: 0,
      };
    }

    /* -----------------------------------------------------
       SEARCH
    ----------------------------------------------------- */

    if (search) {
      const matchedUsers = await User.find({
        $or: [
          {
            userId: {
              $regex: search,
              $options: "i",
            },
          },

          {
            phone: {
              $regex: search,
              $options: "i",
            },
          },

          {
            email: {
              $regex: search,
              $options: "i",
            },
          },

          {
            userGamePlayName: {
              $regex: search,
              $options: "i",
            },
          },

          {
            nineWicketUsername: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      })
        .select("_id")
        .lean();

      const matchedUserIds = matchedUsers.map((user) => user._id);

      query.$or = [
        {
          username: {
            $regex: search,
            $options: "i",
          },
        },

        {
          user: {
            $in: matchedUserIds,
          },
        },
      ];
    }

    /* -----------------------------------------------------
       FETCH WALLETS
    ----------------------------------------------------- */

    const [items, total] = await Promise.all([
      NineWicketWallet.find(query)
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
          exposureBalance: -1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      NineWicketWallet.countDocuments(query),
    ]);

    const formattedItems = items.map((wallet) => ({
      ...wallet,

      totalTransferred: safeNumber(wallet.totalTransferred),

      totalReturned: safeNumber(wallet.totalReturned),

      exposureBalance: Math.max(0, safeNumber(wallet.exposureBalance)),

      lastTransferAmount: safeNumber(wallet.lastTransferAmount),

      lastReturnedAmount: safeNumber(wallet.lastReturnedAmount),

      availableDifference: safeNumber(
        Number(wallet.totalTransferred || 0) -
          Number(wallet.totalReturned || 0),
      ),
    }));

    return res.status(200).json({
      success: true,

      data: formattedItems,

      pagination: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),

        hasNextPage: page < Math.ceil(total / limit),

        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get NineWicket Wallet List Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get NineWicket wallets",
      error: error.message,
    });
  }
});

/* =========================================================
   ADMIN: GET SINGLE USER WALLET
   GET /api/nine-wicket-wallet/:userId
========================================================= */

router.get("/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(userId)
      .select(
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
          "createdAt",
        ].join(" "),
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const wallet = await NineWicketWallet.findOne({
      user: userId,
    }).lean();

    const walletData = wallet || getDefaultWallet(user);

    return res.status(200).json({
      success: true,

      data: {
        ...walletData,

        totalTransferred: safeNumber(walletData.totalTransferred),

        totalReturned: safeNumber(walletData.totalReturned),

        exposureBalance: Math.max(0, safeNumber(walletData.exposureBalance)),

        lastTransferAmount: safeNumber(walletData.lastTransferAmount),

        lastReturnedAmount: safeNumber(walletData.lastReturnedAmount),

        userInfo: user,
      },
    });
  } catch (error) {
    console.error("Get Single NineWicket Wallet Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get NineWicket wallet",
      error: error.message,
    });
  }
});

export default router;
