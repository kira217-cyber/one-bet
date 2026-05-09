import mongoose from "mongoose";

const FooterSocialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      default: "",
      trim: true,
    },

    label: {
      type: String,
      default: "",
      trim: true,
    },

    iconType: {
      type: String,
      enum: ["whatsapp", "telegram", "facebook", "youtube", "custom"],
      default: "custom",
    },

    icon: {
      type: String,
      default: "",
    },

    href: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const AffFooterContentSchema = new mongoose.Schema(
  {
    title: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    desc: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    termsText: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    termsLink: {
      type: String,
      default: "",
      trim: true,
    },

    copyright: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    backgroundImage: {
      type: String,
      default: "",
    },

    socialLinks: {
      type: [FooterSocialLinkSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AffFooterContent", AffFooterContentSchema);