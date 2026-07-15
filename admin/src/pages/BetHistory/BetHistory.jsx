import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaSyncAlt,
  FaFilter,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaWallet,
  FaGamepad,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (value, currency = "BDT") => {
  const symbol = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";

  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return `${symbol} 0.00`;
  }

  return `${symbol} ${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const numberValue = (value) => {
  const number = Number(value || 0);

  return Number.isFinite(number) ? number : 0;
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
};

const statusChip = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "win") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }

  if (value === "loss") {
    return "bg-red-500/15 text-red-200 border-red-400/30";
  }

  return "bg-cyan-500/15 text-cyan-200 border-cyan-400/30";
};

const providerChip = (provider) => {
  const value = String(provider || "").toLowerCase();

  if (value === "ninewicket") {
    return "border-cyan-400/30 bg-cyan-500/15 text-cyan-200";
  }

  return "border-violet-400/30 bg-violet-500/15 text-violet-200";
};

const nineWicketStatusChip = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "settled") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (value === "open") {
    return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  }

  if (value === "cancelled" || value === "canceled" || value === "void") {
    return "border-red-400/30 bg-red-500/15 text-red-200";
  }

  return "border-white/15 bg-white/5 text-white/70";
};

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const selectCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition cursor-pointer";

const cardBase =
  "rounded-2xl border border-green-700/35 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const SkeletonRow = () => (
  <div className="h-16 animate-pulse rounded-xl bg-white/10" />
);

const createEmptyFilters = () => ({
  userId: "",
  phone: "",
  userGamePlayName: "",
  member_account: "",
  game_uid: "",
  game_round: "",
  serial_number: "",
  resultType: "",
  provider: "",
  nineWicketBetId: "",
  nineWicketBetStatus: "",
  eventName: "",
  marketName: "",
  competitionName: "",
  hasExposure: "",
  startDate: "",
  endDate: "",
});

const BetHistory = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [items, setItems] = useState([]);

  const [meta, setMeta] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState(createEmptyFilters);
  const [applied, setApplied] = useState(createEmptyFilters);

  const page = meta.page;
  const totalPages = meta.totalPages;

  const fetchData = async ({
    page: nextPage = 1,
    nextFilters = applied,
    isRefresh = false,
  } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page: nextPage,
        limit: 50,
      };

      if (nextFilters.userId?.trim()) {
        params.userId = nextFilters.userId.trim();
      }

      if (nextFilters.phone?.trim()) {
        params.phone = nextFilters.phone.trim();
      }

      const globalSearch =
        nextFilters.userGamePlayName?.trim() ||
        nextFilters.member_account?.trim() ||
        "";

      if (globalSearch) {
        params.search = globalSearch;
      }

      if (nextFilters.game_uid?.trim()) {
        params.game_uid = nextFilters.game_uid.trim();
        params.game_code = nextFilters.game_uid.trim();
      }

      if (nextFilters.game_round?.trim()) {
        params.game_round = nextFilters.game_round.trim();
        params.verification_key = nextFilters.game_round.trim();
      }

      if (nextFilters.serial_number?.trim()) {
        params.serial_number = nextFilters.serial_number.trim();
        params.transaction_id = nextFilters.serial_number.trim();
      }

      if (nextFilters.resultType?.trim()) {
        params.resultType = nextFilters.resultType.trim();
        params.status = nextFilters.resultType.trim();
      }

      if (nextFilters.provider?.trim()) {
        params.provider = nextFilters.provider.trim();
      }

      if (nextFilters.nineWicketBetId?.trim()) {
        params.nineWicketBetId = nextFilters.nineWicketBetId.trim();
      }

      if (nextFilters.nineWicketBetStatus?.trim()) {
        params.nineWicketBetStatus = nextFilters.nineWicketBetStatus.trim();
      }

      if (nextFilters.eventName?.trim()) {
        params.eventName = nextFilters.eventName.trim();
      }

      if (nextFilters.marketName?.trim()) {
        params.marketName = nextFilters.marketName.trim();
      }

      if (nextFilters.competitionName?.trim()) {
        params.competitionName = nextFilters.competitionName.trim();
      }

      if (nextFilters.hasExposure?.trim()) {
        params.hasExposure = nextFilters.hasExposure.trim();
      }

      if (nextFilters.startDate) {
        params.startDate = nextFilters.startDate;
        params.from = nextFilters.startDate;
      }

      if (nextFilters.endDate) {
        params.endDate = nextFilters.endDate;
        params.to = nextFilters.endDate;
      }

      const { data } = await api.get("/api/history/admin/games", {
        params,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to fetch bet history");
      }

      const rows = Array.isArray(data?.data) ? data.data : [];

      const serverMeta = data?.meta || {};

      setItems(rows);

      setMeta({
        page: Number(
          serverMeta.page || serverMeta.currentPage || nextPage || 1,
        ),

        limit: Number(serverMeta.limit || 50),

        total: Number(serverMeta.total || 0),

        totalPages: Math.max(Number(serverMeta.totalPages || 1), 1),
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch bet history",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({
      page: 1,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const onSearch = (event) => {
    event.preventDefault();

    setApplied(filters);

    fetchData({
      page: 1,
      nextFilters: filters,
      isRefresh: true,
    });
  };

  const onReset = () => {
    const cleared = createEmptyFilters();

    setFilters(cleared);
    setApplied(cleared);

    fetchData({
      page: 1,
      nextFilters: cleared,
      isRefresh: true,
    });
  };

  const onRefresh = async () => {
    await fetchData({
      page,
      nextFilters: applied,
      isRefresh: true,
    });

    toast.info("Refreshed");
  };

  const onPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    fetchData({
      page: nextPage,
      nextFilters: applied,
      isRefresh: true,
    });
  };

  const summary = useMemo(() => {
    let totalBet = 0;
    let totalWin = 0;
    let totalNet = 0;
    let totalMatchStake = 0;
    let totalProfitLoss = 0;
    let totalExposureChange = 0;

    let winCount = 0;
    let lossCount = 0;
    let pushCount = 0;
    let oracleCount = 0;
    let nineWicketCount = 0;

    items.forEach((item) => {
      totalBet += numberValue(item.bet_amount ?? item.amount);

      totalWin += numberValue(item.win_amount);
      totalNet += numberValue(item.net_amount);

      totalMatchStake += numberValue(item.matchStake);
      totalProfitLoss += numberValue(item.profitLoss);

      totalExposureChange += numberValue(item.exposureChange);

      const result = String(item.resultType || item.status || "").toLowerCase();

      const provider = String(item.provider || "oracle").toLowerCase();

      if (result === "win") {
        winCount += 1;
      }

      if (result === "loss") {
        lossCount += 1;
      }

      if (result === "push") {
        pushCount += 1;
      }

      if (provider === "ninewicket") {
        nineWicketCount += 1;
      } else {
        oracleCount += 1;
      }
    });

    return {
      totalBet,
      totalWin,
      totalNet,
      totalMatchStake,
      totalProfitLoss,
      totalExposureChange,
      winCount,
      lossCount,
      pushCount,
      oracleCount,
      nineWicketCount,
      totalItems: items.length,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/15 to-black p-4 text-white md:p-6">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                Game History
              </h1>

              <p className="mt-2 text-sm text-green-200/70">
                Search, filter, summary, and inspect all game history.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 font-bold shadow-lg shadow-green-700/30 hover:from-green-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <FaFilter className="text-lg text-green-300" />

            <h2 className="text-lg font-extrabold text-green-200">
              Search & Filter
            </h2>
          </div>

          <form onSubmit={onSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  User ID
                </label>

                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300/50" />

                  <input
                    type="text"
                    value={filters.userId}
                    onChange={(event) => onChange("userId", event.target.value)}
                    placeholder="Search by userId"
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Phone
                </label>

                <input
                  type="text"
                  value={filters.phone}
                  onChange={(event) => onChange("phone", event.target.value)}
                  placeholder="Search by phone"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  User Game Play Name
                </label>

                <input
                  type="text"
                  value={filters.userGamePlayName}
                  onChange={(event) =>
                    onChange("userGamePlayName", event.target.value)
                  }
                  placeholder="Search userGamePlayName"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Member Account
                </label>

                <input
                  type="text"
                  value={filters.member_account}
                  onChange={(event) =>
                    onChange("member_account", event.target.value)
                  }
                  placeholder="Search member account"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Game UID
                </label>

                <input
                  type="text"
                  value={filters.game_uid}
                  onChange={(event) => onChange("game_uid", event.target.value)}
                  placeholder="Search game uid"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Game Round
                </label>

                <input
                  type="text"
                  value={filters.game_round}
                  onChange={(event) =>
                    onChange("game_round", event.target.value)
                  }
                  placeholder="Search game round"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Serial Number
                </label>

                <input
                  type="text"
                  value={filters.serial_number}
                  onChange={(event) =>
                    onChange("serial_number", event.target.value)
                  }
                  placeholder="Search serial number"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Result Type
                </label>

                <select
                  value={filters.resultType}
                  onChange={(event) =>
                    onChange("resultType", event.target.value)
                  }
                  className={selectCls}
                >
                  <option value="">All</option>
                  <option value="win">WIN</option>
                  <option value="loss">LOSS</option>
                  <option value="push">PUSH</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Provider
                </label>

                <select
                  value={filters.provider}
                  onChange={(event) => onChange("provider", event.target.value)}
                  className={selectCls}
                >
                  <option value="">All Provider</option>
                  <option value="oracle">Oracle</option>
                  <option value="ninewicket">Nine Wicket</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Nine Wicket Bet ID
                </label>

                <input
                  type="text"
                  value={filters.nineWicketBetId}
                  onChange={(event) =>
                    onChange("nineWicketBetId", event.target.value)
                  }
                  placeholder="Search Nine Wicket bet ID"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Nine Wicket Bet Status
                </label>

                <select
                  value={filters.nineWicketBetStatus}
                  onChange={(event) =>
                    onChange("nineWicketBetStatus", event.target.value)
                  }
                  className={selectCls}
                >
                  <option value="">All Bet Status</option>
                  <option value="Open">Open</option>
                  <option value="Settled">Settled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Void">Void</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Exposure
                </label>

                <select
                  value={filters.hasExposure}
                  onChange={(event) =>
                    onChange("hasExposure", event.target.value)
                  }
                  className={selectCls}
                >
                  <option value="">All Exposure</option>
                  <option value="true">Has Exposure</option>
                  <option value="false">No Exposure</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Event Name
                </label>

                <input
                  type="text"
                  value={filters.eventName}
                  onChange={(event) =>
                    onChange("eventName", event.target.value)
                  }
                  placeholder="Search event name"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Market Name
                </label>

                <input
                  type="text"
                  value={filters.marketName}
                  onChange={(event) =>
                    onChange("marketName", event.target.value)
                  }
                  placeholder="Search market name"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Competition
                </label>

                <input
                  type="text"
                  value={filters.competitionName}
                  onChange={(event) =>
                    onChange("competitionName", event.target.value)
                  }
                  placeholder="Search competition"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  Start Date
                </label>

                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300/50" />

                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(event) =>
                      onChange("startDate", event.target.value)
                    }
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-green-200/75">
                  End Date
                </label>

                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300/50" />

                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(event) =>
                      onChange("endDate", event.target.value)
                    }
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 font-bold shadow-lg shadow-green-700/30 hover:from-green-500 hover:to-emerald-500"
              >
                <FaSearch />
                Search
              </button>

              <button
                type="button"
                onClick={onReset}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-green-700/40 bg-black/40 px-5 py-3 font-bold text-green-100 hover:bg-green-900/20"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-green-200/70">
                  Total Records (Page)
                </div>

                <div className="mt-2 text-3xl font-extrabold text-white">
                  {summary.totalItems}
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <FaGamepad className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-green-200/70">
                  Total Bet Amount
                </div>

                <div className="mt-2 text-3xl font-extrabold text-white">
                  {money(summary.totalBet)}
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
                <FaWallet className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-green-200/70">
                  Total Win Amount
                </div>

                <div className="mt-2 text-3xl font-extrabold text-emerald-300">
                  {money(summary.totalWin)}
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
                <FaCheckCircle className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-green-200/70">
                  Nine Wicket Records
                </div>

                <div className="mt-2 text-3xl font-extrabold text-cyan-300">
                  {summary.nineWicketCount}
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <FaGamepad className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-green-200/70">
                  Total Exposure Change
                </div>

                <div
                  className={`mt-2 text-3xl font-extrabold ${
                    summary.totalExposureChange > 0
                      ? "text-red-300"
                      : summary.totalExposureChange < 0
                        ? "text-emerald-300"
                        : "text-white"
                  }`}
                >
                  {money(summary.totalExposureChange)}
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300">
                <FaTimesCircle className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardBase} hidden overflow-hidden lg:block`}>
          <div className="border-b border-green-700/25 p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-green-200">
              All Game History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[3500px]">
              <thead className="bg-black/60">
                <tr className="text-left">
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    User
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Member Account
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Game UID
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Game Round
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Serial Number
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Bet Amount
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Win Amount
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Net Amount
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Result Type
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Balance Before
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Balance After
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Currency
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Oracle Time
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Time
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Provider
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Nine Wicket Username
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Bet ID
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Bet Status
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Match Stake
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Profit / Loss
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Event Type
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Event Name
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Market
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Competition
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Exposure Change
                  </th>

                  <th className="px-4 py-4 text-xs font-extrabold text-cyan-300">
                    Exposure After
                  </th>
                </tr>
              </thead>

              <tbody className="bg-black/30">
                {loading ? (
                  [...Array(8)].map((_, index) => (
                    <tr key={index} className="border-t border-green-700/15">
                      <td colSpan={26} className="px-4 py-3">
                        <SkeletonRow />
                      </td>
                    </tr>
                  ))
                ) : items.length ? (
                  items.map((row) => {
                    const provider = String(
                      row.provider || "oracle",
                    ).toLowerCase();

                    const isNineWicket = provider === "ninewicket";

                    return (
                      <tr
                        key={row._id}
                        className="border-t border-green-700/15 transition hover:bg-green-900/10"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="font-extrabold text-white">
                            {row.userId || "—"}
                          </div>

                          <div className="mt-1 text-xs text-green-200/60">
                            {row.phone || "—"}
                          </div>

                          <div className="mt-1 text-xs text-cyan-200/60">
                            {row.userGamePlayName || "—"}
                          </div>
                        </td>

                        <td className="break-all px-4 py-4 align-top text-sm text-green-100/80">
                          {row.member_account || "—"}
                        </td>

                        <td className="break-all px-4 py-4 align-top text-sm text-white">
                          {row.game_uid || "—"}
                        </td>

                        <td className="break-all px-4 py-4 align-top text-sm text-green-100/80">
                          {row.game_round || "—"}
                        </td>

                        <td className="break-all px-4 py-4 align-top text-sm text-green-100/80">
                          {row.serial_number || "—"}
                        </td>

                        <td className="px-4 py-4 align-top font-extrabold text-white">
                          {money(row.bet_amount, row.currency)}
                        </td>

                        <td className="px-4 py-4 align-top font-extrabold text-emerald-300">
                          {money(row.win_amount, row.currency)}
                        </td>

                        <td
                          className={`px-4 py-4 align-top font-extrabold ${
                            Number(row.net_amount || 0) >= 0
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          {money(row.net_amount, row.currency)}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold ${statusChip(
                              row.resultType,
                            )}`}
                          >
                            {String(row.resultType || "—").toUpperCase()}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top font-extrabold text-white">
                          {money(row.balance_before, row.currency)}
                        </td>

                        <td className="px-4 py-4 align-top font-extrabold text-cyan-300">
                          {money(row.balance_after, row.currency)}
                        </td>

                        <td className="px-4 py-4 align-top text-sm text-green-100/80">
                          {row.currency || "BDT"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-green-100/80">
                          {row.oracleTimestamp || "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-green-100/80">
                          {formatDateTime(row.createdAt)}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase ${providerChip(
                              provider,
                            )}`}
                          >
                            {isNineWicket ? "Nine Wicket" : "Oracle"}
                          </span>
                        </td>

                        <td className="break-all px-4 py-4 align-top text-sm font-semibold text-cyan-200">
                          {isNineWicket
                            ? row.nineWicketUsername ||
                              row.member_account ||
                              "—"
                            : "—"}
                        </td>

                        <td className="break-all px-4 py-4 align-top text-sm text-green-100/80">
                          {isNineWicket ? row.nineWicketBetId || "—" : "—"}
                        </td>

                        <td className="px-4 py-4 align-top">
                          {isNineWicket ? (
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold ${nineWicketStatusChip(
                                row.nineWicketBetStatus,
                              )}`}
                            >
                              {row.nineWicketBetStatus || "—"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-4 py-4 align-top font-extrabold text-cyan-300">
                          {isNineWicket
                            ? money(row.matchStake, row.currency)
                            : "—"}
                        </td>

                        <td
                          className={`px-4 py-4 align-top font-extrabold ${
                            numberValue(row.profitLoss) >= 0
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          {isNineWicket
                            ? money(row.profitLoss, row.currency)
                            : "—"}
                        </td>

                        <td className="break-all px-4 py-4 align-top text-sm text-green-100/80">
                          {isNineWicket ? row.eventTypeName || "—" : "—"}
                        </td>

                        <td className="max-w-[260px] break-words px-4 py-4 align-top text-sm text-white">
                          {isNineWicket ? row.eventName || "—" : "—"}
                        </td>

                        <td className="max-w-[260px] break-words px-4 py-4 align-top text-sm text-green-100/80">
                          {isNineWicket ? row.marketName || "—" : "—"}
                        </td>

                        <td className="max-w-[260px] break-words px-4 py-4 align-top text-sm text-green-100/80">
                          {isNineWicket ? row.competitionName || "—" : "—"}
                        </td>

                        <td
                          className={`px-4 py-4 align-top font-extrabold ${
                            numberValue(row.exposureChange) > 0
                              ? "text-red-300"
                              : numberValue(row.exposureChange) < 0
                                ? "text-emerald-300"
                                : "text-white/60"
                          }`}
                        >
                          {isNineWicket
                            ? money(row.exposureChange, row.currency)
                            : "—"}
                        </td>

                        <td className="px-4 py-4 align-top font-extrabold text-yellow-300">
                          {isNineWicket
                            ? money(row.exposureAfter, row.currency)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={26}
                      className="px-4 py-14 text-center text-sm text-green-200/70"
                    >
                      No game history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 lg:hidden">
          <div className={`${cardBase} p-5`}>
            <h2 className="text-lg font-extrabold text-green-200">
              All Game History
            </h2>
          </div>

          {loading ? (
            [...Array(6)].map((_, index) => <SkeletonRow key={index} />)
          ) : items.length ? (
            items.map((row) => {
              const provider = String(row.provider || "oracle").toLowerCase();

              const isNineWicket = provider === "ninewicket";

              return (
                <div key={row._id} className={`${cardBase} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-extrabold text-white">
                        {row.userId || "—"}
                      </div>

                      <div className="mt-1 text-xs text-green-200/60">
                        {row.phone || "—"}
                      </div>

                      <div className="mt-1 text-xs text-cyan-200/60">
                        {row.userGamePlayName || "—"}
                      </div>

                      {isNineWicket && (
                        <div className="mt-1 text-xs font-semibold text-cyan-300">
                          Nine Wicket:{" "}
                          {row.nineWicketUsername || row.member_account || "—"}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold ${statusChip(
                          row.resultType,
                        )}`}
                      >
                        {String(row.resultType || "—").toUpperCase()}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase ${providerChip(
                          provider,
                        )}`}
                      >
                        {isNineWicket ? "Nine Wicket" : "Oracle"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                      <div className="text-[11px] text-green-200/60">
                        Bet Amount
                      </div>

                      <div className="mt-1 text-sm font-bold text-white">
                        {money(row.bet_amount, row.currency)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                      <div className="text-[11px] text-green-200/60">
                        Win Amount
                      </div>

                      <div className="mt-1 text-sm font-bold text-emerald-300">
                        {money(row.win_amount, row.currency)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                      <div className="text-[11px] text-green-200/60">
                        Net Amount
                      </div>

                      <div
                        className={`mt-1 text-sm font-bold ${
                          Number(row.net_amount || 0) >= 0
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {money(row.net_amount, row.currency)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                      <div className="text-[11px] text-green-200/60">
                        Balance After
                      </div>

                      <div className="mt-1 text-sm font-bold text-cyan-300">
                        {money(row.balance_after, row.currency)}
                      </div>
                    </div>

                    {isNineWicket && (
                      <>
                        <div className="rounded-xl border border-cyan-700/20 bg-black/30 p-3">
                          <div className="text-[11px] text-cyan-200/60">
                            Match Stake
                          </div>

                          <div className="mt-1 text-sm font-bold text-cyan-300">
                            {money(row.matchStake, row.currency)}
                          </div>
                        </div>

                        <div className="rounded-xl border border-cyan-700/20 bg-black/30 p-3">
                          <div className="text-[11px] text-cyan-200/60">
                            Exposure After
                          </div>

                          <div className="mt-1 text-sm font-bold text-yellow-300">
                            {money(row.exposureAfter, row.currency)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="break-all text-green-100/80">
                      <span className="font-bold text-green-200">
                        Member Account:
                      </span>{" "}
                      {row.member_account || "—"}
                    </div>

                    <div className="break-all text-green-100/80">
                      <span className="font-bold text-green-200">
                        Game UID:
                      </span>{" "}
                      {row.game_uid || "—"}
                    </div>

                    <div className="break-all text-green-100/80">
                      <span className="font-bold text-green-200">
                        Game Round:
                      </span>{" "}
                      {row.game_round || "—"}
                    </div>

                    <div className="break-all text-green-100/80">
                      <span className="font-bold text-green-200">
                        Serial Number:
                      </span>{" "}
                      {row.serial_number || "—"}
                    </div>

                    <div className="text-green-100/80">
                      <span className="font-bold text-green-200">
                        Balance Before:
                      </span>{" "}
                      {money(row.balance_before, row.currency)}
                    </div>

                    <div className="text-green-100/80">
                      <span className="font-bold text-green-200">
                        Currency:
                      </span>{" "}
                      {row.currency || "BDT"}
                    </div>

                    {isNineWicket && (
                      <>
                        <div className="break-all text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Bet ID:
                          </span>{" "}
                          {row.nineWicketBetId || "—"}
                        </div>

                        <div className="text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Bet Status:
                          </span>{" "}
                          {row.nineWicketBetStatus || "—"}
                        </div>

                        <div className="text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Profit/Loss:
                          </span>{" "}
                          {money(row.profitLoss, row.currency)}
                        </div>

                        <div className="break-all text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Event Type:
                          </span>{" "}
                          {row.eventTypeName || "—"}
                        </div>

                        <div className="break-all text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Event:
                          </span>{" "}
                          {row.eventName || "—"}
                        </div>

                        <div className="break-all text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Market:
                          </span>{" "}
                          {row.marketName || "—"}
                        </div>

                        <div className="break-all text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Competition:
                          </span>{" "}
                          {row.competitionName || "—"}
                        </div>

                        <div className="text-cyan-100/80">
                          <span className="font-bold text-cyan-200">
                            Exposure Change:
                          </span>{" "}
                          {money(row.exposureChange, row.currency)}
                        </div>
                      </>
                    )}

                    <div className="text-green-100/80">
                      <span className="font-bold text-green-200">
                        Oracle Time:
                      </span>{" "}
                      {row.oracleTimestamp || "—"}
                    </div>

                    <div className="text-green-100/80">
                      <span className="font-bold text-green-200">Time:</span>{" "}
                      {formatDateTime(row.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`${cardBase} p-8 text-center text-green-200/70`}>
              No game history found.
            </div>
          )}
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-green-200/75">
              Showing{" "}
              <span className="font-extrabold text-white">
                {items.length ? (page - 1) * meta.limit + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-extrabold text-white">
                {Math.min(page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="font-extrabold text-white">{meta.total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || refreshing}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  page <= 1 || refreshing
                    ? "cursor-not-allowed border-green-800/30 text-green-200/50 opacity-50"
                    : "border-green-700/40 text-green-100 hover:bg-green-900/20"
                }`}
              >
                <FaChevronLeft />
                Prev
              </button>

              <div className="rounded-xl border border-green-700/30 bg-black/30 px-4 py-2 text-sm font-extrabold text-white">
                Page {page} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || refreshing}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  page >= totalPages || refreshing
                    ? "cursor-not-allowed border-green-800/30 text-green-200/50 opacity-50"
                    : "border-green-700/40 text-green-100 hover:bg-green-900/20"
                }`}
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetHistory;
