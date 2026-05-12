import React, { useEffect, useMemo, useState } from "react";
import {
  Gift,
  History,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  Wallet,
  ClipboardList,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

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

const WeeklyBonus = () => {
  const [activeTab, setActiveTab] = useState("claim");
  const [bonuses, setBonuses] = useState([]);
  const [history, setHistory] = useState([]);

  const [loadingBonuses, setLoadingBonuses] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const claimableCount = useMemo(
    () => bonuses.filter((item) => item.canClaim).length,
    [bonuses],
  );

  const loadBonuses = async () => {
    try {
      setLoadingBonuses(true);
      const { data } = await api.get("/api/weekly-bonus/user/available");
      setBonuses(data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load weekly bonus",
      );
    } finally {
      setLoadingBonuses(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);

      const { data } = await api.get("/api/weekly-bonus/user/history", {
        params: {
          page,
          limit: 15,
        },
      });

      setHistory(data?.data || []);
      setPagination(
        data?.pagination || {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load weekly bonus history",
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadBonuses();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  const handleClaim = async (settingId) => {
    try {
      setClaimingId(settingId);

      const { data } = await api.post(
        `/api/weekly-bonus/user/claim/${settingId}`,
      );

      toast.success(data?.message || "Weekly bonus claimed successfully");

      await loadBonuses();

      if (activeTab === "history") {
        await loadHistory();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to claim weekly bonus",
      );
    } finally {
      setClaimingId(null);
    }
  };

  const refreshCurrent = () => {
    if (activeTab === "claim") loadBonuses();
    else loadHistory();
  };

  return (
    <div className="text-white">
      <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#00694f] to-[#003728] p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2ef00] text-[#165a3e] shadow-md">
              <Gift size={26} />
            </div>

            <div>
              <h2 className="text-[18px] font-semibold text-white">
                Weekly Bonus
              </h2>
              <p className="text-[13px] text-white/70">
                Complete period and claim your fixed bonus.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshCurrent}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-black/20 text-white"
          >
            <RefreshCw
              size={20}
              className={loadingBonuses || loadingHistory ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-black/20 p-3">
            <p className="text-[12px] text-white/60">Available Bonus</p>
            <p className="mt-1 text-[22px] font-bold">{bonuses.length}</p>
          </div>

          <div className="rounded-xl bg-black/20 p-3">
            <p className="text-[12px] text-white/60">Claimable Now</p>
            <p className="mt-1 text-[22px] font-bold text-[#f2ef00]">
              {claimableCount}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-black/20 p-2">
        <button
          type="button"
          onClick={() => setActiveTab("claim")}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
            activeTab === "claim"
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

      {activeTab === "claim" && (
        <div className="space-y-4 pb-4">
          {loadingBonuses ? (
            <LoadingState text="Loading weekly bonus..." />
          ) : bonuses.length > 0 ? (
            bonuses.map((item) => (
              <WeeklyBonusCard
                key={item?.setting?._id}
                item={item}
                claiming={claimingId === item?.setting?._id}
                onClaim={() => handleClaim(item?.setting?._id)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4 pb-4">
          {loadingHistory ? (
            <LoadingState text="Loading weekly bonus history..." />
          ) : history.length > 0 ? (
            <>
              {history.map((item) => (
                <WeeklyHistoryCard key={item._id} item={item} />
              ))}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                  className="cursor-pointer rounded-xl bg-black/25 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-white/70">
                  Page {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                  disabled={pagination.page >= pagination.totalPages}
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
  );
};

const WeeklyBonusCard = ({ item, claiming, onClaim }) => {
  const setting = item?.setting || {};
  const title = setting?.title?.en || setting?.title?.bn || "Weekly Bonus";

  const statusText = item.canClaim ? "Claim available" : "Period running";
  const statusIcon = item.canClaim ? (
    <CheckCircle2 size={17} />
  ) : (
    <Clock size={17} />
  );
  const statusClass = item.canClaim
    ? "bg-emerald-500/15 text-emerald-100 border-emerald-300/20"
    : "bg-yellow-500/15 text-yellow-100 border-yellow-300/20";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#00694f] to-[#003728] shadow-lg">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-white">{title}</h3>
            <p className="mt-1 text-[12px] text-white/65">
              {setting?.periodDays || item.periodDays} days period • Fixed bonus
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
        <InfoBox
          label="Bonus Amount"
          value={money(item.claimAmount)}
          highlight
        />
        <InfoBox
          label="Period Days"
          value={`${setting?.periodDays || item.periodDays || 0} Days`}
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
            <span>Next Claim</span>
            <span className="text-white">
              {formatShortDate(item.nextClaimAt)}
            </span>
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
          {claiming ? "Claiming..." : "Claim Weekly Bonus"}
        </button>
      </div>
    </div>
  );
};

const WeeklyHistoryCard = ({ item }) => {
  const title =
    item?.settingTitle?.en ||
    item?.setting?.title?.en ||
    item?.settingTitle?.bn ||
    "Weekly Bonus";

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
        <InfoBox label="Received" value={money(item.claimAmount)} highlight />
        <InfoBox label="Period Days" value={`${item.periodDays || 0} Days`} />
      </div>

      <div className="mt-3 rounded-xl bg-black/20 p-3 text-[12px] text-white/70">
        <div className="flex justify-between gap-2">
          <span>Period</span>
          <span className="text-right text-white">
            {formatShortDate(item.periodStart)} -{" "}
            {formatShortDate(item.periodEnd)}
          </span>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, highlight = false }) => (
  <div className="rounded-xl bg-black/20 p-3">
    <p className="text-[11px] text-white/55">{label}</p>
    <p
      className={`mt-1 text-[15px] font-bold ${
        highlight ? "text-[#f2ef00]" : "text-white"
      }`}
    >
      {value}
    </p>
  </div>
);

const LoadingState = ({ text }) => (
  <div className="flex min-h-[220px] items-center justify-center px-4">
    <div className="flex flex-col items-center justify-center">
      <Loader2 className="mb-3 animate-spin text-white/70" size={34} />
      <p className="text-[16px] text-white/70">{text}</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex min-h-[220px] items-center justify-center px-4">
    <div className="flex flex-col items-center justify-center">
      <ClipboardList size={44} className="mb-3 text-white/35" />
      <p className="text-[18px] font-normal text-white/70">No Data</p>
    </div>
  </div>
);

export default WeeklyBonus;
