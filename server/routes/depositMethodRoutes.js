import express from "express";
import DepositMethod from "../models/DepositMethod.js";
import upload from "../config/multer.js";

const router = express.Router();

const safeParseJSON = (value, fallback) => {
  try {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const normalizeTextBi = (value = {}) => ({
  bn: typeof value?.bn === "string" ? value.bn.trim() : "",
  en: typeof value?.en === "string" ? value.en.trim() : "",
});

const buildPayload = (req, oldLogoUrl = "") => {
  const body = req.body || {};

  const methodId = String(body.methodId || "")
    .trim()
    .toLowerCase();

  const methodName = normalizeTextBi(safeParseJSON(body.methodName, {}));
  const instructions = normalizeTextBi(safeParseJSON(body.instructions, {}));

  const contacts = safeParseJSON(body.contacts, []).map((item, index) => ({
    id: String(item?.id || `contact-${Date.now()}-${index}`).trim(),
    label: normalizeTextBi(item?.label || {}),
    number: String(item?.number || "").trim(),
    isActive: item?.isActive !== false,
    sort: Number(item?.sort ?? index),
  }));

  const channels = safeParseJSON(body.channels, []).map((item, index) => ({
    id: String(item?.id || `channel-${Date.now()}-${index}`).trim(),
    name: normalizeTextBi(item?.name || {}),
    tagText: String(item?.tagText || "+0%").trim(),
    bonusTitle: normalizeTextBi(item?.bonusTitle || {}),
    bonusPercent: Number(item?.bonusPercent || 0),
    isActive: item?.isActive !== false,
  }));

  const promotions = safeParseJSON(body.promotions, []).map((item, index) => ({
    id: String(item?.id || `promotion-${Date.now()}-${index}`)
      .trim()
      .toLowerCase(),
    name: normalizeTextBi(item?.name || {}),
    bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
    bonusValue: Number(item?.bonusValue || 0),
    turnoverMultiplier: Number(item?.turnoverMultiplier || 1),
    isActive: item?.isActive !== false,
    sort: Number(item?.sort ?? index),
  }));

  const inputs = safeParseJSON(body.inputs, []).map((item) => ({
    key: String(item?.key || "").trim(),
    label: normalizeTextBi(item?.label || {}),
    placeholder: normalizeTextBi(item?.placeholder || {}),
    type: ["text", "number", "tel"].includes(item?.type) ? item.type : "text",
    required: item?.required !== false,
    minLength: Number(item?.minLength || 0),
    maxLength: Number(item?.maxLength || 0),
  }));

  const logoUrl = req.file
    ? `/${req.file.path.replace(/\\/g, "/")}`
    : oldLogoUrl;

  return {
    methodId,
    methodName,
    logoUrl,
    isActive: body.isActive === "false" ? false : true,

    minDepositAmount: Number(body.minDepositAmount || 0),
    maxDepositAmount: Number(body.maxDepositAmount || 0),
    turnoverMultiplier: Number(body.turnoverMultiplier || 1),

    channels,
    promotions,

    details: {
      contacts,
      agentNumber: String(body.agentNumber || "").trim(),
      personalNumber: String(body.personalNumber || "").trim(),
      instructions,
      inputs,
    },
  };
};

// GET all
router.get("/", async (req, res) => {
  try {
    const methods = await DepositMethod.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Deposit methods fetched successfully",
      data: methods,
    });
  } catch (error) {
    console.error("GET deposit methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit methods",
      error: error.message,
    });
  }
});

// GET single
router.get("/:id", async (req, res) => {
  try {
    const method = await DepositMethod.findById(req.params.id);

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deposit method fetched successfully",
      data: method,
    });
  } catch (error) {
    console.error("GET single deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch deposit method",
      error: error.message,
    });
  }
});

// CREATE
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const payload = buildPayload(req);

    if (!payload.methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!payload.methodName.bn && !payload.methodName.en) {
      return res.status(400).json({
        success: false,
        message: "Method name is required",
      });
    }

    const exists = await DepositMethod.findOne({ methodId: payload.methodId });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This methodId already exists",
      });
    }

    const newMethod = await DepositMethod.create(payload);

    return res.status(201).json({
      success: true,
      message: "Deposit method created successfully",
      data: newMethod,
    });
  } catch (error) {
    console.error("CREATE deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create deposit method",
      error: error.message,
    });
  }
});

// UPDATE
router.put("/:id", upload.single("logo"), async (req, res) => {
  try {
    const existing = await DepositMethod.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    const payload = buildPayload(req, existing.logoUrl);

    if (!payload.methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    const duplicate = await DepositMethod.findOne({
      methodId: payload.methodId,
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Another deposit method already uses this methodId",
      });
    }

    const updated = await DepositMethod.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Deposit method updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update deposit method",
      error: error.message,
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await DepositMethod.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deposit method deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("DELETE deposit method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete deposit method",
      error: error.message,
    });
  }
});

export default router;
