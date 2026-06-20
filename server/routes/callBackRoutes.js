import express from "express";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/gameHistory.js";

const router = express.Router();

const toNum = (value = 0) => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const money = (value = 0) => {
  const n = toNum(value);
  return Math.trunc(n * 100) / 100;
};

const clean = (value = "") => String(value || "").trim();

const cleanMemberAccount = (value = "") => {
  let username = clean(value).toLowerCase();

  if (username.endsWith("orclegames")) {
    username = username.slice(0, -"orclegames".length);
  }

  if (username.endsWith("oraclegames")) {
    username = username.slice(0, -"oraclegames".length);
  }

  return username;
};

const applyTurnoverProgress = async ({ userId, wagerAmount }) => {
  const amt = money(wagerAmount);
  if (amt <= 0) return;

  const running = await TurnOver.find({
    user: userId,
    status: "running",
  }).sort({ createdAt: 1 });

  let remaining = amt;

  for (const t of running) {
    if (remaining <= 0) break;

    const required = money(t.required);
    const progress = money(t.progress);
    const left = Math.max(0, money(required - progress));

    if (left <= 0) {
      await TurnOver.updateOne(
        { _id: t._id },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
          },
        },
      );
      continue;
    }

    const add = money(Math.min(left, remaining));
    const newProgress = money(progress + add);
    const completed = newProgress >= required;

    await TurnOver.updateOne(
      { _id: t._id },
      {
        $inc: {
          progress: add,
        },
        ...(completed
          ? {
              $set: {
                status: "completed",
                completedAt: new Date(),
              },
            }
          : {}),
      },
    );

    remaining = money(remaining - add);
  }
};

const applyAffiliateCommission = async ({ player, betAmount, winAmount }) => {
  let affiliateInfo = null;

  if (!player.referredBy) return affiliateInfo;

  const affiliator = await User.findById(player.referredBy);

  if (
    !affiliator ||
    affiliator.role !== "aff-user" ||
    affiliator.isActive !== true
  ) {
    return affiliateInfo;
  }

  const lossPct = Number(affiliator.gameLossCommission || 0);
  const winPct = Number(affiliator.gameWinCommission || 0);

  let totalCommission = 0;
  const details = [];

  if (betAmount > 0 && lossPct > 0) {
    const commissionAmount = money((betAmount * lossPct) / 100);

    if (commissionAmount > 0) {
      await User.updateOne(
        { _id: affiliator._id },
        {
          $inc: {
            gameLossCommissionBalance: commissionAmount,
          },
        },
      );

      totalCommission = money(totalCommission + commissionAmount);

      details.push({
        type: "gameLossCommission",
        commissionPercent: lossPct,
        commissionAmount,
        walletField: "gameLossCommissionBalance",
      });
    }
  }

  if (winAmount > 0 && winPct > 0) {
    const commissionAmount = money((winAmount * winPct) / 100);

    if (commissionAmount > 0) {
      await User.updateOne(
        { _id: affiliator._id },
        {
          $inc: {
            gameWinCommissionBalance: commissionAmount,
          },
        },
      );

      totalCommission = money(totalCommission + commissionAmount);

      details.push({
        type: "gameWinCommission",
        commissionPercent: winPct,
        commissionAmount,
        walletField: "gameWinCommissionBalance",
      });
    }
  }

  if (details.length) {
    affiliateInfo = {
      affiliatorId: String(affiliator._id),
      affiliatorUserId: affiliator.userId,
      totalCommission,
      details,
    };
  }

  return affiliateInfo;
};

router.post("/", async (req, res) => {
  try {
    console.log("\n================ CALLBACK RECEIVED ================");
    console.log("Time:", new Date().toISOString());
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("===================================================\n");

    const {
      game_uid,
      game_round,
      bet_amount,
      serial_number,
      win_amount,
      member_account,
      currency_code,
      timestamp,
    } = req.body || {};

    if (
      !game_uid ||
      !game_round ||
      !serial_number ||
      bet_amount === undefined ||
      win_amount === undefined ||
      !member_account
    ) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "Missing required fields",
      });
    }

    const gameUId = clean(game_uid);
    const gameRound = clean(game_round);
    const serialNumber = clean(serial_number);
    const rawMemberAccount = clean(member_account);
    const userGamePlayName = cleanMemberAccount(member_account);

    const betAmount = money(bet_amount);
    const winAmount = money(win_amount);

    if (betAmount < 0 || winAmount < 0) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "Invalid amount",
      });
    }

    const duplicate = await GameHistory.findOne({
      $or: [{ serial_number: serialNumber }, { game_round: gameRound }],
    }).lean();

    if (duplicate) {
      return res.status(200).json({
        success: false,
        balance: duplicate.balance_after || 0,
        message: "DUPLICATE",
        data: {
          status: "DUPLICATE",
          balance: duplicate.balance_after || 0,
          game_round: gameRound,
          serial_number: serialNumber,
        },
      });
    }

    const player = await User.findOne({
      userGamePlayName,
      isActive: true,
    });

    if (!player) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "USER_NOT_FOUND",
        data: {
          member_account: rawMemberAccount,
          userGamePlayName,
        },
      });
    }

    const currentBalance = money(player.balance || 0);

    if (currentBalance < betAmount) {
      return res.status(200).json({
        success: false,
        balance: currentBalance,
        message: "INSUFFICIENT_BALANCE",
        data: {
          status: "INSUFFICIENT_BALANCE",
          balance: currentBalance,
          currentBalance,
          betAmount,
          game_round: gameRound,
          serial_number: serialNumber,
        },
      });
    }

    const netAmount = money(winAmount - betAmount);

    let resultType = "push";
    if (netAmount > 0) resultType = "win";
    if (netAmount < 0) resultType = "loss";

    const newBalance = money(currentBalance - betAmount + winAmount);

    const updatedPlayer = await User.findByIdAndUpdate(
      player._id,
      {
        $set: {
          balance: newBalance,
        },
      },
      {
        returnDocument: "after",
      },
    );

    const finalBalance = money(updatedPlayer.balance || 0);

    let affiliateInfo = null;

    try {
      affiliateInfo = await applyAffiliateCommission({
        player,
        betAmount,
        winAmount,
      });
    } catch (affiliateError) {
      console.error("Affiliate commission error:", affiliateError.message);
    }

    const history = await GameHistory.create({
      user: player._id,
      userId: player.userId,
      userGamePlayName: player.userGamePlayName,
      member_account: rawMemberAccount,
      phone: `${player.countryCode || ""}${player.phone || ""}`,
      currency: currency_code || player.currency || "BDT",
      userRole: player.role || "user",

      game_uid: gameUId,
      game_round: gameRound,
      serial_number: serialNumber,

      bet_amount: betAmount,
      win_amount: winAmount,
      net_amount: netAmount,
      resultType,

      balance_before: currentBalance,
      balance_after: finalBalance,

      affiliateInfo,
      oracleTimestamp: clean(timestamp),
      rawPayload: req.body || {},
    });

    if (betAmount > 0) {
      await applyTurnoverProgress({
        userId: player._id,
        wagerAmount: betAmount,
      });
    }

    return res.status(200).json({
      success: true,
      balance: finalBalance,
      message: "SUCCESS",
      data: {
        status: "SUCCESS",
        resultType,
        betAmount,
        winAmount,
        netAmount,
        balanceBefore: currentBalance,
        newBalance: finalBalance,
        game_round: gameRound,
        serial_number: serialNumber,
        historyId: history._id,
        affiliateInfo,
      },
    });
  } catch (error) {
    console.error("Callback Error:", error.message);

    if (error?.code === 11000) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "DUPLICATE",
        data: {
          status: "DUPLICATE",
        },
      });
    }

    return res.status(200).json({
      success: false,
      balance: 0,
      message: "Internal processing error, but acknowledged",
    });
  }
});

export default router;
