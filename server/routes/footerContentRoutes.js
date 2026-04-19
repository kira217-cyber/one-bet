import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import FooterContent from "../models/FooterContent.js";

const router = express.Router();

/* ---------------- upload config ---------------- */
const uploadDir = path.join(process.cwd(), "uploads", "footer");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMime = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

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

const cpUpload = upload.fields([
  { name: "paymentImages", maxCount: 50 },
  { name: "responsibleImages", maxCount: 50 },
  { name: "communityImages", maxCount: 50 },
  { name: "licenseImage", maxCount: 1 },
  { name: "appDownloadImage", maxCount: 1 },
]);

const normalizeText = (v) => String(v || "").trim();

const removeFileIfExists = (relativePath = "") => {
  if (!relativePath) return;
  const cleaned = relativePath.replace(/^\/+/, "");
  const abs = path.join(process.cwd(), cleaned);
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
  }
};

const parseJsonArray = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const textPair = (bn, en) => ({
  bn: normalizeText(bn),
  en: normalizeText(en),
});

/* ---------------- PUBLIC ---------------- */
router.get("/footer-content", async (_req, res) => {
  try {
    let doc = await FooterContent.findOne().lean();

    if (!doc) {
      doc = await FooterContent.create({
        paymentTitle: { bn: "পেমেন্ট পদ্ধতি", en: "Payment Methods" },
        responsibleTitle: { bn: "দায়িত্বশীল গেমিং", en: "Responsible Gaming" },
        communityTitle: { bn: "কমিউনিটি ওয়েবসাইট", en: "Community Websites" },
        licenseTitle: { bn: "গেমিং লাইসেন্স", en: "Gaming License" },
        appDownloadTitle: { bn: "অ্যাপ ডাউনলোড", en: "APP Download" },
        descriptionHeading: {
          bn: "বাংলাদেশ, ভারত ও দক্ষিণ-পূর্ব এশিয়ার সেরা বেটিং এক্সচেঞ্জ সাইট",
          en: "Top Betting Exchange Sites Bangladesh, India & South East Asia",
        },
        descriptionText1: { bn: "", en: "" },
        descriptionText2: { bn: "", en: "" },
        descriptionText3: { bn: "", en: "" },
        bottomHeading: {
          bn: "সেরা মানের প্ল্যাটফর্ম",
          en: "The Best Quality Platform",
        },
        bottomCopyright: {
          bn: "©২০২৫ বেটিং এক্সচেঞ্জ অনলাইন গেমিং সাইট",
          en: "@2025 Betting Exchange online gambling site.",
        },
        appDownloadLink: "",
        paymentImages: [],
        responsibleImages: [],
        communityImages: [],
        licenseImage: "",
        appDownloadImage: "",
      });
      doc = doc.toObject();
    }

    return res.status(200).json({
      success: true,
      message: "Footer content fetched successfully",
      data: doc,
    });
  } catch (error) {
    console.error("GET /footer-content error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch footer content",
      error: error.message,
    });
  }
});

/* ---------------- ADMIN ---------------- */
router.get("/admin/footer-content", async (_req, res) => {
  try {
    let doc = await FooterContent.findOne();
    if (!doc) {
      doc = await FooterContent.create({});
    }

    return res.status(200).json({
      success: true,
      message: "Footer content fetched successfully",
      data: doc,
    });
  } catch (error) {
    console.error("GET /admin/footer-content error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch footer content",
      error: error.message,
    });
  }
});

router.put("/admin/footer-content", cpUpload, async (req, res) => {
  try {
    let doc = await FooterContent.findOne();
    if (!doc) {
      doc = await FooterContent.create({});
    }

    const removePaymentImages = parseJsonArray(req.body?.removePaymentImages);
    const removeResponsibleImages = parseJsonArray(
      req.body?.removeResponsibleImages,
    );
    const removeCommunityImages = parseJsonArray(
      req.body?.removeCommunityImages,
    );
    const removeLicenseImage = String(req.body?.removeLicenseImage) === "true";
    const removeAppDownloadImage =
      String(req.body?.removeAppDownloadImage) === "true";

    doc.paymentTitle = textPair(
      req.body?.paymentTitleBn,
      req.body?.paymentTitleEn,
    );
    doc.responsibleTitle = textPair(
      req.body?.responsibleTitleBn,
      req.body?.responsibleTitleEn,
    );
    doc.communityTitle = textPair(
      req.body?.communityTitleBn,
      req.body?.communityTitleEn,
    );
    doc.licenseTitle = textPair(
      req.body?.licenseTitleBn,
      req.body?.licenseTitleEn,
    );
    doc.appDownloadTitle = textPair(
      req.body?.appDownloadTitleBn,
      req.body?.appDownloadTitleEn,
    );
    doc.descriptionHeading = textPair(
      req.body?.descriptionHeadingBn,
      req.body?.descriptionHeadingEn,
    );
    doc.descriptionText1 = textPair(
      req.body?.descriptionText1Bn,
      req.body?.descriptionText1En,
    );
    doc.descriptionText2 = textPair(
      req.body?.descriptionText2Bn,
      req.body?.descriptionText2En,
    );
    doc.descriptionText3 = textPair(
      req.body?.descriptionText3Bn,
      req.body?.descriptionText3En,
    );
    doc.bottomHeading = textPair(
      req.body?.bottomHeadingBn,
      req.body?.bottomHeadingEn,
    );
    doc.bottomCopyright = textPair(
      req.body?.bottomCopyrightBn,
      req.body?.bottomCopyrightEn,
    );
    doc.appDownloadLink = normalizeText(req.body?.appDownloadLink);

    if (removePaymentImages.length) {
      const kept = [];
      for (const img of doc.paymentImages || []) {
        if (removePaymentImages.includes(img)) {
          removeFileIfExists(img);
        } else {
          kept.push(img);
        }
      }
      doc.paymentImages = kept;
    }

    if (removeResponsibleImages.length) {
      const kept = [];
      for (const img of doc.responsibleImages || []) {
        if (removeResponsibleImages.includes(img)) {
          removeFileIfExists(img);
        } else {
          kept.push(img);
        }
      }
      doc.responsibleImages = kept;
    }

    if (removeCommunityImages.length) {
      const kept = [];
      for (const img of doc.communityImages || []) {
        if (removeCommunityImages.includes(img)) {
          removeFileIfExists(img);
        } else {
          kept.push(img);
        }
      }
      doc.communityImages = kept;
    }

    if (removeLicenseImage && doc.licenseImage) {
      removeFileIfExists(doc.licenseImage);
      doc.licenseImage = "";
    }

    if (removeAppDownloadImage && doc.appDownloadImage) {
      removeFileIfExists(doc.appDownloadImage);
      doc.appDownloadImage = "";
    }

    const paymentFiles = req.files?.paymentImages || [];
    const responsibleFiles = req.files?.responsibleImages || [];
    const communityFiles = req.files?.communityImages || [];
    const licenseFile = req.files?.licenseImage?.[0];
    const appDownloadFile = req.files?.appDownloadImage?.[0];

    if (paymentFiles.length) {
      const newPaths = paymentFiles.map(
        (file) => `/uploads/footer/${file.filename}`,
      );
      doc.paymentImages = [...(doc.paymentImages || []), ...newPaths];
    }

    if (responsibleFiles.length) {
      const newPaths = responsibleFiles.map(
        (file) => `/uploads/footer/${file.filename}`,
      );
      doc.responsibleImages = [...(doc.responsibleImages || []), ...newPaths];
    }

    if (communityFiles.length) {
      const newPaths = communityFiles.map(
        (file) => `/uploads/footer/${file.filename}`,
      );
      doc.communityImages = [...(doc.communityImages || []), ...newPaths];
    }

    if (licenseFile) {
      if (doc.licenseImage) removeFileIfExists(doc.licenseImage);
      doc.licenseImage = `/uploads/footer/${licenseFile.filename}`;
    }

    if (appDownloadFile) {
      if (doc.appDownloadImage) removeFileIfExists(doc.appDownloadImage);
      doc.appDownloadImage = `/uploads/footer/${appDownloadFile.filename}`;
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Footer content updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("PUT /admin/footer-content error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update footer content",
      error: error.message,
    });
  }
});

export default router;
