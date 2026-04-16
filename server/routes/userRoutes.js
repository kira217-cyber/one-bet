import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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
 * sanitize user object
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
 * create JWT token
 * ✅ IMPORTANT: id must be user._id for all protected routes
 */
const createToken = (user) => {
  return jwt.sign(
    {
      id: String(user._id), // ✅ main field used by other routes
      _id: String(user._id), // ✅ keep backward compatibility
      userId: user.userId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

const isStrongPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 20 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

/**
 * auth middleware
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const normalizedId = decoded?.id || decoded?._id;

    if (!normalizedId || !mongoose.Types.ObjectId.isValid(normalizedId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session",
      });
    }

    req.user = {
      id: String(normalizedId),
      _id: String(normalizedId),
      userId: decoded?.userId || "",
      role: decoded?.role || "user",
    };

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

    const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
    if (!userIdRegex.test(trimmedUserId)) {
      return res.status(400).json({
        success: false,
        message:
          "User Id must contain only letters, numbers, @, dot, underscore and hyphen",
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
      referrerUser = await User.findOne({
        referralCode: trimmedReferralCode.toUpperCase(),
      });

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
        $inc: {
          referralCount: 1,
          referCommissionBalance: Number(referrerUser.referCommission || 0),
        },
      });
    }

    const token = createToken(newUser);

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

    const token = createToken(user);

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
    const user = await User.findById(req.user.id).populate(
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
 * UPDATE OWN PROFILE
 * Logged in user can update own personal info
 */
router.patch("/update-profile", authMiddleware, async (req, res) => {
  try {
    const userObjectId = req.user?.id || req.user?._id;
    const { userId, email, phone, firstName, lastName } = req.body;

    if (!userObjectId || !mongoose.Types.ObjectId.isValid(userObjectId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session",
      });
    }

    const trimmedUserId = userId?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedEmail = email ? email.trim().toLowerCase() : "";
    const trimmedFirstName = firstName ? firstName.trim() : "";
    const trimmedLastName = lastName ? lastName.trim() : "";

    if (!trimmedUserId || !trimmedPhone) {
      return res.status(400).json({
        success: false,
        message: "User ID and phone are required",
      });
    }

    if (trimmedUserId.length < 4 || trimmedUserId.length > 15) {
      return res.status(400).json({
        success: false,
        message: "User ID must be between 4 and 15 characters",
      });
    }

    const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
    if (!userIdRegex.test(trimmedUserId)) {
      return res.status(400).json({
        success: false,
        message:
          "User ID can contain only letters, numbers, @, dot, underscore and hyphen",
      });
    }

    const existingUserId = await User.findOne({
      userId: trimmedUserId,
      _id: { $ne: userObjectId },
    });

    if (existingUserId) {
      return res.status(400).json({
        success: false,
        message: "This User ID already exists",
      });
    }

    const existingPhone = await User.findOne({
      phone: trimmedPhone,
      _id: { $ne: userObjectId },
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "This phone number already exists",
      });
    }

    if (trimmedEmail) {
      const existingEmail = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: userObjectId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "This email already exists",
        });
      }
    }

    const user = await User.findById(userObjectId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.userId = trimmedUserId;
    user.email = trimmedEmail;
    user.phone = trimmedPhone;
    user.firstName = trimmedFirstName;
    user.lastName = trimmedLastName;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Personal info updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update personal info",
      error: error.message,
    });
  }
});

/**
 * GET BALANCE ONLY
 */
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "userId balance isActive role phone email firstName lastName"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        userId: user.userId,
        balance: Number(user.balance || 0),
        isActive: user.isActive,
        role: user.role,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("GET BALANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch balance",
      error: error.message,
    });
  }
});

/**
 * OPTIONAL LOGOUT API
 * JWT stateless বলে server-side এ কিছু clear করা লাগে না
 * শুধু success response দিচ্ছে
 */
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});


/**
 * RESET PASSWORD
 * Logged in user only
 */
router.put("/reset-password", authMiddleware, async (req, res) => {
  try {
    const userObjectId = req.user?.id || req.user?._id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!userObjectId || !mongoose.Types.ObjectId.isValid(userObjectId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session",
      });
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8-20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
      });
    }

    const user = await User.findById(userObjectId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordMatched = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSameAsOldPassword = await bcrypt.compare(newPassword, user.password);

    if (isSameAsOldPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
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

    const token = createToken(user);

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
router.get(
  "/admin/affiliate-users",
  authMiddleware,
  async (req, res) => {
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
  },
);

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

/**
 * GET ALL USERS
 */
router.get(
  "/admin/all-users",
  authMiddleware,

  async (req, res) => {
    try {
      const users = await User.find({ role: "user" })
        .select("userId phone email balance referralCode isActive createdAt")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("GET ALL USERS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load users",
        error: error.message,
      });
    }
  },
);

/**
 * TOGGLE USER STATUS
 */
router.patch(
  "/admin/all-users/:id/toggle-status",
  authMiddleware,

  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await User.findOne({
        _id: id,
        role: "user",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.isActive = !!isActive;
      await user.save();

      return res.status(200).json({
        success: true,
        message: user.isActive
          ? "User activated successfully"
          : "User deactivated successfully",
        user,
      });
    } catch (error) {
      console.error("TOGGLE USER STATUS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user status",
        error: error.message,
      });
    }
  },
);

/**
 * GET SINGLE USER DETAILS
 */
router.get(
  "/admin/all-users/:id",
  authMiddleware,

  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findOne({
        _id: id,
        role: "user",
      })
        .select(
          "userId email phone firstName lastName isActive currency balance commissionBalance gameLossCommission depositCommission referCommission gameWinCommission gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance referralCode role createdAt updatedAt referralCount referredBy",
        )
        .populate("referredBy", "userId phone");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("GET USER DETAILS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load user details",
        error: error.message,
      });
    }
  },
);

/**
 * UPDATE SINGLE USER DETAILS
 */
router.patch(
  "/admin/all-users/:id",
  authMiddleware,

  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        userId,
        email,
        phone,
        firstName,
        lastName,
        password,
        isActive,
        currency,
        balance,
        commissionBalance,
        gameLossCommission,
        depositCommission,
        referCommission,
        gameWinCommission,
        gameLossCommissionBalance,
        depositCommissionBalance,
        referCommissionBalance,
        gameWinCommissionBalance,
      } = req.body;

      const user = await User.findOne({
        _id: id,
        role: "user",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const trimmedUserId = userId?.trim();
      const trimmedPhone = phone?.trim();
      const trimmedEmail = email ? email.trim().toLowerCase() : "";

      if (!trimmedUserId || !trimmedPhone) {
        return res.status(400).json({
          success: false,
          message: "userId and phone are required",
        });
      }

      const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
      if (!userIdRegex.test(trimmedUserId)) {
        return res.status(400).json({
          success: false,
          message:
            "User ID can contain only letters, numbers, @, dot, underscore and hyphen",
        });
      }

      const existingUserId = await User.findOne({
        userId: trimmedUserId,
        _id: { $ne: user._id },
      });

      if (existingUserId) {
        return res.status(400).json({
          success: false,
          message: "This User ID already exists",
        });
      }

      const existingPhone = await User.findOne({
        phone: trimmedPhone,
        _id: { $ne: user._id },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "This phone number already exists",
        });
      }

      user.userId = trimmedUserId;
      user.email = trimmedEmail;
      user.phone = trimmedPhone;
      user.firstName = firstName || "";
      user.lastName = lastName || "";
      user.isActive = !!isActive;
      user.currency = currency || "BDT";
      user.balance = Number(balance) || 0;
      user.commissionBalance = Number(commissionBalance) || 0;
      user.gameLossCommission = Number(gameLossCommission) || 0;
      user.depositCommission = Number(depositCommission) || 0;
      user.referCommission = Number(referCommission) || 0;
      user.gameWinCommission = Number(gameWinCommission) || 0;
      user.gameLossCommissionBalance = Number(gameLossCommissionBalance) || 0;
      user.depositCommissionBalance = Number(depositCommissionBalance) || 0;
      user.referCommissionBalance = Number(referCommissionBalance) || 0;
      user.gameWinCommissionBalance = Number(gameWinCommissionBalance) || 0;

      if (password && password.trim()) {
        if (password.trim().length < 6) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
          });
        }

        user.password = await bcrypt.hash(password.trim(), 10);
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      console.error("UPDATE USER DETAILS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: error.message,
      });
    }
  },
);

/**
 * GET SINGLE AFFILIATE USER DETAILS
 */
router.get(
  "/admin/affiliate-users/:id",
  authMiddleware,

  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findOne({
        _id: id,
        role: "aff-user",
      })
        .select(
          "userId email phone firstName lastName isActive currency balance commissionBalance gameLossCommission depositCommission referCommission gameWinCommission gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance referralCode role createdAt updatedAt referralCount referredBy",
        )
        .populate("referredBy", "userId phone");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Affiliate user not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("GET AFFILIATE USER DETAILS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load affiliate user details",
        error: error.message,
      });
    }
  },
);

/**
 * UPDATE SINGLE AFFILIATE USER DETAILS
 */
router.patch(
  "/admin/affiliate-users/:id",
  authMiddleware,

  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        userId,
        email,
        phone,
        firstName,
        lastName,
        password,
        isActive,
        currency,
        balance,
        commissionBalance,
        gameLossCommission,
        depositCommission,
        referCommission,
        gameWinCommission,
        gameLossCommissionBalance,
        depositCommissionBalance,
        referCommissionBalance,
        gameWinCommissionBalance,
      } = req.body;

      const user = await User.findOne({
        _id: id,
        role: "aff-user",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Affiliate user not found",
        });
      }

      const trimmedUserId = userId?.trim();
      const trimmedPhone = phone?.trim();
      const trimmedEmail = email ? email.trim().toLowerCase() : "";

      if (!trimmedUserId || !trimmedPhone) {
        return res.status(400).json({
          success: false,
          message: "userId and phone are required",
        });
      }

      const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
      if (!userIdRegex.test(trimmedUserId)) {
        return res.status(400).json({
          success: false,
          message:
            "User ID can contain only letters, numbers, @, dot, underscore and hyphen",
        });
      }

      const existingUserId = await User.findOne({
        userId: trimmedUserId,
        _id: { $ne: user._id },
      });

      if (existingUserId) {
        return res.status(400).json({
          success: false,
          message: "This User ID already exists",
        });
      }

      const existingPhone = await User.findOne({
        phone: trimmedPhone,
        _id: { $ne: user._id },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "This phone number already exists",
        });
      }

      user.userId = trimmedUserId;
      user.email = trimmedEmail;
      user.phone = trimmedPhone;
      user.firstName = firstName || "";
      user.lastName = lastName || "";
      user.isActive = !!isActive;
      user.currency = currency || "BDT";
      user.balance = Number(balance) || 0;
      user.commissionBalance = Number(commissionBalance) || 0;
      user.gameLossCommission = Number(gameLossCommission) || 0;
      user.depositCommission = Number(depositCommission) || 0;
      user.referCommission = Number(referCommission) || 0;
      user.gameWinCommission = Number(gameWinCommission) || 0;
      user.gameLossCommissionBalance = Number(gameLossCommissionBalance) || 0;
      user.depositCommissionBalance = Number(depositCommissionBalance) || 0;
      user.referCommissionBalance = Number(referCommissionBalance) || 0;
      user.gameWinCommissionBalance = Number(gameWinCommissionBalance) || 0;

      if (password && password.trim()) {
        if (password.trim().length < 6) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
          });
        }

        user.password = await bcrypt.hash(password.trim(), 10);
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Affiliate user updated successfully",
        user,
      });
    } catch (error) {
      console.error("UPDATE AFFILIATE USER DETAILS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update affiliate user",
        error: error.message,
      });
    }
  },
);

export default router;
