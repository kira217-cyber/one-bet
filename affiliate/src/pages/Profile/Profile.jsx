import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/affiliate/profile");

      if (data?.success) {
        setFormData({
          userId: data.user?.userId || "",
          password: "",
          firstName: data.user?.firstName || "",
          lastName: data.user?.lastName || "",
          phone: data.user?.phone || "",
          email: data.user?.email || "",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const { userId, password, firstName, lastName, phone, email } = formData;

      if (!userId || !firstName || !lastName || !phone) {
        return toast.error(
          "User ID, First Name, Last Name and Phone are required",
        );
      }

      if (userId.length < 4 || userId.length > 20) {
        return toast.error("User ID must be between 4 and 20 characters");
      }

      const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
      if (!userIdRegex.test(userId)) {
        return toast.error(
          "User ID can contain only letters, numbers, @, dot, underscore and hyphen",
        );
      }

      if (password && (password.length < 8 || password.length > 20)) {
        return toast.error("Password must be between 8 and 20 characters");
      }

      setSaving(true);

      const payload = {
        userId: userId.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      if (password.trim()) {
        payload.password = password;
      }

      const { data } = await api.patch("/api/affiliate/profile", payload);

      if (data?.success) {
        toast.success(data.message || "Profile updated successfully");

        setFormData((prev) => ({
          ...prev,
          password: "",
          userId: data.user?.userId || prev.userId,
          firstName: data.user?.firstName || prev.firstName,
          lastName: data.user?.lastName || prev.lastName,
          phone: data.user?.phone || prev.phone,
          email: data.user?.email || prev.email,
        }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] text-white">
        <div className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black p-6 text-center">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-green-700/40 bg-gradient-to-r from-black via-green-950/30 to-black p-5 shadow-lg shadow-green-900/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40">
            <FaUserCircle className="text-4xl text-black" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              My Profile
            </h1>
            <p className="text-green-200/80 mt-1">
              Update your affiliate account information
            </p>
          </div>
        </div>
      </div>

      {/* Form Box */}
      <div className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black/90 via-green-950/20 to-black/90 p-5 md:p-6 shadow-lg shadow-green-900/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* User ID */}
          <div>
            <label className="block text-sm text-green-200 mb-2">User ID</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="Enter user id"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-green-200 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-green-300 hover:text-white cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm text-green-200 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm text-green-200 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-green-200 mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-green-200 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
            />
          </div>
        </div>

        {/* Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleUpdateProfile}
            disabled={saving}
            className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-semibold shadow-lg shadow-green-600/30"
          >
            {saving ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
