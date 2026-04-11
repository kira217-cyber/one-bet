import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaRedoAlt, FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

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

  const [captcha, setCaptcha] = useState(
    Math.floor(1000 + Math.random() * 9000).toString(),
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      validationCode: isBangla ? "ভ্যালিডেশন কোড" : "Validation Code",
      register: isBangla ? "রেজিস্টার" : "Register",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",

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
      validationPlaceholder: isBangla
        ? "কোড লিখুন"
        : "Enter code",

      fillRequired: isBangla
        ? "সব প্রয়োজনীয় তথ্য পূরণ করুন"
        : "Please fill all required fields",
      validationMismatch: isBangla
        ? "ভ্যালিডেশন কোড মিলছে না"
        : "Validation code does not match",
      registerFailed: isBangla
        ? "অ্যাফিলিয়েট রেজিস্ট্রেশন ব্যর্থ হয়েছে"
        : "Affiliate registration failed",
    }),
    [isBangla],
  );

  const refreshCaptcha = () => {
    setCaptcha(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "referralCode"
          ? e.target.value.toUpperCase()
          : e.target.value,
    }));
  };

  const handleRegister = async () => {
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
        verificationCode,
      } = formData;

      if (
        !userId ||
        !password ||
        !confirmPassword ||
        !firstName ||
        !lastName ||
        !phone ||
        !verificationCode
      ) {
        return toast.error(text.fillRequired);
      }

      if (verificationCode !== captcha) {
        return toast.error(text.validationMismatch);
      }

      setLoading(true);

      const { data } = await api.post("/api/users/affiliate/register", {
        userId,
        password,
        confirmPassword,
        firstName,
        lastName,
        phone,
        email,
        referralCode,
      });

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
        refreshCaptcha();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || text.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-black px-4 py-6 md:px-6 lg:px-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black p-4 md:p-6 lg:p-7 shadow-xl shadow-green-950/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {/* User ID */}
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

            {/* First Name */}
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

            {/* Last Name */}
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                {text.phone}
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={text.phonePlaceholder}
                className="w-full rounded-xl border border-green-700/40 bg-black/70 px-4 py-3 text-white placeholder-green-300/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            {/* Email */}
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

            {/* Refer Code */}
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

            {/* Password */}
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

            {/* Confirm Password */}
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

            {/* Validation Code */}
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

                <div className="rounded-xl bg-white text-black px-2 py-2 md:px-5 md:py-3 font-bold flex items-center justify-center">
                  {captcha}
                </div>

                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black px-5 py-3 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRedoAlt />
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
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
