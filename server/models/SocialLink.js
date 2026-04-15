import mongoose from "mongoose";

const socialItemSchema = new mongoose.Schema(
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

const socialLinkSchema = new mongoose.Schema(
  {
    items: [socialItemSchema],
  },
  { timestamps: true }
);

const SocialLink = mongoose.model("SocialLink", socialLinkSchema);

export default SocialLink;