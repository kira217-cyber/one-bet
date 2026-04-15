import mongoose from "mongoose";

const affSocialItemSchema = new mongoose.Schema(
  {
    iconUrl: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const affSocialLinkSchema = new mongoose.Schema(
  {
    items: [affSocialItemSchema],
  },
  { timestamps: true }
);

const AffSocialLink = mongoose.model("AffSocialLink", affSocialLinkSchema);

export default AffSocialLink;