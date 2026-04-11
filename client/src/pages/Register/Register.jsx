import React, { useEffect, useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { setAuth } from "../../features/auth/authSlice";
import { useLanguage } from "../../Context/LanguageProvider";

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

  const [captcha, setCaptcha] = useState(
    Math.floor(1000 + Math.random() * 9000).toString(),
  );

  const [loading, setLoading] = useState(false);

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
      verificationCode: isBangla ? "ভেরিফিকেশন কোড" : "Verification Code",
      confirm: isBangla ? "কনফার্ম" : "Confirm",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
      terms: isBangla
        ? "আমার বয়স ১৮ বছর, এবং আমি শর্তাবলীতে সম্মত"
        : "I'm 18 years old, and agree to terms and conditions",

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
      verificationPlaceholder: isBangla ? "৪ সংখ্যার কোড" : "4 digit code",

      requiredError: isBangla
        ? "সব প্রয়োজনীয় ঘর পূরণ করুন"
        : "Please fill all required fields",
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
      verificationError: isBangla
        ? "ভেরিফিকেশন কোড সঠিক নয়"
        : "Verification code does not match",
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "referralCode" ? value.toUpperCase() : value,
    }));
  };

  const refreshCaptcha = () => {
    setCaptcha(Math.floor(1000 + Math.random() * 9000).toString());
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
        phone,
        referralCode,
        verificationCode,
      } = formData;

      if (!userId || !password || !confirmPassword || !fullName || !phone) {
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

      if (verificationCode !== captcha) {
        return toast.error(text.verificationError);
      }

      setLoading(true);

      const { data } = await api.post("/api/users/register", {
        userId: userId.trim(),
        password,
        currency,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        referralCode: referralCode.trim().toUpperCase(),
      });

      if (data?.success) {
        dispatch(
          setAuth({
            user: data.user,
            token: data.token,
          }),
        );

        toast.success(text.registerSuccess);
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
      {/* Top Bar */}
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
        {/* FORM SECTION 1 */}
        <div className="bg-[#0b5c45] overflow-hidden mb-4">
          {/* User ID */}
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

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Currency */}
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

          {/* Phone */}
          <div className="flex items-center px-4 py-4">
            <label className="w-28 text-md text-white">{text.phone}</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="text"
              placeholder={text.phonePlaceholder}
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>
        </div>

        {/* FORM SECTION 2 */}
        <div className="bg-[#0b5c45] overflow-hidden mb-4">
          {/* Full Name */}
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

          {/* Email */}
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

          {/* Refer Code */}
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

        {/* VERIFICATION */}
        <div className="bg-[#0b5c45] overflow-hidden mb-6 px-4 py-4 flex items-center">
          <label className="w-28 text-md text-white">
            {text.verificationCode}
          </label>

          <input
            name="verificationCode"
            value={formData.verificationCode}
            onChange={handleChange}
            type="text"
            placeholder={text.verificationPlaceholder}
            className="bg-transparent outline-none text-md w-28 md:flex-1 placeholder-gray-400"
          />

          <div className="bg-white text-black px-3 py-1 text-md font-bold mx-2">
            {captcha}
          </div>

          <button
            type="button"
            onClick={refreshCaptcha}
            className="text-white text-xl cursor-pointer"
          >
            ↻
          </button>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="bg-[#F0DC05] text-black text-lg px-10 py-3 rounded-sm cursor-pointer"
          >
            {loading ? text.loading : text.confirm}
          </button>
        </div>

        {/* TERMS */}
        <p className="text-center text-sm mt-5 text-green-400">{text.terms}</p>
      </div>
    </>
  );
};

export default Register;
