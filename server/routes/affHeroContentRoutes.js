import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffHeroContent from "../models/AffHeroContent.js";

const router = express.Router();

const safeDeleteFile = (filePath = "") => {
  try {
    if (!filePath) return;

    const normalizedPath = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;

    const fullPath = path.join(process.cwd(), normalizedPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("File delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffHeroContent.findOne();

  if (!doc) {
    doc = await AffHeroContent.create({
      unlockText: {
        bn: "সাফল্য আনলক করুন",
        en: "UNLOCK SUCCESS",
      },
      title: {
        bn: "৭০% পর্যন্ত বড় কমিশন আয় করুন",
        en: "EARN BIG UP TO 70% COMMISSION",
      },
      subtitle: {
        bn: "এবং পরিশ্রমের সাথে চমককে গ্রহণ করুন!",
        en: "AND EMBRACE SURPRISES WITH EFFORT!",
      },
      termsText: {
        bn: "*শর্তাবলী প্রযোজ্য",
        en: "*TERMS AND CONDITION APPLY",
      },
      buttonText: {
        bn: "শুরু করুন",
        en: "GET STARTED",
      },
      backgroundImage: "",
      isActive: true,
    });
  }

  return doc;
};

/* ============================= PUBLIC GET ============================= */

router.get("/", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error("Get Hero Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero content",
    });
  }
});

/* ============================= ADMIN UPDATE ============================= */

router.put("/admin", upload.single("backgroundImage"), async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      unlockTextBn,
      unlockTextEn,
      titleBn,
      titleEn,
      subtitleBn,
      subtitleEn,
      termsTextBn,
      termsTextEn,
      buttonTextBn,
      buttonTextEn,
      removeBackgroundImage,
      isActive,
    } = req.body;

    if (removeBackgroundImage === "true" && doc.backgroundImage) {
      safeDeleteFile(doc.backgroundImage);
      doc.backgroundImage = "";
    }

    if (req.file) {
      if (doc.backgroundImage) {
        safeDeleteFile(doc.backgroundImage);
      }

      doc.backgroundImage = `/uploads/${req.file.filename}`;
    }

    doc.unlockText = {
      bn: unlockTextBn || "",
      en: unlockTextEn || "",
    };

    doc.title = {
      bn: titleBn || "",
      en: titleEn || "",
    };

    doc.subtitle = {
      bn: subtitleBn || "",
      en: subtitleEn || "",
    };

    doc.termsText = {
      bn: termsTextBn || "",
      en: termsTextEn || "",
    };

    doc.buttonText = {
      bn: buttonTextBn || "",
      en: buttonTextEn || "",
    };

    if (typeof isActive !== "undefined") {
      doc.isActive = isActive === "true";
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Hero content updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update Hero Content Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update hero content",
    });
  }
});

/* ============================= ADMIN DELETE / RESET ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffHeroContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Hero content not found",
      });
    }

    if (doc.backgroundImage) {
      safeDeleteFile(doc.backgroundImage);
    }

    await AffHeroContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Hero content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Hero Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete hero content",
    });
  }
});

export default router;
