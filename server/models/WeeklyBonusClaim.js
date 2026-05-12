import mongoose from "mongoose";

const { Schema } = mongoose;

const weeklyBonusClaimSchema = new Schema(
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
      ref: "WeeklyBonusSetting",
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

    claimAmount: {
      type: Number,
      required: true,
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
  { timestamps: true },
);

weeklyBonusClaimSchema.index(
  { user: 1, setting: 1, periodStart: 1, periodEnd: 1 },
  { unique: true },
);

weeklyBonusClaimSchema.index({ user: 1, claimedAt: -1 });
weeklyBonusClaimSchema.index({ userId: 1, claimedAt: -1 });
weeklyBonusClaimSchema.index({ setting: 1, claimedAt: -1 });

const WeeklyBonusClaim = mongoose.model(
  "WeeklyBonusClaim",
  weeklyBonusClaimSchema,
);

export default WeeklyBonusClaim;