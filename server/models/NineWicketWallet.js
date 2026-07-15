import mongoose from "mongoose";

const { Schema } = mongoose;

const nineWicketWalletSchema = new Schema(
  {
    /**
     * ==========================================
     * USER REFERENCE
     * ==========================================
     * প্রত্যেক user-এর জন্য একটি NineWicket wallet থাকবে।
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    /**
     * User model-এর 6-letter NineWicket username।
     */

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    /**
     * ==========================================
     * TRANSFER INFORMATION
     * ==========================================
     */

    totalTransferred: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalReturned: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * ==========================================
     * EXPOSURE
     * ==========================================
     * Callback route থেকে update হবে।
     */

    exposureBalance: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    /**
     * ==========================================
     * LAST TRANSFER
     * ==========================================
     */

    lastTransferAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastTransferAt: {
      type: Date,
      default: null,
    },

    /**
     * ==========================================
     * LAST RETURN
     * ==========================================
     */

    lastReturnedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastReturnedAt: {
      type: Date,
      default: null,
    },

    /**
     * NineWicket API-এর সঙ্গে সর্বশেষ sync time।
     */

    lastSyncAt: {
      type: Date,
      default: null,
    },

    /**
     * ==========================================
     * WALLET STATUS
     * ==========================================
     *
     * idle     = এখনো transfer হয়নি
     * playing  = balance NineWicket-এ transfer হয়েছে
     * exposure = active exposure রয়েছে
     * settled  = খেলা settle হয়েছে
     */

    status: {
      type: String,
      enum: ["idle", "playing", "exposure", "settled"],
      default: "idle",
      index: true,
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

nineWicketWalletSchema.index({
  username: 1,
});

nineWicketWalletSchema.index({
  status: 1,
  exposureBalance: -1,
});

nineWicketWalletSchema.index({
  user: 1,
  updatedAt: -1,
});

const NineWicketWallet = mongoose.model(
  "NineWicketWallet",
  nineWicketWalletSchema,
);

export default NineWicketWallet;
