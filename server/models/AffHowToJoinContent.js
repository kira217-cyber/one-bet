import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const stepSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    description: {
      type: textPairSchema,
      default: () => ({}),
    },

    order: {
      type: Number,
      default: 0,
    },

    isHighlighted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const affHowToJoinContentSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    heroText: {
      type: textPairSchema,
      default: () => ({}),
    },

    buttonText: {
      type: textPairSchema,
      default: () => ({}),
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    steps: {
      type: [stepSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AffHowToJoinContent = mongoose.model(
  "AffHowToJoinContent",
  affHowToJoinContentSchema,
);

export default AffHowToJoinContent;