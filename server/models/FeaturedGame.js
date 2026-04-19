import mongoose from "mongoose";

const FeaturedGameSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },

    gameId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  { timestamps: true },
);

const FeaturedGame =
  mongoose.models.FeaturedGame ||
  mongoose.model("FeaturedGame", FeaturedGameSchema);

export default FeaturedGame;