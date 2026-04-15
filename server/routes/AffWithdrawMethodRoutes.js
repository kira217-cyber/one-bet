import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import AffWithdrawMethod from "../models/AffWithdrawMethod.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "affiliate-withdraw-methods");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(cb && null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const allowedMime = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

const parseJSON = (v, fallback = {}) => {
  try {
    return typeof v === "string" ? JSON.parse(v) : v || fallback;
  } catch {
    return fallback;
  }
};

const normalizeFields = (fields = []) => {
  return (Array.isArray(fields) ? fields : []).map((f) => ({
    key: String(f?.key || "").trim(),
    label: {
      bn: String(f?.label?.bn || "").trim(),
      en: String(f?.label?.en || "").trim(),
    },
    placeholder: {
      bn: String(f?.placeholder?.bn || "").trim(),
      en: String(f?.placeholder?.en || "").trim(),
    },
    type: ["text", "number", "tel", "email"].includes(f?.type) ? f.type : "text",
    required: f?.required !== false,
  }));
};

const validateMethod = ({ methodId, name, fields, minimumWithdrawAmount, maximumWithdrawAmount }) => {
  const mid = String(methodId || "").trim().toUpperCase();
  if (!mid) return "Method ID is required";

  if (!name?.bn?.trim() || !name?.en?.trim()) {
    return "Both BN and EN name are required";
  }

  const min = Number(minimumWithdrawAmount || 0);
  const max = Number(maximumWithdrawAmount || 0);

  if (!Number.isFinite(min) || min < 0) return "Minimum withdraw amount must be valid";
  if (!Number.isFinite(max) || max < 0) return "Maximum withdraw amount must be valid";
  if (max > 0 && min > max) return "Minimum withdraw amount cannot exceed maximum";

  for (const f of fields) {
    if (!f.key) return "Field key is required";
    if (!f.label?.bn || !f.label?.en) return "Field label BN and EN are required";
  }

  return null;
};

/**
 * PUBLIC: active methods for affiliate site
 * GET /api/aff-withdraw-methods
 */
router.get("/aff-withdraw-methods", async (_req, res) => {
  try {
    const methods = await AffWithdrawMethod.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (err) {
    console.error("aff-withdraw-methods public list error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ADMIN: all methods
 * GET /api/admin/aff-withdraw-methods
 */
router.get("/admin/aff-withdraw-methods", async (_req, res) => {
  try {
    const methods = await AffWithdrawMethod.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json(methods);
  } catch (err) {
    console.error("admin aff-withdraw-methods list error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ADMIN: create
 * POST /api/admin/aff-withdraw-methods
 */
router.post(
  "/admin/aff-withdraw-methods",
  upload.single("logo"),
  async (req, res) => {
    try {
      const methodId = String(req.body?.methodId || "").trim().toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(req.body?.minimumWithdrawAmount || 0);
      const maximumWithdrawAmount = Number(req.body?.maximumWithdrawAmount || 0);
      const isActive = String(req.body?.isActive) !== "false";

      const error = validateMethod({
        methodId,
        name,
        fields,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
      });

      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      const exists = await AffWithdrawMethod.findOne({ methodId });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
        });
      }

      const logoUrl = req.file
        ? `/uploads/affiliate-withdraw-methods/${req.file.filename}`
        : "";

      const doc = await AffWithdrawMethod.create({
        methodId,
        name,
        logoUrl,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
        fields,
        isActive,
      });

      return res.status(201).json({
        success: true,
        message: "Affiliate withdraw method created successfully",
        data: doc,
      });
    } catch (err) {
      console.error("create aff-withdraw-method error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

/**
 * ADMIN: update
 * PUT /api/admin/aff-withdraw-methods/:id
 */
router.put(
  "/admin/aff-withdraw-methods/:id",
  upload.single("logo"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const doc = await AffWithdrawMethod.findById(id);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Withdraw method not found",
        });
      }

      const methodId = String(req.body?.methodId || "").trim().toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(req.body?.minimumWithdrawAmount || 0);
      const maximumWithdrawAmount = Number(req.body?.maximumWithdrawAmount || 0);
      const isActive = String(req.body?.isActive) !== "false";

      const error = validateMethod({
        methodId,
        name,
        fields,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
      });

      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      const exists = await AffWithdrawMethod.findOne({
        methodId,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
        });
      }

      doc.methodId = methodId;
      doc.name = name;
      doc.fields = fields;
      doc.minimumWithdrawAmount = minimumWithdrawAmount;
      doc.maximumWithdrawAmount = maximumWithdrawAmount;
      doc.isActive = isActive;

      if (req.file) {
        doc.logoUrl = `/uploads/affiliate-withdraw-methods/${req.file.filename}`;
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Affiliate withdraw method updated successfully",
        data: doc,
      });
    } catch (err) {
      console.error("update aff-withdraw-method error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

/**
 * ADMIN: delete
 * DELETE /api/admin/aff-withdraw-methods/:id
 */
router.delete("/admin/aff-withdraw-methods/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await AffWithdrawMethod.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found",
      });
    }

    return res.json({
      success: true,
      message: "Affiliate withdraw method deleted successfully",
    });
  } catch (err) {
    console.error("delete aff-withdraw-method error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;