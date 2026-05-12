import express from "express";
import User from "../models/User.js";
import GameHistory from "../models/gameHistory.js";
import GameLossRewardSetting from "../models/GameLossRewardSetting.js";

const router = express.Router();

router.post("/make-test/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();

    // 2 minutes old setting, so 1 minute period already completed
    const settingCreatedAt = new Date(now.getTime() - 2 * 60 * 1000);

    await GameLossRewardSetting.deleteMany({
      "title.en": "TEST 1 Minute Loss Cashback",
    });

    const setting = await GameLossRewardSetting.create({
      title: {
        en: "TEST 1 Minute Loss Cashback",
        bn: "টেস্ট ১ মিনিট লস ক্যাশব্যাক",
      },
      periodDays: 1,
      minimumLoss: 10,
      bonusPercent: 20,
      isActive: true,
      order: 1,
      createdAt: settingCreatedAt,
      updatedAt: settingCreatedAt,
    });

    await GameHistory.create({
      userId: user.userId,
      provider_code: "TEST",
      game_code: "TEST_GAME",
      bet_type: "BET",
      amount: 100,
      win_amount: 0,
      balance_after: user.balance || 0,
      transaction_id: `TEST_BET_${Date.now()}`,
      round_id: `TEST_ROUND_${Date.now()}`,
      verification_key: `TEST_VERIFY_${Date.now()}`,
      times: "test",
      status: "bet",
      bet_details: {},
      flagged: false,
      createdAt: new Date(settingCreatedAt.getTime() + 30 * 1000),
      updatedAt: new Date(settingCreatedAt.getTime() + 30 * 1000),
    });

    return res.json({
      success: true,
      message: "Test reward data created successfully",
      data: {
        userId: user.userId,
        setting,
        expected: {
          totalBet: 100,
          totalWin: 0,
          netLoss: 100,
          minimumLoss: 10,
          bonusPercent: 20,
          claimAmount: 20,
        },
      },
    });
  } catch (error) {
    console.error("Make reward test data error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create test data",
    });
  }
});

export default router;