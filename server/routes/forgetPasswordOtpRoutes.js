import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

const OTP_EXPIRE_MS = 3 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const forgetPasswordOtpStore = new Map();

const normalizeBdPhone = (phone = "") => {
  let p = String(phone || "").trim();

  p = p.replace(/\s+/g, "");
  p = p.replace(/-/g, "");

  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("01")) p = `88${p}`;
  if (p.startsWith("8801")) return p;

  return p;
};

const toLocalBdPhone = (phone = "") => {
  const normalized = normalizeBdPhone(phone);

  if (normalized.startsWith("8801")) {
    return `0${normalized.slice(2)}`;
  }

  return normalized;
};

const findUserByPhoneFlexible = async (phone = "") => {
  const rawPhone = String(phone || "").trim();
  const normalizedPhone = normalizeBdPhone(rawPhone);
  const localPhone = toLocalBdPhone(rawPhone);

  return User.findOne({
    phone: {
      $in: [rawPhone, normalizedPhone, localPhone],
    },
  });
};

const verifyForgetPasswordOtp = (phone = "", otp = "") => {
  const normalizedPhone = normalizeBdPhone(phone);
  const saved = forgetPasswordOtpStore.get(normalizedPhone);

  if (!saved) {
    return {
      success: false,
      message: "OTP not found. Please request a new OTP",
    };
  }

  if (Date.now() > saved.expiresAt) {
    forgetPasswordOtpStore.delete(normalizedPhone);

    return {
      success: false,
      message: "OTP expired. Please request a new OTP",
    };
  }

  if (String(saved.otp) !== String(otp).trim()) {
    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  forgetPasswordOtpStore.delete(normalizedPhone);

  return {
    success: true,
    phone: normalizedPhone,
  };
};

/**
 * SEND FORGET PASSWORD OTP
 * POST /api/users/send-forget-password-otp
 */
router.post("/send-forget-password-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    const normalizedPhone = normalizeBdPhone(phone);

    if (!normalizedPhone || !/^8801[0-9]{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Valid Bangladeshi phone number is required",
      });
    }

    const user = await findUserByPhoneFlexible(phone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support",
      });
    }

    const existing = forgetPasswordOtpStore.get(normalizedPhone);
    const now = Date.now();

    if (
      existing?.lastSentAt &&
      now - existing.lastSentAt < RESEND_COOLDOWN_MS
    ) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000,
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another OTP`,
        waitSeconds,
      });
    }

    if (!process.env.OSMS_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "SMS service token is not configured",
      });
    }

    const smsRes = await fetch("https://api.o-sms.com/api/service/send-otp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OSMS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: normalizedPhone,
      }),
    });

    const smsData = await smsRes.json();

    console.log("O-SMS FORGET PASSWORD RESPONSE:", {
      status: smsRes.status,
      ok: smsRes.ok,
      data: smsData,
      phoneNumber: normalizedPhone,
    });

    if (!smsRes.ok || !smsData?.success || !smsData?.otp) {
      return res.status(400).json({
        success: false,
        message: smsData?.message || "Failed to send OTP",
      });
    }

    forgetPasswordOtpStore.set(normalizedPhone, {
      otp: String(smsData.otp),
      expiresAt: now + OTP_EXPIRE_MS,
      lastSentAt: now,
    });

    setTimeout(() => {
      const saved = forgetPasswordOtpStore.get(normalizedPhone);

      if (saved?.expiresAt <= Date.now()) {
        forgetPasswordOtpStore.delete(normalizedPhone);
      }
    }, OTP_EXPIRE_MS + 1000);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 180,
      resendAfter: 60,
      devOtp: process.env.NODE_ENV === "production" ? undefined : smsData.otp,
    });
  } catch (error) {
    console.error("SEND FORGET PASSWORD OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

/**
 * FORGET PASSWORD
 * POST /api/users/forget-password
 */
router.post("/forget-password", async (req, res) => {
  try {
    const { phone, otp, password } = req.body;

    if (!phone || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "phone, otp and password are required",
      });
    }

    if (password.length < 8 || password.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 20 characters",
      });
    }

    const user = await findUserByPhoneFlexible(phone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support",
      });
    }

    const otpResult = verifyForgetPasswordOtp(phone, otp);

    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("FORGET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during forget password",
      error: error.message,
    });
  }
});

export default router;
