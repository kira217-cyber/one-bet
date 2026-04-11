import React, { useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const Register = () => {
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

  const refreshCaptcha = () => {
    setCaptcha(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
        return toast.error("Please fill all required fields");
      }

      if (verificationCode !== captcha) {
        return toast.error("Validation code does not match");
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
      toast.error(
        error?.response?.data?.message || "Affiliate registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 text-white">
      <h2 className="text-xl mb-4">Affiliate Register</h2>

      <div className="space-y-3">
        <input
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          placeholder="User Id"
          className="w-full p-3 text-black"
        />
        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          className="w-full p-3 text-black"
        />
        <input
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          type="password"
          className="w-full p-3 text-black"
        />
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full p-3 text-black"
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full p-3 text-black"
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-3 text-black"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 text-black"
        />
        <input
          name="referralCode"
          value={formData.referralCode}
          onChange={handleChange}
          placeholder="Refer Code"
          className="w-full p-3 text-black"
        />

        <div className="flex gap-2">
          <input
            name="verificationCode"
            value={formData.verificationCode}
            onChange={handleChange}
            placeholder="Validation Code"
            className="flex-1 p-3 text-black"
          />
          <div className="bg-white text-black px-4 flex items-center font-bold">
            {captcha}
          </div>
          <button
            type="button"
            onClick={refreshCaptcha}
            className="bg-yellow-400 text-black px-3"
          >
            ↻
          </button>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-400 text-black py-3"
        >
          {loading ? "Loading..." : "Register"}
        </button>
      </div>
    </div>
  );
};

export default Register;
