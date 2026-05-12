import mongoose from "mongoose";

const { Schema } = mongoose;

const gameLossRewardSettingSchema = new Schema(
  {
    title: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },

    periodDays: {
      type: Number,
      required: true,
      min: 1,
      default: 7,
    },

    minimumLoss: {
      type: Number,
      required: true,
      min: 0,
      default: 100,
    },

    bonusPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

gameLossRewardSettingSchema.index({ isActive: 1, order: 1 });

const GameLossRewardSetting = mongoose.model(
  "GameLossRewardSetting",
  gameLossRewardSettingSchema
);

export default GameLossRewardSetting;