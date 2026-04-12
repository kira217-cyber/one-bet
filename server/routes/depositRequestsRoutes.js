import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import DepositRequest from "../models/DepositRequests.js";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";
import DepositMethod from "../models/DepositMethod.js";

const router = express.Router();

/* ---------------- AUTH ---------------- */
const requireAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

/* ---------------- HELPERS ---------------- */
const parsePercent = (tagText) => {
  if (typeof tagText !== "string") return 0;
  if (!tagText.includes("%")) return 0;

  const p = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(p) ? p : 0;
};

const computeBonuses = ({ amount, methodDoc, channelId, promoId }) => {
  const channels = Array.isArray(methodDoc?.channels) ? methodDoc.channels : [];

  const ch = channels.find(
    (c) => String(c?.id) === String(channelId) && c?.isActive !== false
  );

  if (!ch) throw new Error("Invalid channel");

  const channelPercent = parsePercent(ch?.tagText || "+0%");
  const percentBonus = (amount * channelPercent) / 100;

  let promoBonus = 0;

  // ✅ default হলো method-level turnover
  let turnoverMultiplier = Number(methodDoc?.turnoverMultiplier ?? 1);

  const promos = Array.isArray(methodDoc?.promotions)
    ? methodDoc.promotions
    : [];

  const promo = promos.find(
    (p) =>
      String(p?.id || "").toLowerCase() === String(promoId || "").toLowerCase()
  );

  // ✅ promo selected থাকলে promo turnover use হবে
  if (
    promo &&
    String(promoId || "").toLowerCase() !== "none" &&
    promo?.isActive !== false
  ) {
    const bonusValue = Number(promo?.bonusValue ?? 0) || 0;

    if (promo?.bonusType === "percent") {
      promoBonus = (amount * bonusValue) / 100;
    } else {
      promoBonus = bonusValue;
    }

    turnoverMultiplier = Number(
      promo?.turnoverMultiplier ?? turnoverMultiplier
    );
  }

  const totalBonus = promoBonus + percentBonus;
  const targetTurnover = (amount + totalBonus) * turnoverMultiplier;

  return {
    channelPercent,
    percentBonus,
    promoBonus,
    totalBonus,
    turnoverMultiplier,
    targetTurnover,
  };
};

/* ---------------- USER: CREATE REQUEST ---------------- */
router.post("/deposit-requests", requireAuth, async (req, res) => {
  try {
    const {
      methodId,
      channelId,
      promoId = "none",
      amount,
      fields = {},
      display = {},
    } = req.body;

    const amt = Number(amount || 0);

    if (!methodId || !channelId || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    const user = await User.findById(req.user.id).select("_id isActive");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User is not active",
      });
    }

    const methodDoc = await DepositMethod.findOne({
      methodId: String(methodId).toLowerCase(),
    });

    if (!methodDoc || methodDoc?.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit method",
      });
    }

    const minDeposit = Number(methodDoc?.minDepositAmount ?? 0) || 0;
    const maxDeposit = Number(methodDoc?.maxDepositAmount ?? 0) || 0;

    if (minDeposit > 0 && amt < minDeposit) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit is ${minDeposit}`,
      });
    }

    if (maxDeposit > 0 && amt > maxDeposit) {
      return res.status(400).json({
        success: false,
        message: `Maximum deposit is ${maxDeposit}`,
      });
    }

    const calc = computeBonuses({
      amount: amt,
      methodDoc,
      channelId,
      promoId,
    });

    const doc = await DepositRequest.create({
      user: user._id,
      methodId,
      channelId,
      promoId,
      amount: amt,
      fields,
      display,
      calc: {
        channelPercent: calc.channelPercent,
        percentBonus: calc.percentBonus,
        promoBonus: calc.promoBonus,
        totalBonus: calc.totalBonus,
        turnoverMultiplier: calc.turnoverMultiplier,
        targetTurnover: calc.targetTurnover,
        creditedAmount: 0,
      },
      status: "pending",
    });

    return res.json({
      success: true,
      message: "Deposit request created",
      data: { requestId: doc._id },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/* ---------------- USER: MY REQUESTS ---------------- */
router.get("/deposit-requests/my", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DepositRequest.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments({ user: req.user.id }),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: LIST ---------------- */
router.get("/admin/deposit-requests", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    if (q) {
      const users = await User.find({
        $or: [
          { userId: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      filter.user = {
        $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
      };
    }

    const [items, total] = await Promise.all([
      DepositRequest.find(filter)
        .populate("user", "userId phone email balance isActive role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: DETAILS ---------------- */
router.get("/admin/deposit-requests/:id", requireAuth, async (req, res) => {
  try {
    const doc = await DepositRequest.findById(req.params.id)
      .populate("user", "userId phone email balance isActive role")
      .lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      data: doc,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: APPROVE ---------------- */
router.post("/admin/deposit-requests/:id/approve", requireAuth, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const adminNote = String(req.body.adminNote || "");

    await session.withTransaction(async () => {
      const doc = await DepositRequest.findById(req.params.id).session(session);
      if (!doc) throw new Error("Not found");

      // ✅ approved হয়ে গেলে turnover আছে কিনা চেক
      if (doc.status === "approved") {
        const exists = await TurnOver.findOne({
          user: doc.user,
          sourceType: "deposit",
          sourceId: doc._id,
        }).session(session);

        if (!exists) {
          const creditedAmount = Number(doc?.calc?.creditedAmount || doc.amount || 0);
          const targetTurnover = Number(doc?.calc?.targetTurnover || 0);

          await TurnOver.create(
            [
              {
                user: doc.user,
                sourceType: "deposit",
                sourceId: doc._id,
                required: targetTurnover,
                progress: 0,
                status: targetTurnover <= 0 ? "completed" : "running",
                creditedAmount,
                completedAt: targetTurnover <= 0 ? new Date() : null,
              },
            ],
            { session }
          );
        }

        return;
      }

      if (doc.status !== "pending") throw new Error("Already processed");

      const methodDoc = await DepositMethod.findOne({
        methodId: String(doc.methodId).toLowerCase(),
      }).session(session);

      if (!methodDoc || methodDoc.isActive === false) {
        throw new Error("Invalid deposit method");
      }

      const depositAmount = Number(doc.amount || 0);
      if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
        throw new Error("Invalid amount");
      }

      // ✅ আবার recalc হবে
      const calc = computeBonuses({
        amount: depositAmount,
        methodDoc,
        channelId: doc.channelId,
        promoId: doc.promoId,
      });

      const creditedAmount = depositAmount + Number(calc.totalBonus || 0);

      const user = await User.findById(doc.user).session(session);
      if (!user) throw new Error("User not found");
      if (user.isActive === false) throw new Error("User not active");

      // ✅ balance add
      user.balance = Number(user.balance || 0) + creditedAmount;
      await user.save({ session });

      // ✅ affiliate commission logic
      let affiliateCommissionInfo = null;

      if (user.referredBy) {
        const affiliator = await User.findById(user.referredBy).session(session);

        if (
          affiliator &&
          affiliator.role === "aff-user" &&
          affiliator.isActive
        ) {
          const pct = Number(affiliator.depositCommission || 0);

          if (Number.isFinite(pct) && pct > 0) {
            const commissionBase = depositAmount;
            const commissionAmount = (commissionBase * pct) / 100;

            if (commissionAmount > 0) {
              affiliator.depositCommissionBalance =
                Number(affiliator.depositCommissionBalance || 0) +
                commissionAmount;

              await affiliator.save({ session });

              affiliateCommissionInfo = {
                affiliatorId: String(affiliator._id),
                affiliatorUserId: affiliator.userId,
                percent: pct,
                baseAmount: commissionBase,
                commissionAmount,
              };
            }
          }
        }
      }

      // ✅ approve save
      doc.status = "approved";
      doc.adminNote = adminNote;
      doc.approvedBy = req.user.id;
      doc.approvedAt = new Date();

      doc.calc = {
        channelPercent: calc.channelPercent,
        percentBonus: calc.percentBonus,
        promoBonus: calc.promoBonus,
        totalBonus: calc.totalBonus,
        turnoverMultiplier: calc.turnoverMultiplier,
        targetTurnover: calc.targetTurnover,
        creditedAmount,
        affiliateDepositCommission: affiliateCommissionInfo,
      };

      await doc.save({ session });

      // ✅ turnover create
      const existingTo = await TurnOver.findOne({
        user: user._id,
        sourceType: "deposit",
        sourceId: doc._id,
      }).session(session);

      if (!existingTo) {
        const target = Number(calc.targetTurnover || 0);

        await TurnOver.create(
          [
            {
              user: user._id,
              sourceType: "deposit",
              sourceId: doc._id,
              required: target,
              progress: 0,
              status: target <= 0 ? "completed" : "running",
              creditedAmount,
              completedAt: target <= 0 ? new Date() : null,
            },
          ],
          { session }
        );
      }
    });

    return res.json({
      success: true,
      message: "Approved",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e?.message || "Approve failed",
    });
  } finally {
    session.endSession();
  }
});

/* ---------------- ADMIN: REJECT ---------------- */
router.post("/admin/deposit-requests/:id/reject", requireAuth, async (req, res) => {
  try {
    const adminNote = String(req.body.adminNote || "");

    const doc = await DepositRequest.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    if (doc.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Already processed",
      });
    }

    doc.status = "rejected";
    doc.adminNote = adminNote;
    doc.rejectedBy = req.user.id;
    doc.rejectedAt = new Date();

    await doc.save();

    res.json({
      success: true,
      message: "Rejected",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e?.message || "Reject failed",
    });
  }
});

export default router;