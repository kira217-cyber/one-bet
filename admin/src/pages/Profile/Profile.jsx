import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { api } from "../../api/axios";
import { logout } from "../../features/auth/authSlice";

const fetchProfile = async () => {
  const { data } = await api.get("/api/admin/profile");
  return data;
};

const updateProfile = async (payload) => {
  const { data } = await api.put("/api/admin/profile", payload);
  return data;
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: fetchProfile,
    retry: 1,
  });

  useEffect(() => {
    if (data?.admin?.email) {
      reset({
        email: data.admin.email,
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [data, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success(data?.message || "Profile updated");
      dispatch(logout());
      navigate("/login", { replace: true });
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Update failed";
      toast.error(msg);
    },
  });

  const onSubmit = (formData) => {
    mutate({
      email: formData.email?.trim(),
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword || "",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    const msg = error?.response?.data?.message || "Failed to load profile";
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-b from-black via-green-950/30 to-black border border-green-700/40 rounded-2xl p-8 text-center shadow-xl shadow-green-900/30 backdrop-blur-sm"
        >
          <p className="text-red-400 text-lg font-medium">{msg}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-br from-black via-green-950/20 to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-gradient-to-b from-black via-green-950/30 to-black border border-green-700/40 rounded-2xl shadow-2xl shadow-green-900/40 p-8 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Admin Profile
          </h2>
          <p className="text-sm text-green-200/80 mt-2 text-center">
            Changing email or password will require login again
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-green-100 mb-1.5 font-medium">
              Email
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-green-700/50 px-5 py-3.5 text-white placeholder-green-400/50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all duration-300"
              type="email"
              placeholder="admin@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm text-green-100 mb-1.5 font-medium">
              Current Password
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-green-700/50 px-5 py-3.5 text-white placeholder-green-400/50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all duration-300 pr-12"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-[2.8rem] text-green-300 hover:text-green-100 transition-colors duration-200 cursor-pointer"
            >
              {showCurrentPassword ? (
                <FaEyeSlash size={20} />
              ) : (
                <FaEye size={20} />
              )}
            </button>
            {errors.currentPassword && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm text-green-100 mb-1.5 font-medium">
              New Password
            </label>
            <input
              className="w-full rounded-xl bg-black/70 border border-green-700/50 px-5 py-3.5 text-white placeholder-green-400/50 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all duration-300 pr-12"
              type={showNewPassword ? "text" : "password"}
              placeholder="Leave blank to keep current"
              {...register("newPassword", {
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-[2.8rem] text-green-300 hover:text-green-100 transition-colors duration-200 cursor-pointer"
            >
              {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.newPassword && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: isPending ? 1 : 1.03 }}
            whileTap={{ scale: isPending ? 1 : 0.97 }}
            disabled={isPending}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold py-3.5 rounded-xl shadow-lg shadow-green-600/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Updating..." : "Update Profile"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;