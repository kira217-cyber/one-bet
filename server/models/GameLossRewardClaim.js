import mongoose from "mongoose";

const { Schema } = mongoose;

const gameLossRewardClaimSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    setting: {
      type: Schema.Types.ObjectId,
      ref: "GameLossRewardSetting",
      required: true,
      index: true,
    },

    settingTitle: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    periodDays: {
      type: Number,
      required: true,
    },

    periodStart: {
      type: Date,
      required: true,
      index: true,
    },

    periodEnd: {
      type: Date,
      required: true,
      index: true,
    },

    totalBet: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalWin: {
      type: Number,
      default: 0,
      min: 0,
    },

    netLoss: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumLoss: {
      type: Number,
      default: 0,
      min: 0,
    },

    bonusPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    claimAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["claimed", "cancelled"],
      default: "claimed",
      index: true,
    },

    claimedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

gameLossRewardClaimSchema.index(
  { user: 1, setting: 1, periodStart: 1, periodEnd: 1 },
  { unique: true }
);

gameLossRewardClaimSchema.index({ user: 1, claimedAt: -1 });
gameLossRewardClaimSchema.index({ setting: 1, claimedAt: -1 });

const GameLossRewardClaim = mongoose.model(
  "GameLossRewardClaim",
  gameLossRewardClaimSchema
);

export default GameLossRewardClaim;