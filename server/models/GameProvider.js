import mongoose from "mongoose";

const GameProviderSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameCategory",
      required: true,
      index: true,
    },

    providerId: {
      type: String,
      required: true,
      trim: true,
    },

    providerIcon: {
      type: String,
      default: "",
    },

    providerImage: {
      type: String,
      default: "",
    },

    isHome: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

// একই category এর মধ্যে একই providerId duplicate হবে না
GameProviderSchema.index({ categoryId: 1, providerId: 1 }, { unique: true });

export default mongoose.model("GameProvider", GameProviderSchema);
