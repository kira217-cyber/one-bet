import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const whyUsItemSchema = new mongoose.Schema(
  {
    title: { type: textPairSchema, default: () => ({}) },
    description: { type: textPairSchema, default: () => ({}) },

    icon: {
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

const affWhyUsContentSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    cardBackgroundImage: {
      type: String,
      default:
        "https://beit365.bet/assets/affiliate/assets/bdt/icons/bg-icon.png",
      trim: true,
    },

    items: {
      type: [whyUsItemSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AffWhyUsContent = mongoose.model(
  "AffWhyUsContent",
  affWhyUsContentSchema,
);

export default AffWhyUsContent;