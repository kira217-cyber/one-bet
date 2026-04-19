import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/gameHistory.js";

const router = express.Router();

/**
 * ✅ Apply wager amount to running turnovers
 * oldest running turnover first
 */
const applyTurnoverProgress = async ({ session, userMongoId, wagerAmount }) => {
  const amt = Number(wagerAmount || 0);
  if (!Number.isFinite(amt) || amt <= 0) return;

  const runningTurnovers = await TurnOver.find({
    user: userMongoId,
    status: "running",
  })
    .sort({ createdAt: 1 })
    .session(session);

  if (!runningTurnovers.length) return;

  let remaining = amt;

  for (const turnover of runningTurnovers) {
    if (remaining <= 0) break;

    const required = Number(turnover.required || 0);
    const progress = Number(turnover.progress || 0);
    const left = Math.max(0, required - progress);

    if (left <= 0) {
      await TurnOver.updateOne(
        { _id: turnover._id },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
          },
        },
      ).session(session);
      continue;
    }

    const addAmount = Math.min(left, remaining);
    const nextProgress = progress + addAmount;
    const completed = nextProgress >= required;

    await TurnOver.updateOne(
      { _id: turnover._id },
      {
        $inc: { progress: addAmount },
        ...(completed
          ? {
              $set: {
                status: "completed",
                completedAt: new Date(),
              },
            }
          : {}),
      },
    ).session(session);

    remaining -= addAmount;
  }
};

router.post("/", async (req, res) => {
  try {
    const {
      account_id,
      username: rawUsername,
      provider_code,
      amount,
      game_code,
      verification_key,
      bet_type,
      transaction_id,
      times,
      round_id,
      bet_details,
    } = req.body;

    console.log("✅ Callback received:", req.body);

    if (
      !rawUsername ||
      !provider_code ||
      amount === undefined ||
      !game_code ||
      !bet_type
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const cleanUserId = String(rawUsername).trim();
    const normalizedBetType = String(bet_type).trim().toUpperCase();
    const amountFloat = Number.parseFloat(amount);

    if (!Number.isFinite(amountFloat) || amountFloat < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    let balanceChange = 0;
    let nextStatus = "pending";
    let winAmount = 0;

    if (normalizedBetType === "BET") {
      balanceChange = -amountFloat;
      nextStatus = "bet";
      winAmount = 0;
    } else if (normalizedBetType === "SETTLE") {
      balanceChange = amountFloat;
      nextStatus = "settled";
      winAmount = amountFloat;
    } else if (normalizedBetType === "CANCEL") {
      balanceChange = amountFloat;
      nextStatus = "cancelled";
      winAmount = 0;
    } else if (normalizedBetType === "REFUND") {
      balanceChange = amountFloat;
      nextStatus = "refunded";
      winAmount = 0;
    } else if (normalizedBetType === "BONUS" || normalizedBetType === "PROMO") {
      balanceChange = amountFloat;
      nextStatus = "settled";
      winAmount = amountFloat;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid bet_type",
      });
    }

    const player = await User.findOne({ userId: cleanUserId });

    if (!player) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
      });
    }

    if (player.isActive === false) {
      throw Object.assign(new Error("User inactive"), {
        statusCode: 403,
      });
    }

    // ✅ verification_key always unique
    if (verification_key) {
      const existingHistory = await GameHistory.findOne({
        verification_key: String(verification_key).trim(),
      });

      if (existingHistory) {
        throw Object.assign(new Error("DUPLICATE_VERIFICATION_KEY"), {
          duplicate: true,
          statusCode: 200,
          currentBalance: Number(player.balance || 0),
        });
      }
    }

    const currentBalance = Number(player.balance || 0);
    const newBalance = currentBalance + balanceChange;

    // ✅ optional: prevent minus balance on BET
    if (normalizedBetType === "BET" && newBalance < 0) {
      throw Object.assign(new Error("Insufficient balance"), {
        statusCode: 400,
      });
    }

    const gameRecord = await GameHistory.create({
      userId: player.userId,
      provider_code: String(provider_code).trim().toUpperCase(),
      game_code: String(game_code).trim(),
      bet_type: normalizedBetType,
      amount: amountFloat,
      win_amount: winAmount,
      balance_after: newBalance,
      transaction_id: transaction_id ? String(transaction_id).trim() : null,
      round_id: round_id ? String(round_id).trim() : null,
      verification_key: verification_key
        ? String(verification_key).trim()
        : null,
      times: times ? String(times).trim() : null,
      status: nextStatus,
      bet_details:
        bet_details && typeof bet_details === "object" ? bet_details : {},
      flagged: false,
    });

    await User.updateOne(
      { _id: player._id },
      {
        $inc: { balance: balanceChange },
      },
    );

    // ✅ Turnover only for BET
    if (normalizedBetType === "BET" && amountFloat > 0) {
      await applyTurnoverProgress({
        userMongoId: player._id,
        wagerAmount: amountFloat,
      });
    }

    // ✅ Affiliate commission
    let affiliateInfo = null;

    if (player.referredBy) {
      const affiliator = await User.findById(player.referredBy);

      if (
        affiliator &&
        affiliator.role === "aff-user" &&
        affiliator.isActive === true
      ) {
        const lossPct = Number(affiliator.gameLossCommission || 0);
        const winPct = Number(affiliator.gameWinCommission || 0);

        let commissionAmount = 0;
        let walletField = null;

        if (normalizedBetType === "BET" && lossPct > 0) {
          commissionAmount = (amountFloat * lossPct) / 100;
          walletField = "gameLossCommissionBalance";
        }

        if (normalizedBetType === "SETTLE" && winPct > 0) {
          commissionAmount = (amountFloat * winPct) / 100;
          walletField = "gameWinCommissionBalance";
        }

        if (commissionAmount > 0 && walletField) {
          await User.updateOne(
            { _id: affiliator._id },
            {
              $inc: {
                [walletField]: commissionAmount,
              },
            },
          );

          affiliateInfo = {
            affiliatorId: String(affiliator._id),
            affiliatorUserId: affiliator.userId,
            bet_type: normalizedBetType,
            commissionPercent: normalizedBetType === "BET" ? lossPct : winPct,
            commissionAmount,
            walletField,
          };
        }
      }
    }

    const result = {
      historyId: String(gameRecord._id),
      playerUserId: player.userId,
      newBalance,
      balanceChange,
      transaction_id: transaction_id || null,
      verification_key: verification_key || null,
      affiliateInfo,
    };

    return res.json({
      success: true,
      message: "Processed successfully",
      data: result,
    });
  } catch (err) {
    if (err?.message === "DUPLICATE_VERIFICATION_KEY" && err?.duplicate) {
      return res.json({
        success: true,
        message: "Already processed",
        data: {
          verification_key: req.body?.verification_key || null,
          current_balance: err.currentBalance,
        },
      });
    }

    const status = err?.statusCode || 500;

    console.error("❌ Callback error:", err);

    return res.status(status).json({
      success: false,
      message:
        status === 404 ? "User not found" : err.message || "Server error",
    });
  }
});

export default router;
