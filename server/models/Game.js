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

    oracleImageType: {
      type: String,
      enum: ["thumbnail", "height", "original"],
      default: "thumbnail",
    },

    // oracle game._id / game_uid
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
GameSchema.index({ categoryId: 1, status: 1 });
GameSchema.index({ providerDbId: 1, status: 1 });

export default mongoose.model("Game", GameSchema);
