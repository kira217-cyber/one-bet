import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  User,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  BadgePercent,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

const InfoRow = ({
  icon,
  label,
  value,
  rightAction = null,
  valueClass = "",
}) => {
  return (
    <div className="rounded-2xl bg-[#006c4b] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
      <div className="mb-2 flex items-center gap-2 text-white/75">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div
          className={`min-w-0 break-all text-[20px] font-semibold text-white ${valueClass}`}
        >
          {value}
        </div>
        {rightAction}
      </div>
    </div>
  );
};

const Wallet = () => {
  const navigate = useNavigate();

  const authUser = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [loadingBalance, setLoadingBalance] = useState(true);
  const [reloadingBalance, setReloadingBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const [walletData, setWalletData] = useState({
    userId: "",
    balance: 0,
    referralCode: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login first.");
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchWalletData = async (isReload = false) => {
    try {
      if (isReload) {
        setReloadingBalance(true);
      } else {
        setLoadingBalance(true);
      }

      const [balanceRes, meRes] = await Promise.all([
        api.get("/api/users/balance"),
        api.get("/api/users/me"),
      ]);

      const balanceData = balanceRes?.data?.data || {};
      const meUser = meRes?.data?.user || {};

      setWalletData({
        userId: balanceData?.userId || meUser?.userId || authUser?.userId || "",
        balance: Number(balanceData?.balance || 0),
        referralCode: meUser?.referralCode || authUser?.referralCode || "",
      });

      if (isReload) {
        toast.success("Balance reloaded successfully.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load wallet data.";
      toast.error(message);
    } finally {
      setLoadingBalance(false);
      setReloadingBalance(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchWalletData();
  }, [authLoading, isAuthenticated]);

  const handleCopyReferralCode = async () => {
    if (!walletData?.referralCode) {
      toast.error("Referral code not found.");
      return;
    }

    try {
      await navigator.clipboard.writeText(walletData.referralCode);
      setCopied(true);
      toast.success("Referral code copied.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Failed to copy referral code.");
    }
  };

  const formattedBalance = useMemo(() => {
    const amount = Number(walletData?.balance || 0);
    return `৳ ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [walletData?.balance]);

  if (authLoading || loadingBalance) {
    return (
      <div className="min-h-screen bg-[#004d3b] flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-white text-base font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#004d3b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex h-[68px] items-center justify-center bg-[#f2ef00] px-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 items-center justify-center text-white cursor-pointer"
        >
          <ArrowLeft size={28} strokeWidth={2.1} />
        </button>

        <h1 className="text-[24px] font-normal text-[#165a3e] sm:text-[26px]">
          Wallet
        </h1>
      </div>

      <div className="mx-auto w-full max-w-[560px] px-3 pb-8 pt-4 sm:px-4">
        {/* Top wallet summary */}
        <div className="mb-5 rounded-[26px] bg-gradient-to-br from-[#0b7454] via-[#006c4b] to-[#01513a] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.24)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2ef00] text-[#165a3e] shadow-sm">
              <WalletIcon size={24} />
            </div>
            <div>
              <p className="text-sm text-white/70">Available Balance</p>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-[28px] font-bold tracking-tight text-white">
                  {showBalance ? formattedBalance : "৳ ••••••"}
                </h2>

                <button
                  type="button"
                  onClick={() => setShowBalance((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 cursor-pointer"
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => fetchWalletData(true)}
                  disabled={reloadingBalance}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  <RefreshCw
                    size={18}
                    className={reloadingBalance ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Account
            </p>
            <p className="mt-1 break-all text-[17px] font-semibold text-white">
              {walletData?.userId || "N/A"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <InfoRow
            icon={<User size={18} />}
            label="User ID"
            value={walletData?.userId || "N/A"}
          />

          <InfoRow
            icon={<WalletIcon size={18} />}
            label="Balance"
            value={showBalance ? formattedBalance : "৳ ••••••"}
            rightAction={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBalance((prev) => !prev)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2ef00] text-[#165a3e] transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => fetchWalletData(true)}
                  disabled={reloadingBalance}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2ef00] text-[#165a3e] transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  <RefreshCw
                    size={18}
                    className={reloadingBalance ? "animate-spin" : ""}
                  />
                </button>
              </div>
            }
          />

          <InfoRow
            icon={<BadgePercent size={18} />}
            label="Referral Code"
            value={walletData?.referralCode || "N/A"}
            valueClass="tracking-[0.16em] text-[#f2ef00]"
            rightAction={
              <button
                type="button"
                onClick={handleCopyReferralCode}
                className="inline-flex h-10 min-w-[96px] items-center justify-center gap-2 rounded-xl bg-[#f2ef00] px-3 text-sm font-semibold text-[#165a3e] transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
