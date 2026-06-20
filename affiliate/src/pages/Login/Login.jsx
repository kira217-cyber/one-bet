import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const text = useMemo(
    () => ({
      title: isBangla ? "অ্যাফিলিয়েট লগইন" : "Affiliate Login",

      userId: isBangla ? "ইউজার আইডি" : "User Id",
      password: isBangla ? "পাসওয়ার্ড" : "Password",

      login: isBangla ? "লগইন" : "Login",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",

      forgotPassword: isBangla ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?",
      noAccount: isBangla ? "অ্যাকাউন্ট নেই?" : "Don't have an account?",
      register: isBangla ? "রেজিস্টার" : "Register",

      required: isBangla
        ? "ইউজার আইডি এবং পাসওয়ার্ড দিন"
        : "Please enter user id and password",
      success: isBangla ? "লগইন সফল হয়েছে" : "Affiliate login successful",
      failed: isBangla ? "লগইন ব্যর্থ হয়েছে" : "Affiliate login failed",
    }),
    [isBangla],
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    try {
      const { userId, password } = formData;

      if (!userId || !password) {
        return toast.error(text.required);
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
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-green-400">{text.title}</h2>
        </div>

        <div className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black p-5 shadow-lg">
          <div className="space-y-4">
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
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-green-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="mt-2 text-right">
                <Link
                  to="/forget-password"
                  className="text-sm text-green-400 underline cursor-pointer"
                >
                  {text.forgotPassword}
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full cursor-pointer bg-green-500 text-black py-3 rounded-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? text.loading : text.login}
            </button>

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
