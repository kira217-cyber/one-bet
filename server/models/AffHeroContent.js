import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: {
      type: String,
      default: "",
      trim: true,
    },
    en: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const affHeroContentSchema = new mongoose.Schema(
  {
    unlockText: {
      type: textPairSchema,
      default: () => ({}),
    },

    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    subtitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    termsText: {
      type: textPairSchema,
      default: () => ({}),
    },

    buttonText: {
      type: textPairSchema,
      default: () => ({}),
    },

    backgroundImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const AffHeroContent = mongoose.model(
  "AffHeroContent",
  affHeroContentSchema,
);

export default AffHeroContent;