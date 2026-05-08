import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffCampaignContent from "../models/AffCampaignContent.js";

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
    console.error("Campaign file delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffCampaignContent.findOne();

  if (!doc) {
    doc = await AffCampaignContent.create({
      heading: {
        bn: "চলমান ক্যাম্পেইন",
        en: "ONGOING CAMPAIGNS",
      },

      moreDetailsText: {
        bn: "আরও বিস্তারিত",
        en: "MORE DETAILS",
      },

      signUpText: {
        bn: "সাইন আপ করুন",
        en: "SIGN UP NOW",
      },

      isActive: true,

      campaigns: [
        {
          title: {
            bn: "অ্যাস্ট্রোনটস অফ প্রফিট: ৭০% কমিশন ক্র্যাশ",
            en: "ASTRONAUTS OF PROFIT: 70% COMMISSION CRASH",
          },
          date: {
            bn: "শুরু ২৫শে আগস্ট ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে",
            en: "Starts from 21:30 (GMT+5:30) on 25th August 2024.",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/hero-banner/avaitoer.jpg",
          order: 1,
          isActive: true,
        },
        {
          title: {
            bn: "বোর্নমাউথ সকার ব্লিটজ",
            en: "BOURNEMOUTH SOCCER BLITZ",
          },
          date: {
            bn: "শুরু ১১ই আগস্ট ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে ২৫শে মে ২০২৫, রাত ২১:২৯ (GMT+5:30) পর্যন্ত",
            en: "Starts from 21:30 (GMT+5:30) on 11th August 2024 until 21:29 (GMT+5:30) on 25th May 2025",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/hero-banner/soocer-bix.jpg",
          order: 2,
          isActive: true,
        },
        {
          title: {
            bn: "এ.এফ.সি. বোর্নমাউথ গোল্ড রাশ",
            en: "A.F.C. BOURNEMOUTH GOLD RUSH",
          },
          date: {
            bn: "শুরু ৩১শে জুলাই ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে ৩১শে মে ২০২৫, রাত ২১:২৯ (GMT+5:30) পর্যন্ত",
            en: "Starts from 21:30 (GMT+5:30) on 31st July 2024 until 21:29 (GMT+5:30) on 31st May 2025",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/hero-banner/650x400-USD.webp",
          order: 3,
          isActive: true,
        },
        {
          title: {
            bn: "অ্যাফিলিয়েট রেফারেল প্রোগ্রাম",
            en: "AFFILIATE REFERRAL PROGRAM",
          },
          date: {
            bn: "শুরু ১লা জুন ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে",
            en: "Starts from 21:30 (GMT+5:30) on 1st June 2024",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/hero-banner/referal.png",
          order: 4,
          isActive: true,
        },
        {
          title: {
            bn: "অল নিউ বাজি ক্যাম্পেইন",
            en: "ALL NEW BAJI CAMPAIGN",
          },
          date: {
            bn: "চলমান বিশেষ ক্যাম্পেইন এখন উপলব্ধ",
            en: "Special ongoing campaign available now",
          },
          image:
            "https://beit365.bet/assets/affiliate/assets/hero-banner/All-NewBaji.jpg",
          order: 5,
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

    data.campaigns = (data.campaigns || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Campaign Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign content",
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
    console.error("Admin Get Campaign Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign content",
    });
  }
});

/* ============================= UPDATE MAIN CONTENT ============================= */

router.put("/admin", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      headingBn,
      headingEn,
      moreDetailsTextBn,
      moreDetailsTextEn,
      signUpTextBn,
      signUpTextEn,
      isActive,
    } = req.body;

    doc.heading = {
      bn: headingBn || "",
      en: headingEn || "",
    };

    doc.moreDetailsText = {
      bn: moreDetailsTextBn || "",
      en: moreDetailsTextEn || "",
    };

    doc.signUpText = {
      bn: signUpTextBn || "",
      en: signUpTextEn || "",
    };

    if (typeof isActive !== "undefined") {
      doc.isActive = isActive === "true";
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Campaign content updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update Campaign Content Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update campaign content",
    });
  }
});

/* ============================= CREATE CAMPAIGN ============================= */

router.post(
  "/admin/campaigns",
  upload.single("image"),
  async (req, res) => {
    try {
      const doc = await createDefaultDoc();

      const {
        titleBn,
        titleEn,
        dateBn,
        dateEn,
        imageUrl,
        order,
        isActive,
      } = req.body;

      const image = req.file
        ? `/uploads/${req.file.filename}`
        : imageUrl || "";

      doc.campaigns.push({
        title: {
          bn: titleBn || "",
          en: titleEn || "",
        },
        date: {
          bn: dateBn || "",
          en: dateEn || "",
        },
        image,
        order: Number(order || doc.campaigns.length + 1),
        isActive: isActive !== "false",
      });

      await doc.save();

      return res.status(201).json({
        success: true,
        message: "Campaign created successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Create Campaign Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to create campaign",
      });
    }
  },
);

/* ============================= UPDATE CAMPAIGN ============================= */

router.put(
  "/admin/campaigns/:campaignId",
  upload.single("image"),
  async (req, res) => {
    try {
      const { campaignId } = req.params;

      const doc = await createDefaultDoc();
      const campaign = doc.campaigns.id(campaignId);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      const {
        titleBn,
        titleEn,
        dateBn,
        dateEn,
        imageUrl,
        order,
        isActive,
        removeImage,
      } = req.body;

      if (removeImage === "true" && campaign.image) {
        safeDeleteFile(campaign.image);
        campaign.image = "";
      }

      if (req.file) {
        if (campaign.image) {
          safeDeleteFile(campaign.image);
        }

        campaign.image = `/uploads/${req.file.filename}`;
      } else if (imageUrl) {
        if (campaign.image && campaign.image !== imageUrl) {
          safeDeleteFile(campaign.image);
        }

        campaign.image = imageUrl;
      }

      campaign.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      campaign.date = {
        bn: dateBn || "",
        en: dateEn || "",
      };

      campaign.order = Number(order || 0);
      campaign.isActive = isActive !== "false";

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Campaign updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Campaign Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update campaign",
      });
    }
  },
);

/* ============================= DELETE CAMPAIGN ============================= */

router.delete("/admin/campaigns/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;

    const doc = await createDefaultDoc();
    const campaign = doc.campaigns.id(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.image) {
      safeDeleteFile(campaign.image);
    }

    campaign.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete Campaign Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete campaign",
    });
  }
});

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffCampaignContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Campaign content not found",
      });
    }

    for (const campaign of doc.campaigns || []) {
      if (campaign.image) {
        safeDeleteFile(campaign.image);
      }
    }

    await AffCampaignContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Campaign content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Campaign Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete campaign content",
    });
  }
});

export default router;