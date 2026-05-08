import mongoose from "mongoose";

const textPairSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const tableHeadersSchema = new mongoose.Schema(
  {
    recruit: { type: textPairSchema, default: () => ({}) },
    winLoss: { type: textPairSchema, default: () => ({}) },
    deduction: { type: textPairSchema, default: () => ({}) },
    bonus: { type: textPairSchema, default: () => ({}) },
    paymentFee: { type: textPairSchema, default: () => ({}) },
    commission: { type: textPairSchema, default: () => ({}) },
  },
  { _id: false },
);

const playerRowSchema = new mongoose.Schema(
  {
    name: {
      type: textPairSchema,
      default: () => ({}),
    },

    winLoss: {
      type: String,
      default: "",
      trim: true,
    },

    deduction: {
      type: String,
      default: "",
      trim: true,
    },

    bonus: {
      type: String,
      default: "",
      trim: true,
    },

    paymentFee: {
      type: String,
      default: "",
      trim: true,
    },

    commission: {
      type: String,
      default: "-",
      trim: true,
    },

    negative: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const totalsSchema = new mongoose.Schema(
  {
    label: {
      type: textPairSchema,
      default: () => ({}),
    },

    winLoss: {
      type: String,
      default: "",
      trim: true,
    },

    deduction: {
      type: String,
      default: "",
      trim: true,
    },

    bonus: {
      type: String,
      default: "",
      trim: true,
    },

    paymentFee: {
      type: String,
      default: "",
      trim: true,
    },

    commission: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const affCommissionStructureContentSchema = new mongoose.Schema(
  {
    title: {
      type: textPairSchema,
      default: () => ({}),
    },

    headers: {
      type: tableHeadersSchema,
      default: () => ({}),
    },

    players: {
      type: [playerRowSchema],
      default: [],
    },

    totals: {
      type: totalsSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const AffCommissionStructureContent = mongoose.model(
  "AffCommissionStructureContent",
  affCommissionStructureContentSchema,
);

export default AffCommissionStructureContent;