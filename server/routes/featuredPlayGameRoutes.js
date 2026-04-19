import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import FeaturedGame from "../models/FeaturedGame.js";

const router = express.Router();

/**
 * auth middleware
 * expects: Authorization: Bearer <token>
 */
const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    req.user = { id };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

const isObjectIdLike = (val) => /^[0-9a-fA-F]{24}$/.test(String(val || ""));

/**
 * Oracle game details by ids
 * POST /api/games/by-ids
 */
const fetchOracleGameDetailsByIds = async ({ oracleGameId, apiKey }) => {
  const res = await axios.post(
    "https://api.oraclegames.live/api/games/by-ids",
    {
      ids: [String(oracleGameId)],
    },
    {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
  );

  const item = Array.isArray(res.data?.data) ? res.data.data[0] || {} : {};

  return {
    game_code: String(item?.game_code || "").trim(),
    game_type:
      String(item?.provider?.gameType || "")
        .trim()
        .toUpperCase() ||
      String(item?.game_type || "")
        .trim()
        .toUpperCase(),
    provider_code: String(item?.provider?.provider_code || "")
      .trim()
      .toUpperCase(),
    raw: item,
  };
};

/**
 * POST /api/featured-play-game/playgame
 * body: { gameID }
 *
 * gameID can be:
 * - FeaturedGame._id
 * - FeaturedGame.gameId
 */
router.post("/playgame", requireAuth, async (req, res) => {
  try {
    const { gameID } = req.body || {};

    if (!gameID) {
      return res
        .status(400)
        .json({ success: false, message: "gameID is required" });
    }

    const authUserId = req.user?.id;

    const user = await User.findById(authUserId).select(
      "userId balance isActive currency",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isActive !== true) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is not active" });
    }

    let balance = Number(user.balance || 0);
    if (!Number.isFinite(balance) || balance < 0) {
      balance = 0;
    }

    const ORACLE_API_KEY = process.env.DSTGAME_TOKEN;

    // test
    const LAUNCH_URL = "https://api.oraclegames.live/api/admin/games/launch";

    // live
    // const LAUNCH_URL = "https://crazybet99.com/getgameurl/v2";

    if (!ORACLE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "DSTGAME_TOKEN missing in .env",
      });
    }

    let featuredDoc = null;

    if (isObjectIdLike(gameID)) {
      featuredDoc = await FeaturedGame.findById(gameID);
    }

    if (!featuredDoc) {
      featuredDoc = await FeaturedGame.findOne({
        gameId: String(gameID).trim(),
      });
    }

    if (!featuredDoc) {
      return res.status(404).json({
        success: false,
        message:
          "Featured game not found in DB (gameID must be FeaturedGame._id or FeaturedGame.gameId)",
      });
    }

    if (featuredDoc.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "This featured game is inactive",
      });
    }

    const oracleGameId = String(featuredDoc.gameId || "").trim();
    if (!oracleGameId) {
      return res.status(400).json({
        success: false,
        message: "Oracle featured game id missing in DB",
      });
    }

    const oracleGameDetails = await fetchOracleGameDetailsByIds({
      oracleGameId,
      apiKey: ORACLE_API_KEY,
    });

    const game_code = oracleGameDetails.game_code;
    const game_type = oracleGameDetails.game_type;
    const provider_code = oracleGameDetails.provider_code;

    if (!game_code) {
      return res.status(400).json({
        success: false,
        message: "game_code not found from Oracle API",
        raw: oracleGameDetails.raw,
      });
    }

    if (!game_type) {
      return res.status(400).json({
        success: false,
        message: "game_type not found from Oracle API",
        raw: oracleGameDetails.raw,
      });
    }

    if (!provider_code) {
      return res.status(400).json({
        success: false,
        message: "provider_code not found from Oracle API",
        raw: oracleGameDetails.raw,
      });
    }

    const payload = {
      username: user.userId,
      money: Math.max(0, Math.floor(balance)),
      currency: user.currency || "BDT",
      game_code,
      provider_code,
      game_type,
    };

    console.log("Launching featured game payload:", payload);

    const response = await fetch(LAUNCH_URL, {
      method: "POST",
      headers: {
        "x-dstgame-key": "ceeeba1c-892b-4571-b05f-2bcec5c4a44e",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    let gameUrl = "";

    if (typeof responseData === "string") {
      gameUrl = responseData;
    } else {
      gameUrl =
        responseData?.url ||
        responseData?.data?.url ||
        responseData?.gameUrl ||
        responseData?.game_url ||
        responseData?.launchUrl ||
        responseData?.data?.launchUrl ||
        "";
    }

    if (!gameUrl || typeof gameUrl !== "string") {
      return res.status(502).json({
        success: false,
        message: "No game URL received from featured launch API",
        error: responseData,
        payloadUsed: payload,
      });
    }

    return res.json({
      success: true,
      gameUrl,
      used: {
        featured_db_id: String(featuredDoc._id),
        oracle_game_id: oracleGameId,
        game_code,
        provider_code,
        game_type,
      },
    });
  } catch (error) {
    console.error(
      "FeaturedPlayGame API Error:",
      error.response?.data || error.message,
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to launch featured game",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
