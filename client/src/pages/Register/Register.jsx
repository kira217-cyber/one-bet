import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { setAuth } from "../../features/auth/authSlice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    Math.floor(1000 + Math.random() * 9000).toString()
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
        return toast.error("Please fill all required fields");
      }

      if (userId.length < 4 || userId.length > 15) {
        return toast.error("User Id must be 4 to 15 characters");
      }

      const userIdRegex = /^[a-zA-Z0-9@._-]+$/;
      if (!userIdRegex.test(userId)) {
        return toast.error(
          "User Id can contain only letters, numbers, @, dot, underscore and hyphen"
        );
      }

      if (password.length < 8 || password.length > 20) {
        return toast.error("Password must be 8 to 20 characters");
      }

      if (password !== confirmPassword) {
        return toast.error("Password and Confirm Password do not match");
      }

      if (verificationCode !== captcha) {
        return toast.error("Verification code does not match");
      }

      setLoading(true);

      const { data } = await api.post("/api/users/register", {
        userId: userId.trim(),
        password,
        currency,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        referralCode: referralCode.trim(),
      });

      if (data?.success) {
        dispatch(
          setAuth({
            user: data.user,
            token: data.token,
          })
        );

        toast.success("Registration successful");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Registration failed");
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
        <h2 className="text-xl text-center text-white">Sign up</h2>
      </div>

      <div className="px-4 pt-2 text-white">
        {/* FORM SECTION 1 */}
        <div className="bg-[#0b5c45] overflow-hidden mb-4">
          {/* User ID */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">User Id</label>
            <input
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              type="text"
              placeholder="4-15 char, allow @ . _ -"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">Password</label>
            <div className="flex items-center flex-1">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPass ? "text" : "password"}
                placeholder="8-20 char"
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
            <label className="w-28 text-md text-white">Confirm Password</label>
            <div className="flex items-center flex-1">
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm Password"
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
            <label className="w-28 text-md text-white">Currency</label>
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
            <label className="w-28 text-md text-white">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="text"
              placeholder="Phone Number"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>
        </div>

        {/* FORM SECTION 2 */}
        <div className="bg-[#0b5c45] overflow-hidden mb-4">
          {/* Full Name */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              type="text"
              placeholder="Full Name"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-4">
            <label className="w-28 text-md text-white">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          {/* Refer Code */}
          <div className="flex items-center px-4 py-4">
            <label className="w-28 text-md text-white">Refer Code</label>
            <input
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              type="text"
              placeholder="Enter if you have one"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>
        </div>

        {/* VERIFICATION */}
        <div className="bg-[#0b5c45] overflow-hidden mb-6 px-4 py-4 flex items-center">
          <label className="w-28 text-md text-white">Verification Code</label>

          <input
            name="verificationCode"
            value={formData.verificationCode}
            onChange={handleChange}
            type="text"
            placeholder="4 digit code"
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
            {loading ? "Loading..." : "Confirm"}
          </button>
        </div>

        {/* TERMS */}
        <p className="text-center text-sm mt-5 text-green-400">
          I'm 18 years old, and agree to terms and conditions
        </p>
      </div>
    </>
  );
};

export default Register;