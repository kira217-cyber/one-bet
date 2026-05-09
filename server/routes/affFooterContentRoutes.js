import express from "express";
import AffFooterContent from "../models/AffFooterContent.js";
import upload from "../config/multer.js";

const router = express.Router();

const normalizePath = (filePath = "") => {
  return filePath.replace(/\\/g, "/");
};

const getSingleDoc = async () => {
  let doc = await AffFooterContent.findOne();

  if (!doc) {
    doc = await AffFooterContent.create({
      title: {
        bn: "আমাদের সাথে যুক্ত থাকুন",
        en: "Connect with us.",
      },

      desc: {
        bn: "ক্যাম্পেইন, ঘোষণা এবং অ্যাফিলিয়েট মার্কেটিং সম্পর্কিত আপডেট শেয়ার করার জন্য একটি কেন্দ্রীভূত প্ল্যাটফর্ম।",
        en: "Organized as a centralized platform for sharing campaigns, announcement, and updates related to affiliate marketing efforts",
      },

      termsText: {
        bn: "শর্তাবলী",
        en: "Terms & Conditions",
      },

      termsLink: "#",

      copyright: {
        bn: "© ২০২০ সাল থেকে কপিরাইট, beit365.bet Affiliates Program। সর্বস্বত্ব সংরক্ষিত।",
        en: "© Copyrighted since 2020, beit365.bet Affiliates Program. All rights reserved.",
      },

      backgroundImage:
        "https://beit365.bet/assets/affiliate/assets/bg/Community-Page.png",

      socialLinks: [
        {
          platform: "WhatsApp",
          label: "WhatsApp",
          iconType: "whatsapp",
          href: "#",
          order: 1,
          isActive: true,
        },
        {
          platform: "Telegram",
          label: "Telegram",
          iconType: "telegram",
          href: "#",
          order: 2,
          isActive: true,
        },
        {
          platform: "Facebook",
          label: "Facebook",
          iconType: "facebook",
          href: "#",
          order: 3,
          isActive: true,
        },
        {
          platform: "YouTube",
          label: "YouTube",
          iconType: "youtube",
          href: "#",
          order: 4,
          isActive: true,
        },
      ],
    });
  }

  return doc;
};

/*
|--------------------------------------------------------------------------
| PUBLIC GET
|--------------------------------------------------------------------------
*/
router.get("/", async (req, res) => {
  try {
    const doc = await getSingleDoc();

    const activeSocialLinks = (doc.socialLinks || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return res.json({
      success: true,
      data: {
        ...doc.toObject(),
        socialLinks: activeSocialLinks,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load footer content",
    });
  }
});

/*
|--------------------------------------------------------------------------
| ADMIN GET
|--------------------------------------------------------------------------
*/
router.get("/admin", async (req, res) => {
  try {
    const doc = await getSingleDoc();

    return res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin footer content",
    });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE SECTION
|--------------------------------------------------------------------------
*/
router.put(
  "/admin",
  upload.single("backgroundImage"),
  async (req, res) => {
    try {
      const doc = await getSingleDoc();

      const {
        titleBn,
        titleEn,

        descBn,
        descEn,

        termsTextBn,
        termsTextEn,

        termsLink,

        copyrightBn,
        copyrightEn,

        backgroundImageUrl,
        removeBackgroundImage,

        isActive,
      } = req.body;

      doc.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      doc.desc = {
        bn: descBn || "",
        en: descEn || "",
      };

      doc.termsText = {
        bn: termsTextBn || "",
        en: termsTextEn || "",
      };

      doc.termsLink = termsLink || "";

      doc.copyright = {
        bn: copyrightBn || "",
        en: copyrightEn || "",
      };

      doc.isActive = String(isActive) === "true";

      if (String(removeBackgroundImage) === "true") {
        doc.backgroundImage = "";
      }

      if (backgroundImageUrl?.trim()) {
        doc.backgroundImage = backgroundImageUrl.trim();
      }

      if (req.file) {
        doc.backgroundImage = normalizePath(`/${req.file.path}`);
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Footer section updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update footer section",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| CREATE SOCIAL LINK
|--------------------------------------------------------------------------
*/
router.post(
  "/admin/social-links",
  upload.single("icon"),
  async (req, res) => {
    try {
      const doc = await getSingleDoc();

      const {
        platform,
        label,
        iconType,
        iconUrl,
        href,
        order,
        isActive,
      } = req.body;

      let finalIcon = "";

      if (iconUrl?.trim()) {
        finalIcon = iconUrl.trim();
      }

      if (req.file) {
        finalIcon = normalizePath(`/${req.file.path}`);
      }

      doc.socialLinks.push({
        platform: platform || "",
        label: label || "",
        iconType: iconType || "custom",
        icon: finalIcon,
        href: href || "",
        order: Number(order || 0),
        isActive: String(isActive) === "true",
      });

      await doc.save();

      return res.json({
        success: true,
        message: "Social link created successfully",
        data: doc,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create social link",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| UPDATE SOCIAL LINK
|--------------------------------------------------------------------------
*/
router.put(
  "/admin/social-links/:id",
  upload.single("icon"),
  async (req, res) => {
    try {
      const doc = await getSingleDoc();

      const social = doc.socialLinks.id(req.params.id);

      if (!social) {
        return res.status(404).json({
          success: false,
          message: "Social link not found",
        });
      }

      const {
        platform,
        label,
        iconType,
        iconUrl,
        href,
        order,
        isActive,
        removeIcon,
      } = req.body;

      social.platform = platform || "";
      social.label = label || "";
      social.iconType = iconType || "custom";
      social.href = href || "";
      social.order = Number(order || 0);
      social.isActive = String(isActive) === "true";

      if (String(removeIcon) === "true") {
        social.icon = "";
      }

      if (iconUrl?.trim()) {
        social.icon = iconUrl.trim();
      }

      if (req.file) {
        social.icon = normalizePath(`/${req.file.path}`);
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Social link updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update social link",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| DELETE SOCIAL LINK
|--------------------------------------------------------------------------
*/
router.delete("/admin/social-links/:id", async (req, res) => {
  try {
    const doc = await getSingleDoc();

    doc.socialLinks = doc.socialLinks.filter(
      (item) => item._id.toString() !== req.params.id,
    );

    await doc.save();

    return res.json({
      success: true,
      message: "Social link deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete social link",
    });
  }
});

export default router;