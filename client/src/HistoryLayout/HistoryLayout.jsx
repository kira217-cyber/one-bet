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
    loading: isBangla ? "লোড..." : "Loading...",
    failed: isBangla ? "ব্যালেন্স লোড করা যায়নি" : "Failed to load balance",
    wallet: isBangla ? "রিয়েল ওয়ালেট" : "REAL WALLET",
    exposure: isBangla ? "এক্সপোজার" : "Exp",
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
        setProfile({
          ...userData,

          balance: data?.balance ?? userData?.balance ?? 0,

          exposureBalance:
            data?.exposureBalance ??
            data?.nineWicket?.exposureBalance ??
            userData?.exposureBalance ??
            userData?.nineWicket?.exposureBalance ??
            0,

          totalBalance: data?.totalBalance ?? userData?.totalBalance ?? 0,

          nineWicket: data?.nineWicket ?? userData?.nineWicket ?? null,
        });
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

  const realExposureBalance = formatMoney(
    realUser?.exposureBalance ?? realUser?.nineWicket?.exposureBalance ?? 0,
  );

  return (
    <div>
      <div className="flex h-[61px] w-full max-w-[476px] items-center justify-between bg-[#f4f400] px-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center justify-center text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="text-[16px] font-medium uppercase tracking-[0.3px] text-[#118c1d] sm:text-[22px]">
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
              className={`h-4 w-4 ${loadingBalance ? "animate-spin" : ""}`}
              strokeWidth={2.3}
            />
          </button>

          <button
            type="button"
            onClick={() => setShowBalance((prev) => !prev)}
            className="flex cursor-pointer items-center justify-center text-[#118c1d]"
          >
            {showBalance ? (
              <Eye className="h-4 w-4" strokeWidth={2.3} />
            ) : (
              <EyeOff className="h-4 w-4" strokeWidth={2.3} />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[18px] font-medium text-[#118c1d]">
              {loadingBalance
                ? text.loading
                : showBalance
                  ? realBalance
                  : "••••••"}
            </span>
          </div>

          <div className="rounded-full bg-red-600 px-3 py-[3px] text-[14px] font-semibold leading-none text-white">
            {text.exposure}{" "}
            {loadingBalance
              ? "..."
              : showBalance
                ? realExposureBalance
                : "••••"}
          </div>
        </div>
      </div>

      <HistoryNavbar />

      <Outlet />
    </div>
  );
};

export default HistoryLayout;
