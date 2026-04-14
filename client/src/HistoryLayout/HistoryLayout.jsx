import React, { useEffect, useState } from "react";
import HistoryNavbar from "../components/HistoryNavbar/HistoryNavbar";
import { Outlet, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RefreshCw, Eye, EyeOff } from "lucide-react";
import {
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSelectors";
import { api } from "../api/axios";
import { useLanguage } from "../context/LanguageProvider";


const HistoryLayout = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const authUser = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);

  const [profile, setProfile] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const text = {
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    failed: isBangla ? "ব্যালেন্স লোড করা যায়নি" : "Failed to load balance",
    wallet: isBangla ? "রিয়েল ওয়ালেট" : "REAL WALLET",
  };

  const formatMoney = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const loadProfile = async () => {
    if (!isAuthed) {
      setProfile(null);
      return;
    }

    try {
      setLoadingBalance(true);

      const { data } = await api.get("/api/users/me");
      const userData = data?.user || data?.data || null;

      if (userData) {
        setProfile(userData);
      }
    } catch (error) {
      console.error("Failed to fetch profile/balance:", error);
      toast.error(error?.response?.data?.message || text.failed);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [isAuthed]);

  const realUser = profile || authUser || null;
  const realBalance = formatMoney(realUser?.balance || 0);

  return (
    <div>
      <div className="w-full max-w-[476px] h-[61px] bg-[#f4f400] flex items-center justify-between px-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center text-white cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="text-[#118c1d] text-[16px] sm:text-[22px] font-medium uppercase tracking-[0.3px]">
            {text.wallet}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProfile}
            disabled={loadingBalance}
            className={`flex items-center justify-center text-[#118c1d] ${
              loadingBalance ? "opacity-70" : "cursor-pointer"
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingBalance ? "animate-spin" : ""}`}
              strokeWidth={2.3}
            />
          </button>

          <button
            type="button"
            onClick={() => setShowBalance((prev) => !prev)}
            className="flex items-center justify-center text-[#118c1d] cursor-pointer"
          >
            {showBalance ? (
              <Eye className="w-4 h-4" strokeWidth={2.3} />
            ) : (
              <EyeOff className="w-4 h-4" strokeWidth={2.3} />
            )}
          </button>

          <div className="flex items-center gap-2">

            <span className="text-[#118c1d] text-[18px] font-medium">
              {loadingBalance
                ? text.loading
                : showBalance
                  ? realBalance
                  : "••••••"}
            </span>
          </div>

          <div className="bg-red-600 text-white text-[14px] font-semibold px-3 py-[3px] rounded-full leading-none">
            Exp -0
          </div>
        </div>
      </div>

      <HistoryNavbar />
      <Outlet />
    </div>
  );
};

export default HistoryLayout;
