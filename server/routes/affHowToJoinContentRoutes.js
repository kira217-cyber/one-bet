import express from "express";
import fs from "fs";
import path from "path";

import upload from "../config/multer.js";
import AffHowToJoinContent from "../models/AffHowToJoinContent.js";

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
    console.error("How To Join file delete error:", error);
  }
};

const createDefaultDoc = async () => {
  let doc = await AffHowToJoinContent.findOne();

  if (!doc) {
    doc = await AffHowToJoinContent.create({
      isActive: true,

      title: {
        bn: "HOW TO JOIN",
        en: "HOW TO JOIN",
      },

      heroText: {
        bn: "এখনই তোমার অ্যাফিলিয়েট যাত্রা শুরু করো!",
        en: "Start your affiliate journey now!",
      },

      buttonText: {
        bn: "Register now",
        en: "Register now",
      },

      image:
        "https://beit365.bet/assets/affiliate/assets/hero-banner/clzhvb72472ur07zopjckzhdv.webp",

      steps: [
        {
          number: "01",
          title: {
            bn: "Register",
            en: "Register",
          },
          description: {
            bn: "প্লেয়ার ইউনিক অ্যাফিলিয়েট লিংক ব্যবহার করে beit365.bet অ্যাকাউন্ট রেজিস্টার করে",
            en: "Player registers beit365.bet account with unique affiliate link",
          },
          order: 1,
          isHighlighted: false,
          isActive: true,
        },
        {
          number: "02",
          title: {
            bn: "Generate",
            en: "Generate",
          },
          description: {
            bn: "প্লেয়ার নেট প্রফিট জেনারেট করে",
            en: "Player generates net profit",
          },
          order: 2,
          isHighlighted: false,
          isActive: true,
        },
        {
          number: "03",
          title: {
            bn: "Earn",
            en: "Earn",
          },
          description: {
            bn: "তুমি নেট প্রফিটের 40% কমিশন হিসেবে আয় করো",
            en: "You earn 40% of net profit as commission",
          },
          order: 3,
          isHighlighted: true,
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

    data.steps = (data.steps || [])
      .filter((step) => step.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get How To Join Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch how to join content",
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
    console.error("Admin Get How To Join Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch how to join content",
    });
  }
});

/* ============================= UPDATE SECTION ============================= */

router.put("/admin", upload.single("image"), async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      titleBn,
      titleEn,
      heroTextBn,
      heroTextEn,
      buttonTextBn,
      buttonTextEn,
      imageUrl,
      removeImage,
      isActive,
    } = req.body;

    doc.title = {
      bn: titleBn || "",
      en: titleEn || "",
    };

    doc.heroText = {
      bn: heroTextBn || "",
      en: heroTextEn || "",
    };

    doc.buttonText = {
      bn: buttonTextBn || "",
      en: buttonTextEn || "",
    };

    if (typeof isActive !== "undefined") {
      doc.isActive = isActive === "true" || isActive === true;
    }

    if (removeImage === "true" && doc.image) {
      safeDeleteFile(doc.image);
      doc.image = "";
    }

    if (req.file) {
      if (doc.image) {
        safeDeleteFile(doc.image);
      }

      doc.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      if (doc.image !== imageUrl) {
        safeDeleteFile(doc.image);
      }

      doc.image = imageUrl;
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "How to join section updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update How To Join Section Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update how to join section",
    });
  }
});

/* ============================= CREATE STEP ============================= */

router.post("/admin/steps", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      number,
      titleBn,
      titleEn,
      descriptionBn,
      descriptionEn,
      order,
      isHighlighted,
      isActive,
    } = req.body;

    doc.steps.push({
      number: number || "",
      title: {
        bn: titleBn || "",
        en: titleEn || "",
      },
      description: {
        bn: descriptionBn || "",
        en: descriptionEn || "",
      },
      order: Number(order || doc.steps.length + 1),
      isHighlighted: isHighlighted === "true" || isHighlighted === true,
      isActive: isActive !== "false",
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Step created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create How To Join Step Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create step",
    });
  }
});

/* ============================= UPDATE STEP ============================= */

router.put("/admin/steps/:stepId", async (req, res) => {
  try {
    const { stepId } = req.params;

    const doc = await createDefaultDoc();
    const step = doc.steps.id(stepId);

    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Step not found",
      });
    }

    const {
      number,
      titleBn,
      titleEn,
      descriptionBn,
      descriptionEn,
      order,
      isHighlighted,
      isActive,
    } = req.body;

    step.number = number || "";
    step.title = {
      bn: titleBn || "",
      en: titleEn || "",
    };
    step.description = {
      bn: descriptionBn || "",
      en: descriptionEn || "",
    };
    step.order = Number(order || 0);
    step.isHighlighted = isHighlighted === "true" || isHighlighted === true;
    step.isActive = isActive !== "false";

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Step updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update How To Join Step Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update step",
    });
  }
});

/* ============================= DELETE STEP ============================= */

router.delete("/admin/steps/:stepId", async (req, res) => {
  try {
    const { stepId } = req.params;

    const doc = await createDefaultDoc();
    const step = doc.steps.id(stepId);

    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Step not found",
      });
    }

    step.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Step deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete How To Join Step Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete step",
    });
  }
});

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffHowToJoinContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "How to join content not found",
      });
    }

    safeDeleteFile(doc.image);

    await AffHowToJoinContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "How to join content deleted successfully",
    });
  } catch (error) {
    console.error("Delete How To Join Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete how to join content",
    });
  }
});

export default router;