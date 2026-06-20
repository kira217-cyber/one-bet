import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import axios from "axios";

import Game from "../models/Game.js";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import upload from "../config/multer.js";

const router = express.Router();

const ORACLE_GAME_API_BASE =
  process.env.ORACLE_GAME_API_BASE || "https://oraclegames.net/api/game";

const ORACLE_GAME_DATA_KEY =
  process.env.ORACLE_GAME_DATA_KEY || "1189baca156e1bbbecc3b26651a63565";

const validOracleImageTypes = ["thumbnail", "height", "original"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value = "") => String(value || "").trim();

const cleanProviderCode = (value = "") => cleanText(value).toUpperCase();

const toBool = (value) =>
  value === true || value === "true" || value === "1" || value === 1;

const cleanOracleImageType = (value) => {
  if (validOracleImageTypes.includes(value)) return value;
  return "thumbnail";
};

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = filePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatGame = (req, doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    imageUrl: obj.image ? buildFileUrl(req, obj.image) : "",
  };
};

const deleteLocalFile = (filePath = "") => {
  try {
    if (!filePath) return;
    if (/^https?:\/\//i.test(filePath)) return;

    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("FILE DELETE ERROR:", error.message);
  }
};

const getOracleGameId = (game) => {
  return cleanText(game?.game_uid || game?.gameUId || game?._id || game?.id);
};

const normalizeOracleGames = (payload) => {
  const list = Array.isArray(payload?.games)
    ? payload.games
    : Array.isArray(payload?.data?.games)
      ? payload.data.games
      : Array.isArray(payload)
        ? payload
        : [];

  return list
    .filter((game) => getOracleGameId(game))
    .map((game) => ({
      name: game.name || game.gameName || "",
      game_uid: getOracleGameId(game),
      gameId: getOracleGameId(game),
      provider: game.provider || "",
      category: game.category || "",
      status: game.status,
      original: game.original || game.images?.original || "",
      height: game.height || game.images?.height || "",
      thumbnail: game.thumbnail || game.images?.thumbnail || game.image || "",
      images: {
        original: game.original || game.images?.original || "",
        height: game.height || game.images?.height || "",
        thumbnail: game.thumbnail || game.images?.thumbnail || game.image || "",
      },
      raw: game,
    }));
};

/* ======================================================
   FETCH ORACLE GAMES BY PROVIDER CODE
   GET /api/games/oracle/:providerCode
====================================================== */

router.get("/oracle/:providerCode", async (req, res) => {
  try {
    const providerCode = cleanProviderCode(req.params.providerCode);

    if (!providerCode) {
      return res.status(400).json({
        success: false,
        message: "providerCode is required",
      });
    }

    const response = await axios.get(
      `${ORACLE_GAME_API_BASE}/${providerCode}`,
      {
        headers: {
          "x-oraclegamedata-key": ORACLE_GAME_DATA_KEY,
        },
        timeout: 30000,
      },
    );

    const games = normalizeOracleGames(response.data);

    return res.status(200).json({
      success: true,
      message: "Oracle games fetched successfully",
      data: {
        provider: response.data?.provider || null,
        games,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch Oracle games",
    });
  }
});

/* ======================================================
   CREATE GAME
   POST /api/games
====================================================== */

router.post("/", async (req, res) => {
  try {
    const {
      categoryId,
      providerDbId,
      gameId,
      gameUId,
      oracleImageType,
      status,
      isHot,
      isFavourite,
    } = req.body || {};

    if (!categoryId || !isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required",
      });
    }

    if (!providerDbId || !isValidObjectId(providerDbId)) {
      return res.status(400).json({
        success: false,
        message: "Valid providerDbId is required",
      });
    }

    const finalGameId = cleanText(gameId || gameUId);

    if (!finalGameId) {
      return res.status(400).json({
        success: false,
        message: "gameId is required",
      });
    }

    const categoryExists = await GameCategory.findById(categoryId);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const providerExists = await GameProvider.findOne({
      _id: providerDbId,
      categoryId,
    });

    if (!providerExists) {
      return res.status(404).json({
        success: false,
        message: "Provider not found under this category",
      });
    }

    const alreadyExists = await Game.findOne({
      providerDbId,
      gameId: finalGameId,
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "This game already exists under the selected provider",
      });
    }

    const newGame = await Game.create({
      categoryId,
      providerDbId,
      gameId: finalGameId,
      oracleImageType: cleanOracleImageType(oracleImageType),
      image: "",
      isHot: toBool(isHot),
      isFavourite: toBool(isFavourite),
      status: status === "inactive" ? "inactive" : "active",
    });

    const populated = await Game.findById(newGame._id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate("providerDbId", "providerId providerIcon status categoryId");

    return res.status(201).json({
      success: true,
      message: "Game added successfully",
      data: formatGame(req, populated),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This game already exists under the selected provider",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add game",
      error: error.message,
    });
  }
});

/* ======================================================
   GET GAMES
   GET /api/games
====================================================== */

router.get("/", async (req, res) => {
  try {
    const {
      providerDbId = "",
      categoryId = "",
      status = "",
      gameId = "",
      oracleImageType = "",
      isHot = "",
      isFavourite = "",
      page = 1,
      limit = 50,
    } = req.query || {};

    const filter = {};

    if (providerDbId) {
      if (!isValidObjectId(providerDbId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid providerDbId",
        });
      }

      filter.providerDbId = providerDbId;
    }

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

    if (gameId) {
      filter.gameId = {
        $regex: gameId,
        $options: "i",
      };
    }

    if (oracleImageType && validOracleImageTypes.includes(oracleImageType)) {
      filter.oracleImageType = oracleImageType;
    }

    if (isHot !== "") {
      filter.isHot = toBool(isHot);
    }

    if (isFavourite !== "") {
      filter.isFavourite = toBool(isFavourite);
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    const [games, total] = await Promise.all([
      Game.find(filter)
        .populate("categoryId", "categoryName categoryTitle status")
        .populate("providerDbId", "providerId providerIcon status categoryId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      Game.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: games.length,
      data: games.map((item) => formatGame(req, item)),
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
      message: "Failed to fetch games",
      error: error.message,
    });
  }
});

/* ======================================================
   GET SINGLE GAME
   GET /api/games/:id
====================================================== */

router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid game id",
      });
    }

    const game = await Game.findById(req.params.id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate("providerDbId", "providerId providerIcon status categoryId");

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatGame(req, game),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch game",
      error: error.message,
    });
  }
});

/* ======================================================
   UPDATE GAME
   PUT /api/games/:id
====================================================== */

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Invalid game id",
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      if (req.file) deleteLocalFile(req.file.path);

      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const {
      categoryId,
      providerDbId,
      gameId,
      gameUId,
      status,
      removeOldImage,
      isHot,
      isFavourite,
      oracleImageType,
    } = req.body || {};

    if (categoryId !== undefined) {
      if (!isValidObjectId(categoryId)) {
        if (req.file) deleteLocalFile(req.file.path);

        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      const categoryExists = await GameCategory.findById(categoryId);

      if (!categoryExists) {
        if (req.file) deleteLocalFile(req.file.path);

        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      game.categoryId = categoryId;
    }

    if (providerDbId !== undefined) {
      if (!isValidObjectId(providerDbId)) {
        if (req.file) deleteLocalFile(req.file.path);

        return res.status(400).json({
          success: false,
          message: "Invalid providerDbId",
        });
      }

      const providerExists = await GameProvider.findById(providerDbId);

      if (!providerExists) {
        if (req.file) deleteLocalFile(req.file.path);

        return res.status(404).json({
          success: false,
          message: "Provider not found",
        });
      }

      game.providerDbId = providerDbId;
    }

    if (gameId !== undefined || gameUId !== undefined) {
      const newGameId = cleanText(gameId || gameUId);

      if (!newGameId) {
        if (req.file) deleteLocalFile(req.file.path);

        return res.status(400).json({
          success: false,
          message: "gameId is required",
        });
      }

      const exists = await Game.findOne({
        _id: { $ne: game._id },
        providerDbId: game.providerDbId,
        gameId: newGameId,
      });

      if (exists) {
        if (req.file) deleteLocalFile(req.file.path);

        return res.status(409).json({
          success: false,
          message: "This game already exists under the selected provider",
        });
      }

      game.gameId = newGameId;
    }

    const oldImagePath = game.image;

    if (req.file) {
      game.image = req.file.path;
    } else if (removeOldImage === "true") {
      game.image = "";
    }

    if (status && ["active", "inactive"].includes(status)) {
      game.status = status;
    }

    if (typeof isHot !== "undefined") {
      game.isHot = toBool(isHot);
    }

    if (typeof isFavourite !== "undefined") {
      game.isFavourite = toBool(isFavourite);
    }

    if (typeof oracleImageType !== "undefined") {
      game.oracleImageType = cleanOracleImageType(oracleImageType);
    }

    await game.save();

    if (req.file && oldImagePath && oldImagePath !== game.image) {
      deleteLocalFile(oldImagePath);
    }

    if (removeOldImage === "true" && !req.file && oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    const populated = await Game.findById(game._id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate("providerDbId", "providerId providerIcon status categoryId");

    return res.status(200).json({
      success: true,
      message: "Game updated successfully",
      data: formatGame(req, populated),
    });
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This game already exists under the selected provider",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update game",
      error: error.message,
    });
  }
});

/* ======================================================
   REMOVE CUSTOM IMAGE ONLY
   PATCH /api/games/:id/remove-image
====================================================== */

router.patch("/:id/remove-image", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid game id",
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const oldImagePath = game.image;

    game.image = "";
    await game.save();

    if (oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    const populated = await Game.findById(game._id)
      .populate("categoryId", "categoryName categoryTitle status")
      .populate("providerDbId", "providerId providerIcon status categoryId");

    return res.status(200).json({
      success: true,
      message: "Game custom image removed",
      data: formatGame(req, populated),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove image",
      error: error.message,
    });
  }
});

/* ======================================================
   DELETE GAME
   DELETE /api/games/:id
====================================================== */

router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid game id",
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const oldImagePath = game.image;

    await Game.findByIdAndDelete(req.params.id);

    if (oldImagePath) {
      deleteLocalFile(oldImagePath);
    }

    return res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete game",
      error: error.message,
    });
  }
});

export default router;
