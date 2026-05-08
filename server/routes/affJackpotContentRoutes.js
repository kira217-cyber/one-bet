import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffJackpotContent from "../models/AffJackpotContent.js";

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
    console.error("Jackpot file delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffJackpotContent.findOne();

  if (!doc) {
    doc = await AffJackpotContent.create({
      isActive: true,

      title: {
        bn: "জ্যাকপট কস্ট স্ট্রাকচার",
        en: "JACKPOT COST STRUCTURE",
      },

      infoTitle: {
        bn: "জ্যাকপট কস্ট কী?",
        en: "What is Jackpot Cost?",
      },

      infoText: {
        bn: "জ্যাকপট কস্ট একটি বিশেষ সিস্টেম যেখানে অ্যাফিলিয়েটরা জ্যাকপট পুলের একটি ছোট অংশে অবদান রাখে, আর কোম্পানি পটের অধিকাংশ অংশ কভার করে। এই যৌথ প্রচেষ্টা এমন একটি জয়-জয় পরিস্থিতি তৈরি করে যেখানে একজন প্লেয়ার জ্যাকপট জিতলে শুধু তার জয়ই হয় না, এটি তোমারও সুবিধা। উদাহরণস্বরূপ, ধরো তোমার প্লেয়ার ৳১০,০০,০০০ জ্যাকপট জিতেছে। এতে শুধু খেলোয়াড়ই বিজয়ী হয় না, বরং তাদের প্ল্যাটফর্মের প্রতি আনুগত্যও বাড়ে, যার ফলে টেকসই সম্পৃক্ততা এবং তোমার জন্য ধারাবাহিক লাভ তৈরি হয়। পাশাপাশি, তুমি একটি শক্তিশালী এবং বিশ্বস্ত প্লেয়ার বেস ধরে রাখতে পারবে।",
        en: "The Jackpot Cost is a unique system where affiliates contribute a small portion of the jackpot pool, while the company covers the majority of the pot. This collaborative effort creates a win-win situation: when a player hits the jackpot, it’s not just their victory—it’s yours too! For instance, imagine if your player won a ৳10,00,000 jackpot. Not only does that payout make them a winner, but it also increases their loyalty to our platform, leading to sustained engagement and continuous profit for you. Plus, you get to maintain a strong and loyal player base.",
      },

      benefitsTitle: {
        bn: "অ্যাফিলিয়েটদের জন্য জ্যাকপট ফিচারের সুবিধা কী?",
        en: "What are the benefits of the Jackpot feature for affiliates?",
      },

      mainImage:
        "https://beit365.bet/assets/affiliate/assets/images/jackpotcostmain1927.jpg",

      cards: [
        {
          title: {
            bn: "প্লেয়ার ধরে রাখা বৃদ্ধি ও অ্যাফিলিয়েট আয় বৃদ্ধি",
            en: "Increased Player Retention & Affiliate Earnings",
          },
          description: {
            bn: "যদি কোনো প্লেয়ার জ্যাকপট জিতে, তাহলে সে খেলা চালিয়ে যাওয়ার সম্ভাবনা বেশি থাকে, ফলে তুমি তাদের বাজির মাধ্যমে আরও কমিশন আয়ের সুযোগ পাবে।",
            en: "If a player wins a jackpot, they're more likely to continue playing, providing you with further opportunities to earn commissions as they wager their winnings.",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard157b6.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard1.webp&w=384&q=75",
          order: 1,
          isActive: true,
        },
        {
          title: {
            bn: "বড় জ্যাকপট, বড় পেআউট",
            en: "Bigger Jackpots, Bigger Payouts",
          },
          description: {
            bn: "বড় জ্যাকপট আরও বেশি প্লেয়ারকে আকর্ষণ করে, ফলে তোমার লিংকের মাধ্যমে সাইন-আপের সম্ভাবনা বাড়ে এবং কমিশনও বাড়ে।",
            en: "Larger jackpots will attract more players, increasing the chances of sign-ups through your links, and ultimately, boosting your commissions.",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard27c88.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard2.webp&w=384&q=75",
          order: 2,
          isActive: true,
        },
        {
          title: {
            bn: "রেক্রুটমেন্ট আরও শক্তিশালী",
            en: "Enhanced Recruitment",
          },
          description: {
            bn: "আকর্ষণীয় জ্যাকপট ফিচার নতুন প্লেয়ার রিক্রুট করতে সাহায্য করে এবং তোমার অ্যাফিলিয়েট প্রচারকে আরও কার্যকর করে তোলে।",
            en: "A stronger jackpot feature makes your promotional offer more appealing and helps bring in more new players through affiliate recruitment.",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard33fc7.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard3.webp&w=384&q=75",
          order: 3,
          isActive: true,
        },
        {
          title: {
            bn: "টেকসই আয়ের বৃদ্ধি",
            en: "Sustainable Earnings Growth",
          },
          description: {
            bn: "যখন প্লেয়াররা নিয়মিত সক্রিয় থাকে, তখন দীর্ঘমেয়াদে তোমার আয় স্থিতিশীলভাবে বাড়তে থাকে।",
            en: "As players stay active for longer, your earning opportunities become more consistent and can grow steadily over time.",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard4f1c0.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard4.webp&w=384&q=75",
          order: 4,
          isActive: true,
        },
        {
          title: {
            bn: "সুষ্ঠু খেলা, সমান পুরস্কার",
            en: "Fair Play, Equal Rewards",
          },
          description: {
            bn: "এই সিস্টেম প্লেয়ারদের জন্য আরও ন্যায্য এবং আকর্ষণীয় অভিজ্ঞতা তৈরি করে, যা তাদের দীর্ঘমেয়াদি সম্পৃক্ততা বাড়ায়।",
            en: "A balanced jackpot model helps create a fairer experience for players, supporting trust and stronger long-term engagement.",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard5811c.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard5.webp&w=384&q=75",
          order: 5,
          isActive: true,
        },
        {
          title: {
            bn: "সবার থেকে আলাদা হয়ে উঠুন",
            en: "Stand Out from the Crowd",
          },
          description: {
            bn: "জ্যাকপট সুবিধা তোমার অফারকে প্রতিযোগীদের থেকে আলাদা করে তোলে এবং প্লেয়ারদের কাছে আরও শক্তিশালী ইমপ্রেশন তৈরি করে।",
            en: "A jackpot feature helps differentiate your offer from competitors and makes your affiliate promotions more memorable.",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard68b25.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard6.webp&w=384&q=75",
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

    data.cards = (data.cards || [])
      .filter((card) => card.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Jackpot Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jackpot content",
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
    console.error("Admin Get Jackpot Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jackpot content",
    });
  }
});

/* ============================= UPDATE SECTION ============================= */

router.put(
  "/admin",
  upload.single("mainImage"),
  async (req, res) => {
    try {
      const doc = await createDefaultDoc();

      const {
        titleBn,
        titleEn,
        infoTitleBn,
        infoTitleEn,
        infoTextBn,
        infoTextEn,
        benefitsTitleBn,
        benefitsTitleEn,
        mainImageUrl,
        removeMainImage,
        isActive,
      } = req.body;

      doc.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      doc.infoTitle = {
        bn: infoTitleBn || "",
        en: infoTitleEn || "",
      };

      doc.infoText = {
        bn: infoTextBn || "",
        en: infoTextEn || "",
      };

      doc.benefitsTitle = {
        bn: benefitsTitleBn || "",
        en: benefitsTitleEn || "",
      };

      if (typeof isActive !== "undefined") {
        doc.isActive = isActive === "true" || isActive === true;
      }

      if (removeMainImage === "true" && doc.mainImage) {
        safeDeleteFile(doc.mainImage);
        doc.mainImage = "";
      }

      if (req.file) {
        if (doc.mainImage) {
          safeDeleteFile(doc.mainImage);
        }

        doc.mainImage = `/uploads/${req.file.filename}`;
      } else if (mainImageUrl) {
        if (doc.mainImage !== mainImageUrl) {
          safeDeleteFile(doc.mainImage);
        }

        doc.mainImage = mainImageUrl;
      }

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Jackpot section updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Jackpot Section Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update jackpot section",
      });
    }
  },
);

/* ============================= CREATE CARD ============================= */

router.post(
  "/admin/cards",
  upload.single("image"),
  async (req, res) => {
    try {
      const doc = await createDefaultDoc();

      const {
        titleBn,
        titleEn,
        descriptionBn,
        descriptionEn,
        imageUrl,
        order,
        isActive,
      } = req.body;

      const image = req.file
        ? `/uploads/${req.file.filename}`
        : imageUrl || "";

      doc.cards.push({
        title: {
          bn: titleBn || "",
          en: titleEn || "",
        },
        description: {
          bn: descriptionBn || "",
          en: descriptionEn || "",
        },
        image,
        order: Number(order || doc.cards.length + 1),
        isActive: isActive !== "false",
      });

      await doc.save();

      return res.status(201).json({
        success: true,
        message: "Jackpot card created successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Create Jackpot Card Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to create jackpot card",
      });
    }
  },
);

/* ============================= UPDATE CARD ============================= */

router.put(
  "/admin/cards/:cardId",
  upload.single("image"),
  async (req, res) => {
    try {
      const { cardId } = req.params;

      const doc = await createDefaultDoc();
      const card = doc.cards.id(cardId);

      if (!card) {
        return res.status(404).json({
          success: false,
          message: "Jackpot card not found",
        });
      }

      const {
        titleBn,
        titleEn,
        descriptionBn,
        descriptionEn,
        imageUrl,
        order,
        isActive,
        removeImage,
      } = req.body;

      card.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      card.description = {
        bn: descriptionBn || "",
        en: descriptionEn || "",
      };

      card.order = Number(order || 0);
      card.isActive = isActive !== "false";

      if (removeImage === "true" && card.image) {
        safeDeleteFile(card.image);
        card.image = "";
      }

      if (req.file) {
        if (card.image) {
          safeDeleteFile(card.image);
        }

        card.image = `/uploads/${req.file.filename}`;
      } else if (imageUrl) {
        if (card.image !== imageUrl) {
          safeDeleteFile(card.image);
        }

        card.image = imageUrl;
      }

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Jackpot card updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Jackpot Card Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update jackpot card",
      });
    }
  },
);

/* ============================= DELETE CARD ============================= */

router.delete("/admin/cards/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;

    const doc = await createDefaultDoc();
    const card = doc.cards.id(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Jackpot card not found",
      });
    }

    if (card.image) {
      safeDeleteFile(card.image);
    }

    card.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Jackpot card deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete Jackpot Card Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete jackpot card",
    });
  }
});

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffJackpotContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Jackpot content not found",
      });
    }

    safeDeleteFile(doc.mainImage);

    for (const card of doc.cards || []) {
      if (card.image) {
        safeDeleteFile(card.image);
      }
    }

    await AffJackpotContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Jackpot content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Jackpot Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete jackpot content",
    });
  }
});

export default router;