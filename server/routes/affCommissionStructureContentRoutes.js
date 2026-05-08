import express from "express";
import AffCommissionStructureContent from "../models/AffCommissionStructureContent.js";

const router = express.Router();

const createDefaultDoc = async () => {
  let doc = await AffCommissionStructureContent.findOne();

  if (!doc) {
    doc = await AffCommissionStructureContent.create({
      isActive: true,

      title: {
        bn: "কমিশন স্ট্রাকচার",
        en: "COMMISSION STRUCTURE",
      },

      headers: {
        recruit: {
          bn: "অ্যাফিলিয়েট রিক্রুট",
          en: "AFFILIATE RECRUIT",
        },
        winLoss: {
          bn: "জয়/ক্ষতি",
          en: "WIN/LOSS",
        },
        deduction: {
          bn: "কর্তন",
          en: "DEDUCTION",
        },
        bonus: {
          bn: "বোনাস",
          en: "BONUS",
        },
        paymentFee: {
          bn: "পেমেন্ট ফি",
          en: "PAYMENT FEE",
        },
        commission: {
          bn: "কমিশন",
          en: "COMMISSION",
        },
      },

      players: [
        {
          name: { bn: "প্লেয়ার A", en: "Player A" },
          winLoss: "1,000,000",
          deduction: "180,000",
          bonus: "20,000",
          paymentFee: "40,000",
          commission: "-",
          negative: false,
          order: 1,
          isActive: true,
        },
        {
          name: { bn: "প্লেয়ার B", en: "Player B" },
          winLoss: "-300,000",
          deduction: "0",
          bonus: "25,000",
          paymentFee: "12,000",
          commission: "-",
          negative: true,
          order: 2,
          isActive: true,
        },
        {
          name: { bn: "প্লেয়ার C", en: "Player C" },
          winLoss: "-500,000",
          deduction: "0",
          bonus: "10,000",
          paymentFee: "20,000",
          commission: "-",
          negative: true,
          order: 3,
          isActive: true,
        },
        {
          name: { bn: "প্লেয়ার D", en: "Player D" },
          winLoss: "1,500,000",
          deduction: "270,000",
          bonus: "40,000",
          paymentFee: "60,000",
          commission: "-",
          negative: false,
          order: 4,
          isActive: true,
        },
        {
          name: { bn: "প্লেয়ার E", en: "Player E" },
          winLoss: "2,700,000",
          deduction: "486,000",
          bonus: "10,000",
          paymentFee: "108,000",
          commission: "-",
          negative: false,
          order: 5,
          isActive: true,
        },
      ],

      totals: {
        label: {
          bn: "মোট",
          en: "TOTAL",
        },
        winLoss: "4,400,000",
        deduction: "936,000",
        bonus: "105,000",
        paymentFee: "240,000",
        commission: "1,247,600",
      },
    });
  }

  return doc;
};

/* ============================= PUBLIC GET ============================= */

router.get("/", async (req, res) => {
  try {
    const doc = await createDefaultDoc();
    const data = doc.toObject();

    data.players = (data.players || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Commission Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commission structure content",
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
    console.error("Admin Get Commission Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch commission structure content",
    });
  }
});

/* ============================= UPDATE SECTION ============================= */

router.put("/admin", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      titleBn,
      titleEn,

      recruitHeaderBn,
      recruitHeaderEn,
      winLossHeaderBn,
      winLossHeaderEn,
      deductionHeaderBn,
      deductionHeaderEn,
      bonusHeaderBn,
      bonusHeaderEn,
      paymentFeeHeaderBn,
      paymentFeeHeaderEn,
      commissionHeaderBn,
      commissionHeaderEn,

      totalLabelBn,
      totalLabelEn,
      totalWinLoss,
      totalDeduction,
      totalBonus,
      totalPaymentFee,
      totalCommission,

      isActive,
    } = req.body;

    doc.title = {
      bn: titleBn || "",
      en: titleEn || "",
    };

    doc.headers = {
      recruit: {
        bn: recruitHeaderBn || "",
        en: recruitHeaderEn || "",
      },
      winLoss: {
        bn: winLossHeaderBn || "",
        en: winLossHeaderEn || "",
      },
      deduction: {
        bn: deductionHeaderBn || "",
        en: deductionHeaderEn || "",
      },
      bonus: {
        bn: bonusHeaderBn || "",
        en: bonusHeaderEn || "",
      },
      paymentFee: {
        bn: paymentFeeHeaderBn || "",
        en: paymentFeeHeaderEn || "",
      },
      commission: {
        bn: commissionHeaderBn || "",
        en: commissionHeaderEn || "",
      },
    };

    doc.totals = {
      label: {
        bn: totalLabelBn || "",
        en: totalLabelEn || "",
      },
      winLoss: totalWinLoss || "",
      deduction: totalDeduction || "",
      bonus: totalBonus || "",
      paymentFee: totalPaymentFee || "",
      commission: totalCommission || "",
    };

    if (typeof isActive !== "undefined") {
      doc.isActive = isActive === "true" || isActive === true;
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Commission structure updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update Commission Structure Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to update commission structure content",
    });
  }
});

/* ============================= CREATE PLAYER ROW ============================= */

router.post("/admin/players", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      nameBn,
      nameEn,
      winLoss,
      deduction,
      bonus,
      paymentFee,
      commission,
      negative,
      order,
      isActive,
    } = req.body;

    doc.players.push({
      name: {
        bn: nameBn || "",
        en: nameEn || "",
      },
      winLoss: winLoss || "",
      deduction: deduction || "",
      bonus: bonus || "",
      paymentFee: paymentFee || "",
      commission: commission || "-",
      negative: negative === "true" || negative === true,
      order: Number(order || doc.players.length + 1),
      isActive: isActive !== "false",
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Player row created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create Player Row Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create player row",
    });
  }
});

/* ============================= UPDATE PLAYER ROW ============================= */

router.put("/admin/players/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    const doc = await createDefaultDoc();
    const player = doc.players.id(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player row not found",
      });
    }

    const {
      nameBn,
      nameEn,
      winLoss,
      deduction,
      bonus,
      paymentFee,
      commission,
      negative,
      order,
      isActive,
    } = req.body;

    player.name = {
      bn: nameBn || "",
      en: nameEn || "",
    };

    player.winLoss = winLoss || "";
    player.deduction = deduction || "";
    player.bonus = bonus || "";
    player.paymentFee = paymentFee || "";
    player.commission = commission || "-";
    player.negative = negative === "true" || negative === true;
    player.order = Number(order || 0);
    player.isActive = isActive !== "false";

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Player row updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update Player Row Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update player row",
    });
  }
});

/* ============================= DELETE PLAYER ROW ============================= */

router.delete("/admin/players/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params;

    const doc = await createDefaultDoc();
    const player = doc.players.id(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player row not found",
      });
    }

    player.deleteOne();

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Player row deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete Player Row Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete player row",
    });
  }
});

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffCommissionStructureContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Commission structure content not found",
      });
    }

    await AffCommissionStructureContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Commission structure content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Commission Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete commission structure content",
    });
  }
});

export default router;