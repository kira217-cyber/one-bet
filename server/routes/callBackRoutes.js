import express from "express";

import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/gameHistory.js";
import NineWicketWallet from "../models/NineWicketWallet.js";

const router = express.Router();

/* =========================================================
   CONFIGURATION
========================================================= */

const NINE_WICKET_GAME_UID =
  process.env.NINE_WICKET_GAME_UID || "48341a3bf62b6dd0814d7129e7e0834b";

/* =========================================================
   BASIC HELPERS
========================================================= */

const toNum = (value = 0) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

const money = (value = 0) => {
  const number = toNum(value);

  return Math.trunc(number * 100) / 100;
};

const clean = (value = "") => {
  return String(value || "").trim();
};

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

const isNineWicketGame = (gameUId = "") => {
  return clean(gameUId) === NINE_WICKET_GAME_UID;
};

/* =========================================================
   TURNOVER PROGRESS
========================================================= */

const applyTurnoverProgress = async ({ userId, wagerAmount }) => {
  const amount = money(wagerAmount);

  if (amount <= 0) {
    return;
  }

  const runningTurnovers = await TurnOver.find({
    user: userId,
    status: "running",
  }).sort({
    createdAt: 1,
  });

  let remaining = amount;

  for (const turnover of runningTurnovers) {
    if (remaining <= 0) {
      break;
    }

    const required = money(turnover.required);

    const progress = money(turnover.progress);

    const left = Math.max(0, money(required - progress));

    if (left <= 0) {
      await TurnOver.updateOne(
        {
          _id: turnover._id,
        },
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
      {
        _id: turnover._id,
      },
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

/* =========================================================
   AFFILIATE COMMISSION
========================================================= */

const applyAffiliateCommission = async ({ player, betAmount, winAmount }) => {
  let affiliateInfo = null;

  if (!player.referredBy) {
    return affiliateInfo;
  }

  const affiliator = await User.findById(player.referredBy);

  if (
    !affiliator ||
    affiliator.role !== "aff-user" ||
    affiliator.isActive !== true
  ) {
    return affiliateInfo;
  }

  const lossPercent = Number(affiliator.gameLossCommission || 0);

  const winPercent = Number(affiliator.gameWinCommission || 0);

  let totalCommission = 0;

  const details = [];

  /* -------------------------------------------------------
     BET / LOSS COMMISSION
  ------------------------------------------------------- */

  if (betAmount > 0 && lossPercent > 0) {
    const commissionAmount = money((betAmount * lossPercent) / 100);

    if (commissionAmount > 0) {
      await User.updateOne(
        {
          _id: affiliator._id,
        },
        {
          $inc: {
            gameLossCommissionBalance: commissionAmount,
          },
        },
      );

      totalCommission = money(totalCommission + commissionAmount);

      details.push({
        type: "gameLossCommission",

        commissionPercent: lossPercent,

        commissionAmount,

        walletField: "gameLossCommissionBalance",
      });
    }
  }

  /* -------------------------------------------------------
     WIN COMMISSION
  ------------------------------------------------------- */

  if (winAmount > 0 && winPercent > 0) {
    const commissionAmount = money((winAmount * winPercent) / 100);

    if (commissionAmount > 0) {
      await User.updateOne(
        {
          _id: affiliator._id,
        },
        {
          $inc: {
            gameWinCommissionBalance: commissionAmount,
          },
        },
      );

      totalCommission = money(totalCommission + commissionAmount);

      details.push({
        type: "gameWinCommission",

        commissionPercent: winPercent,

        commissionAmount,

        walletField: "gameWinCommissionBalance",
      });
    }
  }

  if (details.length > 0) {
    affiliateInfo = {
      affiliatorId: String(affiliator._id),

      affiliatorUserId: affiliator.userId || "",

      totalCommission,

      details,
    };
  }

  return affiliateInfo;
};

/* =========================================================
   GET OR CREATE NINE WICKET WALLET
========================================================= */

const getOrCreateNineWicketWallet = async ({ player, nineWicketUsername }) => {
  let wallet = await NineWicketWallet.findOne({
    user: player._id,
  });

  if (wallet) {
    if (wallet.username !== nineWicketUsername) {
      wallet.username = nineWicketUsername;

      wallet.lastSyncAt = new Date();

      await wallet.save();
    }

    return wallet;
  }

  wallet = await NineWicketWallet.create({
    user: player._id,

    username: nineWicketUsername,

    totalTransferred: 0,

    totalReturned: 0,

    exposureBalance: 0,

    lastTransferAmount: 0,

    lastReturnedAmount: 0,

    lastTransferAt: null,

    lastReturnedAt: null,

    lastSyncAt: new Date(),

    status: "idle",
  });

  return wallet;
};

/* =========================================================
   NINE WICKET EXPOSURE
========================================================= */

/**
 * Exposure rules:
 *
 * 1. Bet callback:
 *
 *    betAmount > 0
 *    winAmount === 0
 *
 *    Previous same round stake থাকলে:
 *
 *    exposure =
 *      current exposure
 *      - previous same-round stake
 *      + current stake
 *
 *
 * 2. Settlement / close callback:
 *
 *    betAmount === 0
 *
 *    exposure =
 *      current exposure
 *      - current matchStake
 *
 *
 * Exposure কখনো 0-এর নিচে যাবে না।
 */

const updateNineWicketExposure = async ({
  player,
  nineWicketUsername,
  gameRound,
  betAmount,
  winAmount,
  matchStake,
}) => {
  const safeMatchStake = Math.max(0, money(matchStake));

  const wallet = await getOrCreateNineWicketWallet({
    player,
    nineWicketUsername,
  });

  const currentExposure = Math.max(0, money(wallet.exposureBalance || 0));

  let previousRoundMatchStake = 0;

  let exposureChange = 0;

  let exposureAfter = currentExposure;

  let exposureAction = "none";

  /* -------------------------------------------------------
     BET CALLBACK
  ------------------------------------------------------- */

  if (betAmount > 0 && winAmount === 0 && safeMatchStake > 0) {
    const previousRoundBet = await GameHistory.findOne({
      user: player._id,

      provider: "ninewicket",

      game_round: gameRound,

      bet_amount: {
        $gt: 0,
      },

      win_amount: 0,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (previousRoundBet) {
      previousRoundMatchStake = Math.max(
        0,
        money(previousRoundBet.matchStake || 0),
      );
    }

    exposureChange = money(safeMatchStake - previousRoundMatchStake);

    exposureAfter = Math.max(
      0,
      money(currentExposure - previousRoundMatchStake + safeMatchStake),
    );

    exposureAction =
      previousRoundMatchStake > 0 ? "replace_same_round" : "add_new_round";
  } else if (betAmount === 0 && safeMatchStake > 0) {
    /* -------------------------------------------------------
     SETTLEMENT / CLOSE CALLBACK
  ------------------------------------------------------- */
    exposureChange = money(-safeMatchStake);

    exposureAfter = Math.max(0, money(currentExposure - safeMatchStake));

    exposureAction =
      winAmount > 0 ? "subtract_settlement" : "subtract_zero_win";
  }

  /* -------------------------------------------------------
     WALLET STATUS
  ------------------------------------------------------- */

  let walletStatus = wallet.status || "idle";

  if (exposureAfter > 0) {
    walletStatus = "exposure";
  } else if (exposureAction !== "none") {
    walletStatus = "settled";
  }

  wallet.username = nineWicketUsername;

  wallet.exposureBalance = exposureAfter;

  wallet.lastSyncAt = new Date();

  wallet.status = walletStatus;

  await wallet.save();

  return {
    wallet,

    previousRoundMatchStake,

    exposureAction,

    exposureChange,

    exposureAfter,
  };
};

/* =========================================================
   CALLBACK ROUTE
   POST /api/call-back
========================================================= */

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
      nine_wicket,
    } = req.body || {};

    /* -----------------------------------------------------
       REQUIRED FIELDS
    ----------------------------------------------------- */

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

    const cleanedMemberAccount = cleanMemberAccount(member_account);

    const betAmount = money(bet_amount);

    const winAmount = money(win_amount);

    const nineWicketCallback = isNineWicketGame(gameUId);

    if (betAmount < 0 || winAmount < 0) {
      return res.status(200).json({
        success: false,

        balance: 0,

        message: "Invalid amount",
      });
    }

    /* -----------------------------------------------------
       DUPLICATE CHECK

       শুধু serial_number unique।
       game_round duplicate হতে পারবে।
    ----------------------------------------------------- */

    const duplicate = await GameHistory.findOne({
      serial_number: serialNumber,
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

    /* =====================================================
       NINE WICKET CALLBACK
    ===================================================== */

    if (nineWicketCallback) {
      const nineWicketUsername = cleanedMemberAccount;

      /* ---------------------------------------------------
         VALIDATE NINE WICKET USERNAME
      --------------------------------------------------- */

      if (!/^[a-z]{6}$/.test(nineWicketUsername)) {
        return res.status(200).json({
          success: false,

          balance: 0,

          message: "INVALID_NINE_WICKET_USERNAME",

          data: {
            member_account: rawMemberAccount,

            nineWicketUsername,

            usernameLength: nineWicketUsername.length,
          },
        });
      }

      /* ---------------------------------------------------
         FIND USER
      --------------------------------------------------- */

      const player = await User.findOne({
        nineWicketUsername,

        role: "user",

        isActive: true,
      });

      if (!player) {
        return res.status(200).json({
          success: false,

          balance: 0,

          message: "USER_NOT_FOUND",

          data: {
            member_account: rawMemberAccount,

            nineWicketUsername,
          },
        });
      }

      /* ---------------------------------------------------
         NINE WICKET DATA
      --------------------------------------------------- */

      const matchStake = Math.max(
        0,
        money(nine_wicket?.matchStake ?? nine_wicket?.matchAmount ?? 0),
      );

      const profitLoss = money(nine_wicket?.profitLoss || 0);

      const nineWicketBetId = clean(nine_wicket?.betId);

      const nineWicketBetStatus = clean(nine_wicket?.betStatus);

      const eventTypeName = clean(nine_wicket?.eventTypeName);

      const eventName = clean(nine_wicket?.eventName);

      const marketName = clean(nine_wicket?.marketName);

      const competitionName = clean(nine_wicket?.competitionName);

      /* ---------------------------------------------------
         MAIN BALANCE UNCHANGED
      --------------------------------------------------- */

      const currentBalance = money(player.balance || 0);

      const finalBalance = currentBalance;

      const netAmount = money(winAmount - betAmount);

      let resultType = "push";

      if (netAmount > 0) {
        resultType = "win";
      }

      if (netAmount < 0) {
        resultType = "loss";
      }

      /* ---------------------------------------------------
         EXPOSURE UPDATE
      --------------------------------------------------- */

      const {
        wallet,
        previousRoundMatchStake,
        exposureAction,
        exposureChange,
        exposureAfter,
      } = await updateNineWicketExposure({
        player,

        nineWicketUsername,

        gameRound,

        betAmount,

        winAmount,

        matchStake,
      });

      /* ---------------------------------------------------
         AFFILIATE COMMISSION
      --------------------------------------------------- */

      let affiliateInfo = null;

      try {
        affiliateInfo = await applyAffiliateCommission({
          player,

          betAmount,

          winAmount,
        });
      } catch (affiliateError) {
        console.error(
          "Nine Wicket affiliate commission error:",
          affiliateError.message,
        );
      }

      /* ---------------------------------------------------
         CREATE HISTORY
      --------------------------------------------------- */

      const history = await GameHistory.create({
        user: player._id,

        userId: player.userId || String(player._id),

        userGamePlayName: player.userGamePlayName || "",

        nineWicketUsername,

        provider: "ninewicket",

        member_account: rawMemberAccount,

        phone: player.phone || "",

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

        nineWicketBetId,

        nineWicketBetStatus,

        matchStake,

        profitLoss,

        eventTypeName,

        eventName,

        marketName,

        competitionName,

        exposureChange,

        exposureAfter,

        affiliateInfo,

        oracleTimestamp: clean(timestamp),

        rawPayload: req.body || {},
      });

      /* ---------------------------------------------------
         TURNOVER
      --------------------------------------------------- */

      if (betAmount > 0) {
        try {
          await applyTurnoverProgress({
            userId: player._id,

            wagerAmount: betAmount,
          });
        } catch (turnoverError) {
          console.error("Nine Wicket turnover error:", turnoverError.message);
        }
      }

      /* ---------------------------------------------------
         LOG
      --------------------------------------------------- */

      console.log("========== NINE WICKET CALLBACK SUCCESS ==========");

      console.log("User:", nineWicketUsername);

      console.log("Game Round:", gameRound);

      console.log("Serial Number:", serialNumber);

      console.log("Bet Amount:", betAmount);

      console.log("Win Amount:", winAmount);

      console.log("Match Stake:", matchStake);

      console.log("Bet Status:", nineWicketBetStatus);

      console.log("Event Type:", eventTypeName);

      console.log("Event:", eventName);

      console.log("Market:", marketName);

      console.log("Competition:", competitionName);

      console.log("Previous Round Stake:", previousRoundMatchStake);

      console.log("Exposure Action:", exposureAction);

      console.log("Exposure Change:", exposureChange);

      console.log("Exposure After:", exposureAfter);

      console.log("Wallet Status:", wallet.status);

      console.log("==================================================");

      return res.status(200).json({
        success: true,

        balance: finalBalance,

        message: "SUCCESS",

        data: {
          status: "SUCCESS",

          provider: "ninewicket",

          resultType,

          betAmount,

          winAmount,

          netAmount,

          matchStake,

          previousRoundMatchStake,

          profitLoss,

          nineWicketBetId,

          nineWicketBetStatus,

          eventTypeName,

          eventName,

          marketName,

          competitionName,

          exposureAction,

          exposureChange,

          exposureBalance: exposureAfter,

          walletStatus: wallet.status,

          balanceBefore: currentBalance,

          newBalance: finalBalance,

          game_round: gameRound,

          serial_number: serialNumber,

          historyId: history._id,

          affiliateInfo,
        },
      });
    }

    /* =====================================================
       NORMAL ORACLE CALLBACK
    ===================================================== */

    const userGamePlayName = cleanedMemberAccount;

    const player = await User.findOne({
      userGamePlayName,

      role: "user",

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

    /* -----------------------------------------------------
       BALANCE CHECK
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       RESULT
    ----------------------------------------------------- */

    const netAmount = money(winAmount - betAmount);

    let resultType = "push";

    if (netAmount > 0) {
      resultType = "win";
    }

    if (netAmount < 0) {
      resultType = "loss";
    }

    const newBalance = money(currentBalance - betAmount + winAmount);

    /* -----------------------------------------------------
       UPDATE USER BALANCE
    ----------------------------------------------------- */

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

    const finalBalance = money(updatedPlayer?.balance || 0);

    /* -----------------------------------------------------
       AFFILIATE COMMISSION
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       CREATE HISTORY
    ----------------------------------------------------- */

    const history = await GameHistory.create({
      user: player._id,

      userId: player.userId || String(player._id),

      userGamePlayName: player.userGamePlayName,

      nineWicketUsername: "",

      provider: "oracle",

      member_account: rawMemberAccount,

      phone: player.phone || "",

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

      nineWicketBetId: "",

      nineWicketBetStatus: "",

      matchStake: 0,

      profitLoss: 0,

      eventTypeName: "",

      eventName: "",

      marketName: "",

      competitionName: "",

      exposureChange: 0,

      exposureAfter: 0,

      affiliateInfo,

      oracleTimestamp: clean(timestamp),

      rawPayload: req.body || {},
    });

    /* -----------------------------------------------------
       TURNOVER
    ----------------------------------------------------- */

    if (betAmount > 0) {
      try {
        await applyTurnoverProgress({
          userId: player._id,

          wagerAmount: betAmount,
        });
      } catch (turnoverError) {
        console.error("Oracle turnover error:", turnoverError.message);
      }
    }

    /* -----------------------------------------------------
       SUCCESS RESPONSE
    ----------------------------------------------------- */

    return res.status(200).json({
      success: true,

      balance: finalBalance,

      message: "SUCCESS",

      data: {
        status: "SUCCESS",

        provider: "oracle",

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

    console.error("Callback Stack:", error.stack);

    /* -----------------------------------------------------
       UNIQUE SERIAL NUMBER ERROR
    ----------------------------------------------------- */

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
