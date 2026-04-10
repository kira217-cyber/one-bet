// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
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


// ✅ port
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
