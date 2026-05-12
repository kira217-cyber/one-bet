import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Gift,
  History,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import WeeklyBonus from "../../components/WeeklyBonus/WeeklyBonus";

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatShortDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    dateStyle: "medium",
  });
};

const Reward = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("available");
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);

  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const claimableCount = useMemo(
    () => rewards.filter((item) => item.canClaim).length,
    [rewards],
  );

  const loadRewards = async () => {
    try {
      setLoadingRewards(true);

      const { data } = await api.get("/api/game-loss-rewards/user/available");

      setRewards(data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load rewards");
    } finally {
      setLoadingRewards(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);

      const { data } = await api.get("/api/game-loss-rewards/user/history", {
        params: {
          page: historyPage,
          limit: 15,
        },
      });

      setHistory(data?.data || []);
      setHistoryPagination(
        data?.pagination || {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load reward history",
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, historyPage]);

  const handleClaim = async (settingId) => {
    try {
      setClaimingId(settingId);

      const { data } = await api.post(
        `/api/game-loss-rewards/user/claim/${settingId}`,
      );

      toast.success(data?.message || "Reward claimed successfully");

      await loadRewards();

      if (activeTab === "history") {
        await loadHistory();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to claim reward");
    } finally {
      setClaimingId(null);
    }
  };

  const refreshCurrentTab = () => {
    if (activeTab === "available") {
      loadRewards();
    } else {
      loadHistory();
    }
  };

  return (
    <div className="min-h-screen bg-[#004d3b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex h-[66px] items-center justify-center bg-[#f2ef00] px-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center text-[#165a3e]"
        >
          <ArrowLeft size={28} strokeWidth={2.2} />
        </button>

        <h1 className="text-[22px] font-normal text-[#165a3e] sm:text-[24px]">
          Rewards
        </h1>

        <button
          type="button"
          onClick={refreshCurrentTab}
          className="absolute right-4 flex h-10 w-10 cursor-pointer items-center justify-center text-[#165a3e]"
        >
          <RefreshCw
            size={22}
            className={loadingRewards || loadingHistory ? "animate-spin" : ""}
          />
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Top Card */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#00694f] to-[#003728] p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2ef00] text-[#165a3e] shadow-md">
              <Gift size={26} />
            </div>

            <div>
              <h2 className="text-[18px] font-semibold text-white">
                Game Loss Rewards
              </h2>

              <p className="text-[13px] text-white/70">
                Play games, complete period, then claim cashback bonus.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-[12px] text-white/60">Available Rewards</p>

              <p className="mt-1 text-[22px] font-bold">{rewards.length}</p>
            </div>

            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-[12px] text-white/60">Claimable Now</p>

              <p className="mt-1 text-[22px] font-bold text-[#f2ef00]">
                {claimableCount}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-black/20 p-2">
          <button
            type="button"
            onClick={() => setActiveTab("available")}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              activeTab === "available"
                ? "bg-[#f2ef00] text-[#165a3e]"
                : "text-white/75"
            }`}
          >
            <Gift size={18} />
            Claim
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              activeTab === "history"
                ? "bg-[#f2ef00] text-[#165a3e]"
                : "text-white/75"
            }`}
          >
            <History size={18} />
            History
          </button>
        </div>

        {/* Claim Tab */}
        {activeTab === "available" && (
          <div className="space-y-4 pb-8">
            {loadingRewards ? (
              <LoadingState text="Loading rewards..." />
            ) : rewards.length > 0 ? (
              rewards.map((item) => (
                <RewardCard
                  key={item?.setting?._id}
                  item={item}
                  claiming={claimingId === item?.setting?._id}
                  onClaim={() => handleClaim(item?.setting?._id)}
                />
              ))
            ) : (
              <EmptyState />
            )}

            {/* Weekly Bonus Section */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <WeeklyBonus />
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4 pb-8">
            {loadingHistory ? (
              <LoadingState text="Loading history..." />
            ) : history.length > 0 ? (
              <>
                {history.map((item) => (
                  <HistoryCard key={item._id} item={item} />
                ))}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setHistoryPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={historyPagination.page <= 1}
                    className="cursor-pointer rounded-xl bg-black/25 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-white/70">
                    Page {historyPagination.page} /{" "}
                    {historyPagination.totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setHistoryPage((prev) =>
                        Math.min(historyPagination.totalPages, prev + 1),
                      )
                    }
                    disabled={
                      historyPagination.page >= historyPagination.totalPages
                    }
                    className="cursor-pointer rounded-xl bg-black/25 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RewardCard = ({ item, claiming, onClaim }) => {
  const setting = item?.setting || {};

  const title =
    setting?.title?.en || setting?.title?.bn || "Game Loss Cashback";

  let statusText = "Not eligible";
  let statusIcon = <XCircle size={17} />;
  let statusClass = "bg-red-500/15 text-red-100 border-red-300/20";

  if (!item.canClaimByDate) {
    statusText = "Period running";
    statusIcon = <Clock size={17} />;
    statusClass = "bg-yellow-500/15 text-yellow-100 border-yellow-300/20";
  } else if (item.canClaim) {
    statusText = "Claim available";
    statusIcon = <CheckCircle2 size={17} />;
    statusClass = "bg-emerald-500/15 text-emerald-100 border-emerald-300/20";
  } else if (!item.eligibleByLoss) {
    statusText = "Minimum loss not reached";
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#00694f] to-[#003728] shadow-lg">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-white">{title}</h3>

            <p className="mt-1 text-[12px] text-white/65">
              {setting?.periodDays || item.periodDays} days period •{" "}
              {setting?.bonusPercent || item.bonusPercent}% cashback
            </p>
          </div>

          <span
            className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
          >
            {statusIcon}
            {statusText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <InfoBox label="Total Bet" value={money(item.totalBet)} />
        <InfoBox label="Total Win" value={money(item.totalWin)} />
        <InfoBox label="Net Loss" value={money(item.netLoss)} danger />
        <InfoBox
          label="Claim Amount"
          value={money(item.claimAmount)}
          highlight
        />
      </div>

      <div className="px-4 pb-4">
        <div className="mb-3 rounded-xl bg-black/20 p-3 text-[12px] text-white/70">
          <div className="flex justify-between gap-2">
            <span>Period Start</span>

            <span className="text-white">
              {formatShortDate(item.periodStart)}
            </span>
          </div>

          <div className="mt-1 flex justify-between gap-2">
            <span>Period End</span>

            <span className="text-white">
              {formatShortDate(item.periodEnd)}
            </span>
          </div>

          <div className="mt-1 flex justify-between gap-2">
            <span>Minimum Loss</span>

            <span className="text-white">{money(item.minimumLoss)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClaim}
          disabled={!item.canClaim || claiming}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
            item.canClaim
              ? "bg-[#f2ef00] text-[#165a3e] shadow-lg active:scale-[0.98]"
              : "cursor-not-allowed bg-white/10 text-white/45"
          }`}
        >
          {claiming ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Wallet size={18} />
          )}

          {claiming ? "Claiming..." : "Claim Reward"}
        </button>
      </div>
    </div>
  );
};

const HistoryCard = ({ item }) => {
  const title =
    item?.settingTitle?.en ||
    item?.setting?.title?.en ||
    item?.settingTitle?.bn ||
    "Game Loss Cashback";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#00694f] to-[#003728] p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-white">{title}</h3>

          <p className="mt-1 text-[12px] text-white/65">
            Claimed at {formatDate(item.claimedAt)}
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[12px] font-semibold text-emerald-100">
          Claimed
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoBox label="Total Bet" value={money(item.totalBet)} />
        <InfoBox label="Total Win" value={money(item.totalWin)} />
        <InfoBox label="Net Loss" value={money(item.netLoss)} danger />
        <InfoBox label="Received" value={money(item.claimAmount)} highlight />
      </div>

      <div className="mt-3 rounded-xl bg-black/20 p-3 text-[12px] text-white/70">
        <div className="flex justify-between gap-2">
          <span>Period</span>

          <span className="text-right text-white">
            {formatShortDate(item.periodStart)} -{" "}
            {formatShortDate(item.periodEnd)}
          </span>
        </div>

        <div className="mt-1 flex justify-between gap-2">
          <span>Bonus Percent</span>

          <span className="text-white">{item.bonusPercent}%</span>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, highlight = false, danger = false }) => {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <p className="text-[11px] text-white/55">{label}</p>

      <p
        className={`mt-1 text-[15px] font-bold ${
          highlight ? "text-[#f2ef00]" : danger ? "text-red-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const LoadingState = ({ text }) => {
  return (
    <div className="flex min-h-[calc(100vh-260px)] items-center justify-center px-4">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="mb-3 animate-spin text-white/70" size={34} />

        <p className="text-[16px] text-white/70">{text}</p>
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="flex min-h-[calc(100vh-260px)] items-center justify-center px-4">
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-4 flex flex-col items-center">
          <div className="absolute bottom-[-8px] h-7 w-24 rounded-full bg-black/25 blur-[1px]" />

          <span className="absolute -left-5 top-5 h-[3px] w-3 rounded-full bg-white/25" />
          <span className="absolute -right-5 top-8 h-[4px] w-[7px] rounded-full bg-white/25" />
          <span className="absolute left-1/2 top-[-10px] h-[4px] w-[6px] -translate-x-1/2 rounded-full bg-white/20" />

          <div className="relative flex h-16 w-12 items-center justify-center rounded-md bg-gradient-to-b from-[#8c8c8c] via-[#d5d5d5] to-[#8d8d8d] shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),0_4px_10px_rgba(0,0,0,0.25)]">
            <div className="absolute -top-[2px] h-3 w-6 rounded-b-md rounded-t-sm bg-[#6a6a6a] shadow-sm" />

            <div className="absolute top-[1px] h-[6px] w-[6px] rounded-full bg-[#5b5b5b]" />

            <div className="absolute bottom-[8px] right-[7px] h-4 w-4 rotate-45 bg-gradient-to-br from-[#cfcfcf] to-[#9f9f9f] shadow-inner" />

            <div className="absolute inset-[4px] rounded-[3px] border border-white/20" />

            <ClipboardList
              size={26}
              strokeWidth={1.8}
              className="text-white/15"
            />
          </div>
        </div>

        <p className="text-[18px] font-normal tracking-[0.01em] text-white/70">
          No Data
        </p>
      </div>
    </div>
  );
};

export default Reward;
