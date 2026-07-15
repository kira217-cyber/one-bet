import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 4,
      maxlength: 15,
      index: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    /**
     * ==========================================
     * NORMAL ORACLE GAME USERNAME
     * ==========================================
     * Normal Oracle games-এর জন্য ব্যবহার হবে।
     * অবশ্যই exactly 10 lowercase English letters।
     */

    userGamePlayName: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      minlength: 10,
      maxlength: 10,
    },

    /**
     * ==========================================
     * NINE WICKET USERNAME
     * ==========================================
     * Nine Wicket-এর জন্য আলাদা username।
     * অবশ্যই exactly 6 lowercase English letters।
     */

    nineWicketUsername: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      minlength: 6,
      maxlength: 6,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "aff-user"],
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    currency: {
      type: String,
      default: "BDT",
      trim: true,
      uppercase: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    createdUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * ==========================================
     * OWN GAMEPLAY USER FOR AFFILIATE
     * ==========================================
     * aff-user নিজের gameplay user create করবে।
     * Affiliate balance transfer এই user-এ যাবে।
     */

    ownUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    ownUserCreatedAt: {
      type: Date,
      default: null,
    },

    /**
     * ==========================================
     * COMMISSION SETTINGS
     * ==========================================
     */

    commissionBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    gameLossCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    depositCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    referCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    gameWinCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    gameLossCommissionBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    depositCommissionBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    referCommissionBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    gameWinCommissionBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * ==========================================
     * PROFILE
     * ==========================================
     */

    firstName: {
      type: String,
      default: "",
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
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

userSchema.index(
  {
    referralCode: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.index(
  {
    userGamePlayName: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      userGamePlayName: {
        $type: "string",
      },
    },
  },
);

userSchema.index(
  {
    nineWicketUsername: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      nineWicketUsername: {
        $type: "string",
      },
    },
  },
);

userSchema.index({
  role: 1,
  isActive: 1,
});

userSchema.index({
  userId: 1,
  phone: 1,
});

userSchema.index({
  referredBy: 1,
});

userSchema.index({
  ownUser: 1,
});

/**
 * ==========================================
 * MODEL
 * ==========================================
 */

const User = mongoose.model("User", userSchema);

export default User;
