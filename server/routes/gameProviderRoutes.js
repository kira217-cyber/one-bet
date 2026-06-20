import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import axios from "axios";

import GameProvider from "../models/GameProvider.js";
import GameCategory from "../models/GameCategory.js";
import Game from "../models/Game.js";
import upload from "../config/multer.js";

const router = express.Router();

const ORACLE_PROVIDER_LIST_API =
  process.env.ORACLE_PROVIDER_LIST_API ||
  "https://oraclegames.net/api/providerlist";

const ORACLE_PROVIDER_LIST_KEY =
  process.env.ORACLE_PROVIDER_LIST_KEY ||
  process.env.ORACLE_GAME_DATA_KEY ||
  "";

const providerUpload = upload.fields([
  { name: "providerIcon", maxCount: 1 },
  { name: "providerImage", maxCount: 1 },
]);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value = "") => String(value || "").trim();

const cleanProviderCode = (value = "") => cleanText(value).toUpperCase();

const toBoolean = (value) =>
  value === true || value === "true" || value === "1" || value === 1;

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatProvider = (req, doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    providerCode: obj.providerId,
    providerName: obj.providerId,
    providerIconUrl: obj.providerIcon
      ? buildFileUrl(req, obj.providerIcon)
      : "",
    providerImageUrl: obj.providerImage
      ? buildFileUrl(req, obj.providerImage)
      : "",
  };
};

const deleteLocalFile = (filePath = "") => {
  try {
    if (!filePath) return;
    if (String(filePath).startsWith("http")) return;

    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("FILE DELETE ERROR:", error.message);
  }
};

const deleteUploadedFiles = (files = {}) => {
  const iconFile = files?.providerIcon?.[0];
  const imageFile = files?.providerImage?.[0];

  if (iconFile?.path) deleteLocalFile(iconFile.path);
  if (imageFile?.path) deleteLocalFile(imageFile.path);
};

/* ======================================================
   FETCH ORACLE PROVIDER LIST
   GET /api/game-providers/oracle/list
====================================================== */

router.get("/oracle/list", async (req, res) => {
  try {
    const response = await axios.get(ORACLE_PROVIDER_LIST_API, {
      headers: {
        "x-oraclegamedata-key": ORACLE_PROVIDER_LIST_KEY,
      },
      timeout: 30000,
    });

    const list = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.providers || [];

    const providers = list
      .filter((item) => item?.code && item?.name)
      .map((item) => ({
        providerCode: cleanProviderCode(item.code),
        providerId: cleanProviderCode(item.code),
        providerName: cleanText(item.name),
        image: item.image || "",
        status: item.status || "",
        currency: item.currency || "",
        language: item.language || "",
      }));

    return res.status(200).json({
      success: true,
      message: "Oracle provider list fetched successfully",
      data: providers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch Oracle provider list",
    });
  }
});

/* ======================================================
   SYNC ORACLE PROVIDERS
   POST /api/game-providers/oracle/sync
====================================================== */

router.post("/oracle/sync", async (req, res) => {
  try {
    const { categoryId, providers = [] } = req.body || {};

    if (!categoryId || !isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    const category = await GameCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Game category not found",
      });
    }

    if (!Array.isArray(providers) || providers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Providers array is required",
      });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    const savedProviders = [];

    for (const item of providers) {
      const providerId = cleanProviderCode(
        item.providerId || item.providerCode || item.code,
      );

      if (!providerId) {
        skipped += 1;
        continue;
      }

      const existing = await GameProvider.findOne({
        categoryId,
        providerId,
      });

      if (existing) {
        if (item.image && !existing.providerIcon) {
          existing.providerIcon = item.image;
        }

        if (item.image && !existing.providerImage) {
          existing.providerImage = item.image;
        }

        await existing.save();

        updated += 1;
        savedProviders.push(formatProvider(req, existing));
      } else {
        const provider = await GameProvider.create({
          categoryId,
          providerId,
          providerIcon: item.image || "",
          providerImage: item.image || "",
          isHome: false,
          status: "active",
        });

        created += 1;
        savedProviders.push(formatProvider(req, provider));
      }
    }

    return res.status(200).json({
      success: true,
      message: "Oracle providers synced successfully",
      data: {
        created,
        updated,
        skipped,
        providers: savedProviders,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This provider already exists in this category",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

/* ======================================================
   CREATE PROVIDER
   POST /api/game-providers
====================================================== */

router.post("/", providerUpload, async (req, res) => {
  try {
    const { categoryId, providerId, status, isHome } = req.body || {};

    const iconFile = req.files?.providerIcon?.[0];
    const imageFile = req.files?.providerImage?.[0];

    if (!categoryId || !isValidObjectId(categoryId)) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);

    if (!categoryExists) {
      deleteUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const finalProviderId = cleanProviderCode(providerId);

    const existing = await GameProvider.findOne({
      categoryId,
      providerId: finalProviderId,
    });

    if (existing) {
      deleteUploadedFiles(req.files);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const newProvider = await GameProvider.create({
      categoryId,
      providerId: finalProviderId,
      providerIcon: iconFile ? iconFile.path : "",
      providerImage: imageFile ? imageFile.path : "",
      isHome: toBoolean(isHome),
      status: status === "inactive" ? "inactive" : "active",
    });

    const populated = await GameProvider.findById(newProvider._id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    return res.status(201).json({
      success: true,
      message: "Provider added successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    deleteUploadedFiles(req.files);

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This provider already exists in this category",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add provider",
      error: error.message,
    });
  }
});

/* ======================================================
   GET PROVIDERS
   GET /api/game-providers
====================================================== */

router.get("/", async (req, res) => {
  try {
    const {
      categoryId = "",
      status = "",
      isHome = "",
      search = "",
      page = 1,
      limit = 20,
    } = req.query || {};

    const filter = {};

    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      filter.categoryId = categoryId;
    }

    if (status && ["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    if (isHome === "true" || isHome === "false") {
      filter.isHome = isHome === "true";
    }

    if (search) {
      filter.providerId = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 20, 1);
    const skip = (pageNum - 1) * limitNum;

    const [providers, total] = await Promise.all([
      GameProvider.find(filter)
        .populate("categoryId", "categoryName categoryTitle status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      GameProvider.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers.map((item) => formatProvider(req, item)),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
      error: error.message,
    });
  }
});

/* ======================================================
   GET ACTIVE PROVIDERS PUBLIC
   GET /api/game-providers/active/list
====================================================== */

router.get("/active/list", async (req, res) => {
  try {
    const { categoryId = "" } = req.query || {};

    const filter = { status: "active" };

    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      filter.categoryId = categoryId;
    }

    const providers = await GameProvider.find(filter)
      .populate("categoryId", "categoryName categoryTitle status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers.map((item) => formatProvider(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active providers",
      error: error.message,
    });
  }
});

/* ======================================================
   GET SINGLE PROVIDER
   GET /api/game-providers/:id
====================================================== */

router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider id",
      });
    }

    const provider = await GameProvider.findById(req.params.id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatProvider(req, provider),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch provider",
      error: error.message,
    });
  }
});

/* ======================================================
   UPDATE PROVIDER
   PUT /api/game-providers/:id
====================================================== */

router.put("/:id", providerUpload, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Invalid provider id",
      });
    }

    const provider = await GameProvider.findById(req.params.id);

    const iconFile = req.files?.providerIcon?.[0];
    const imageFile = req.files?.providerImage?.[0];

    if (!provider) {
      deleteUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const {
      categoryId,
      providerId,
      status,
      isHome,
      removeOldIcon,
      removeOldImage,
    } = req.body || {};

    if (!categoryId || !isValidObjectId(categoryId)) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerId?.trim()) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "providerId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);

    if (!categoryExists) {
      deleteUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const finalProviderId = cleanProviderCode(providerId);

    const duplicate = await GameProvider.findOne({
      _id: { $ne: provider._id },
      categoryId,
      providerId: finalProviderId,
    });

    if (duplicate) {
      deleteUploadedFiles(req.files);
      return res.status(409).json({
        success: false,
        message: "This provider already exists in the selected category",
      });
    }

    const oldIconPath = provider.providerIcon;
    const oldImagePath = provider.providerImage;

    provider.categoryId = categoryId;
    provider.providerId = finalProviderId;
    provider.status = status === "inactive" ? "inactive" : "active";
    provider.isHome = toBoolean(isHome);

    if (iconFile) {
      provider.providerIcon = iconFile.path;
    } else if (removeOldIcon === "true") {
      provider.providerIcon = "";
    }

    if (imageFile) {
      provider.providerImage = imageFile.path;
    } else if (removeOldImage === "true") {
      provider.providerImage = "";
    }

    await provider.save();

    if (iconFile && oldIconPath) deleteLocalFile(oldIconPath);
    if (imageFile && oldImagePath) deleteLocalFile(oldImagePath);

    if (removeOldIcon === "true" && !iconFile && oldIconPath) {
      deleteLocalFile(oldIconPath);
    }

    if (removeOldImage === "true" && !imageFile && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    const populated = await GameProvider.findById(provider._id).populate(
      "categoryId",
      "categoryName categoryTitle status",
    );

    return res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      data: formatProvider(req, populated),
    });
  } catch (error) {
    deleteUploadedFiles(req.files);

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This provider already exists in this category",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update provider",
      error: error.message,
    });
  }
});

/* ======================================================
   DELETE PROVIDER
   DELETE /api/game-providers/:id
====================================================== */

router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider id",
      });
    }

    const provider = await GameProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const oldIconPath = provider.providerIcon;
    const oldImagePath = provider.providerImage;

    let deletedGames = { deletedCount: 0 };

    try {
      deletedGames = await Game.deleteMany({
        $or: [
          { providerDbId: provider._id },
          { providerId: provider.providerId },
          { providerCode: provider.providerId },
        ],
      });
    } catch {
      deletedGames = { deletedCount: 0 };
    }

    await GameProvider.findByIdAndDelete(provider._id);

    if (oldIconPath) deleteLocalFile(oldIconPath);
    if (oldImagePath) deleteLocalFile(oldImagePath);

    return res.status(200).json({
      success: true,
      message: "Provider deleted successfully",
      data: {
        providerId: provider._id,
        deletedGames: deletedGames?.deletedCount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete provider",
      error: error.message,
    });
  }
});

export default router;
