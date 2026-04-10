import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate } from "react-router";

const Register = () => {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="mb-4 relative bg-[#0b5c45] px-4 py-4">
        <button
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
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-6">
            <label className="w-28 text-md text-white">
              User Id
            </label>
            <input
              type="text"
              placeholder="4-15 char,allow number"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-6">
            <label className="w-28 text-md text-white">
              Password
            </label>
            <div className="flex items-center flex-1">
              <input
                type={showPass ? "text" : "password"}
                placeholder="8-20 char"
                className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="text-gray-300 text-2xl cursor-pointer"
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-6">
            <label className="w-28 text-md text-white">
              Confirm Password
            </label>
            <div className="flex items-center flex-1">
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm Password"
                className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
              />
              <button
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="text-gray-300 text-2xl cursor-pointer"
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Currency */}
          <div className="flex items-center px-4 py-6">
            <label className="w-28 text-md text-white">
              Currency
            </label>
            <select className="bg-transparent outline-none text-md flex-1 text-gray-200 cursor-pointer">
              <option>BDT</option>
            </select>
          </div>
        </div>

        {/* FORM SECTION 2 */}
        <div className="bg-[#0b5c45] overflow-hidden mb-4">
          {/* Full Name */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-6">
            <label className="w-28 text-md text-white">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Full Name"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div className="flex items-center border-b border-[#0f6b50] px-4 py-6">
            <label className="w-28 text-md text-white">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>

          {/* Refer Code */}
          <div className="flex items-center px-4 py-6">
            <label className="w-28 text-md text-white">
              Refer Code
            </label>
            <input
              type="text"
              placeholder="Enter if you have one"
              className="bg-transparent outline-none text-md flex-1 placeholder-gray-400"
            />
          </div>
        </div>

        {/* VERIFICATION */}
        <div className="bg-[#0b5c45] overflow-hidden mb-6 px-4 py-6 flex items-center">
          <label className="w-28 text-md text-white">
            Verification Code
          </label>

          <input
            type="text"
            placeholder="4 digit code"
            className="bg-transparent outline-none text-md w-28 md:flex-1 placeholder-gray-400"
          />

          <div className="bg-white text-black px-3 py-1 text-md font-bold mx-2">
            9946
          </div>

          <button className="text-white text-xl cursor-pointer">↻</button>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button className="bg-[#F0DC05] text-black text-lg px-10 py-3 rounded-sm cursor-pointer">
            Confirm
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
