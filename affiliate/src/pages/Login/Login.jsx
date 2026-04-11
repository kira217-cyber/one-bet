import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { setAuth } from "../../features/auth/authSlice";
import { Link, useNavigate } from "react-router";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
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

  const handleLogin = async () => {
    try {
      const { userId, password, verificationCode } = formData;

      if (!userId || !password || !verificationCode) {
        return toast.error("Please fill all required fields");
      }

      if (verificationCode !== captcha) {
        return toast.error("Validation code does not match");
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

        toast.success("Affiliate login successful");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Affiliate login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 text-white">
      <h2 className="text-xl mb-4">Affiliate Login</h2>

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
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-yellow-400 text-black py-3"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="text-center text-sm pt-2">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-yellow-400 underline font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
