import React, { useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const BottomNavbar = () => {
  const [open, setOpen] = useState(false);

  // 🔥 Context
  const { language, changeLanguage, isBangla } = useLanguage();

  // 🔥 Flag
  const Flag = () => {
    if (isBangla) {
      return (
        <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
        </div>
      );
    } else {
      return (
        <img
          src="https://flagcdn.com/w40/gb.png"
          alt="English"
          className="w-6 h-6 rounded-full object-cover"
        />
      );
    }
  };

  return (
    <>
      {/* 🔥 Bottom Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <div className="max-w-[480px] mx-auto flex text-white font-semibold">
          {/* Currency + Language */}
          <div
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-green-700 px-4 py-3 cursor-pointer w-1/3"
          >
            <Flag />
            <div className="text-sm leading-tight">
              <p>BDT</p>
              <p>{isBangla ? "বাংলা" : "English"}</p>
            </div>
          </div>

          {/* Login */}
          <Link
            to="/login"
            className="flex items-center justify-center bg-green-800 w-1/3 cursor-pointer"
          >
            {isBangla ? "লগইন" : "Login"}
          </Link>

          {/* Sign Up */}
          <Link
            to="/register"
            className="flex items-center justify-center bg-yellow-400 text-black w-1/3 cursor-pointer"
          >
            {isBangla ? "সাইন আপ" : "Sign up"}
          </Link>
        </div>
      </div>

      {/* 🔥 Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-gray-700 w-full max-w-[480px] rounded-t-xl md:rounded-md overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center bg-green-700 px-4 py-4 text-white">
              <h2 className="text-lg font-semibold">
                {isBangla ? "মুদ্রা এবং ভাষা" : "Currency and Language"}
              </h2>
              <button className="cursor-pointer" onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex items-center justify-between">
              {/* Currency */}
              <div className="flex items-center gap-3 text-white">
                <Flag />
                <p>{isBangla ? "৳ বিডিটি" : "৳ BDT"}</p>
              </div>

              {/* Language Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => changeLanguage("English")}
                  className={`px-6 cursor-pointer py-2 border ${
                    language === "English"
                      ? "border-white bg-white text-black"
                      : "border-gray-300 text-white"
                  }`}
                >
                  English
                </button>

                <button
                  onClick={() => changeLanguage("Bangla")}
                  className={`px-6 cursor-pointer py-2 border ${
                    language === "Bangla"
                      ? "border-white bg-white text-black"
                      : "border-gray-300 text-white"
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavbar;
