import mongoose from "mongoose";

const { Schema } = mongoose;

const nineWicketWalletSchema = new Schema(
  {
    /**
     * প্রত্যেক user-এর জন্য একটি wallet থাকবে।
     *
     * unique: true থেকেই index তৈরি হবে।
     * তাই আলাদা index: true দেওয়া হয়নি।
     */

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /**
     * User model-এর six-letter Nine Wicket username।
     */

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    /**
     * Nine Wicket-এ মোট কত balance transfer হয়েছে।
     */

    totalTransferred: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Nine Wicket থেকে মোট কত balance ফেরত এসেছে।
     */

    totalReturned: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Callback route থেকে current exposure update হবে।
     */

    exposureBalance: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    /**
     * সর্বশেষ transfer amount।
     */

    lastTransferAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * সর্বশেষ returned amount।
     */

    lastReturnedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * সর্বশেষ transfer-এর সময়।
     */

    lastTransferAt: {
      type: Date,
      default: null,
    },

    /**
     * সর্বশেষ balance return-এর সময়।
     */

    lastReturnedAt: {
      type: Date,
      default: null,
    },

    /**
     * Nine Wicket API-এর সঙ্গে সর্বশেষ sync।
     */

    lastSyncAt: {
      type: Date,
      default: null,
    },

    /**
     * idle:
     * এখনো transfer হয়নি।
     *
     * playing:
     * balance transfer হয়েছে।
     *
     * exposure:
     * active exposure রয়েছে।
     *
     * settled:
     * exposure শেষ হয়েছে।
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

/**
 * username field-এর মধ্যে index: true আছে।
 * তাই নিচে আলাদা username index দেওয়া হয়নি।
 */

nineWicketWalletSchema.index({
  status: 1,
  exposureBalance: -1,
});

nineWicketWalletSchema.index({
  user: 1,
  updatedAt: -1,
});

/**
 * ==========================================
 * MODEL
 * ==========================================
 */

const NineWicketWallet = mongoose.model(
  "NineWicketWallet",
  nineWicketWalletSchema,
);

export default NineWicketWallet;
