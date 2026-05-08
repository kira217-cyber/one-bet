import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const jackpotCardSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    description: {
      type: textPairSchema,
      default: () => ({}),
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const affJackpotContentSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    infoTitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    infoText: {
      type: textPairSchema,
      default: () => ({}),
    },

    benefitsTitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    mainImage: {
      type: String,
      default: "",
      trim: true,
    },

    cards: {
      type: [jackpotCardSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AffJackpotContent = mongoose.model(
  "AffJackpotContent",
  affJackpotContentSchema,
);

export default AffJackpotContent;