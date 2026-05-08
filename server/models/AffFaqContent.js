import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const faqItemSchema = new mongoose.Schema(
  {
    question: {
      type: textPairSchema,
      default: () => ({}),
    },

    answer: {
      type: textPairSchema,
      default: () => ({}),
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

const faqTabSchema = new mongoose.Schema(
  {
    tabKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    label: {
      type: textPairSchema,
      default: () => ({}),
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    items: {
      type: [faqItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const affFaqContentSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },

    tabs: {
      type: [faqTabSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const AffFaqContent = mongoose.model("AffFaqContent", affFaqContentSchema);

export default AffFaqContent;