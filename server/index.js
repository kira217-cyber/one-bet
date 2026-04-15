// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";
import depositMethodRoutes from "./routes/depositMethodRoutes.js";
import withdrawMethodRoutes from "./routes/withdrawMethodRoutes.js";
import depositRequestsRoutes from "./routes/depositRequestsRoutes.js";
import turnOverRoutes from "./routes/turnOverRoutes.js";
import withdrawRequestRoutes from "./routes/withdrawRequestRoutes.js";
import gameCategoryRoutes from "./routes/gameCategoryRoutes.js";
import gameProviderRoutes from "./routes/gameProviderRoutes.js";
import gamesRoutes from "./routes/gamesRoutes.js";
import autodepositRoutes from "./routes/autodepositRoutes.js";
import playGameRoutes from "./routes/playGameRoutes.js";
import callbackRoutes from "./routes/callBackRoutes.js";
import allHistoryRoutes from "./routes/allHistoryRoutes.js";
import bulkAdjustmentRoutes from "./routes/bulkAdjustmentRoutes.js";
import affWithdrawMethodRoutes from "./routes/AffWithdrawMethodRoutes.js";
import affWithdrawRequestRoutes from "./routes/AffWithdrawRequestRoutes.js";
import sportsRoutes from "./routes/sportsRoutes.js";
import sportsPlayGameRoutes from "./routes/sportsPlayGameRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import siteIdentityRoutes from "./routes/siteIdentityRoutes.js";
import affSiteIdentityRoutes from "./routes/affSiteIdentityRoutes.js";
import socialLinkRoutes from "./routes/socialLinkRoutes.js";
import affSocialLinkRoutes from "./routes/affSocialLinkRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
// ...

dotenv.config();

// ✅ MongoDB connect
connectDB();

const app = express();

// ✅ middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// ✅ uploads folder static (image access করার জন্য)
app.use("/uploads", express.static("uploads"));

// ✅ test route
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// ✅ routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/deposit-methods", depositMethodRoutes);
app.use("/api/withdraw-methods", withdrawMethodRoutes);
app.use("/api", depositRequestsRoutes);
app.use("/api", turnOverRoutes);
app.use("/api", withdrawRequestRoutes);
app.use("/api/game-categories", gameCategoryRoutes);
app.use("/api/game-providers", gameProviderRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/auto-deposit", autodepositRoutes);
app.use("/api/play-game", playGameRoutes);
app.use("/api/callback", callbackRoutes);
app.use("/api/history", allHistoryRoutes);
app.use("/api/admin", bulkAdjustmentRoutes);
app.use("/api", affWithdrawMethodRoutes);
app.use("/api", affWithdrawRequestRoutes);
app.use("/api", sportsRoutes);
app.use("/api/sports-play-game", sportsPlayGameRoutes);
app.use("/api", sliderRoutes);
app.use("/api", noticeRoutes);
app.use("/api", siteIdentityRoutes);
app.use("/api", affSiteIdentityRoutes);
app.use("/api", socialLinkRoutes);    
app.use("/api", affSocialLinkRoutes);  
app.use("/api", promotionRoutes);   

// ✅ port
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
