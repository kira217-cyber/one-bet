import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
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
  { _id: false },
);

const footerContentSchema = new mongoose.Schema(
  {
    paymentTitle: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    responsibleTitle: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    communityTitle: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    licenseTitle: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    appDownloadTitle: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    descriptionHeading: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    descriptionText1: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    descriptionText2: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    descriptionText3: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    bottomHeading: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },
    bottomCopyright: {
      type: textPairSchema,
      default: () => ({ bn: "", en: "" }),
    },

    appDownloadLink: {
      type: String,
      default: "",
      trim: true,
    },

    paymentImages: {
      type: [String],
      default: [],
    },
    responsibleImages: {
      type: [String],
      default: [],
    },
    communityImages: {
      type: [String],
      default: [],
    },

    licenseImage: {
      type: String,
      default: "",
      trim: true,
    },
    appDownloadImage: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

const FooterContent =
  mongoose.models.FooterContent ||
  mongoose.model("FooterContent", footerContentSchema);

export default FooterContent;
