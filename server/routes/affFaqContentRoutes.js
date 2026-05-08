import express from "express";
import AffFaqContent from "../models/AffFaqContent.js";

const router = express.Router();

const createDefaultDoc = async () => {
  let doc = await AffFaqContent.findOne();

  if (!doc) {
    doc = await AffFaqContent.create({
      isActive: true,
      tabs: [
        {
          tabKey: "general",
          label: { bn: "General", en: "General" },
          order: 1,
          isActive: true,
          items: [
            {
              question: { bn: "আমরা কারা?", en: "Who are we?" },
              answer: {
                bn: "beit365.bet ২০২০ সালে প্রতিষ্ঠিত একটি শীর্ষমানের অনলাইন গেমিং ও অ্যাফিলিয়েট প্ল্যাটফর্ম। আমরা ক্রিকেট, ফুটবল, টেনিস, লাইভ ক্যাসিনো, টেবিল গেমস এবং স্লটভিত্তিক প্রচারণা ও পার্টনারশিপ সিস্টেম নিয়ে কাজ করি।",
                en: "Founded in 2020, beit365.bet is a top-tier online gaming and affiliate platform in Asia. We focus on betting exchange, live casino, table games, slots, and strong affiliate growth opportunities.",
              },
              order: 1,
              isActive: true,
            },
            {
              question: {
                bn: "beit365.bet অ্যাফিলিয়েট প্রোগ্রাম কী?",
                en: "What is the beit365.bet Affiliate Program?",
              },
              answer: {
                bn: "এটি এমন একটি প্রোগ্রাম যেখানে তুমি তোমার রেফারেল লিংক ব্যবহার করে নতুন ব্যবহারকারী আনতে পারবে এবং তাদের কার্যক্রমের উপর কমিশন উপার্জন করতে পারবে।",
                en: "The beit365.bet Affiliate Program allows partners to earn commission by referring new users through their unique tracking links and promotional materials.",
              },
              order: 2,
              isActive: true,
            },
            {
              question: {
                bn: "আমি কি আপনাদের বিশ্বাস করতে পারি?",
                en: "Can I trust you?",
              },
              answer: {
                bn: "আমরা স্বচ্ছ ট্র্যাকিং, নির্ভরযোগ্য কমিশন স্ট্রাকচার, রিপোর্টিং সিস্টেম এবং দ্রুত সাপোর্ট দেওয়ার চেষ্টা করি যাতে পার্টনাররা নিরাপদে কাজ করতে পারেন।",
                en: "We aim to provide transparent reporting, dependable tracking, fair commission structures, and responsive support so our partners can work with confidence.",
              },
              order: 3,
              isActive: true,
            },
            {
              question: {
                bn: "অ্যাফিলিয়েট প্রোগ্রামের সুবিধা কী?",
                en: "What is the advantage of the beit365.bet Affiliate Program?",
              },
              answer: {
                bn: "উচ্চ কমিশন, রিয়েল-টাইম রিপোর্ট, মার্কেটিং ব্যানার, নিয়মিত ক্যাম্পেইন, এবং ডেডিকেটেড সাপোর্ট—এই সবকিছুই আমাদের প্রোগ্রামের মূল সুবিধা।",
                en: "The program offers competitive commission rates, campaign materials, performance tracking, dedicated support, and frequent promotional opportunities.",
              },
              order: 4,
              isActive: true,
            },
          ],
        },

        {
          tabKey: "account",
          label: { bn: "Account", en: "Account" },
          order: 2,
          isActive: true,
          items: [
            {
              question: {
                bn: "আমি কীভাবে অ্যাফিলিয়েট হব?",
                en: "How do I become an affiliate?",
              },
              answer: {
                bn: "রেজিস্ট্রেশন পেজে গিয়ে তোমার তথ্য দিয়ে সাইন আপ করলেই অ্যাফিলিয়েট অ্যাকাউন্ট খোলা যাবে। অ্যাকাউন্ট ভেরিফিকেশনের পর তুমি তোমার রেফারেল টুলস ব্যবহার করতে পারবে।",
                en: "You can become an affiliate by signing up through the registration page, submitting the required information, and completing account approval if needed.",
              },
              order: 1,
              isActive: true,
            },
            {
              question: {
                bn: "প্রোগ্রামে যোগ দিতে কি ফ্রি?",
                en: "Is the program free to join?",
              },
              answer: {
                bn: "হ্যাঁ, আমাদের অ্যাফিলিয়েট প্রোগ্রামে যোগ দেওয়া সম্পূর্ণ ফ্রি। কোনো সাইন আপ ফি নেই।",
                en: "Yes, joining the affiliate program is completely free. There are no registration charges for becoming a partner.",
              },
              order: 2,
              isActive: true,
            },
            {
              question: {
                bn: "আমার অ্যাকাউন্ট ভেরিফাই করতে কী লাগবে?",
                en: "What do I need to verify my account?",
              },
              answer: {
                bn: "সাধারণত তোমার নাম, ইমেইল, ফোন নম্বর এবং কিছু ক্ষেত্রে পরিচয় যাচাইয়ের জন্য ডকুমেন্ট প্রয়োজন হতে পারে।",
                en: "You may need to provide your name, email, phone number, and sometimes identity documents depending on the account review process.",
              },
              order: 3,
              isActive: true,
            },
            {
              question: {
                bn: "আমি কি একাধিক অ্যাকাউন্ট খুলতে পারি?",
                en: "Can I create multiple accounts?",
              },
              answer: {
                bn: "না, সাধারণত একজন ব্যবহারকারীর জন্য একটি অ্যাকাউন্ট অনুমোদিত। একাধিক অ্যাকাউন্ট থাকলে তা নীতিমালার বিরোধী হতে পারে।",
                en: "In most cases, only one account per partner is allowed. Multiple accounts may violate the platform policy.",
              },
              order: 4,
              isActive: true,
            },
          ],
        },

        {
          tabKey: "payment",
          label: { bn: "Payment", en: "Payment" },
          order: 3,
          isActive: true,
          items: [
            {
              question: {
                bn: "পেমেন্ট কীভাবে কাজ করে?",
                en: "How does payment work?",
              },
              answer: {
                bn: "তোমার রেফারকৃত ব্যবহারকারীদের কার্যক্রমের ভিত্তিতে কমিশন গণনা হয় এবং নির্ধারিত পেমেন্ট সাইকেল অনুযায়ী তা তোমার অ্যাকাউন্টে যোগ হয়।",
                en: "Commission is calculated based on the activity of your referred users and added to your account according to the payment cycle defined by the program.",
              },
              order: 1,
              isActive: true,
            },
            {
              question: {
                bn: "কমিশন কবে পাব?",
                en: "When will I receive my commission?",
              },
              answer: {
                bn: "পেমেন্ট সাধারণত সাপ্তাহিক বা মাসিক সাইকেলে প্রসেস করা হয়, তবে সঠিক সময়সীমা তোমার চুক্তি ও অ্যাকাউন্ট সেটিংসের উপর নির্ভর করে।",
                en: "Payments are usually processed on a weekly or monthly schedule, depending on the agreement and your account setup.",
              },
              order: 2,
              isActive: true,
            },
            {
              question: {
                bn: "কোন কোন পেমেন্ট মেথড সাপোর্ট করে?",
                en: "Which payment methods are supported?",
              },
              answer: {
                bn: "ব্যাংক ট্রান্সফার, ই-ওয়ালেট এবং কিছু ক্ষেত্রে ক্রিপ্টো বা লোকাল পেমেন্ট মেথড সাপোর্ট করা হতে পারে।",
                en: "Supported payment methods may include bank transfer, e-wallets, and in some cases local payment options or other approved channels.",
              },
              order: 3,
              isActive: true,
            },
            {
              question: {
                bn: "ন্যূনতম উইথড্র সীমা কত?",
                en: "What is the minimum withdrawal limit?",
              },
              answer: {
                bn: "ন্যূনতম উত্তোলনের পরিমাণ অ্যাকাউন্ট টাইপ বা পেমেন্ট মেথড অনুযায়ী ভিন্ন হতে পারে। সঠিক তথ্য ড্যাশবোর্ডে দেখা যাবে।",
                en: "The minimum withdrawal amount can vary depending on the payment method or account type. You can check the exact amount in your dashboard.",
              },
              order: 4,
              isActive: true,
            },
          ],
        },

        {
          tabKey: "jackpot",
          label: { bn: "Jackpot Cost", en: "Jackpot Cost" },
          order: 4,
          isActive: true,
          items: [
            {
              question: {
                bn: "জ্যাকপট কস্ট বলতে কী বোঝায়?",
                en: "What does jackpot cost mean?",
              },
              answer: {
                bn: "জ্যাকপট কস্ট হলো বিশেষ প্রোমোশন বা জ্যাকপটভিত্তিক অফারের জন্য নির্ধারিত খরচ, যা নির্দিষ্ট ক্যাম্পেইনের হিসাবের অংশ হিসেবে গণনা করা হয়।",
                en: "Jackpot cost refers to the cost associated with special jackpot promotions or prize pools that may be included in campaign or revenue calculations.",
              },
              order: 1,
              isActive: true,
            },
            {
              question: {
                bn: "জ্যাকপট কস্ট কি কমিশনে প্রভাব ফেলে?",
                en: "Does jackpot cost affect commission?",
              },
              answer: {
                bn: "হ্যাঁ, কিছু ক্ষেত্রে জ্যাকপট কস্ট নেট রেভিনিউ বা কমিশন ক্যালকুলেশনের অংশ হিসেবে বিবেচিত হতে পারে।",
                en: "Yes, in some cases jackpot cost may be factored into net revenue calculations, which can influence commission results.",
              },
              order: 2,
              isActive: true,
            },
            {
              question: {
                bn: "জ্যাকপট কস্ট কোথায় দেখতে পারব?",
                en: "Where can I see jackpot cost details?",
              },
              answer: {
                bn: "তোমার অ্যাফিলিয়েট ড্যাশবোর্ডের রিপোর্ট বা ফিন্যান্স সেকশনে জ্যাকপট-সম্পর্কিত তথ্য দেখতে পারবে।",
                en: "You can usually find jackpot-related financial details in the reporting or finance section of your affiliate dashboard.",
              },
              order: 3,
              isActive: true,
            },
            {
              question: {
                bn: "সব ক্যাম্পেইনে কি জ্যাকপট কস্ট থাকে?",
                en: "Does every campaign include jackpot cost?",
              },
              answer: {
                bn: "না, সব ক্যাম্পেইনে জ্যাকপট কস্ট থাকে না। এটি নির্ভর করে নির্দিষ্ট অফার, গেম এবং প্রোমোশনের ধরন অনুযায়ী।",
                en: "No, jackpot cost does not apply to every campaign. It depends on the promotion structure and the type of offer involved.",
              },
              order: 4,
              isActive: true,
            },
          ],
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

    data.tabs = (data.tabs || [])
      .filter((tab) => tab.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((tab) => ({
        ...tab,
        items: (tab.items || [])
          .filter((item) => item.isActive !== false)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
      }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get FAQ Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ content",
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
    console.error("Admin Get FAQ Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ content",
    });
  }
});

/* ============================= UPDATE SECTION STATUS ============================= */

router.put("/admin", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const { isActive } = req.body;

    if (typeof isActive !== "undefined") {
      doc.isActive = isActive === "true" || isActive === true;
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "FAQ section updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update FAQ Section Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update FAQ section",
    });
  }
});

/* ============================= CREATE TAB ============================= */

router.post("/admin/tabs", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const { tabKey, labelBn, labelEn, order, isActive } = req.body;

    if (!tabKey) {
      return res.status(400).json({
        success: false,
        message: "Tab key is required",
      });
    }

    const cleanKey = String(tabKey).trim().toLowerCase();

    const exists = doc.tabs.some((tab) => tab.tabKey === cleanKey);

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Tab key already exists",
      });
    }

    doc.tabs.push({
      tabKey: cleanKey,
      label: {
        bn: labelBn || "",
        en: labelEn || "",
      },
      order: Number(order || doc.tabs.length + 1),
      isActive: isActive !== "false",
      items: [],
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "FAQ tab created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create FAQ Tab Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create FAQ tab",
    });
  }
});

/* ============================= UPDATE TAB ============================= */

router.put("/admin/tabs/:tabId", async (req, res) => {
  try {
    const { tabId } = req.params;
    const doc = await createDefaultDoc();

    const tab = doc.tabs.id(tabId);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: "FAQ tab not found",
      });
    }

    const { tabKey, labelBn, labelEn, order, isActive } = req.body;

    if (tabKey) {
      const cleanKey = String(tabKey).trim().toLowerCase();

      const exists = doc.tabs.some(
        (item) => item._id.toString() !== tabId && item.tabKey === cleanKey,
      );

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Tab key already exists",
        });
      }

      tab.tabKey = cleanKey;
    }

    tab.label = {
      bn: labelBn || "",
      en: labelEn || "",
    };

    tab.order = Number(order || 0);
    tab.isActive = isActive !== "false";

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "FAQ tab updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update FAQ Tab Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update FAQ tab",
    });
  }
});

/* ============================= DELETE TAB ============================= */

router.delete("/admin/tabs/:tabId", async (req, res) => {
  try {
    const { tabId } = req.params;
    const doc = await createDefaultDoc();

    const tab = doc.tabs.id(tabId);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: "FAQ tab not found",
      });
    }

    tab.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "FAQ tab deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete FAQ Tab Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ tab",
    });
  }
});

/* ============================= CREATE ITEM ============================= */

router.post("/admin/tabs/:tabId/items", async (req, res) => {
  try {
    const { tabId } = req.params;
    const doc = await createDefaultDoc();

    const tab = doc.tabs.id(tabId);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: "FAQ tab not found",
      });
    }

    const {
      questionBn,
      questionEn,
      answerBn,
      answerEn,
      order,
      isActive,
    } = req.body;

    tab.items.push({
      question: {
        bn: questionBn || "",
        en: questionEn || "",
      },
      answer: {
        bn: answerBn || "",
        en: answerEn || "",
      },
      order: Number(order || tab.items.length + 1),
      isActive: isActive !== "false",
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "FAQ item created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create FAQ Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create FAQ item",
    });
  }
});

/* ============================= UPDATE ITEM ============================= */

router.put("/admin/tabs/:tabId/items/:itemId", async (req, res) => {
  try {
    const { tabId, itemId } = req.params;
    const doc = await createDefaultDoc();

    const tab = doc.tabs.id(tabId);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: "FAQ tab not found",
      });
    }

    const item = tab.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "FAQ item not found",
      });
    }

    const {
      questionBn,
      questionEn,
      answerBn,
      answerEn,
      order,
      isActive,
    } = req.body;

    item.question = {
      bn: questionBn || "",
      en: questionEn || "",
    };

    item.answer = {
      bn: answerBn || "",
      en: answerEn || "",
    };

    item.order = Number(order || 0);
    item.isActive = isActive !== "false";

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "FAQ item updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update FAQ Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update FAQ item",
    });
  }
});

/* ============================= DELETE ITEM ============================= */

router.delete("/admin/tabs/:tabId/items/:itemId", async (req, res) => {
  try {
    const { tabId, itemId } = req.params;
    const doc = await createDefaultDoc();

    const tab = doc.tabs.id(tabId);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: "FAQ tab not found",
      });
    }

    const item = tab.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "FAQ item not found",
      });
    }

    item.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "FAQ item deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete FAQ Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ item",
    });
  }
});

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffFaqContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "FAQ content not found",
      });
    }

    await AffFaqContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "FAQ content deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ Content Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ content",
    });
  }
});

export default router;