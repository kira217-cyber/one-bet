import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/**
 * 6 digit unique referral code generate
 */
const generateUniqueReferralCode = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let exists = true;

  while (exists) {
    code = "";

    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const found = await User.findOne({ referralCode: code });

    if (!found) {
      exists = false;
    }
  }

  return code;
};

/**
 * user object sanitize
 */
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    currency: user.currency,
    balance: user.balance,
    referralCode: user.referralCode,
    createdUsers: user.createdUsers,
    referredBy: user.referredBy,
    referralCount: user.referralCount,
    commissionBalance: user.commissionBalance,
    gameLossCommission: user.gameLossCommission,
    depositCommission: user.depositCommission,
    referCommission: user.referCommission,
    gameWinCommission: user.gameWinCommission,
    gameLossCommissionBalance: user.gameLossCommissionBalance,
    depositCommissionBalance: user.depositCommissionBalance,
    referCommissionBalance: user.referCommissionBalance,
    gameWinCommissionBalance: user.gameWinCommissionBalance,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  };
};

/**
 * auth middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
  try {
    const { userId, email, phone, password, fullName, currency, referralCode } =
      req.body;

    if (!userId || !phone || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "userId, phone, password, fullName are required",
      });
    }

    const trimmedUserId = userId.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email ? email.trim().toLowerCase() : "";
    const trimmedFullName = fullName.trim();
    const trimmedReferralCode = referralCode ? referralCode.trim() : "";

    if (trimmedUserId.length < 4 || trimmedUserId.length > 15) {
      return res.status(400).json({
        success: false,
        message: "User Id must be between 4 and 15 characters",
      });
    }

    const userIdRegex = /^[a-zA-Z0-9]+$/;
    if (!userIdRegex.test(trimmedUserId)) {
      return res.status(400).json({
        success: false,
        message: "User Id must contain only letters and numbers",
      });
    }

    if (password.length < 8 || password.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 20 characters",
      });
    }

    const existingUserId = await User.findOne({ userId: trimmedUserId });
    if (existingUserId) {
      return res.status(400).json({
        success: false,
        message: "This User Id already exists",
      });
    }

    const existingPhone = await User.findOne({ phone: trimmedPhone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "This phone number already exists",
      });
    }

    let referrerUser = null;

    if (trimmedReferralCode) {
      referrerUser = await User.findOne({ referralCode: trimmedReferralCode });

      if (!referrerUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nameParts = trimmedFullName.split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const newReferralCode = await generateUniqueReferralCode();

    const newUser = await User.create({
      userId: trimmedUserId,
      email: trimmedEmail,
      phone: trimmedPhone,
      password: hashedPassword,
      role: "user",
      isActive: true,
      currency: currency || "BDT",
      referralCode: newReferralCode,
      firstName,
      lastName,
      referredBy: referrerUser ? referrerUser._id : null,
    });

    if (referrerUser) {
      await User.findByIdAndUpdate(referrerUser._id, {
        $push: { createdUsers: newUser._id },
        $inc: { referralCount: 1 },
      });
    }

    const token = jwt.sign(
      {
        _id: newUser._id,
        userId: newUser.userId,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "userId and password are required",
      });
    }

    const user = await User.findOne({ userId: userId.trim() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid User Id or Password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid User Id or Password",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        userId: user.userId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
});

/**
 * GET ME
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "referredBy createdUsers",
      "userId firstName lastName referralCode phone email",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * AFFILIATE REGISTER
 */
router.post("/affiliate/register", async (req, res) => {
  try {
    const {
      userId,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      email,
      referralCode,
    } = req.body;

    if (
      !userId ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    if (password.length < 8 || password.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8 to 20 characters",
      });
    }

    if (userId.length < 4 || userId.length > 20) {
      return res.status(400).json({
        success: false,
        message: "User Id must be 4 to 20 characters",
      });
    }

    const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
    if (!userIdRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User Id format",
      });
    }

    const existingUserId = await User.findOne({ userId: userId.trim() });
    if (existingUserId) {
      return res.status(400).json({
        success: false,
        message: "This User Id already exists",
      });
    }

    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "This phone number already exists",
      });
    }

    let referrerUser = null;

    if (referralCode?.trim()) {
      referrerUser = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
      });

      if (!referrerUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid refer code",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newReferralCode = await generateUniqueReferralCode();

    const newUser = await User.create({
      userId: userId.trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email?.trim()?.toLowerCase() || "",
      referralCode: newReferralCode,
      role: "aff-user",
      isActive: false,
      referredBy: referrerUser ? referrerUser._id : null,
    });

    if (referrerUser) {
      await User.findByIdAndUpdate(referrerUser._id, {
        $push: { createdUsers: newUser._id },
        $inc: { referralCount: 1 },
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Affiliate account created successfully. Wait for admin approval.",
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("AFFILIATE REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during affiliate registration",
      error: error.message,
    });
  }
});

/**
 * AFFILIATE LOGIN
 */
router.post("/affiliate/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "User Id and password are required",
      });
    }

    const user = await User.findOne({
      userId: userId.trim(),
      role: "aff-user",
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid User Id or Password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin cannot active your account",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid User Id or Password",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        userId: user.userId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "Affiliate login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("AFFILIATE LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during affiliate login",
      error: error.message,
    });
  }
});

/**
 * ADMIN - GET ALL AFFILIATE USERS
 */
router.get("/admin/affiliate-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: "aff-user" })
      .select(
        "userId firstName lastName phone email balance isActive referralCode gameLossCommission depositCommission referCommission gameWinCommission createdAt",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET AFFILIATE USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate users",
    });
  }
});

/**
 * ADMIN - ACTIVATE / DEACTIVATE AFFILIATE USER
 */
router.patch(
  "/admin/affiliate-users/:id/toggle-active",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        isActive,
        gameLossCommission,
        depositCommission,
        referCommission,
        gameWinCommission,
      } = req.body;

      const user = await User.findOne({ _id: id, role: "aff-user" });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Affiliate user not found",
        });
      }

      const updateData = {
        isActive: !!isActive,
      };

      if (isActive) {
        updateData.gameLossCommission = Number(gameLossCommission) || 0;
        updateData.depositCommission = Number(depositCommission) || 0;
        updateData.referCommission = Number(referCommission) || 0;
        updateData.gameWinCommission = Number(gameWinCommission) || 0;
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: updatedUser.isActive
          ? "Affiliate user activated successfully"
          : "Affiliate user deactivated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("TOGGLE AFFILIATE ACTIVE ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update affiliate user status",
      });
    }
  },
);

export default router;
