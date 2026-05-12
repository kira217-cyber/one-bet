import mongoose from "mongoose";

const { Schema } = mongoose;

const weeklyBonusSettingSchema = new Schema(
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

    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
  { timestamps: true },
);

weeklyBonusSettingSchema.index({ isActive: 1, order: 1 });

const WeeklyBonusSetting = mongoose.model(
  "WeeklyBonusSetting",
  weeklyBonusSettingSchema,
);

export default WeeklyBonusSetting;