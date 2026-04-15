import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "Favorites",
        "Casino",
        "Slots",
        "Sports",
        "Live",
        "Table",
        "Fishing",
        "Lottery",
      ],
      required: true,
      trim: true,
    },
    title: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },
    description: {
      bn: {
        type: String,
        default: "",
      },
      en: {
        type: String,
        default: "",
      },
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;