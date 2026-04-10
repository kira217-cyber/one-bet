import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";
import { adminLogin } from "../../features/auth/authAPI";
import { setCredentials } from "../../features/auth/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: adminLogin,
    onSuccess: (data) => {
      if (!data?.token || !data?.admin?.email) {
        toast.error("Login response invalid");
        return;
      }

      dispatch(setCredentials({ admin: data.admin, token: data.token }));
      toast.success("Admin login success");
      navigate(from, { replace: true });
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    },
  });

  const onSubmit = (formData) => {
    mutate({
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-green-950/20 to-black">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-gradient-to-b from-black via-green-950/30 to-black border border-green-700/40 rounded-2xl shadow-2xl shadow-green-900/30 p-8 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-green-500/40">
            <FaUserShield className="text-3xl text-black" />
          </div>

          <h2 className="text-3xl font-bold text-white tracking-tight">
            Admin Login
          </h2>

          <p className="text-sm text-green-200/80 mt-2 text-center">
            Enter your email and password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-green-100 mb-1.5 font-medium">
              Email
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-green-700/50 px-5 py-3.5 text-white placeholder-green-400/50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all duration-300"
              placeholder="email@example.com"
              type="email"
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm text-green-100 mb-1.5 font-medium">
              Password
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-green-700/50 px-5 py-3.5 text-white placeholder-green-400/50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all duration-300 pr-12"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[2.8rem] text-green-300 hover:text-green-100 transition-colors duration-200 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: isPending ? 1 : 1.03 }}
            whileTap={{ scale: isPending ? 1 : 0.97 }}
            disabled={isPending}
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold py-3.5 rounded-xl shadow-lg shadow-green-600/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaUserShield className="text-lg text-black" />
            {isPending ? "Logging in..." : "Login"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
