import React, { useState } from "react";
import { X, House, Ticket, Wallet, UserRound, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";
import { toast } from "react-toastify";

const BottomNavbar = () => {
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  const { language, changeLanguage, isBangla } = useLanguage();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

 const handleLogout = () => {
  dispatch(logout());
  setOpenAccount(false);

  toast.success("Logout successful");

  navigate("/");
};

  const Flag = () => {
    if (isBangla) {
      return (
        <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
        </div>
      );
    }

    return (
      <img
        src="https://flagcdn.com/w40/gb.png"
        alt="English"
        className="w-6 h-6 rounded-full object-cover"
      />
    );
  };

  const navItems = [
    {
      to: "/",
      label: isBangla ? "হোম" : "Home",
      icon: House,
    },
    {
      to: "/promotions",
      label: isBangla ? "প্রমোশন" : "Promotions",
      icon: Ticket,
    },
    {
      to: "/deposit",
      label: isBangla ? "ডিপোজিট" : "Deposit",
      icon: Wallet,
    },
     {
      to: "/account",
      label: isBangla ? "অ্যাকাউন্ট" : "Account",
      icon: UserRound,
    },
  ];

  return (
    <>
      {/* Logged Out Navbar */}
      {!isAuthenticated && (
        <div className="fixed bottom-0 left-0 w-full z-50">
          <div className="max-w-[480px] mx-auto flex text-white font-semibold">
            {/* Currency + Language */}
            <div
              onClick={() => setOpenLanguage(true)}
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
      )}

      {/* Logged In Navbar */}
      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 w-full z-50">
          <div className="max-w-[480px] mx-auto bg-[#00513f] flex items-center justify-between text-white px-2 py-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={index}
                  to={item.to}
                  className="flex flex-col items-center justify-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? "bg-white/20" : "bg-transparent"
                    }`}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <span className="text-[12px] leading-none mt-1">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* My Account */}
            {/* <button
              type="button"
              onClick={() => setOpenAccount(true)}
              className="flex flex-col items-center justify-center flex-1 cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  location.pathname === "/my-account"
                    ? "bg-white/20"
                    : "bg-transparent"
                }`}
              >
                <UserRound size={22} strokeWidth={1.8} />
              </div>
              <span className="text-[12px] leading-none mt-1">
                {isBangla ? "আমার অ্যাকাউন্ট" : "My Account"}
              </span>
            </button> */}
          </div>
        </div>
      )}

      {/* Language Modal */}
      {openLanguage && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60]">
          <div className="bg-gray-700 w-full max-w-[480px] rounded-t-xl md:rounded-md overflow-hidden">
            <div className="flex justify-between items-center bg-green-700 px-4 py-4 text-white">
              <h2 className="text-lg font-semibold">
                {isBangla ? "মুদ্রা এবং ভাষা" : "Currency and Language"}
              </h2>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setOpenLanguage(false)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Flag />
                <p>{isBangla ? "৳ বিডিটি" : "৳ BDT"}</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
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
                  type="button"
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

      {/* My Account / Logout Modal */}
      {openAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60]">
          <div className="bg-gray-700 w-full max-w-[480px] rounded-t-xl md:rounded-md overflow-hidden">
            <div className="flex justify-between items-center bg-green-700 px-4 py-4 text-white">
              <h2 className="text-lg font-semibold">
                {isBangla ? "আমার অ্যাকাউন্ট" : "My Account"}
              </h2>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setOpenAccount(false)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <Link
                to="/my-account"
                onClick={() => setOpenAccount(false)}
                className="block w-full text-center bg-[#0b5c45] text-white py-3 rounded"
              >
                {isBangla ? "প্রোফাইল দেখুন" : "View Profile"}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded cursor-pointer"
              >
                <LogOut size={18} />
                {isBangla ? "লগআউট" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavbar;
