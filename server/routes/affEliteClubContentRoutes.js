import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffEliteClubContent from "../models/AffEliteClubContent.js";

const router = express.Router();

const safeDeleteFile = (filePath = "") => {
  try {
    if (!filePath) return;
    if (/^https?:\/\//i.test(filePath)) return;

    const normalizedPath = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;

    const fullPath = path.join(process.cwd(), normalizedPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Elite Club file delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffEliteClubContent.findOne();

  if (!doc) {
    doc = await AffEliteClubContent.create({
      title: {
        bn: "ELITE CLUB",
        en: "ELITE CLUB",
      },

      subtitle: {
        bn: "আমাদের এলিটদের জন্য বিশেষ প্রিমিয়াম সুবিধা।",
        en: "Premium privileges specially for our elites.",
      },

      backgroundImage:
        "https://beit365.bet/assets/affiliate/assets/bdt/EliteBG.webp",

      crestImage:
        "https://beit365.bet/assets/affiliate/assets/bdt/Rectangle.png",

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
    console.error("Get Elite Club Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch elite club content",
    });
  }
});

/* ============================= ADMIN GET ============================= */

router.get("/admin", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error("Admin Get Elite Club Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch elite club content",
    });
  }
});

/* ============================= ADMIN UPDATE ============================= */

router.put(
  "/admin",
  upload.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "crestImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const doc = await createDefaultDoc();

      const {
        titleBn,
        titleEn,
        subtitleBn,
        subtitleEn,
        backgroundImageUrl,
        crestImageUrl,
        removeBackgroundImage,
        removeCrestImage,
        isActive,
      } = req.body;

      doc.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      doc.subtitle = {
        bn: subtitleBn || "",
        en: subtitleEn || "",
      };

      if (typeof isActive !== "undefined") {
        doc.isActive = isActive === "true" || isActive === true;
      }

      if (removeBackgroundImage === "true" && doc.backgroundImage) {
        safeDeleteFile(doc.backgroundImage);
        doc.backgroundImage = "";
      }

      if (removeCrestImage === "true" && doc.crestImage) {
        safeDeleteFile(doc.crestImage);
        doc.crestImage = "";
      }

      if (req.files?.backgroundImage?.[0]) {
        if (doc.backgroundImage) {
          safeDeleteFile(doc.backgroundImage);
        }

        doc.backgroundImage = `/uploads/${req.files.backgroundImage[0].filename}`;
      } else if (backgroundImageUrl) {
        if (doc.backgroundImage !== backgroundImageUrl) {
          safeDeleteFile(doc.backgroundImage);
        }

        doc.backgroundImage = backgroundImageUrl;
      }

      if (req.files?.crestImage?.[0]) {
        if (doc.crestImage) {
          safeDeleteFile(doc.crestImage);
        }

        doc.crestImage = `/uploads/${req.files.crestImage[0].filename}`;
      } else if (crestImageUrl) {
        if (doc.crestImage !== crestImageUrl) {
          safeDeleteFile(doc.crestImage);
        }

        doc.crestImage = crestImageUrl;
      }

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Elite Club content updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Elite Club Content Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update elite club content",
      });
    }
  },
);

/* ============================= ADMIN DELETE ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffEliteClubContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Elite Club content not found",
      });
    }

    safeDeleteFile(doc.backgroundImage);
    safeDeleteFile(doc.crestImage);

    await AffEliteClubContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Elite Club content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Elite Club Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete elite club content",
    });
  }
});

export default router;