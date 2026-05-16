import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
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

const ForgetPassword = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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

  const isBangladeshSelected = selected?.cca2 === "BD";

  const resetOtp = () => {
    setOtpSent(false);
    setOtpCountdown(0);
    setFormData((prev) => ({ ...prev, otp: "" }));
  };

  const text = useMemo(
    () => ({
      title: isBangla ? "পাসওয়ার্ড ভুলে গেছেন" : "Forget Password",
      phone: isBangla ? "ফোন" : "Phone",
      otp: isBangla ? "ওটিপি কোড" : "OTP Code",
      password: isBangla ? "নতুন পাসওয়ার্ড" : "New Password",
      confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      phonePlaceholder: isBangla ? "ফোন নাম্বার" : "Phone Number",
      otpPlaceholder: isBangla ? "এসএমএস ওটিপি লিখুন" : "Enter SMS OTP",
      passwordPlaceholder: isBangla ? "৮-২০ অক্ষর" : "8-20 char",
      confirmPasswordPlaceholder: isBangla
        ? "কনফার্ম পাসওয়ার্ড"
        : "Confirm Password",
      searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",
      sendOtp: isBangla ? "ওটিপি পাঠান" : "Send OTP",
      resendOtp: isBangla ? "আবার পাঠান" : "Resend OTP",
      sendingOtp: isBangla ? "পাঠানো হচ্ছে..." : "Sending...",
      verifyNext: isBangla ? "পরবর্তী" : "Next",
      resetPassword: isBangla ? "পাসওয়ার্ড পরিবর্তন করুন" : "Reset Password",
      resetting: isBangla ? "আপডেট হচ্ছে..." : "Updating...",
      phoneRequired: isBangla
        ? "আগে ফোন নাম্বার দিন"
        : "Please enter phone number first",
      otpRequired: isBangla ? "ওটিপি কোড দিন" : "Please enter OTP code",
      passwordRequired: isBangla
        ? "নতুন পাসওয়ার্ড দিন"
        : "Please enter new password",
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
      backLogin: isBangla ? "লগইনে ফিরে যান" : "Back to Login",
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
      setOtpSent(false);

      const { data } = await api.post("/api/users/send-forget-password-otp", {
        phone: bdPhoneForApi,
      });

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

      const { data } = await api.post("/api/users/forget-password", payload);

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
    <>
      <div className="mb-4 relative bg-[#0b5c45] px-4 py-4">
        <button
          type="button"
          className="absolute cursor-pointer"
          onClick={() => navigate("/login")}
        >
          <FaAngleLeft className="text-3xl text-gray-200" />
        </button>

        <h2 className="text-xl text-center text-white">{text.title}</h2>
      </div>

      <div className="px-4 pt-2 text-white">
        <div className="mb-4 flex items-center justify-center gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-2 rounded-full transition-all ${
                step >= item ? "w-10 bg-[#F0DC05]" : "w-6 bg-[#0b5c45]"
              }`}
            />
          ))}
        </div>

        <div className="bg-[#0b5c45] overflow-visible mb-4">
          <div className="relative flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">{text.phone}</label>

            <div
              ref={dropdownRef}
              className="relative flex flex-1 items-center"
            >
              <button
                type="button"
                disabled={step > 1}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 pr-2 text-white cursor-pointer disabled:opacity-60"
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
                type="text"
                disabled={step > 1}
                placeholder={text.phonePlaceholder}
                className="min-w-0 bg-transparent outline-none text-md flex-1 placeholder-gray-400 disabled:opacity-70"
              />

              {dropdownOpen && step === 1 && (
                <div className="absolute left-0 top-10 z-50 w-[260px] rounded-md border border-[#0f6b50] bg-[#073b2d] shadow-lg">
                  <div className="border-b border-[#0f6b50] p-2">
                    <div className="flex items-center gap-2 rounded-md border border-[#0f6b50] px-2">
                      <FaSearch className="text-gray-300" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={text.searchCountry}
                        className="h-9 w-full bg-transparent text-sm outline-none placeholder-gray-400"
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
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#0b5c45] cursor-pointer"
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
                        <span className="text-sm font-semibold text-[#F0DC05]">
                          {item.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {step >= 2 && isBangladeshSelected && (
            <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
              <label className="w-28 text-md text-white">{text.otp}</label>

              <input
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                type="text"
                disabled={step > 2}
                placeholder={text.otpPlaceholder}
                className="bg-transparent outline-none text-md flex-1 placeholder-gray-400 disabled:opacity-70"
              />
            </div>
          )}

          {step >= 3 && (
            <>
              <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
                <label className="w-28 text-md text-white">
                  {text.password}
                </label>

                <div className="flex items-center flex-1">
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPass ? "text" : "password"}
                    placeholder={text.passwordPlaceholder}
                    className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-gray-300 text-2xl cursor-pointer"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center px-4 py-4">
                <label className="w-28 text-md text-white">
                  {text.confirmPassword}
                </label>

                <div className="flex items-center flex-1">
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPass ? "text" : "password"}
                    placeholder={text.confirmPasswordPlaceholder}
                    className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="text-gray-300 text-2xl cursor-pointer"
                  >
                    {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          {step === 1 && isBangladeshSelected && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || otpCountdown > 0}
              className="bg-[#F0DC05] text-black text-lg px-10 py-3 rounded-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
              className="bg-[#F0DC05] text-black text-lg px-10 py-3 rounded-sm cursor-pointer"
            >
              {text.verifyNext}
            </button>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#F0DC05] text-black text-lg px-10 py-3 rounded-sm cursor-pointer"
              >
                {text.verifyNext}
              </button>

              {isBangladeshSelected && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || otpCountdown > 0}
                  className="text-sm text-green-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingOtp
                    ? text.sendingOtp
                    : otpCountdown > 0
                      ? `${text.resendOtp} (${otpCountdown}s)`
                      : text.resendOtp}
                </button>
              )}
            </>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetting}
              className="bg-[#F0DC05] text-black text-lg px-8 py-3 rounded-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {resetting ? text.resetting : text.resetPassword}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-green-400 cursor-pointer"
          >
            {text.backLogin}
          </button>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
