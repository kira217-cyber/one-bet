import express from "express";
import mongoose from "mongoose";
import WithdrawRequest from "../models/WithdrawRequest.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import { authMiddleware } from "./userRoutes.js";

const router = express.Router();

const requireAuth = authMiddleware;

/**
 * USER: eligibility
 * block withdraw if user has any running turnover
 */
router.get("/withdraw-requests/eligibility", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (!running) {
      return res.json({
        success: true,
        data: {
          eligible: true,
          hasRunningTurnover: false,
          remaining: 0,
          message: "",
        },
      });
    }

    const required = Number(running.required || 0);
    const progress = Number(running.progress || 0);
    const remaining = Math.max(0, required - progress);

    return res.json({
      success: true,
      data: {
        eligible: false,
        hasRunningTurnover: true,
        remaining,
        message:
          remaining > 0
            ? `Turnover pending: remaining ${remaining}`
            : "Turnover pending",
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
    });
  }
});

/**
 * USER: create withdraw request
 * - turnover fulfilled check
 * - method validation
 * - balance hold instantly
 */
router.post("/withdraw-requests", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { methodId, amount, fields } = req.body || {};
    const amt = Number(amount || 0);

    if (!methodId || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({
        success: false,
        message: "methodId and valid amount required",
      });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (running) {
      const remaining = Math.max(
        0,
        Number(running.required || 0) - Number(running.progress || 0),
      );

      return res.status(403).json({
        success: false,
        message: "Turnover not fulfilled. Complete turnover before withdraw.",
        data: { remaining },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    if (user.isActive === false) {
      throw Object.assign(new Error("User is inactive"), { statusCode: 403 });
    }

    const currentBalance = Number(user.balance || 0);

    if (currentBalance < amt) {
      throw Object.assign(new Error("Insufficient balance"), {
        statusCode: 400,
      });
    }

    const balanceAfter = currentBalance - amt;

    const doc = await WithdrawRequest.create({
      user: user._id,
      methodId: String(methodId),
      amount: amt,
      fields: fields && typeof fields === "object" ? fields : {},
      status: "pending",
      balanceBefore: currentBalance,
      balanceAfter,
    });

    await User.updateOne(
      { _id: user._id },
      { $set: { balance: balanceAfter } },
    );

    return res.json({
      success: true,
      message: "Withdraw request created successfully",
      data: doc,
    });
  } catch (e) {
    const status = e?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/**
 * USER: my requests
 */
router.get("/withdraw-requests/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments({ user: userId }),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to load history",
    });
  }
});

/**
 * USER: my single request
 */
router.get("/withdraw-requests/my/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const doc = await WithdrawRequest.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to load request",
    });
  }
});

/**
 * ADMIN: list requests
 */
router.get("/admin/withdraw-requests", requireAuth, async (req, res) => {
  try {
    const status = String(req.query.status || "pending").trim();
    const qText = String(req.query.q || "").trim();

    const q = {};

    if (status && status !== "all") {
      q.status = status;
    }

    if (qText) {
      const users = await User.find({
        $or: [
          { userId: { $regex: qText, $options: "i" } },
          { phone: { $regex: qText, $options: "i" } },
          { email: { $regex: qText, $options: "i" } },
        ],
      }).select("_id");

      const ids = users.map((u) => u._id);

      q.user = {
        $in: ids.length ? ids : [new mongoose.Types.ObjectId()],
      };
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find(q)
        .populate("user", "userId phone email balance role isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments(q),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to load requests",
    });
  }
});

/**
 * ADMIN: details
 */
router.get("/admin/withdraw-requests/:id", requireAuth, async (req, res) => {
  try {
    const doc = await WithdrawRequest.findById(req.params.id).populate(
      "user",
      "userId phone email balance role isActive",
    );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to load details",
    });
  }
});

/**
 * ADMIN: approve
 * balance already held on create
 */
router.patch(
  "/admin/withdraw-requests/:id/approve",
  requireAuth,
  async (req, res) => {
    try {
      const { adminNote } = req.body || {};

      const doc = await WithdrawRequest.findById(req.params.id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Not found",
        });
      }

      if (doc.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending requests can be approved",
        });
      }

      doc.status = "approved";
      doc.approvedAt = new Date();
      doc.adminNote = adminNote || "";
      doc.adminId = req.user?.id || req.user?._id || null;

      await doc.save();

      return res.json({
        success: true,
        message: "Approved successfully",
        data: doc,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Approve failed",
      });
    }
  },
);

/**
 * ADMIN: reject
 * refund held balance
 */
router.patch(
  "/admin/withdraw-requests/:id/reject",
  requireAuth,
  async (req, res) => {
    try {
      const { adminNote } = req.body || {};

      const doc = await WithdrawRequest.findById(req.params.id);

      if (!doc) {
        throw Object.assign(new Error("Not found"), { statusCode: 404 });
      }

      if (doc.status !== "pending") {
        throw Object.assign(new Error("Only pending can be rejected"), {
          statusCode: 400,
        });
      }

      await User.updateOne(
        { _id: doc.user },
        { $inc: { balance: Number(doc.amount || 0) } }
      );

      doc.status = "rejected";
      doc.rejectedAt = new Date();
      doc.adminNote = adminNote || "";
      doc.adminId = req.user?.id || req.user?._id || null;

      await doc.save();

      return res.json({
        success: true,
        message: "Rejected successfully and balance refunded",
        data: doc,
      });
    } catch (e) {
      const status = e?.statusCode || 500;

      return res.status(status).json({
        success: false,
        message: e?.message || "Reject failed",
      });
    }
  }
);

export default router;
