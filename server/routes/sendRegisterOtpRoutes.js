import express from "express";

const router = express.Router();

const OTP_EXPIRE_MS = 3 * 60 * 1000; // 3 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export const registerOtpStore = new Map();

const normalizeBdPhone = (phone = "") => {
  let p = String(phone || "").trim();

  p = p.replace(/\s+/g, "");
  p = p.replace(/-/g, "");

  if (p.startsWith("+")) {
    p = p.slice(1);
  }

  if (p.startsWith("01")) {
    p = `88${p}`;
  }

  if (p.startsWith("8801")) {
    return p;
  }

  return p;
};

router.post("/send-register-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    const normalizedPhone = normalizeBdPhone(phone);

    if (!normalizedPhone || !/^8801[0-9]{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Valid Bangladeshi phone number is required",
      });
    }

    const existing = registerOtpStore.get(normalizedPhone);
    const now = Date.now();

    if (existing?.lastSentAt && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
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

    if (!smsRes.ok || !smsData?.success || !smsData?.otp) {
      return res.status(400).json({
        success: false,
        message: smsData?.message || "Failed to send OTP",
      });
    }

    registerOtpStore.set(normalizedPhone, {
      otp: String(smsData.otp),
      expiresAt: now + OTP_EXPIRE_MS,
      lastSentAt: now,
    });

    setTimeout(() => {
      const saved = registerOtpStore.get(normalizedPhone);

      if (saved?.expiresAt <= Date.now()) {
        registerOtpStore.delete(normalizedPhone);
      }
    }, OTP_EXPIRE_MS + 1000);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 180,
      resendAfter: 60,
    });
  } catch (error) {
    console.error("Send Register OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

export const verifyRegisterOtp = (phone = "", otp = "") => {
  const normalizedPhone = normalizeBdPhone(phone);
  const saved = registerOtpStore.get(normalizedPhone);

  if (!saved) {
    return {
      success: false,
      message: "OTP not found. Please request a new OTP",
    };
  }

  if (Date.now() > saved.expiresAt) {
    registerOtpStore.delete(normalizedPhone);

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

  registerOtpStore.delete(normalizedPhone);

  return {
    success: true,
    phone: normalizedPhone,
  };
};

export const normalizeRegisterPhone = normalizeBdPhone;

export default router;