import mongoose from "mongoose";

const { Schema } = mongoose;

const gameHistorySchema = new Schema(
  {
    /**
     * ==========================================
     * USER INFORMATION
     * ==========================================
     */

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

    /**
     * Normal Oracle game username।
     * Nine Wicket history-এর ক্ষেত্রে empty string থাকবে।
     */

    userGamePlayName: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },

    /**
     * Nine Wicket-এর 6-letter username।
     * Normal Oracle history-এর ক্ষেত্রে empty string থাকবে।
     */

    nineWicketUsername: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },

    /**
     * Provider callback থেকে পাওয়া original member account।
     */

    member_account: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    currency: {
      type: String,
      default: "BDT",
      trim: true,
      uppercase: true,
    },

    userRole: {
      type: String,
      default: "user",
      index: true,
    },

    /**
     * ==========================================
     * PROVIDER INFORMATION
     * ==========================================
     */

    provider: {
      type: String,
      enum: ["oracle", "ninewicket"],
      default: "oracle",
      required: true,
      index: true,
    },

    game_uid: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /**
     * একই game_round-এর জন্য multiple callback আসতে পারবে।
     * তাই game_round unique নয়।
     */

    game_round: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /**
     * শুধু serial_number unique থাকবে।
     */

    serial_number: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    /**
     * ==========================================
     * BET INFORMATION
     * ==========================================
     */

    bet_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    win_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    net_amount: {
      type: Number,
      required: true,
    },

    resultType: {
      type: String,
      enum: ["win", "loss", "push"],
      required: true,
      index: true,
    },

    balance_before: {
      type: Number,
      required: true,
    },

    balance_after: {
      type: Number,
      required: true,
    },

    /**
     * ==========================================
     * NINE WICKET INFORMATION
     * ==========================================
     */

    nineWicketBetId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    nineWicketBetStatus: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /**
     * Callback-এর matchStake অথবা matchAmount
     * normalize করে এখানে save হবে।
     */

    matchStake: {
      type: Number,
      default: 0,
      min: 0,
    },

    profitLoss: {
      type: Number,
      default: 0,
    },

    /**
     * Nine Wicket event details।
     */

    eventTypeName: {
      type: String,
      default: "",
      trim: true,
    },

    eventName: {
      type: String,
      default: "",
      trim: true,
    },

    marketName: {
      type: String,
      default: "",
      trim: true,
    },

    competitionName: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * এই callback-এর কারণে exposure কত পরিবর্তন হয়েছে।
     *
     * Positive value = exposure add
     * Negative value = exposure remove
     */

    exposureChange: {
      type: Number,
      default: 0,
    },

    /**
     * Callback process হওয়ার পরের total exposure।
     */

    exposureAfter: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    /**
     * ==========================================
     * AFFILIATE INFORMATION
     * ==========================================
     */

    affiliateInfo: {
      type: Schema.Types.Mixed,
      default: null,
    },

    /**
     * ==========================================
     * CALLBACK INFORMATION
     * ==========================================
     */

    oracleTimestamp: {
      type: String,
      default: "",
      trim: true,
    },

    rawPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

/**
 * ==========================================
 * INDEXES
 * ==========================================
 */

gameHistorySchema.index({
  user: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  user: 1,
  game_uid: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  user: 1,
  provider: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  user: 1,
  provider: 1,
  game_round: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  provider: 1,
  game_round: 1,
  bet_amount: 1,
  win_amount: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  resultType: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  userGamePlayName: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  nineWicketUsername: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  nineWicketBetId: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  provider: 1,
  exposureAfter: -1,
  createdAt: -1,
});

/**
 * ==========================================
 * MODEL
 * ==========================================
 */

export default mongoose.model("GameHistory", gameHistorySchema);
