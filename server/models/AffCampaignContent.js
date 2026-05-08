import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const campaignItemSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    date: {
      type: textPairSchema,
      default: () => ({}),
    },

    image: {
      type: String,
      default: "",
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

const affCampaignContentSchema = new mongoose.Schema(
  {
    heading: {
      type: textPairSchema,
      default: () => ({}),
    },

    moreDetailsText: {
      type: textPairSchema,
      default: () => ({}),
    },

    signUpText: {
      type: textPairSchema,
      default: () => ({}),
    },

    campaigns: {
      type: [campaignItemSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AffCampaignContent = mongoose.model(
  "AffCampaignContent",
  affCampaignContentSchema,
);

export default AffCampaignContent;