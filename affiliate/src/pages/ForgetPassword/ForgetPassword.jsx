import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaLock, FaSearch } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const normalizeBdLocalPhone = (phone = "") => {
  const clean = String(phone || "")
    .replace(/\D/g, "")
    .trim();

  if (clean.startsWith("01")) return clean;
  if (clean.startsWith("1")) return `0${clean}`;
  if (clean.startsWith("8801")) return clean.slice(2);

  return clean;
};

const ForgetPassword = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState({
    name: "Bangladesh",
    code: "+880",
    cca2: "BD",
    flag: "https://flagcdn.com/w40/bd.png",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isBangladeshSelected = selected?.cca2 === "BD";

  const resetOtp = () => {
    setOtpSent(false);
    setOtpCountdown(0);
    setFormData((prev) => ({ ...prev, otp: "" }));
  };

  const text = useMemo(
    () => ({
      title: isBangla
        ? "অ্যাফিলিয়েট পাসওয়ার্ড রিসেট"
        : "Affiliate Password Reset",
      subtitle: isBangla
        ? "আপনার অ্যাফিলিয়েট অ্যাকাউন্টের ফোন নাম্বার দিয়ে পাসওয়ার্ড পরিবর্তন করুন"
        : "Reset your affiliate account password using your phone number",

      phone: isBangla ? "ফোন" : "Phone",
      otp: isBangla ? "ওটিপি কোড" : "OTP Code",
      password: isBangla ? "নতুন পাসওয়ার্ড" : "New Password",
      confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",

      phonePlaceholder: isBangla ? "ফোন নাম্বার লিখুন" : "Enter phone number",
      otpPlaceholder: isBangla ? "এসএমএস ওটিপি লিখুন" : "Enter SMS OTP",
      passwordPlaceholder: isBangla ? "৮-২০ অক্ষর" : "8-20 characters",
      confirmPasswordPlaceholder: isBangla
        ? "কনফার্ম পাসওয়ার্ড লিখুন"
        : "Enter confirm password",

      sendOtp: isBangla ? "ওটিপি পাঠান" : "Send OTP",
      resendOtp: isBangla ? "আবার পাঠান" : "Resend OTP",
      sendingOtp: isBangla ? "পাঠানো হচ্ছে..." : "Sending...",
      next: isBangla ? "পরবর্তী" : "Next",
      resetPassword: isBangla ? "পাসওয়ার্ড পরিবর্তন করুন" : "Reset Password",
      resetting: isBangla ? "আপডেট হচ্ছে..." : "Updating...",
      backLogin: isBangla ? "লগইনে ফিরে যান" : "Back to Login",

      phoneRequired: isBangla
        ? "আগে ফোন নাম্বার দিন"
        : "Please enter phone number first",
      otpRequired: isBangla ? "ওটিপি কোড দিন" : "Please enter OTP code",
      passwordRequired: isBangla
        ? "নতুন পাসওয়ার্ড দিন"
        : "Please enter new password",
      confirmRequired: isBangla
        ? "কনফার্ম পাসওয়ার্ড দিন"
        : "Please enter confirm password",
      passwordLength: isBangla
        ? "পাসওয়ার্ড ৮ থেকে ২০ অক্ষরের হতে হবে"
        : "Password must be 8 to 20 characters",
      passwordMatch: isBangla
        ? "পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না"
        : "Password and Confirm Password do not match",

      otpSent: isBangla ? "ওটিপি পাঠানো হয়েছে" : "OTP sent successfully",
      otpFailed: isBangla ? "ওটিপি পাঠানো যায়নি" : "Failed to send OTP",
      resetSuccess: isBangla
        ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে"
        : "Password reset successfully",
      resetFailed: isBangla
        ? "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে"
        : "Password reset failed",
    }),
    [isBangla],
  );

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags",
        );
        const data = await res.json();

        const list = (Array.isArray(data) ? data : [])
          .map((c) => {
            const root = c?.idd?.root || "";
            const suffix = c?.idd?.suffixes?.[0] || "";
            const code = `${root}${suffix}`.trim();

            return {
              name: c?.name?.common || "",
              code,
              cca2: c?.cca2 || "",
              flag:
                c?.flags?.png ||
                `https://flagcdn.com/w40/${String(
                  c?.cca2 || "",
                ).toLowerCase()}.png`,
            };
          })
          .filter((item) => item.name && item.code && item.cca2)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(list);

        const bd = list.find((item) => item.cca2 === "BD");
        if (bd) setSelected(bd);
      } catch (error) {
        console.error("Country fetch failed:", error);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (!isBangladeshSelected) resetOtp();
  }, [isBangladeshSelected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCountdown]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;

    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.cca2.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const cleanLocalPhone = useMemo(() => {
    return String(formData.phone || "")
      .replace(/\D/g, "")
      .trim();
  }, [formData.phone]);

  const bdPhoneForApi = useMemo(() => {
    return normalizeBdLocalPhone(cleanLocalPhone);
  }, [cleanLocalPhone]);

  const fullPhone = useMemo(() => {
    const code = String(selected.code || "").replace(/\D/g, "");
    return `${code}${cleanLocalPhone}`;
  }, [selected.code, cleanLocalPhone]);

  const apiPhone = isBangladeshSelected ? bdPhoneForApi : fullPhone;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "phone" || name === "otp" ? value.replace(/\D/g, "") : value,
    }));

    if (name === "phone") resetOtp();
  };

  const handleSendOtp = async () => {
    try {
      if (!isBangladeshSelected) return;

      if (!bdPhoneForApi) {
        return toast.error(text.phoneRequired);
      }

      setSendingOtp(true);

      const { data } = await api.post(
        "/api/users/affiliate/send-forget-password-otp",
        {
          phone: bdPhoneForApi,
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || text.otpFailed);
      }

      setOtpSent(true);
      setStep(2);
      setOtpCountdown(Number(data?.resendAfter || 60));

      toast.success(data?.message || text.otpSent);
    } catch (error) {
      console.error(error);

      const waitSeconds = error?.response?.data?.waitSeconds;
      if (waitSeconds) setOtpCountdown(Number(waitSeconds));

      toast.error(
        error?.response?.data?.message || error?.message || text.otpFailed,
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleNext = () => {
    if (!cleanLocalPhone) {
      return toast.error(text.phoneRequired);
    }

    if (isBangladeshSelected && !formData.otp.trim()) {
      return toast.error(text.otpRequired);
    }

    setStep(3);
  };

  const handleResetPassword = async () => {
    try {
      const { otp, password, confirmPassword } = formData;

      if (!cleanLocalPhone) {
        return toast.error(text.phoneRequired);
      }

      if (isBangladeshSelected && !otp.trim()) {
        return toast.error(text.otpRequired);
      }

      if (!password) {
        return toast.error(text.passwordRequired);
      }

      if (!confirmPassword) {
        return toast.error(text.confirmRequired);
      }

      if (password.length < 8 || password.length > 20) {
        return toast.error(text.passwordLength);
      }

      if (password !== confirmPassword) {
        return toast.error(text.passwordMatch);
      }

      setResetting(true);

      const payload = {
        phone: apiPhone,
        password,
      };

      if (isBangladeshSelected) {
        payload.otp = otp.trim();
      } else {
        payload.skipOtp = true;
      }

      const { data } = await api.post(
        "/api/users/affiliate/forget-password",
        payload,
      );

      if (!data?.success) {
        throw new Error(data?.message || text.resetFailed);
      }

      toast.success(data?.message || text.resetSuccess);
      navigate("/login");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || error?.message || text.resetFailed,
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-6 md:px-6 lg:px-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-6 rounded-2xl border border-green-700/40 bg-gradient-to-r from-black via-green-950/40 to-black p-5 shadow-lg shadow-green-900/20">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
              <FaLock className="text-2xl text-black" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                {text.title}
              </h2>
              <p className="mt-1 text-sm text-green-200/80 md:text-base">
                {text.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-2 rounded-full transition-all ${
                step >= item ? "w-12 bg-green-400" : "w-7 bg-green-950"
              }`}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black p-4 shadow-xl shadow-green-950/20 md:p-6"
        >
          <div className="space-y-5">
            <div ref={dropdownRef} className="relative">
              <label className="mb-2 block text-sm font-medium text-green-200">
                {text.phone}
              </label>

              <div className="flex rounded-xl border border-green-700/40 bg-black/70 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/20">
                <button
                  type="button"
                  disabled={step > 1}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 border-r border-green-700/40 px-3 text-white cursor-pointer disabled:opacity-60"
                >
                  <img
                    src={selected.flag}
                    alt={selected.name}
                    className="h-[14px] w-[22px] object-cover border border-white/30"
                  />
                  <span className="text-sm font-semibold">{selected.code}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={step > 1}
                  placeholder={text.phonePlaceholder}
                  className="min-w-0 flex-1 rounded-r-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-green-300/40 disabled:opacity-70"
                />
              </div>

              {dropdownOpen && step === 1 && (
                <div className="absolute left-0 top-[78px] z-50 w-full min-w-[280px] rounded-xl border border-green-700/40 bg-[#031b12] shadow-xl shadow-green-950/50">
                  <div className="border-b border-green-700/40 p-2">
                    <div className="flex items-center gap-2 rounded-lg border border-green-700/40 px-3">
                      <FaSearch className="text-green-300" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={text.searchCountry}
                        className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder-green-300/40"
                      />
                    </div>
                  </div>

                  <div className="max-h-[240px] overflow-y-auto">
                    {filteredCountries.map((item) => (
                      <button
                        key={`${item.cca2}-${item.code}`}
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setDropdownOpen(false);
                          setSearch("");
                          resetOtp();
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-green-950/60 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={item.flag}
                            alt={item.name}
                            className="h-[14px] w-[22px] object-cover border border-white/30"
                          />
                          <span className="text-sm text-white">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-green-300">
                          {item.code}
                        </span>
                      </button>
                    ))}

                    {filteredCountries.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-green-200/70">
                        {isBangla ? "কোন দেশ পাওয়া যায়নি" : "No country found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {step >= 2 && isBangladeshSelected && (
              <div>
                <label className="mb-2 block text-sm font-medium text-green-200">
                  {text.otp}
                </label>

                <input
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  disabled={step > 2}
                  placeholder={text.otpPlaceholder}
                  className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white outline-none placeholder:text-green-300/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 disabled:opacity-70"
                />
              </div>
            )}

            {step >= 3 && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-green-200">
                    {text.password}
                  </label>

                  <div className="relative">
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      placeholder={text.passwordPlaceholder}
                      className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 pr-12 text-white outline-none placeholder:text-green-300/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-green-300 hover:text-white"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-green-200">
                    {text.confirmPassword}
                  </label>

                  <div className="relative">
                    <input
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={text.confirmPasswordPlaceholder}
                      className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 pr-12 text-white outline-none placeholder:text-green-300/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-green-300 hover:text-white"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            {step === 1 && isBangladeshSelected && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpCountdown > 0}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3.5 font-bold text-black shadow-lg shadow-green-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sendingOtp
                  ? text.sendingOtp
                  : otpCountdown > 0
                    ? `${otpCountdown}s`
                    : otpSent
                      ? text.resendOtp
                      : text.sendOtp}
              </button>
            )}

            {step === 1 && !isBangladeshSelected && (
              <button
                type="button"
                onClick={handleNext}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3.5 font-bold text-black shadow-lg shadow-green-600/30"
              >
                {text.next}
              </button>
            )}

            {step === 2 && isBangladeshSelected && (
              <>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3.5 font-bold text-black shadow-lg shadow-green-600/30"
                >
                  {text.next}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || otpCountdown > 0}
                  className="cursor-pointer text-sm text-green-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingOtp
                    ? text.sendingOtp
                    : otpCountdown > 0
                      ? `${text.resendOtp} (${otpCountdown}s)`
                      : text.resendOtp}
                </button>
              </>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetting}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3.5 font-bold text-black shadow-lg shadow-green-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resetting ? text.resetting : text.resetPassword}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="cursor-pointer text-sm text-green-400"
            >
              {text.backLogin}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgetPassword;
