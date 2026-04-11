import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaRedoAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { setAuth } from "../../features/auth/authSlice";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    verificationCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(
    Math.floor(1000 + Math.random() * 9000).toString(),
  );
  const [loading, setLoading] = useState(false);

  const text = useMemo(
    () => ({
      title: isBangla ? "অ্যাফিলিয়েট লগইন" : "Affiliate Login",

      userId: isBangla ? "ইউজার আইডি" : "User Id",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      validationCode: isBangla ? "ভ্যালিডেশন কোড" : "Validation Code",

      login: isBangla ? "লগইন" : "Login",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",

      noAccount: isBangla ? "অ্যাকাউন্ট নেই?" : "Don't have an account?",
      register: isBangla ? "রেজিস্টার" : "Register",

      required: isBangla
        ? "সব তথ্য পূরণ করুন"
        : "Please fill all required fields",
      mismatch: isBangla
        ? "ভ্যালিডেশন কোড মিলছে না"
        : "Validation code does not match",
      success: isBangla ? "লগইন সফল হয়েছে" : "Affiliate login successful",
      failed: isBangla ? "লগইন ব্যর্থ হয়েছে" : "Affiliate login failed",
    }),
    [isBangla],
  );

  const refreshCaptcha = () => {
    setCaptcha(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    try {
      const { userId, password, verificationCode } = formData;

      if (!userId || !password || !verificationCode) {
        return toast.error(text.required);
      }

      if (verificationCode !== captcha) {
        return toast.error(text.mismatch);
      }

      setLoading(true);

      const { data } = await api.post("/api/users/affiliate/login", {
        userId,
        password,
      });

      if (data?.success) {
        dispatch(
          setAuth({
            user: data.user,
            token: data.token,
          }),
        );

        toast.success(text.success);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || text.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black px-4 py-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-green-400">{text.title}</h2>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black p-5 shadow-lg">
          <div className="space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-sm mb-1 text-green-300">
                {text.userId}
              </label>
              <input
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder={text.userId}
                className="w-full p-3 rounded-lg bg-black border border-green-700/40 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1 text-green-300">
                {text.password}
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder={text.password}
                  className="w-full p-3 rounded-lg bg-black border border-green-700/40 outline-none pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-green-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Captcha */}
            <div>
              <label className="block text-sm mb-1 text-green-300">
                {text.validationCode}
              </label>

              <div className="flex gap-1 md:gap-2">
                <input
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  placeholder={text.validationCode}
                  className="flex-1 p-3 rounded-lg bg-black border border-green-700/40 w-32 md:w-auto"
                />

                <div className="bg-white text-black px-2 md:px-4 flex items-center font-bold rounded">
                  {captcha}
                </div>

                <button
                  onClick={refreshCaptcha}
                  className="cursor-pointer bg-green-500 text-black px-3 rounded"
                >
                  <FaRedoAlt />
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full cursor-pointer bg-green-500 text-black py-3 rounded-lg font-semibold"
            >
              {loading ? text.loading : text.login}
            </button>

            {/* Register */}
            <p className="text-center text-sm">
              {text.noAccount}{" "}
              <Link
                to="/register"
                className="text-green-400 underline cursor-pointer"
              >
                {text.register}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
