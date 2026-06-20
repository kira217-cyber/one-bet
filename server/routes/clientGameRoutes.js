import express from "express";
import axios from "axios";
import mongoose from "mongoose";

import Game from "../models/Game.js";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import FeaturedGame from "../models/FeaturedGame.js";
import Sports from "../models/Sports.js";

const router = express.Router();

const ORACLE_GAME_API_BASE =
  process.env.ORACLE_GAME_API_BASE || "https://oraclegames.net/api/game";

const ORACLE_GAME_DATA_KEY =
  process.env.ORACLE_GAME_DATA_KEY || "1189baca156e1bbbecc3b26651a63565";

const validObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const toBool = (value) =>
  value === true || value === "true" || value === "1" || value === 1;

const getFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const cleanPath = String(filePath).replace(/\\/g, "/");

  return `${req.protocol}://${req.get("host")}${
    cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`
  }`;
};

const getOracleImage = (oracleGame = {}, type = "thumbnail") => {
  if (type === "original") {
    return oracleGame.original || oracleGame.images?.original || "";
  }

  if (type === "height") {
    return oracleGame.height || oracleGame.images?.height || "";
  }

  return (
    oracleGame.thumbnail ||
    oracleGame.images?.thumbnail ||
    oracleGame.original ||
    oracleGame.images?.original ||
    ""
  );
};

const normalizeOracleGames = (data) => {
  const games = Array.isArray(data?.games)
    ? data.games
    : Array.isArray(data?.data?.games)
      ? data.data.games
      : Array.isArray(data)
        ? data
        : [];

  const map = new Map();

  games.forEach((game) => {
    const id = String(
      game?.game_uid ||
        game?.gameUId ||
        game?.gameId ||
        game?._id ||
        game?.id ||
        "",
    ).trim();

    if (id) {
      map.set(id, {
        gameId: id,
        gameName: game.name || game.gameName || game.game_code || "",
        provider: game.provider || "",
        category: game.category || "",
        game_code: game.game_code || "",
        thumbnail: game.thumbnail || game.images?.thumbnail || game.image || "",
        height: game.height || game.images?.height || "",
        original: game.original || game.images?.original || "",
        images: {
          thumbnail:
            game.thumbnail || game.images?.thumbnail || game.image || "",
          height: game.height || game.images?.height || "",
          original: game.original || game.images?.original || "",
        },
        raw: game,
      });
    }
  });

  return map;
};

const fetchOracleGamesByProvider = async (providerId) => {
  try {
    if (!providerId || !ORACLE_GAME_DATA_KEY) return new Map();

    const { data } = await axios.get(`${ORACLE_GAME_API_BASE}/${providerId}`, {
      headers: {
        "x-oraclegamedata-key": ORACLE_GAME_DATA_KEY,
      },
      timeout: 30000,
    });

    return normalizeOracleGames(data);
  } catch (error) {
    console.log(
      "Oracle games fetch error:",
      error?.response?.data || error.message,
    );
    return new Map();
  }
};

const formatCategory = (req, category) => {
  const obj = category.toObject ? category.toObject() : category;

  return {
    ...obj,
    iconImageUrl: obj.iconImage ? getFileUrl(req, obj.iconImage) : "",
  };
};

const formatProvider = (req, provider) => {
  const obj = provider.toObject ? provider.toObject() : provider;

  return {
    ...obj,
    providerName: obj.providerId,
    providerIconUrl: obj.providerIcon ? getFileUrl(req, obj.providerIcon) : "",
    providerImageUrl: obj.providerImage
      ? getFileUrl(req, obj.providerImage)
      : "",
  };
};

const formatGame = async (req, game, oracleMap) => {
  const obj = game.toObject ? game.toObject() : game;

  const oracleGame = oracleMap.get(String(obj.gameId)) || {};
  const customImage = obj.image ? getFileUrl(req, obj.image) : "";
  const oracleImage = getOracleImage(oracleGame, obj.oracleImageType);

  return {
    ...obj,

    imageUrl: customImage,
    gameName: oracleGame.gameName || obj.gameId,
    gameImage: customImage || oracleImage || "/placeholder-game.png",

    displayName: oracleGame.gameName || obj.gameId || "Unnamed Game",
    displayImage: customImage || oracleImage || "/placeholder-game.png",
    displayGameCode: oracleGame.game_code || "",

    oracleGame,
    oracle: {
      name: oracleGame.gameName || "",
      image: oracleImage || "",
      provider: oracleGame.provider || "",
      category: oracleGame.category || "",
    },
  };
};

const formatGamesWithOracle = async (req, games = []) => {
  const providerCodes = [
    ...new Set(
      games
        .map((game) => game?.providerDbId?.providerId)
        .filter(Boolean)
        .map((item) => String(item).toUpperCase()),
    ),
  ];

  const oracleMaps = await Promise.all(
    providerCodes.map(async (providerId) => ({
      providerId,
      map: await fetchOracleGamesByProvider(providerId),
    })),
  );

  const oracleMapByProvider = new Map();

  oracleMaps.forEach((item) => {
    oracleMapByProvider.set(item.providerId, item.map);
  });

  return Promise.all(
    games.map((game) => {
      const providerId = String(
        game?.providerDbId?.providerId || "",
      ).toUpperCase();
      const oracleMap = oracleMapByProvider.get(providerId) || new Map();

      return formatGame(req, game, oracleMap);
    }),
  );
};

/* ======================================================
   GET /api/client-games/categories
====================================================== */
router.get("/categories", async (req, res) => {
  try {
    const categories = await GameCategory.find({ status: "active" }).sort({
      order: 1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: categories.map((item) => formatCategory(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load categories",
    });
  }
});

/* ======================================================
   GET /api/client-games/providers?categoryId=&isHome=true
====================================================== */
router.get("/providers", async (req, res) => {
  try {
    const { categoryId = "", isHome = "" } = req.query || {};

    const query = {
      status: "active",
    };

    if (categoryId) {
      if (!validObjectId(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      query.categoryId = categoryId;
    }

    if (isHome !== "") {
      query.isHome = toBool(isHome);
    }

    const providers = await GameProvider.find(query)
      .populate("categoryId")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: providers.map((item) => formatProvider(req, item)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load providers",
    });
  }
});

/* ======================================================
   GET /api/client-games/games
====================================================== */
router.get("/games", async (req, res) => {
  try {
    const {
      categoryId = "",
      providerDbId = "",
      status = "active",
      isHot = "",
      isFavourite = "",
      search = "",
      page = "",
      limit = "",
    } = req.query || {};

    const query = {};

    if (status) query.status = status;

    if (categoryId) {
      if (!validObjectId(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId",
        });
      }

      query.categoryId = categoryId;
    }

    if (providerDbId) {
      if (!validObjectId(providerDbId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid providerDbId",
        });
      }

      query.providerDbId = providerDbId;
    }

    if (isHot !== "") query.isHot = toBool(isHot);
    if (isFavourite !== "") query.isFavourite = toBool(isFavourite);

    if (search) {
      query.gameId = {
        $regex: String(search),
        $options: "i",
      };
    }

    let gameQuery = Game.find(query)
      .populate("categoryId")
      .populate("providerDbId")
      .sort({ createdAt: 1 });

    const hasPagination = page !== "" || limit !== "";

    let total = 0;
    let pageNum = 1;
    let limitNum = 0;

    if (hasPagination) {
      pageNum = Math.max(Number(page) || 1, 1);
      limitNum = Math.max(Number(limit) || 30, 1);

      total = await Game.countDocuments(query);

      gameQuery = gameQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const games = await gameQuery;
    const formattedGames = await formatGamesWithOracle(req, games);

    return res.json({
      success: true,
      data: hasPagination
        ? {
            games: formattedGames,
            meta: {
              page: pageNum,
              limit: limitNum,
              total,
              totalPages: Math.ceil(total / limitNum) || 1,
            },
          }
        : formattedGames,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load games",
    });
  }
});

/* ======================================================
   GET /api/client-games/hot-games
====================================================== */
router.get("/hot-games", async (req, res) => {
  try {
    const games = await Game.find({
      status: "active",
      isHot: true,
    })
      .populate("categoryId")
      .populate("providerDbId")
      .sort({ createdAt: -1 });

    const formattedGames = await formatGamesWithOracle(req, games);

    return res.json({
      success: true,
      data: formattedGames,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load hot games",
    });
  }
});

/* ======================================================
   GET /api/client-games/favourite-games
====================================================== */
router.get("/favourite-games", async (req, res) => {
  try {
    const games = await Game.find({
      status: "active",
      isFavourite: true,
    })
      .populate("categoryId")
      .populate("providerDbId")
      .sort({ createdAt: -1 });

    const formattedGames = await formatGamesWithOracle(req, games);

    return res.json({
      success: true,
      data: formattedGames,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load favourite games",
    });
  }
});

/* ======================================================
   GET /api/client-games/featured-games
====================================================== */
router.get("/featured-games", async (req, res) => {
  try {
    const featured = await FeaturedGame.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });

    const gameIds = featured.map((item) => item.gameId).filter(Boolean);

    const games = await Game.find({
      status: "active",
      gameId: { $in: gameIds },
    })
      .populate("categoryId")
      .populate("providerDbId");

    const formattedGames = await formatGamesWithOracle(req, games);
    const gameMap = new Map(
      formattedGames.map((game) => [String(game.gameId), game]),
    );

    const data = featured
      .map((item) => {
        const obj = item.toObject ? item.toObject() : item;
        const game = gameMap.get(String(obj.gameId));

        return {
          ...obj,
          bannerImageUrl: obj.bannerImage
            ? getFileUrl(req, obj.bannerImage)
            : "",
          game,
        };
      })
      .filter((item) => item.game);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load featured games",
    });
  }
});

/* ======================================================
   GET /api/client-games/sports
====================================================== */
router.get("/sports", async (req, res) => {
  try {
    const sports = await Sports.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });

    const data = sports.map((item) => {
      const obj = item.toObject ? item.toObject() : item;

      return {
        ...obj,
        iconImageUrl: obj.iconImage ? getFileUrl(req, obj.iconImage) : "",
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load sports",
    });
  }
});

/* ======================================================
   GET /api/client-games/games/:gameId
====================================================== */
router.get("/games/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const query = {
      status: "active",
      $or: [{ gameId: String(gameId) }],
    };

    if (validObjectId(gameId)) {
      query.$or.push({ _id: gameId });
    }

    const game = await Game.findOne(query)
      .populate("categoryId")
      .populate("providerDbId");

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const formattedGames = await formatGamesWithOracle(req, [game]);

    return res.json({
      success: true,
      data: formattedGames[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load game",
    });
  }
});

export default router;
