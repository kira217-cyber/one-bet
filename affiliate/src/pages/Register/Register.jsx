import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaSearch, FaUserPlus } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
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

const Register = () => {
  const { isBangla } = useLanguage();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    referralCode: "",
    verificationCode: "",
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

  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isBangladeshSelected = selected?.cca2 === "BD";

  const resetOtp = () => {
    setOtpSent(false);
    setOtpCountdown(0);
    setFormData((prev) => ({ ...prev, verificationCode: "" }));
  };

  const text = useMemo(
    () => ({
      title: isBangla ? "অ্যাফিলিয়েট রেজিস্টার" : "Affiliate Register",
      subtitle: isBangla
        ? "নিচের তথ্যগুলো পূরণ করে আপনার অ্যাফিলিয়েট অ্যাকাউন্ট তৈরি করুন"
        : "Fill in the information below to create your affiliate account",

      userId: isBangla ? "ইউজার আইডি" : "User Id",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      firstName: isBangla ? "নামের প্রথম অংশ" : "First Name",
      lastName: isBangla ? "নামের শেষ অংশ" : "Last Name",
      phone: isBangla ? "ফোন" : "Phone",
      email: isBangla ? "ইমেইল" : "Email",
      referCode: isBangla ? "রেফার কোড" : "Refer Code",
      validationCode: isBangla ? "ওটিপি কোড" : "OTP Code",
      sendOtp: isBangla ? "ওটিপি পাঠান" : "Send OTP",
      resendOtp: isBangla ? "আবার পাঠান" : "Resend OTP",
      sendingOtp: isBangla ? "পাঠানো হচ্ছে..." : "Sending...",
      otpSent: isBangla ? "ওটিপি পাঠানো হয়েছে" : "OTP sent successfully",
      register: isBangla ? "রেজিস্টার" : "Register",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
      searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",

      userIdPlaceholder: isBangla ? "ইউজার আইডি লিখুন" : "Enter user id",
      passwordPlaceholder: isBangla ? "পাসওয়ার্ড লিখুন" : "Enter password",
      confirmPasswordPlaceholder: isBangla
        ? "কনফার্ম পাসওয়ার্ড লিখুন"
        : "Enter confirm password",
      firstNamePlaceholder: isBangla
        ? "নামের প্রথম অংশ লিখুন"
        : "Enter first name",
      lastNamePlaceholder: isBangla ? "নামের শেষ অংশ লিখুন" : "Enter last name",
      phonePlaceholder: isBangla ? "ফোন নাম্বার লিখুন" : "Enter phone number",
      emailPlaceholder: isBangla ? "ইমেইল লিখুন" : "Enter email",
      referCodePlaceholder: isBangla
        ? "রেফার কোড থাকলে লিখুন"
        : "Enter refer code if you have one",
      validationPlaceholder: isBangla ? "এসএমএস ওটিপি লিখুন" : "Enter SMS OTP",

      fillRequired: isBangla
        ? "সব প্রয়োজনীয় তথ্য পূরণ করুন"
        : "Please fill all required fields",
      phoneRequiredError: isBangla
        ? "আগে ফোন নাম্বার দিন"
        : "Please enter phone number first",
      otpRequiredError: isBangla ? "ওটিপি কোড দিন" : "Please enter OTP code",
      otpSendFailed: isBangla ? "ওটিপি পাঠানো যায়নি" : "Failed to send OTP",
      registerFailed: isBangla
        ? "অ্যাফিলিয়েট রেজিস্ট্রেশন ব্যর্থ হয়েছে"
        : "Affiliate registration failed",
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

  const registerPhone = isBangladeshSelected ? bdPhoneForApi : fullPhone;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "referralCode"
          ? value.toUpperCase()
          : name === "phone" || name === "verificationCode"
            ? value.replace(/\D/g, "")
            : value,
    }));

    if (name === "phone") resetOtp();
  };

  const handleSendOtp = async () => {
    try {
      if (!isBangladeshSelected) return;

      if (!bdPhoneForApi) {
        return toast.error(text.phoneRequiredError);
      }

      setSendingOtp(true);
      setOtpSent(false);

      const { data } = await api.post("/api/users/send-register-otp", {
        phone: bdPhoneForApi,
      });

      if (!data?.success) {
        throw new Error(data?.message || text.otpSendFailed);
      }

      setOtpSent(true);
      setOtpCountdown(Number(data?.resendAfter || 60));
      toast.success(data?.message || text.otpSent);
    } catch (error) {
      const waitSeconds = error?.response?.data?.waitSeconds;

      if (waitSeconds) {
        setOtpCountdown(Number(waitSeconds));
      }

      toast.error(
        error?.response?.data?.message || error?.message || text.otpSendFailed,
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async () => {
    try {
      const {
        userId,
        password,
        confirmPassword,
        firstName,
        lastName,
        email,
        referralCode,
        verificationCode,
      } = formData;

      if (
        !userId ||
        !password ||
        !confirmPassword ||
        !firstName ||
        !lastName ||
        !cleanLocalPhone
      ) {
        return toast.error(text.fillRequired);
      }

      if (isBangladeshSelected && !verificationCode.trim()) {
        return toast.error(text.otpRequiredError);
      }

      setLoading(true);

      const payload = {
        userId: userId.trim(),
        password,
        confirmPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: registerPhone,
        email: email.trim(),
        referralCode: referralCode.trim().toUpperCase(),
      };

      if (isBangladeshSelected) {
        payload.verificationCode = verificationCode.trim();
      }

      const { data } = await api.post("/api/users/affiliate/register", payload);

      if (data?.success) {
        toast.success(data.message);

        setFormData({
          userId: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          referralCode: "",
          verificationCode: "",
        });

        setOtpSent(false);
        setOtpCountdown(0);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || text.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black px-4 py-6 md:px-6 lg:px-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-6 rounded-2xl border border-green-700/40 bg-gradient-to-r from-black via-green-950/40 to-black p-5 shadow-lg shadow-green-900/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <FaUserPlus className="text-2xl text-black" />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {text.title}
              </h2>
              <p className="text-sm md:text-base text-green-200/80 mt-1">
                {text.subtitle}
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black p-4 md:p-6 lg:p-7 shadow-xl shadow-green-950/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.userId}
              </label>
              <input
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder={text.userIdPlaceholder}
                className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.firstName}
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={text.firstNamePlaceholder}
                className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.lastName}
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={text.lastNamePlaceholder}
                className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.phone}
              </label>

              <div className="flex rounded-xl border border-green-700/40 bg-black/70 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/20">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 px-3 text-white cursor-pointer border-r border-green-700/40"
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
                  placeholder={text.phonePlaceholder}
                  className="min-w-0 flex-1 rounded-r-xl bg-transparent px-4 py-3 text-white placeholder-green-300/40 outline-none"
                />
              </div>

              {dropdownOpen && (
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

            {isBangladeshSelected && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-green-200 mb-2">
                  {text.validationCode}
                </label>

                <div className="flex flex-row gap-1 md:gap-3">
                  <input
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    placeholder={text.validationPlaceholder}
                    className="flex-1 rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 w-32 md:w-auto"
                  />

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpCountdown > 0}
                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black px-3 md:px-5 py-3 font-semibold flex items-center justify-center gap-2 min-w-[110px]"
                  >
                    {sendingOtp
                      ? text.sendingOtp
                      : otpCountdown > 0
                        ? `${otpCountdown}s`
                        : otpSent
                          ? text.resendOtp
                          : text.sendOtp}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.email}
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={text.emailPlaceholder}
                className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.referCode}
              </label>
              <input
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder={text.referCodePlaceholder}
                className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.password}
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={text.passwordPlaceholder}
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 pr-12 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-300 hover:text-white cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.confirmPassword}
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={text.confirmPasswordPlaceholder}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 pr-12 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-300 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black py-3.5 font-bold text-base shadow-lg shadow-green-600/30"
            >
              {loading ? text.loading : text.register}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
