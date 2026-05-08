import mongoose from "mongoose";

const { Schema } = mongoose;

const AffOwnUserTransferSchema = new Schema(
  {
    affUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ownUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
      index: true,
    },

    affBalanceBefore: {
      type: Number,
      required: true,
      default: 0,
    },

    affBalanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },

    ownUserBalanceBefore: {
      type: Number,
      required: true,
      default: 0,
    },

    ownUserBalanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },

    eligibilitySnapshot: {
      required: {
        type: Number,
        default: 5,
      },
      activeReferralCount: {
        type: Number,
        default: 0,
      },
      depositedReferralCount: {
        type: Number,
        default: 0,
      },
      remainingReferralCount: {
        type: Number,
        default: 0,
      },
      message: {
        type: String,
        default: "",
      },
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },

    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

AffOwnUserTransferSchema.index({ affUser: 1, createdAt: -1 });
AffOwnUserTransferSchema.index({ ownUser: 1, createdAt: -1 });
AffOwnUserTransferSchema.index({ status: 1, createdAt: -1 });

const AffOwnUserTransfer = mongoose.model(
  "AffOwnUserTransfer",
  AffOwnUserTransferSchema,
);

export default AffOwnUserTransfer;