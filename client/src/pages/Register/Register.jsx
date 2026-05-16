import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { setAuth } from "../../features/auth/authSlice";
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { isBangla } = useLanguage();

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    currency: "BDT",
    fullName: "",
    email: "",
    phone: "",
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

  const isBangladeshSelected = selected?.cca2 === "BD";

  const resetOtp = () => {
    setOtpSent(false);
    setOtpCountdown(0);
    setFormData((prev) => ({ ...prev, verificationCode: "" }));
  };

  const text = useMemo(
    () => ({
      title: isBangla ? "সাইন আপ" : "Sign up",
      userId: isBangla ? "ইউজার আইডি" : "User Id",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      currency: isBangla ? "কারেন্সি" : "Currency",
      phone: isBangla ? "ফোন" : "Phone",
      fullName: isBangla ? "পূর্ণ নাম" : "Full Name",
      email: isBangla ? "ইমেইল" : "Email",
      referCode: isBangla ? "রেফার কোড" : "Refer Code",
      verificationCode: isBangla ? "ওটিপি " : "OTP",
      sendOtp: isBangla ? "ওটিপি পাঠান" : "Send OTP",
      resendOtp: isBangla ? "আবার পাঠান" : "Resend OTP",
      sendingOtp: isBangla ? "পাঠানো হচ্ছে..." : "Sending...",
      confirm: isBangla ? "কনফার্ম" : "Confirm",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
      terms: isBangla
        ? "আমার বয়স ১৮ বছর, এবং আমি শর্তাবলীতে সম্মত"
        : "I'm 18 years old, and agree to terms and conditions",
      searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",
      userIdPlaceholder: isBangla
        ? "৪-১৫ অক্ষর, @ . _ - ব্যবহার করা যাবে"
        : "4-15 char, allow @ . _ -",
      passwordPlaceholder: isBangla ? "৮-২০ অক্ষর" : "8-20 char",
      confirmPasswordPlaceholder: isBangla
        ? "কনফার্ম পাসওয়ার্ড"
        : "Confirm Password",
      phonePlaceholder: isBangla ? "ফোন নাম্বার" : "Phone Number",
      fullNamePlaceholder: isBangla ? "পূর্ণ নাম" : "Full Name",
      emailPlaceholder: isBangla ? "ইমেইল" : "Email",
      referCodePlaceholder: isBangla ? "থাকলে লিখুন" : "Enter if you have one",
      verificationPlaceholder: isBangla
        ? "এসএমএস ওটিপি লিখুন"
        : "Enter SMS OTP",
      requiredError: isBangla
        ? "সব প্রয়োজনীয় ঘর পূরণ করুন"
        : "Please fill all required fields",
      phoneRequiredError: isBangla
        ? "আগে ফোন নাম্বার দিন"
        : "Please enter phone number first",
      otpRequiredError: isBangla ? "ওটিপি কোড দিন" : "Please enter OTP code",
      otpSendFailed: isBangla ? "ওটিপি পাঠানো যায়নি" : "Failed to send OTP",
      userIdLengthError: isBangla
        ? "ইউজার আইডি ৪ থেকে ১৫ অক্ষরের হতে হবে"
        : "User Id must be 4 to 15 characters",
      userIdFormatError: isBangla
        ? "ইউজার আইডিতে শুধু অক্ষর, সংখ্যা, @, ডট, আন্ডারস্কোর এবং হাইফেন ব্যবহার করা যাবে"
        : "User Id can contain only letters, numbers, @, dot, underscore and hyphen",
      passwordLengthError: isBangla
        ? "পাসওয়ার্ড ৮ থেকে ২০ অক্ষরের হতে হবে"
        : "Password must be 8 to 20 characters",
      passwordMatchError: isBangla
        ? "পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না"
        : "Password and Confirm Password do not match",
      registerSuccess: isBangla
        ? "রেজিস্ট্রেশন সফল হয়েছে"
        : "Registration successful",
      registerFailed: isBangla
        ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে"
        : "Registration failed",
    }),
    [isBangla],
  );

  useEffect(() => {
    const refFromQuery = searchParams.get("ref");
    if (refFromQuery) {
      setFormData((prev) => ({
        ...prev,
        referralCode: refFromQuery.trim().toUpperCase(),
      }));
    }
  }, [searchParams]);

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

      toast.success(data?.message || "OTP sent successfully");
    } catch (error) {
      console.error(error);

      const waitSeconds = error?.response?.data?.waitSeconds;
      if (waitSeconds) setOtpCountdown(Number(waitSeconds));

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
        currency,
        fullName,
        email,
        referralCode,
        verificationCode,
      } = formData;

      if (
        !userId ||
        !password ||
        !confirmPassword ||
        !fullName ||
        !cleanLocalPhone
      ) {
        return toast.error(text.requiredError);
      }

      if (userId.length < 4 || userId.length > 15) {
        return toast.error(text.userIdLengthError);
      }

      const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
      if (!userIdRegex.test(userId)) {
        return toast.error(text.userIdFormatError);
      }

      if (password.length < 8 || password.length > 20) {
        return toast.error(text.passwordLengthError);
      }

      if (password !== confirmPassword) {
        return toast.error(text.passwordMatchError);
      }

      if (isBangladeshSelected && !verificationCode.trim()) {
        return toast.error(text.otpRequiredError);
      }

      setLoading(true);

      const payload = {
        userId: userId.trim(),
        password,
        confirmPassword,
        currency,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: registerPhone,
        referralCode: referralCode.trim().toUpperCase(),
      };

      if (isBangladeshSelected) {
        payload.verificationCode = verificationCode.trim();
      }

      const { data } = await api.post("/api/users/register", payload);

      if (data?.success) {
        dispatch(
          setAuth({
            user: data.user,
            token: data.token,
          }),
        );

        toast.success(data?.message || text.registerSuccess);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || text.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 relative bg-[#0b5c45] px-4 py-4">
        <button
          type="button"
          className="absolute cursor-pointer"
          onClick={() => navigate("/")}
        >
          <FaAngleLeft className="text-3xl text-gray-200" />
        </button>
        <h2 className="text-xl text-center text-white">{text.title}</h2>
      </div>

      <div className="px-4 pt-2 text-white">
        <div className="bg-[#0b5c45] overflow-visible mb-4">
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">{text.userId}</label>
            <input
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              type="text"
              placeholder={text.userIdPlaceholder}
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">{text.password}</label>
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

          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
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

          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">{text.currency}</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="bg-transparent outline-none text-md flex-1 text-gray-200 cursor-pointer"
            >
              <option value="BDT" className="text-black">
                BDT
              </option>
            </select>
          </div>

          <div className="relative flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">{text.phone}</label>

            <div
              ref={dropdownRef}
              className="relative flex flex-1 items-center"
            >
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 pr-2 text-white cursor-pointer"
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
                placeholder={text.phonePlaceholder}
                className="min-w-0 bg-transparent outline-none text-md flex-1 placeholder-gray-400"
              />

              {dropdownOpen && (
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

                    {filteredCountries.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-gray-300">
                        {isBangla ? "কোন দেশ পাওয়া যায়নি" : "No country found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isBangladeshSelected && (
            <div className="flex items-center px-4 py-4">
              <label className="w-28 text-md text-white">
                {text.verificationCode}
              </label>

              <input
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                type="text"
                placeholder={text.verificationPlaceholder}
                className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpCountdown > 0}
                className="ml-1 min-w-[80px] bg-[#F0DC05] px-1 py-1 sm:px-3 sm:py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
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
          )}
        </div>

        <div className="bg-[#0b5c45] overflow-hidden mb-4">
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">{text.fullName}</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              type="text"
              placeholder={text.fullNamePlaceholder}
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">{text.email}</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder={text.emailPlaceholder}
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center px-4 py-4">
            <label className="w-28 text-md text-white">{text.referCode}</label>
            <input
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              type="text"
              placeholder={text.referCodePlaceholder}
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="bg-[#F0DC05] text-black text-lg px-10 py-3 rounded-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? text.loading : text.confirm}
          </button>
        </div>

        <p className="text-center text-sm mt-5 text-green-400">{text.terms}</p>
      </div>
    </>
  );
};

export default Register;
