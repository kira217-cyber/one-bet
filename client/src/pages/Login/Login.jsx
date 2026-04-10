import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate } from "react-router";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {" "}
      {/* Top Bar */}
      <div className="mb-4 relative bg-[#0b5c45] px-4 py-4">
        <button className="absolute" onClick={() => navigate("/")}>
          <FaAngleLeft className="text-3xl text-gray-200 cursor-pointer " />
        </button>
        <h2 className="text-xl text-center text-white">Login</h2>
      </div>
      <div className="px-4 pt-4 text-white">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <h1 className="text-center font-bold">
            <img
              src="https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/7cbc1ab7-a435-460a-2a83-e69643e58000/public"
              className="w-60 h-14"
            />
          </h1>
        </div>

        {/* Form */}
        <div className="bg-[#0b5c45] rounded-md overflow-hidden">
          {/* User ID */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-6">
            <label className="w-24 text-md text-white">User Id</label>
            <input
              type="text"
              placeholder="User Id"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="flex items-center  px-4 py-6">
            <label className="w-24 text-md text-white">Password</label>
            <div className="flex items-center flex-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-300 text-2xl cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right mt-3">
          <button className="text-[#F0DC05] text-md border border-[#F0DC05] px-2 cursor-pointer py-2 rounded">
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button className="w-full mt-5 bg-[#F0DC05] text-xl text-black cursor-pointer py-4 rounded-sm">
          Login
        </button>

        {/* Demo Login */}
        <button className="w-full mt-6 bg-[#F0DC05] text-xl text-black cursor-pointer py-4 rounded-sm">
          Demo Login
        </button>

        {/* Signup */}
        <p className="text-center text-md mt-6 text-gray-200">
          Do not have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-[#F0DC05] cursor-pointer underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </>
  );
};

export default Login;
