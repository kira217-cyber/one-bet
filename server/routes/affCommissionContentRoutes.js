import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffCommissionContent from "../models/AffCommissionContent.js";

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
    console.error("Commission file delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffCommissionContent.findOne();

  if (!doc) {
    doc = await AffCommissionContent.create({
      title: {
        bn: "৪০% নির্দিষ্ট কমিশন",
        en: "40% FIXED COMMISSION",
      },

      subtitle: {
        bn: "আমরা অ্যাফিলিয়েটদের প্রতি সপ্তাহে ৪০% নির্দিষ্ট কমিশন রেট দিচ্ছি।",
        en: "We are giving 40% fixed commission rate to affiliates every week.",
      },

      structureTitle: {
        bn: "কমিশন স্ট্রাকচার",
        en: "COMMISSION STRUCTURE",
      },

      winLossText: {
        bn: "জয়/ক্ষতি",
        en: "Win/Loss",
      },

      bonusText: {
        bn: "বোনাস",
        en: "Bonus",
      },

      deductionText: {
        bn: "কর্তন",
        en: "Deduction",
      },

      paymentFeeText: {
        bn: "পেমেন্ট ফি",
        en: "Payment Fee",
      },

      registerButtonText: {
        bn: "এখনই রেজিস্টার",
        en: "REGISTER NOW",
      },

      watchButtonText: {
        bn: "ভিডিও দেখুন",
        en: "WATCH VIDEO",
      },

      countryTitle: {
        bn: "বাংলাদেশ",
        en: "BANGLADESH",
      },

      countryDescription: {
        bn: "আমাদের অ্যাফিলিয়েটরা চলমান ক্যাম্পেইন থেকে আরও অতিরিক্ত কমিশন উপার্জন করতে পারবে।",
        en: "Our affiliates will be able to earn another extra commission from our running campaigns.",
      },

      paymentTitle: {
        bn: "পেমেন্ট ফি:",
        en: "PAYMENT FEE:",
      },

      paymentDescription: {
        bn: "(ডিপোজিট এমাউন্ট × ৪.০%) + (উইথড্রয়াল এমাউন্ট × ২.০%)",
        en: "(DEPOSIT AMOUNT X 4.0%) + (WITHDRAWAL AMOUNT X 2.0%)",
      },

      bonusTitle: {
        bn: "বোনাস:",
        en: "BONUS:",
      },

      bonusDescription: {
        bn: "প্রোমোশন বোনাস + ভিআইপি ক্যাশ বোনাস",
        en: "PROMOTION BONUS + VIP CASH BONUS",
      },

      netProfitTitle: {
        bn: "নেট প্রফিট:",
        en: "NET PROFIT:",
      },

      netProfitDescription: {
        bn: "(প্লেয়ার জয়/ক্ষতি - জ্যাকপট কস্ট) - ১৮% কর্তন - বোনাস - পেমেন্ট ফি",
        en: "(PLAYER WIN/LOSS - JACKPOT COST) - 18% DEDUCTION - BONUS - PAYMENT FEE",
      },

      ratingText: "(396)",

      leftBackgroundImage:
        "https://beit365.bet/assets/affiliate/assets/hero-banner/bdt-hero.webp",

      growthImage:
        "https://beit365.bet/assets/affiliate/assets/images/growth2e0f.png",

      countryFlagImage:
        "https://beit365.bet/assets/affiliate/assets/img/flag/bn.jpg",

      videoUrl: "",

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
    console.error("Get Commission Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commission content",
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
    console.error("Admin Get Commission Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commission content",
    });
  }
});

/* ============================= ADMIN UPDATE ============================= */

router.put(
  "/admin",
  upload.fields([
    { name: "leftBackgroundImage", maxCount: 1 },
    { name: "growthImage", maxCount: 1 },
    { name: "countryFlagImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const doc = await createDefaultDoc();

      const {
        titleBn,
        titleEn,

        subtitleBn,
        subtitleEn,

        structureTitleBn,
        structureTitleEn,

        winLossTextBn,
        winLossTextEn,

        bonusTextBn,
        bonusTextEn,

        deductionTextBn,
        deductionTextEn,

        paymentFeeTextBn,
        paymentFeeTextEn,

        registerButtonTextBn,
        registerButtonTextEn,

        watchButtonTextBn,
        watchButtonTextEn,

        countryTitleBn,
        countryTitleEn,

        countryDescriptionBn,
        countryDescriptionEn,

        paymentTitleBn,
        paymentTitleEn,

        paymentDescriptionBn,
        paymentDescriptionEn,

        bonusTitleBn,
        bonusTitleEn,

        bonusDescriptionBn,
        bonusDescriptionEn,

        netProfitTitleBn,
        netProfitTitleEn,

        netProfitDescriptionBn,
        netProfitDescriptionEn,

        ratingText,
        videoUrl,
        isActive,

        leftBackgroundImageUrl,
        growthImageUrl,
        countryFlagImageUrl,

        removeLeftBackgroundImage,
        removeGrowthImage,
        removeCountryFlagImage,
      } = req.body;

      doc.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      doc.subtitle = {
        bn: subtitleBn || "",
        en: subtitleEn || "",
      };

      doc.structureTitle = {
        bn: structureTitleBn || "",
        en: structureTitleEn || "",
      };

      doc.winLossText = {
        bn: winLossTextBn || "",
        en: winLossTextEn || "",
      };

      doc.bonusText = {
        bn: bonusTextBn || "",
        en: bonusTextEn || "",
      };

      doc.deductionText = {
        bn: deductionTextBn || "",
        en: deductionTextEn || "",
      };

      doc.paymentFeeText = {
        bn: paymentFeeTextBn || "",
        en: paymentFeeTextEn || "",
      };

      doc.registerButtonText = {
        bn: registerButtonTextBn || "",
        en: registerButtonTextEn || "",
      };

      doc.watchButtonText = {
        bn: watchButtonTextBn || "",
        en: watchButtonTextEn || "",
      };

      doc.countryTitle = {
        bn: countryTitleBn || "",
        en: countryTitleEn || "",
      };

      doc.countryDescription = {
        bn: countryDescriptionBn || "",
        en: countryDescriptionEn || "",
      };

      doc.paymentTitle = {
        bn: paymentTitleBn || "",
        en: paymentTitleEn || "",
      };

      doc.paymentDescription = {
        bn: paymentDescriptionBn || "",
        en: paymentDescriptionEn || "",
      };

      doc.bonusTitle = {
        bn: bonusTitleBn || "",
        en: bonusTitleEn || "",
      };

      doc.bonusDescription = {
        bn: bonusDescriptionBn || "",
        en: bonusDescriptionEn || "",
      };

      doc.netProfitTitle = {
        bn: netProfitTitleBn || "",
        en: netProfitTitleEn || "",
      };

      doc.netProfitDescription = {
        bn: netProfitDescriptionBn || "",
        en: netProfitDescriptionEn || "",
      };

      doc.ratingText = ratingText || "";
      doc.videoUrl = videoUrl || "";

      if (typeof isActive !== "undefined") {
        doc.isActive = isActive === "true" || isActive === true;
      }

      if (removeLeftBackgroundImage === "true" && doc.leftBackgroundImage) {
        safeDeleteFile(doc.leftBackgroundImage);
        doc.leftBackgroundImage = "";
      }

      if (removeGrowthImage === "true" && doc.growthImage) {
        safeDeleteFile(doc.growthImage);
        doc.growthImage = "";
      }

      if (removeCountryFlagImage === "true" && doc.countryFlagImage) {
        safeDeleteFile(doc.countryFlagImage);
        doc.countryFlagImage = "";
      }

      if (req.files?.leftBackgroundImage?.[0]) {
        if (doc.leftBackgroundImage) {
          safeDeleteFile(doc.leftBackgroundImage);
        }

        doc.leftBackgroundImage = `/uploads/${req.files.leftBackgroundImage[0].filename}`;
      } else if (leftBackgroundImageUrl) {
        if (doc.leftBackgroundImage !== leftBackgroundImageUrl) {
          safeDeleteFile(doc.leftBackgroundImage);
        }

        doc.leftBackgroundImage = leftBackgroundImageUrl;
      }

      if (req.files?.growthImage?.[0]) {
        if (doc.growthImage) {
          safeDeleteFile(doc.growthImage);
        }

        doc.growthImage = `/uploads/${req.files.growthImage[0].filename}`;
      } else if (growthImageUrl) {
        if (doc.growthImage !== growthImageUrl) {
          safeDeleteFile(doc.growthImage);
        }

        doc.growthImage = growthImageUrl;
      }

      if (req.files?.countryFlagImage?.[0]) {
        if (doc.countryFlagImage) {
          safeDeleteFile(doc.countryFlagImage);
        }

        doc.countryFlagImage = `/uploads/${req.files.countryFlagImage[0].filename}`;
      } else if (countryFlagImageUrl) {
        if (doc.countryFlagImage !== countryFlagImageUrl) {
          safeDeleteFile(doc.countryFlagImage);
        }

        doc.countryFlagImage = countryFlagImageUrl;
      }

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Commission content updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Commission Content Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update commission content",
      });
    }
  },
);

/* ============================= ADMIN DELETE ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffCommissionContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Commission content not found",
      });
    }

    safeDeleteFile(doc.leftBackgroundImage);
    safeDeleteFile(doc.growthImage);
    safeDeleteFile(doc.countryFlagImage);

    await AffCommissionContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Commission content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Commission Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete commission content",
    });
  }
});

export default router;