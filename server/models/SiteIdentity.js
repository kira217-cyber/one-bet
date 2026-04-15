import mongoose from "mongoose";

const siteIdentitySchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: "",
      trim: true,
    },
    favicon: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
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
  },
  {
    timestamps: true,
  }
);

const SiteIdentity = mongoose.model("SiteIdentity", siteIdentitySchema);

export default SiteIdentity;