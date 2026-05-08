import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const affEliteClubContentSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    subtitle: {
      type: textPairSchema,
      default: () => ({}),
    },

    backgroundImage: {
      type: String,
      default: "",
      trim: true,
    },

    crestImage: {
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

const AffEliteClubContent = mongoose.model(
  "AffEliteClubContent",
  affEliteClubContentSchema,
);

export default AffEliteClubContent;