import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    provider_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    game_code: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    bet_type: {
      type: String,
      enum: ["BET", "SETTLE", "CANCEL", "REFUND", "BONUS", "PROMO"],
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    win_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance_after: {
      type: Number,
      default: 0,
    },

    transaction_id: {
      type: String,
      trim: true,
      default: null,
      index: true, // ✅ searchable, but NOT unique
    },

    round_id: {
      type: String,
      trim: true,
      default: null,
      sparse: true,
    },

    verification_key: {
      type: String,
      trim: true,
      default: null,
      unique: true, // ✅ always unique
      sparse: true,
      index: true,
    },

    times: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "bet",
        "settled",
        "won",
        "lost",
        "push",
        "cancelled",
        "refunded",
        "error",
        "void",
      ],
      default: "pending",
      index: true,
    },

    bet_details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

gameHistorySchema.index({ userId: 1, createdAt: -1 });
gameHistorySchema.index({ provider_code: 1, game_code: 1 });
gameHistorySchema.index({ status: 1, createdAt: -1 });

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;