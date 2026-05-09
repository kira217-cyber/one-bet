import mongoose from "mongoose";

const SupportChannelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    label: {
      bn: {
        type: String,
        default: "",
      },

      en: {
        type: String,
        default: "",
      },
    },

    icon: {
      type: String,
      default: "",
    },

    link: {
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

const AffSupportContentSchema = new mongoose.Schema(
  {
    title: {
      bn: {
        type: String,
        default: "",
      },

      en: {
        type: String,
        default: "",
      },
    },

    subtitle: {
      bn: {
        type: String,
        default: "",
      },

      en: {
        type: String,
        default: "",
      },
    },

    openText: {
      bn: {
        type: String,
        default: "",
      },

      en: {
        type: String,
        default: "",
      },
    },

    liveChatText: {
      bn: {
        type: String,
        default: "",
      },

      en: {
        type: String,
        default: "",
      },
    },

    noteText: {
      bn: {
        type: String,
        default: "",
      },

      en: {
        type: String,
        default: "",
      },
    },

    messageButtonText: {
      bn: {
        type: String,
        default: "",
      },

      en: {
        type: String,
        default: "",
      },
    },

    backgroundImage: {
      type: String,
      default: "",
    },

    channels: {
      type: [SupportChannelSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "AffSupportContent",
  AffSupportContentSchema,
);