import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffWhyUsContent from "../models/AffWhyUsContent.js";

const router = express.Router();

const safeDeleteFile = (filePath = "") => {
  try {
    if (!filePath) return;
    if (/^https?:\/\//i.test(filePath)) return;

    const normalizedPath = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;

    const fullPath = path.join(process.cwd(), normalizedPath);

    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (error) {
    console.error("Why Us file delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffWhyUsContent.findOne();

  if (!doc) {
    doc = await AffWhyUsContent.create({
      isActive: true,

      title: {
        bn: "WHY US",
        en: "WHY US",
      },

      cardBackgroundImage:
        "https://beit365.bet/assets/affiliate/assets/bdt/icons/bg-icon.png",

      items: [
        {
          title: { bn: "ফ্রি রেজিস্ট্রেশন", en: "Free to Register" },
          description: {
            bn: "আমাদের 24/7 কাস্টমার সাপোর্ট টিম সবসময় বিভিন্ন ভাষায় তোমার যেকোনো প্রশ্নে সহায়তা করতে প্রস্তুত। যেকোনো সময়, যেকোনো স্থান থেকে সহজে যোগাযোগ করো।",
            en: "Our 24/7 customer support team is always here to assist you with any inquiries in different languages. Reach us anytime, anywhere, with a great and smooth live chat experience.",
          },
          icon: "https://beit365.bet/assets/affiliate/assets/images/freef709.png",
          order: 1,
          isActive: true,
        },
        {
          title: { bn: "বিশ্বস্ত ও নিরাপদ", en: "Trusted & Secure" },
          description: {
            bn: "আমাদের সাথে তুমি নিশ্চিন্তে কাজ করতে পারো। তোমার গোপনীয়তা সবসময় আমাদের অগ্রাধিকার। উন্নত সিকিউরিটি সিস্টেম ও 128-bit encryption তোমার ডেটা ও লেনদেনকে সুরক্ষিত রাখে।",
            en: "With us, you can always play with no worries as your privacy is always our top priority. beit365.bet uses a top-notch security system together with a 128-bit encryption to ensure all your transactions as well as the privacy of your data are safe and secure.",
          },
          icon: "https://beit365.bet/assets/affiliate/assets/images/trustedccf4.png",
          order: 2,
          isActive: true,
        },
        {
          title: { bn: "স্থিতিশীল ও ন্যায্য", en: "Stability & Fair" },
          description: {
            bn: "আমরা সময়ে সময়ে আকর্ষণীয় বোনাস ও রিওয়ার্ডসহ প্রোমোশন চালু করি। নিয়মিত বোনাস ও বড় জয়ের সুযোগ beit365.bet-এর অন্যতম সুবিধা।",
            en: "We will launch promotions that come with exciting rewards & bonuses from time to time! Always getting extra bonuses and winning big is one of the biggest perks on beit365.bet!",
          },
          icon: "https://beit365.bet/assets/affiliate/assets/images/stabilityde5c.png",
          order: 3,
          isActive: true,
        },
        {
          title: { bn: "বিভিন্ন ধরনের পণ্য", en: "Variety of Products" },
          description: {
            bn: "আমরা হাজারো আকর্ষণীয় প্রোডাক্ট ও গেমিং অপশন অফার করি, যাতে ব্যবহারকারীরা সবসময় নতুন অভিজ্ঞতা পায়।",
            en: "We provide thousands of exciting products and gaming options so users can always enjoy fresh and engaging experiences.",
          },
          icon: "https://beit365.bet/assets/affiliate/assets/images/variety31bf.png",
          order: 4,
          isActive: true,
        },
        {
          title: { bn: "লোকাল সার্ভিস", en: "Local Service" },
          description: {
            bn: "আমাদের বর্তমান বাজার বাংলাদেশ, ভারত, পাকিস্তান এবং আরও কয়েকটি অঞ্চলে বিস্তৃত। লোকালাইজড সার্ভিস আমাদের শক্তিশালী দিক।",
            en: "Our current available markets are Bangladesh, India, Pakistan, and more. Localized service is one of our strongest advantages.",
          },
          icon: "https://beit365.bet/assets/affiliate/assets/images/localservice55ad.png",
          order: 5,
          isActive: true,
        },
        {
          title: { bn: "সাপ্তাহিক পেআউট", en: "Payout: Every Week" },
          description: {
            bn: "আমাদের beit365.bet অ্যাফিলিয়েট প্রোগ্রামের মাধ্যমে তুমি প্রতি সপ্তাহে দ্রুত পেআউট পাবে, যা তোমার আয়কে আরও সহজ ও নির্ভরযোগ্য করে তোলে।",
            en: "Get paid faster with our beit365.bet Affiliate Program! Enjoy weekly payouts that make your earnings more reliable and convenient.",
          },
          icon: "https://beit365.bet/assets/affiliate/assets/images/clw09myg840gb07ztbdlpvss583bb.png",
          order: 6,
          isActive: true,
        },
      ],
    });
  }

  return doc;
};

/* ============================= PUBLIC GET ============================= */

router.get("/", async (req, res) => {
  try {
    const doc = await createDefaultDoc();
    const data = doc.toObject();

    data.items = (data.items || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Why Us Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch why us content",
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
    console.error("Admin Get Why Us Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch why us content",
    });
  }
});

/* ============================= UPDATE SECTION ============================= */

router.put(
  "/admin",
  upload.single("cardBackgroundImage"),
  async (req, res) => {
    try {
      const doc = await createDefaultDoc();

      const {
        titleBn,
        titleEn,
        cardBackgroundImageUrl,
        removeCardBackgroundImage,
        isActive,
      } = req.body;

      doc.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      if (typeof isActive !== "undefined") {
        doc.isActive = isActive === "true" || isActive === true;
      }

      if (removeCardBackgroundImage === "true" && doc.cardBackgroundImage) {
        safeDeleteFile(doc.cardBackgroundImage);
        doc.cardBackgroundImage = "";
      }

      if (req.file) {
        if (doc.cardBackgroundImage) safeDeleteFile(doc.cardBackgroundImage);
        doc.cardBackgroundImage = `/uploads/${req.file.filename}`;
      } else if (cardBackgroundImageUrl) {
        if (doc.cardBackgroundImage !== cardBackgroundImageUrl) {
          safeDeleteFile(doc.cardBackgroundImage);
        }

        doc.cardBackgroundImage = cardBackgroundImageUrl;
      }

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Why Us section updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Why Us Section Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update why us section",
      });
    }
  },
);

/* ============================= CREATE ITEM ============================= */

router.post("/admin/items", upload.single("icon"), async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      titleBn,
      titleEn,
      descriptionBn,
      descriptionEn,
      iconUrl,
      order,
      isActive,
    } = req.body;

    const icon = req.file ? `/uploads/${req.file.filename}` : iconUrl || "";

    doc.items.push({
      title: {
        bn: titleBn || "",
        en: titleEn || "",
      },
      description: {
        bn: descriptionBn || "",
        en: descriptionEn || "",
      },
      icon,
      order: Number(order || doc.items.length + 1),
      isActive: isActive !== "false",
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Why Us item created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create Why Us Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create why us item",
    });
  }
});

/* ============================= UPDATE ITEM ============================= */

router.put("/admin/items/:itemId", upload.single("icon"), async (req, res) => {
  try {
    const { itemId } = req.params;

    const doc = await createDefaultDoc();
    const item = doc.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Why Us item not found",
      });
    }

    const {
      titleBn,
      titleEn,
      descriptionBn,
      descriptionEn,
      iconUrl,
      order,
      isActive,
      removeIcon,
    } = req.body;

    item.title = {
      bn: titleBn || "",
      en: titleEn || "",
    };

    item.description = {
      bn: descriptionBn || "",
      en: descriptionEn || "",
    };

    item.order = Number(order || 0);
    item.isActive = isActive !== "false";

    if (removeIcon === "true" && item.icon) {
      safeDeleteFile(item.icon);
      item.icon = "";
    }

    if (req.file) {
      if (item.icon) safeDeleteFile(item.icon);
      item.icon = `/uploads/${req.file.filename}`;
    } else if (iconUrl) {
      if (item.icon !== iconUrl) safeDeleteFile(item.icon);
      item.icon = iconUrl;
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Why Us item updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update Why Us Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update why us item",
    });
  }
});

/* ============================= DELETE ITEM ============================= */

router.delete("/admin/items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    const doc = await createDefaultDoc();
    const item = doc.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Why Us item not found",
      });
    }

    if (item.icon) safeDeleteFile(item.icon);

    item.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Why Us item deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete Why Us Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete why us item",
    });
  }
});

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffWhyUsContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Why Us content not found",
      });
    }

    safeDeleteFile(doc.cardBackgroundImage);

    for (const item of doc.items || []) {
      if (item.icon) safeDeleteFile(item.icon);
    }

    await AffWhyUsContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Why Us content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Why Us Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete why us content",
    });
  }
});

export default router;