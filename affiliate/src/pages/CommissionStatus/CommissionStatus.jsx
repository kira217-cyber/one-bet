import React, { useEffect, useMemo, useState } from "react";
import {
  FaSyncAlt,
  FaWallet,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaGift,
  FaGamepad,
  FaCoins,
} from "react-icons/fa";
import { api } from "../../api/axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectAuth, selectToken } from "../../features/auth/authSelectors";

const money = (n, currency = "BDT") => {
  const symbol = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(n || 0);

  if (!Number.isFinite(num)) {
    return `${symbol} 0.00`;
  }

  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-xl shadow-green-900/20";

const miniCard =
  "rounded-2xl border border-green-700/30 bg-black/40 p-5 hover:border-green-500/40 transition";

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/10 animate-pulse h-[120px]" />
);

const InfoCard = ({
  title,
  value,
  subtitle,
  icon,
  colorClass = "text-green-300",
}) => {
  return (
    <div className={miniCard}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-green-100/75">
            {title}
          </div>
          <div className="mt-2 text-[24px] font-extrabold text-white break-words">
            {value}
          </div>
          {subtitle ? (
            <div className="mt-2 text-[12px] text-green-200/60">{subtitle}</div>
          ) : null}
        </div>

        <div
          className={`h-12 w-12 rounded-2xl border border-green-500/20 bg-green-500/10 flex items-center justify-center shrink-0 ${colorClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const CommissionStatus = () => {
  const auth = useSelector(selectAuth);
  const tokenFromSelector = useSelector(selectToken);
  const token = tokenFromSelector || auth?.token || "";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const headers = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get("/api/affiliate/commission-status", {
        headers,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load commission status");
      }

      setData(data?.data || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load commission status",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const summary = useMemo(() => {
    const mainBalance = n(data?.mainBalance);
    const gameLossCommission = n(data?.gameLossCommission);
    const gameWinCommission = n(data?.gameWinCommission);
    const referCommission = n(data?.referCommission);
    const depositCommission = n(data?.depositCommission);

    const gameWinCommissionBalance = n(data?.gameWinCommissionBalance);
    const referCommissionBalance = n(data?.referCommissionBalance);
    const depositCommissionBalance = n(data?.depositCommissionBalance);
    const gameLossCommissionBalance = n(data?.gameLossCommissionBalance);

    const totalRate =
      gameLossCommission +
      gameWinCommission +
      referCommission +
      depositCommission;

    const totalCommissionBalance =
      referCommissionBalance +
      depositCommissionBalance +
      gameLossCommissionBalance;

    const totalPendingAdjustment =
      referCommissionBalance +
      depositCommissionBalance +
      gameLossCommissionBalance +
      gameWinCommissionBalance;

    return {
      mainBalance,
      totalRate,
      totalCommissionBalance,
      totalPendingAdjustment,
      gameLossCommission,
      gameWinCommission,
      referCommission,
      depositCommission,
      gameWinCommissionBalance,
      referCommissionBalance,
      depositCommissionBalance,
      gameLossCommissionBalance,
    };
  }, [data]);

  const currency = data?.currency || "BDT";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/10 to-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${cardBase} p-5 sm:p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Commission Status
              </h1>
              <p className="mt-2 text-sm text-green-200/70">
                View your commission rates, commission balances, main wallet
                balance, and overall summary.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={loading || refreshing}
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-700/30 border border-green-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Balance + Summary */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className={`${cardBase} p-6`}>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-green-500/25 bg-green-500/10 flex items-center justify-center text-green-300">
                  <FaWallet className="text-2xl" />
                </div>

                <div>
                  <div className="text-sm text-green-200/70 font-semibold">
                    Main Balance
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {money(summary.mainBalance, currency)}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardBase} p-6`}>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center text-emerald-300">
                  <FaChartLine className="text-2xl" />
                </div>

                <div className="min-w-0">
                  <div className="text-sm text-green-200/70 font-semibold">
                    Summary
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="text-white">
                      Total Commission Balance:{" "}
                      <span className="font-extrabold text-emerald-300">
                        {money(summary.totalCommissionBalance, currency)}
                      </span>
                    </div>
                    <div className="text-white">
                      Total Pending Adjustment:{" "}
                      <span className="font-extrabold text-amber-300">
                        {money(summary.totalPendingAdjustment, currency)}
                      </span>
                    </div>
                    <div className="text-white">
                      Total Commission Rate Sum:{" "}
                      <span className="font-extrabold text-cyan-300">
                        {money(summary.totalRate, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Commission Rates */}
        <div className={`${cardBase} p-5 sm:p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-5">
            <FaCoins className="text-green-300 text-xl" />
            <h2 className="text-xl font-extrabold text-green-200">
              Commission Rates
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <InfoCard
                title="Game Loss Commission"
                value={money(summary.gameLossCommission, currency)}
                subtitle="Current game loss commission rate/value"
                icon={<FaArrowUp className="text-xl" />}
                colorClass="text-emerald-300"
              />
              <InfoCard
                title="Game Win Commission"
                value={money(summary.gameWinCommission, currency)}
                subtitle="Current game win commission rate/value"
                icon={<FaArrowDown className="text-xl" />}
                colorClass="text-red-300"
              />
              <InfoCard
                title="Refer Commission"
                value={money(summary.referCommission, currency)}
                subtitle="Referral commission rate/value"
                icon={<FaGift className="text-xl" />}
                colorClass="text-cyan-300"
              />
              <InfoCard
                title="Deposit Commission"
                value={money(summary.depositCommission, currency)}
                subtitle="Deposit commission rate/value"
                icon={<FaWallet className="text-xl" />}
                colorClass="text-amber-300"
              />
            </div>
          )}
        </div>

        {/* Commission Balances */}
        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <FaGamepad className="text-green-300 text-xl" />
            <h2 className="text-xl font-extrabold text-green-200">
              Commission Balances
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <InfoCard
                title="Game Win Commission Balance"
                value={money(summary.gameWinCommissionBalance, currency)}
                subtitle="Pending game win commission balance"
                icon={<FaArrowDown className="text-xl" />}
                colorClass="text-red-300"
              />
              <InfoCard
                title="Refer Commission Balance"
                value={money(summary.referCommissionBalance, currency)}
                subtitle="Pending referral commission balance"
                icon={<FaGift className="text-xl" />}
                colorClass="text-cyan-300"
              />
              <InfoCard
                title="Deposit Commission Balance"
                value={money(summary.depositCommissionBalance, currency)}
                subtitle="Pending deposit commission balance"
                icon={<FaWallet className="text-xl" />}
                colorClass="text-amber-300"
              />
              <InfoCard
                title="Game Loss Commission Balance"
                value={money(summary.gameLossCommissionBalance, currency)}
                subtitle="Pending game loss commission balance"
                icon={<FaArrowUp className="text-xl" />}
                colorClass="text-emerald-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionStatus;
