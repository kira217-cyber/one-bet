import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const affCommissionContentSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    subtitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    structureTitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    winLossText: {
      type: textPairSchema,
      default: () => ({}),
    },

    bonusText: {
      type: textPairSchema,
      default: () => ({}),
    },

    deductionText: {
      type: textPairSchema,
      default: () => ({}),
    },

    paymentFeeText: {
      type: textPairSchema,
      default: () => ({}),
    },

    registerButtonText: {
      type: textPairSchema,
      default: () => ({}),
    },

    watchButtonText: {
      type: textPairSchema,
      default: () => ({}),
    },

    countryTitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    countryDescription: {
      type: textPairSchema,
      default: () => ({}),
    },

    paymentTitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    paymentDescription: {
      type: textPairSchema,
      default: () => ({}),
    },

    bonusTitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    bonusDescription: {
      type: textPairSchema,
      default: () => ({}),
    },

    netProfitTitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    netProfitDescription: {
      type: textPairSchema,
      default: () => ({}),
    },

    ratingText: {
      type: String,
      default: "(396)",
      trim: true,
    },

    leftBackgroundImage: {
      type: String,
      default: "",
    },

    growthImage: {
      type: String,
      default: "",
    },

    countryFlagImage: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AffCommissionContent = mongoose.model(
  "AffCommissionContent",
  affCommissionContentSchema,
);

export default AffCommissionContent;