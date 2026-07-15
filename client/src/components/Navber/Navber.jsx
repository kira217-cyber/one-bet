import React, { useEffect, useState } from "react";
import { Download, RefreshCw, Eye, EyeOff, Wallet } from "lucide-react";
import { BiMenuAltLeft } from "react-icons/bi";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../context/LanguageProvider";
import { api } from "../../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

const Navber = ({ setOpen }) => {
  const { isBangla } = useLanguage();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authUser = useSelector(selectUser);

  const [siteIdentity, setSiteIdentity] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchSiteIdentity = async () => {
      try {
        const res = await api.get("/api/site-identity");

        setSiteIdentity(res?.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch site identity:", error);

        setSiteIdentity(null);
      }
    };

    fetchSiteIdentity();
  }, []);

  const loadProfile = async () => {
    if (!isAuthenticated) {
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
      console.error("Failed to fetch navbar balance:", error);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [isAuthenticated]);

  const formatMoney = (value) => {
    const num = Number(value || 0);

    return `৳${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const logoSrc = siteIdentity?.logo
    ? siteIdentity.logo.startsWith("http")
      ? siteIdentity.logo
      : `${import.meta.env.VITE_APP_URL}${siteIdentity.logo}`
    : null;

  const realUser = profile || authUser || null;

  const balanceText = showBalance
    ? formatMoney(realUser?.balance || 0)
    : "৳••••";

  const exposureBalanceText = showBalance
    ? formatMoney(
        realUser?.exposureBalance ?? realUser?.nineWicket?.exposureBalance ?? 0,
      )
    : "৳••••";

  return (
    <div className="fixed top-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-between bg-[#005C40] px-2 py-2 text-white">
      {/* Menu + Logo */}
      <div className="flex min-w-0 shrink-0 items-center gap-1">
        <BiMenuAltLeft
          onClick={() => setOpen(true)}
          className="h-8 w-8 shrink-0 cursor-pointer text-yellow-400"
        />

        <Link to="/" className="flex shrink-0 items-center">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="site-logo"
              className="h-12 w-24 object-contain"
            />
          ) : (
            <div className="h-12 w-20 animate-pulse rounded bg-[#003c29] sm:w-24" />
          )}
        </Link>
      </div>

      {/* Balance - middle */}
      {isAuthenticated && (
        <div className="flex rounded-xl border border-yellow-400/40 bg-gradient-to-r from-[#003c29] to-[#006c4a] px-1 py-1 shadow-md shadow-black/30">
          <div className="flex min-w-0 flex-1 flex-col justify-center leading-none">
            <span className="mr-1 max-w-auto truncate text-[14px] font-extrabold text-yellow-400 sm:text-[18px]">
              {loadingBalance ? "..." : balanceText}
            </span>

            <span className="mt-[3px] mr-1 truncate text-[10px] font-semibold text-white/80 sm:text-[12px]">
              {isBangla ? "এক্সপোজার" : "Exposure"}:{" "}
              <span className="font-bold text-red-300">
                {loadingBalance ? "..." : exposureBalanceText}
              </span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={loadProfile}
              disabled={loadingBalance}
              className="cursor-pointer rounded-full bg-black/25 p-1 text-white disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingBalance ? "animate-spin" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowBalance((prev) => !prev)}
              className="cursor-pointer rounded-full bg-black/25 p-1 text-white"
            >
              {showBalance ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <>
          {/* Right Desktop */}
          <div className="hidden shrink-0 items-center gap-3 text-xs sm:flex">
            <Link
              to="/auto-deposit"
              className="flex cursor-pointer flex-col items-center font-bold text-yellow-400 transition-all hover:scale-105"
            >
              <Download className="h-7 w-7" />

              <span>{isBangla ? "ডিপোজিট" : "Deposit"}</span>
            </Link>

            <Link
              to="/withdraw"
              className="flex cursor-pointer flex-col items-center font-bold text-yellow-400 transition-all hover:scale-105"
            >
              <Wallet className="h-7 w-7" />

              <span>{isBangla ? "উইথড্র" : "Withdraw"}</span>
            </Link>
          </div>

          {/* Right Mobile */}
          <div className="flex shrink-0 items-center gap-2 text-[11px] sm:hidden">
            <Link
              to="/auto-deposit"
              className="flex cursor-pointer flex-col items-center font-bold text-yellow-400 transition-all active:scale-95"
            >
              <Download className="h-4 w-4" />

              <span>{isBangla ? "ডিপো" : "Depo"}</span>
            </Link>

            <Link
              to="/withdraw"
              className="flex cursor-pointer flex-col items-center font-bold text-yellow-400 transition-all active:scale-95"
            >
              <Wallet className="h-4 w-4" />

              <span>{isBangla ? "উইথ" : "With"}</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Navber;
