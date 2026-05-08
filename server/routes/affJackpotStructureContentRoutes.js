import express from "express";
import AffJackpotStructureContent from "../models/AffJackpotStructureContent.js";

const router = express.Router();

const createDefaultDoc = async () => {
  let doc = await AffJackpotStructureContent.findOne();

  if (!doc) {
    doc = await AffJackpotStructureContent.create({
      isActive: true,

      footerTitle: {
        bn: "জ্যাকপট কস্ট",
        en: "JACKPOT COST",
      },

      footerText: {
        bn: "আরও জানতে বা অতিরিক্ত তথ্যের প্রয়োজন হলে, পাশের বাটনে ক্লিক করো!",
        en: "If you're interested in learning more or need further information, click the button beside!",
      },

      buttonText: {
        bn: "আরও জানুন",
        en: "FIND OUT MORE",
      },

      scenarios: [
        {
          scenarioKey: "A",
          title: {
            bn: "SCENARIO A",
            en: "SCENARIO A",
          },
          subtitle: {
            bn: "If the player didn't win the Jackpot",
            en: "If the player didn't win the Jackpot",
          },
          smallTitle: {
            bn: "JACKPOT COST CALCULATION:",
            en: "JACKPOT COST CALCULATION:",
          },
          smallRows: [
            {
              label: {
                bn: "PROGRESSIVE SHARE",
                en: "PROGRESSIVE SHARE",
              },
              value: "5,000 BDT",
              colorType: "white",
              order: 1,
            },
            {
              label: {
                bn: "(-) PROGRESSIVE WIN",
                en: "(-) PROGRESSIVE WIN",
              },
              value: "0 BDT",
              colorType: "white",
              order: 2,
            },
          ],
          jackpotCostLabel: {
            bn: "JACKPOT COST",
            en: "JACKPOT COST",
          },
          jackpotCost: "5,000 BDT",
          jackpotCostColorType: "red",

          calcTitle: {
            bn: "CALCULATION:",
            en: "CALCULATION:",
          },
          calcRows: [
            {
              label: {
                bn: "PROFIT & LOSS",
                en: "PROFIT & LOSS",
              },
              value: "500,000 BDT",
              colorType: "white",
              order: 1,
            },
            {
              label: {
                bn: "(-) JACKPOT COST",
                en: "(-) JACKPOT COST",
              },
              value: "5,000 BDT",
              colorType: "red",
              order: 2,
            },
            {
              label: {
                bn: "NEW PROFIT & LOSS",
                en: "NEW PROFIT & LOSS",
              },
              value: "495,000 BDT",
              colorType: "white",
              order: 3,
            },
            {
              label: {
                bn: "(-) DEDUCTION (18%)",
                en: "(-) DEDUCTION (18%)",
              },
              value: "89,100 BDT",
              colorType: "white",
              order: 4,
            },
            {
              label: {
                bn: "(-) BONUS",
                en: "(-) BONUS",
              },
              value: "15,000 BDT",
              colorType: "white",
              order: 5,
            },
            {
              label: {
                bn: "(-) PAYMENT FEE",
                en: "(-) PAYMENT FEE",
              },
              value: "9,900 BDT",
              colorType: "white",
              order: 6,
            },
          ],

          netProfitLabel: {
            bn: "NET PROFIT",
            en: "NET PROFIT",
          },
          netProfit: "381,000 BDT",

          affiliateTitle: {
            bn: "AFFILIATE COMMISSION 40%",
            en: "AFFILIATE COMMISSION 40%",
          },
          affiliateValue: "152,400 BDT",

          descriptionTitle: {
            bn: "AFFILIATE A",
            en: "AFFILIATE A",
          },
          description: {
            bn: "The affiliate commission is calculated by first subtracting the Jackpot Cost (5,000) from the initial Profit & Loss of 500,000, resulting in an adjusted Profit & Loss amount of 495,000. This adjusted amount is then further reduced by an 18% deduction (89,100), a bonus (15,000), and a payment fee (9,900) to arrive at the final Net Profit of 381,000. The commission is 40% of this Net Profit, totaling 152,400.",
            en: "The affiliate commission is calculated by first subtracting the Jackpot Cost (5,000) from the initial Profit & Loss of 500,000, resulting in an adjusted Profit & Loss amount of 495,000. This adjusted amount is then further reduced by an 18% deduction (89,100), a bonus (15,000), and a payment fee (9,900) to arrive at the final Net Profit of 381,000. The commission is 40% of this Net Profit, totaling 152,400.",
          },

          order: 1,
          isActive: true,
        },

        {
          scenarioKey: "B",
          title: {
            bn: "SCENARIO B",
            en: "SCENARIO B",
          },
          subtitle: {
            bn: "If the player won the Jackpot",
            en: "If the player won the Jackpot",
          },
          smallTitle: {
            bn: "JACKPOT COST CALCULATION:",
            en: "JACKPOT COST CALCULATION:",
          },
          smallRows: [
            {
              label: {
                bn: "PROGRESSIVE SHARE",
                en: "PROGRESSIVE SHARE",
              },
              value: "5,000 BDT",
              colorType: "white",
              order: 1,
            },
            {
              label: {
                bn: "(-) PROGRESSIVE WIN",
                en: "(-) PROGRESSIVE WIN",
              },
              value: "1,000,000 BDT",
              colorType: "red",
              order: 2,
            },
          ],
          jackpotCostLabel: {
            bn: "JACKPOT COST",
            en: "JACKPOT COST",
          },
          jackpotCost: "(995,000) BDT",
          jackpotCostColorType: "green",

          calcTitle: {
            bn: "CALCULATION:",
            en: "CALCULATION:",
          },
          calcRows: [
            {
              label: {
                bn: "PROFIT & LOSS",
                en: "PROFIT & LOSS",
              },
              value: "495,000 BDT",
              colorType: "red",
              order: 1,
            },
            {
              label: {
                bn: "(-) JACKPOT COST",
                en: "(-) JACKPOT COST",
              },
              value: "(995,000) BDT",
              colorType: "green",
              order: 2,
            },
            {
              label: {
                bn: "NEW PROFIT & LOSS",
                en: "NEW PROFIT & LOSS",
              },
              value: "500,000 BDT",
              colorType: "white",
              order: 3,
            },
            {
              label: {
                bn: "(-) DEDUCTION (18%)",
                en: "(-) DEDUCTION (18%)",
              },
              value: "90,000 BDT",
              colorType: "white",
              order: 4,
            },
            {
              label: {
                bn: "(-) BONUS",
                en: "(-) BONUS",
              },
              value: "15,000 BDT",
              colorType: "white",
              order: 5,
            },
            {
              label: {
                bn: "(-) PAYMENT FEE",
                en: "(-) PAYMENT FEE",
              },
              value: "9,900 BDT",
              colorType: "white",
              order: 6,
            },
          ],

          netProfitLabel: {
            bn: "NET PROFIT",
            en: "NET PROFIT",
          },
          netProfit: "385,100 BDT",

          affiliateTitle: {
            bn: "AFFILIATE COMMISSION 40%",
            en: "AFFILIATE COMMISSION 40%",
          },
          affiliateValue: "154,040 BDT",

          descriptionTitle: {
            bn: "AFFILIATE B",
            en: "AFFILIATE B",
          },
          description: {
            bn: "The affiliate commission is calculated by first subtracting the Jackpot Cost of (995,000) from the initial Profit & Loss of 495,000. Since subtracting a negative number is equivalent to adding, this results in a New Profit & Loss of 500,000. Once the adjusted Profit & Loss is then reduced by a deduction of (90,000), followed by a bonus of (15,000), and a payment fee of (9,900), leading to a final Net Profit of 385,100. The affiliate commission, which is 40% of this Net Profit, totals 154,040.",
            en: "The affiliate commission is calculated by first subtracting the Jackpot Cost of (995,000) from the initial Profit & Loss of 495,000. Since subtracting a negative number is equivalent to adding, this results in a New Profit & Loss of 500,000. Once the adjusted Profit & Loss is then reduced by a deduction of (90,000), followed by a bonus of (15,000), and a payment fee of (9,900), leading to a final Net Profit of 385,100. The affiliate commission, which is 40% of this Net Profit, totals 154,040.",
          },

          order: 2,
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

    data.scenarios = (data.scenarios || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((scenario) => ({
        ...scenario,
        smallRows: (scenario.smallRows || []).sort(
          (a, b) => Number(a.order || 0) - Number(b.order || 0),
        ),
        calcRows: (scenario.calcRows || []).sort(
          (a, b) => Number(a.order || 0) - Number(b.order || 0),
        ),
      }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Jackpot Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jackpot structure content",
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
    console.error("Admin Get Jackpot Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jackpot structure content",
    });
  }
});

/* ============================= UPDATE SECTION ============================= */

router.put("/admin", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      footerTitleBn,
      footerTitleEn,
      footerTextBn,
      footerTextEn,
      buttonTextBn,
      buttonTextEn,
      isActive,
    } = req.body;

    doc.footerTitle = {
      bn: footerTitleBn || "",
      en: footerTitleEn || "",
    };

    doc.footerText = {
      bn: footerTextBn || "",
      en: footerTextEn || "",
    };

    doc.buttonText = {
      bn: buttonTextBn || "",
      en: buttonTextEn || "",
    };

    if (typeof isActive !== "undefined") {
      doc.isActive = isActive === "true" || isActive === true;
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Jackpot structure section updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update Jackpot Structure Section Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to update jackpot structure section",
    });
  }
});

/* ============================= CREATE SCENARIO ============================= */

router.post("/admin/scenarios", async (req, res) => {
  try {
    const doc = await createDefaultDoc();

    const {
      scenarioKey,

      titleBn,
      titleEn,
      subtitleBn,
      subtitleEn,

      smallTitleBn,
      smallTitleEn,

      jackpotCostLabelBn,
      jackpotCostLabelEn,
      jackpotCost,
      jackpotCostColorType,

      calcTitleBn,
      calcTitleEn,

      netProfitLabelBn,
      netProfitLabelEn,
      netProfit,

      affiliateTitleBn,
      affiliateTitleEn,
      affiliateValue,

      descriptionTitleBn,
      descriptionTitleEn,
      descriptionBn,
      descriptionEn,

      order,
      isActive,
    } = req.body;

    doc.scenarios.push({
      scenarioKey: scenarioKey || "",
      title: { bn: titleBn || "", en: titleEn || "" },
      subtitle: { bn: subtitleBn || "", en: subtitleEn || "" },
      smallTitle: { bn: smallTitleBn || "", en: smallTitleEn || "" },
      smallRows: [],
      jackpotCostLabel: {
        bn: jackpotCostLabelBn || "",
        en: jackpotCostLabelEn || "",
      },
      jackpotCost: jackpotCost || "",
      jackpotCostColorType: jackpotCostColorType || "red",
      calcTitle: { bn: calcTitleBn || "", en: calcTitleEn || "" },
      calcRows: [],
      netProfitLabel: {
        bn: netProfitLabelBn || "",
        en: netProfitLabelEn || "",
      },
      netProfit: netProfit || "",
      affiliateTitle: {
        bn: affiliateTitleBn || "",
        en: affiliateTitleEn || "",
      },
      affiliateValue: affiliateValue || "",
      descriptionTitle: {
        bn: descriptionTitleBn || "",
        en: descriptionTitleEn || "",
      },
      description: {
        bn: descriptionBn || "",
        en: descriptionEn || "",
      },
      order: Number(order || doc.scenarios.length + 1),
      isActive: isActive !== "false",
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Scenario created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create Scenario Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create scenario",
    });
  }
});

/* ============================= UPDATE SCENARIO ============================= */

router.put("/admin/scenarios/:scenarioId", async (req, res) => {
  try {
    const { scenarioId } = req.params;

    const doc = await createDefaultDoc();
    const scenario = doc.scenarios.id(scenarioId);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    const {
      scenarioKey,

      titleBn,
      titleEn,
      subtitleBn,
      subtitleEn,

      smallTitleBn,
      smallTitleEn,

      jackpotCostLabelBn,
      jackpotCostLabelEn,
      jackpotCost,
      jackpotCostColorType,

      calcTitleBn,
      calcTitleEn,

      netProfitLabelBn,
      netProfitLabelEn,
      netProfit,

      affiliateTitleBn,
      affiliateTitleEn,
      affiliateValue,

      descriptionTitleBn,
      descriptionTitleEn,
      descriptionBn,
      descriptionEn,

      order,
      isActive,
    } = req.body;

    scenario.scenarioKey = scenarioKey || "";
    scenario.title = { bn: titleBn || "", en: titleEn || "" };
    scenario.subtitle = { bn: subtitleBn || "", en: subtitleEn || "" };
    scenario.smallTitle = {
      bn: smallTitleBn || "",
      en: smallTitleEn || "",
    };
    scenario.jackpotCostLabel = {
      bn: jackpotCostLabelBn || "",
      en: jackpotCostLabelEn || "",
    };
    scenario.jackpotCost = jackpotCost || "";
    scenario.jackpotCostColorType = jackpotCostColorType || "red";
    scenario.calcTitle = { bn: calcTitleBn || "", en: calcTitleEn || "" };
    scenario.netProfitLabel = {
      bn: netProfitLabelBn || "",
      en: netProfitLabelEn || "",
    };
    scenario.netProfit = netProfit || "";
    scenario.affiliateTitle = {
      bn: affiliateTitleBn || "",
      en: affiliateTitleEn || "",
    };
    scenario.affiliateValue = affiliateValue || "";
    scenario.descriptionTitle = {
      bn: descriptionTitleBn || "",
      en: descriptionTitleEn || "",
    };
    scenario.description = { bn: descriptionBn || "", en: descriptionEn || "" };
    scenario.order = Number(order || 0);
    scenario.isActive = isActive !== "false";

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Scenario updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Update Scenario Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update scenario",
    });
  }
});

/* ============================= DELETE SCENARIO ============================= */

router.delete("/admin/scenarios/:scenarioId", async (req, res) => {
  try {
    const { scenarioId } = req.params;

    const doc = await createDefaultDoc();
    const scenario = doc.scenarios.id(scenarioId);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    scenario.deleteOne();
    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Scenario deleted successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Delete Scenario Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete scenario",
    });
  }
});

/* ============================= CREATE SMALL ROW ============================= */

router.post("/admin/scenarios/:scenarioId/small-rows", async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const doc = await createDefaultDoc();
    const scenario = doc.scenarios.id(scenarioId);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    const { labelBn, labelEn, value, colorType, order } = req.body;

    scenario.smallRows.push({
      label: { bn: labelBn || "", en: labelEn || "" },
      value: value || "",
      colorType: colorType || "white",
      order: Number(order || scenario.smallRows.length + 1),
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Small row created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create Small Row Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create small row",
    });
  }
});

/* ============================= UPDATE SMALL ROW ============================= */

router.put(
  "/admin/scenarios/:scenarioId/small-rows/:rowId",
  async (req, res) => {
    try {
      const { scenarioId, rowId } = req.params;
      const doc = await createDefaultDoc();
      const scenario = doc.scenarios.id(scenarioId);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: "Scenario not found",
        });
      }

      const row = scenario.smallRows.id(rowId);

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Small row not found",
        });
      }

      const { labelBn, labelEn, value, colorType, order } = req.body;

      row.label = { bn: labelBn || "", en: labelEn || "" };
      row.value = value || "";
      row.colorType = colorType || "white";
      row.order = Number(order || 0);

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Small row updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Small Row Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update small row",
      });
    }
  },
);

/* ============================= DELETE SMALL ROW ============================= */

router.delete(
  "/admin/scenarios/:scenarioId/small-rows/:rowId",
  async (req, res) => {
    try {
      const { scenarioId, rowId } = req.params;
      const doc = await createDefaultDoc();
      const scenario = doc.scenarios.id(scenarioId);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: "Scenario not found",
        });
      }

      const row = scenario.smallRows.id(rowId);

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Small row not found",
        });
      }

      row.deleteOne();
      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Small row deleted successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Delete Small Row Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete small row",
      });
    }
  },
);

/* ============================= CREATE CALC ROW ============================= */

router.post("/admin/scenarios/:scenarioId/calc-rows", async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const doc = await createDefaultDoc();
    const scenario = doc.scenarios.id(scenarioId);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }

    const { labelBn, labelEn, value, colorType, order } = req.body;

    scenario.calcRows.push({
      label: { bn: labelBn || "", en: labelEn || "" },
      value: value || "",
      colorType: colorType || "white",
      order: Number(order || scenario.calcRows.length + 1),
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Calculation row created successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Create Calc Row Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create calculation row",
    });
  }
});

/* ============================= UPDATE CALC ROW ============================= */

router.put(
  "/admin/scenarios/:scenarioId/calc-rows/:rowId",
  async (req, res) => {
    try {
      const { scenarioId, rowId } = req.params;
      const doc = await createDefaultDoc();
      const scenario = doc.scenarios.id(scenarioId);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: "Scenario not found",
        });
      }

      const row = scenario.calcRows.id(rowId);

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Calculation row not found",
        });
      }

      const { labelBn, labelEn, value, colorType, order } = req.body;

      row.label = { bn: labelBn || "", en: labelEn || "" };
      row.value = value || "";
      row.colorType = colorType || "white";
      row.order = Number(order || 0);

      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Calculation row updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Update Calc Row Error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update calculation row",
      });
    }
  },
);

/* ============================= DELETE CALC ROW ============================= */

router.delete(
  "/admin/scenarios/:scenarioId/calc-rows/:rowId",
  async (req, res) => {
    try {
      const { scenarioId, rowId } = req.params;
      const doc = await createDefaultDoc();
      const scenario = doc.scenarios.id(scenarioId);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: "Scenario not found",
        });
      }

      const row = scenario.calcRows.id(rowId);

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Calculation row not found",
        });
      }

      row.deleteOne();
      await doc.save();

      return res.status(200).json({
        success: true,
        message: "Calculation row deleted successfully",
        data: doc,
      });
    } catch (error) {
      console.error("Delete Calc Row Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete calculation row",
      });
    }
  },
);

/* ============================= DELETE FULL SECTION ============================= */

router.delete("/admin", async (req, res) => {
  try {
    const doc = await AffJackpotStructureContent.findOne();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Jackpot structure content not found",
      });
    }

    await AffJackpotStructureContent.deleteOne({ _id: doc._id });

    return res.status(200).json({
      success: true,
      message: "Jackpot structure content deleted successfully",
    });
  } catch (error) {
    console.error("Delete Jackpot Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete jackpot structure content",
    });
  }
});

export default router;