import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameCategory",
      required: true,
      index: true,
    },

    providerDbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameProvider",
      required: true,
      index: true,
    },

    // oracle game._id
    gameId: {
      type: String,
      required: true,
      trim: true,
    },

    // admin custom image only
    image: {
      type: String,
      default: "",
    },

    isHot: {
      type: Boolean,
      default: false,
    },

    isFavourite: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

GameSchema.index({ providerDbId: 1, gameId: 1 }, { unique: true });

export default mongoose.model("Game", GameSchema);
