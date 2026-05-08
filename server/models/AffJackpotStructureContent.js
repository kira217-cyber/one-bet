import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const rowSchema = new mongoose.Schema(
  {
    label: { type: textPairSchema, default: () => ({}) },
    value: { type: String, default: "", trim: true },
    colorType: {
      type: String,
      enum: ["white", "red", "green"],
      default: "white",
    },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const scenarioSchema = new mongoose.Schema(
  {
    scenarioKey: {
      type: String,
      default: "",
      trim: true,
    },

    title: { type: textPairSchema, default: () => ({}) },
    subtitle: { type: textPairSchema, default: () => ({}) },

    smallTitle: { type: textPairSchema, default: () => ({}) },
    smallRows: { type: [rowSchema], default: [] },

    jackpotCostLabel: { type: textPairSchema, default: () => ({}) },
    jackpotCost: { type: String, default: "", trim: true },
    jackpotCostColorType: {
      type: String,
      enum: ["white", "red", "green"],
      default: "red",
    },

    calcTitle: { type: textPairSchema, default: () => ({}) },
    calcRows: { type: [rowSchema], default: [] },

    netProfitLabel: { type: textPairSchema, default: () => ({}) },
    netProfit: { type: String, default: "", trim: true },

    affiliateTitle: { type: textPairSchema, default: () => ({}) },
    affiliateValue: { type: String, default: "", trim: true },

    descriptionTitle: { type: textPairSchema, default: () => ({}) },
    description: { type: textPairSchema, default: () => ({}) },

    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const affJackpotStructureContentSchema = new mongoose.Schema(
  {
    footerTitle: { type: textPairSchema, default: () => ({}) },
    footerText: { type: textPairSchema, default: () => ({}) },
    buttonText: { type: textPairSchema, default: () => ({}) },

    scenarios: {
      type: [scenarioSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AffJackpotStructureContent = mongoose.model(
  "AffJackpotStructureContent",
  affJackpotStructureContentSchema,
);

export default AffJackpotStructureContent;