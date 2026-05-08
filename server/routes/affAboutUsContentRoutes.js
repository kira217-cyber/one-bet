import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffAboutUsContent from "../models/AffAboutUsContent.js";

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
    console.error("About Us file delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffAboutUsContent.findOne();

  if (!doc) {
    doc = await AffAboutUsContent.create({
      isActive: true,

      title: {
        bn: "ABOUT US",
        en: "ABOUT US",
      },

      subtitle: {
        bn: "beit365.bet এশিয়ার অন্যতম নির্ভরযোগ্য অনলাইন গেমিং ব্র্যান্ড। আমরা নিরাপদ, ন্যায্য এবং মানসম্মত গেমিং অভিজ্ঞতা দিতে গুরুত্ব দিই।",
        en: "beit365.bet is the most reliable online gambling brand in Asia. We emphasize on providing a fair and safe gaming experience.",
      },

      items: [
        {
          title: { bn: "লাইভ ক্যাসিনো", en: "Live Casino" },
          image:
            "https://beit365.bet/assets/affiliate/assets/aboutus/inr/live-casino.webp",
          order: 1,
          isActive: true,
        },
        {
          title: { bn: "স্পোর্টস এক্সচেঞ্জ", en: "Sports Exchange" },
          image:
            "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sports-exchange.webp",
          order: 2,
          isActive: true,
        },
        {
          title: { bn: "স্লটস", en: "Slots" },
          image:
            "https://beit365.bet/assets/affiliate/assets/aboutus/inr/slots.webp",
          order: 3,
          isActive: true,
        },
        {
          title: { bn: "স্পোর্টসবুক", en: "Sportsbook" },
          image:
            "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sportsbook.webp",
          order: 4,
          isActive: true,
        },
        {
          title: { bn: "ক্র্যাশ", en: "Crash" },
          image:
            "https://beit365.bet/assets/affiliate/assets/aboutus/inr/crash.webp",
          order: 5,
          isActive: true,
        },
        {
          title: { bn: "এবং আরো", en: "and any more" },
          image:
            "https://beit365.bet/assets/affiliate/assets/aboutus/inr/etc.webp",
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
    console.error("Get About Us Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch about us content",
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
    console.error("Admin Get About Us Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch about us content",
    });
  }
});

/* ============================= UPDATE SECTION ============================= */

router.put("/admin", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const { titleBn, titleEn, subtitleBn, subtitleEn, isActive } = req.body;

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

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "About Us section updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update About Us Section Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update about us section",
    });
  }
});

/* ============================= CREATE ITEM ============================= */

router.post("/admin/items", upload.single("image"), async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const { titleBn, titleEn, imageUrl, order, isActive } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl || "";

    doc.items.push({
      title: {
        bn: titleBn || "",
        en: titleEn || "",
      },
      image,
      order: Number(order || doc.items.length + 1),
      isActive: isActive !== "false",
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "About item created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create About Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create about item",
    });
  }
});

/* ============================= UPDATE ITEM ============================= */

router.put("/admin/items/:itemId", upload.single("image"), async (req, res) => {
  try {
    const { itemId } = req.params;

    const doc = await createDefaultDoc();
    const item = doc.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "About item not found",
      });
    }

    const {
      titleBn,
      titleEn,
      imageUrl,
      order,
      isActive,
      removeImage,
    } = req.body;

    item.title = {
      bn: titleBn || "",
      en: titleEn || "",
    };

    item.order = Number(order || 0);
    item.isActive = isActive !== "false";

    if (removeImage === "true" && item.image) {
      safeDeleteFile(item.image);
      item.image = "";
    }

    if (req.file) {
      if (item.image) safeDeleteFile(item.image);
      item.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      if (item.image !== imageUrl) safeDeleteFile(item.image);
      item.image = imageUrl;
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "About item updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update About Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update about item",
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
        message: "About item not found",
      });
    }

    if (item.image) safeDeleteFile(item.image);

    item.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "About item deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete About Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete about item",
    });
  }
});

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffAboutUsContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "About Us content not found",
      });
    }

    for (const item of doc.items || []) {
      if (item.image) safeDeleteFile(item.image);
    }

    await AffAboutUsContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "About Us content deleted successfully",
    });
  } catch (error) {
    console.error("Delete About Us Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete about us content",
    });
  }
});

export default router;