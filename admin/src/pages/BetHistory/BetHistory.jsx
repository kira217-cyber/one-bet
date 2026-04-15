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
  FaHashtag,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

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

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const statusChip = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "win" || s === "won" || s === "success") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }

  if (s === "loss" || s === "lose" || s === "lost" || s === "failed") {
    return "bg-red-500/15 text-red-200 border-red-400/30";
  }

  if (s === "cancel" || s === "refund") {
    return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  }

  return "bg-cyan-500/15 text-cyan-200 border-cyan-400/30";
};

const typeChip = (betType) => {
  const t = String(betType || "").toUpperCase();

  if (t === "BET") {
    return "bg-blue-500/15 text-blue-200 border-blue-400/30";
  }

  if (t === "SETTLE") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }

  if (t === "CANCEL" || t === "REFUND") {
    return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  }

  return "bg-purple-500/15 text-purple-200 border-purple-400/30";
};

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const selectCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition cursor-pointer";

const cardBase =
  "rounded-2xl border border-green-700/35 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const SkeletonRow = () => (
  <div className="h-16 rounded-xl bg-white/10 animate-pulse" />
);

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

  const [filters, setFilters] = useState({
    userId: "",
    phone: "",
    provider_code: "",
    game_code: "",
    bet_type: "",
    status: "",
    transaction_id: "",
    verification_key: "",
    startDate: "",
    endDate: "",
  });

  const [applied, setApplied] = useState({
    userId: "",
    phone: "",
    provider_code: "",
    game_code: "",
    bet_type: "",
    status: "",
    transaction_id: "",
    verification_key: "",
    startDate: "",
    endDate: "",
  });

  const page = meta.page;
  const totalPages = meta.totalPages;

  const fetchData = async ({
    page: nextPage = 1,
    nextFilters = applied,
    isRefresh = false,
  } = {}) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: nextPage,
        limit: 50,
      };

      if (nextFilters.userId?.trim()) params.userId = nextFilters.userId.trim();
      if (nextFilters.phone?.trim()) params.phone = nextFilters.phone.trim();
      if (nextFilters.provider_code?.trim()) {
        params.provider_code = nextFilters.provider_code.trim();
      }
      if (nextFilters.game_code?.trim())
        params.game_code = nextFilters.game_code.trim();
      if (nextFilters.bet_type?.trim())
        params.bet_type = nextFilters.bet_type.trim();
      if (nextFilters.status?.trim()) params.status = nextFilters.status.trim();
      if (nextFilters.transaction_id?.trim()) {
        params.transaction_id = nextFilters.transaction_id.trim();
      }
      if (nextFilters.verification_key?.trim()) {
        params.verification_key = nextFilters.verification_key.trim();
      }
      if (nextFilters.startDate) params.startDate = nextFilters.startDate;
      if (nextFilters.endDate) params.endDate = nextFilters.endDate;

      const { data } = await api.get("/api/history/admin/games", { params });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to fetch bet history");
      }

      const rows = Array.isArray(data?.data) ? data.data : [];
      const serverMeta = data?.meta || {};

      setItems(rows);
      setMeta({
        page: Number(serverMeta.page || nextPage || 1),
        limit: Number(serverMeta.limit || 50),
        total: Number(serverMeta.total || 0),
        totalPages: Number(serverMeta.totalPages || 1),
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
    fetchData({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onSearch = (e) => {
    e.preventDefault();
    setApplied(filters);
    fetchData({
      page: 1,
      nextFilters: filters,
      isRefresh: true,
    });
  };

  const onReset = () => {
    const cleared = {
      userId: "",
      phone: "",
      provider_code: "",
      game_code: "",
      bet_type: "",
      status: "",
      transaction_id: "",
      verification_key: "",
      startDate: "",
      endDate: "",
    };

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
    if (nextPage < 1 || nextPage > totalPages) return;

    fetchData({
      page: nextPage,
      nextFilters: applied,
      isRefresh: true,
    });
  };

  const summary = useMemo(() => {
    let totalAmount = 0;
    let totalWinAmount = 0;
    let winCount = 0;
    let lossCount = 0;
    let settleCount = 0;
    let betCount = 0;

    items.forEach((item) => {
      totalAmount += n(item.amount);
      totalWinAmount += n(item.win_amount);

      const s = String(item.status || "").toLowerCase();
      const t = String(item.bet_type || "").toUpperCase();

      if (s === "win" || s === "won" || s === "success") winCount += 1;
      if (s === "loss" || s === "lose" || s === "lost" || s === "failed")
        lossCount += 1;
      if (t === "SETTLE") settleCount += 1;
      if (t === "BET") betCount += 1;
    });

    return {
      totalAmount,
      totalWinAmount,
      winCount,
      lossCount,
      settleCount,
      betCount,
      totalItems: items.length,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/15 to-black text-white p-4 md:p-6">
      <div className="max-w-[1700px] mx-auto space-y-6">
        {/* Header */}
        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Bet History
              </h1>
              <p className="mt-2 text-sm text-green-200/70">
                Search, filter, summary, and inspect all game bet history.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <FaFilter className="text-green-300 text-lg" />
            <h2 className="text-lg font-extrabold text-green-200">
              Search & Filter
            </h2>
          </div>

          <form onSubmit={onSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  User ID
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300/50" />
                  <input
                    type="text"
                    value={filters.userId}
                    onChange={(e) => onChange("userId", e.target.value)}
                    placeholder="Search by userId"
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={filters.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="Search by phone"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Provider Code
                </label>
                <input
                  type="text"
                  value={filters.provider_code}
                  onChange={(e) => onChange("provider_code", e.target.value)}
                  placeholder="e.g. PG"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Game Code
                </label>
                <input
                  type="text"
                  value={filters.game_code}
                  onChange={(e) => onChange("game_code", e.target.value)}
                  placeholder="Search game code"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Bet Type
                </label>
                <select
                  value={filters.bet_type}
                  onChange={(e) => onChange("bet_type", e.target.value)}
                  className={selectCls}
                >
                  <option value="">All</option>
                  <option value="BET">BET</option>
                  <option value="SETTLE">SETTLE</option>
                  <option value="CANCEL">CANCEL</option>
                  <option value="REFUND">REFUND</option>
                  <option value="BONUS">BONUS</option>
                  <option value="PROMO">PROMO</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={filters.status}
                  onChange={(e) => onChange("status", e.target.value)}
                  placeholder="win / loss / success"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={filters.transaction_id}
                  onChange={(e) => onChange("transaction_id", e.target.value)}
                  placeholder="Search transaction id"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Verification Key
                </label>
                <input
                  type="text"
                  value={filters.verification_key}
                  onChange={(e) => onChange("verification_key", e.target.value)}
                  placeholder="Search verification key"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300/50" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onChange("startDate", e.target.value)}
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  End Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300/50" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onChange("endDate", e.target.value)}
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30"
              >
                <FaSearch />
                Search
              </button>

              <button
                type="button"
                onClick={onReset}
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-black/40 border border-green-700/40 hover:bg-green-900/20 text-green-100"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-green-200/70 font-semibold">
                  Total Bets (Page)
                </div>
                <div className="mt-2 text-3xl font-extrabold text-white">
                  {summary.totalItems}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 flex items-center justify-center text-cyan-300">
                <FaGamepad className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-green-200/70 font-semibold">
                  Total Amount
                </div>
                <div className="mt-2 text-3xl font-extrabold text-white">
                  {money(summary.totalAmount)}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-amber-500/25 bg-amber-500/10 flex items-center justify-center text-amber-300">
                <FaWallet className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-green-200/70 font-semibold">
                  Total Win Amount
                </div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-300">
                  {money(summary.totalWinAmount)}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center text-emerald-300">
                <FaCheckCircle className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-green-200/70 font-semibold">
                  Win Count
                </div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-300">
                  {summary.winCount}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center text-emerald-300">
                <FaCheckCircle className="text-xl" />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-green-200/70 font-semibold">
                  Loss Count
                </div>
                <div className="mt-2 text-3xl font-extrabold text-red-300">
                  {summary.lossCount}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-red-500/25 bg-red-500/10 flex items-center justify-center text-red-300">
                <FaTimesCircle className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className={`${cardBase} hidden lg:block overflow-hidden`}>
          <div className="p-5 sm:p-6 border-b border-green-700/25">
            <h2 className="text-lg font-extrabold text-green-200">
              All Bet History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1500px] w-full">
              <thead className="bg-black/60">
                <tr className="text-left">
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    User
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Provider / Game
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Bet Type
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Status
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Win Amount
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Balance After
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Transaction
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Verification
                  </th>
                  <th className="px-4 py-4 text-xs font-extrabold text-green-200/80">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="bg-black/30">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-t border-green-700/15">
                      <td colSpan={10} className="px-4 py-3">
                        <SkeletonRow />
                      </td>
                    </tr>
                  ))
                ) : items.length ? (
                  items.map((row) => (
                    <tr
                      key={row._id}
                      className="border-t border-green-700/15 hover:bg-green-900/10 transition"
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="font-extrabold text-white">
                          {row.userId || "—"}
                        </div>
                        <div className="text-xs text-green-200/60 mt-1">
                          {row.phone || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="font-extrabold text-white">
                          {row.provider_code || "—"}
                        </div>
                        <div className="text-xs text-green-200/60 mt-1 break-all">
                          {row.game_code || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold border ${typeChip(
                            row.bet_type,
                          )}`}
                        >
                          {String(row.bet_type || "—").toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold border ${statusChip(
                            row.status,
                          )}`}
                        >
                          {String(row.status || "—").toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top font-extrabold text-white">
                        {money(row.amount)}
                      </td>

                      <td className="px-4 py-4 align-top font-extrabold text-emerald-300">
                        {money(row.win_amount)}
                      </td>

                      <td className="px-4 py-4 align-top font-extrabold text-cyan-300">
                        {money(row.balance_after)}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="inline-flex items-start gap-2 text-sm text-white break-all">
                          <FaHashtag className="mt-1 text-green-300/70 shrink-0" />
                          <span>{row.transaction_id || "—"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top break-all text-sm text-green-100/80">
                        {row.verification_key || "—"}
                      </td>

                      <td className="px-4 py-4 align-top text-sm text-green-100/80 whitespace-nowrap">
                        {formatDateTime(row.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-14 text-center text-sm text-green-200/70"
                    >
                      No bet history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          <div className={`${cardBase} p-5`}>
            <h2 className="text-lg font-extrabold text-green-200">
              All Bet History
            </h2>
          </div>

          {loading ? (
            [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
          ) : items.length ? (
            items.map((row) => (
              <div key={row._id} className={`${cardBase} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-extrabold text-white">
                      {row.userId || "—"}
                    </div>
                    <div className="text-xs text-green-200/60 mt-1">
                      {row.phone || "—"}
                    </div>
                  </div>

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold border ${statusChip(
                      row.status,
                    )}`}
                  >
                    {String(row.status || "—").toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                    <div className="text-[11px] text-green-200/60">
                      Provider
                    </div>
                    <div className="mt-1 text-sm font-bold text-white break-all">
                      {row.provider_code || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                    <div className="text-[11px] text-green-200/60">
                      Bet Type
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold border ${typeChip(
                          row.bet_type,
                        )}`}
                      >
                        {String(row.bet_type || "—").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                    <div className="text-[11px] text-green-200/60">Amount</div>
                    <div className="mt-1 text-sm font-bold text-white">
                      {money(row.amount)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-green-700/20 bg-black/30 p-3">
                    <div className="text-[11px] text-green-200/60">
                      Win Amount
                    </div>
                    <div className="mt-1 text-sm font-bold text-emerald-300">
                      {money(row.win_amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="text-green-100/80 break-all">
                    <span className="font-bold text-green-200">Game:</span>{" "}
                    {row.game_code || "—"}
                  </div>

                  <div className="text-green-100/80 break-all">
                    <span className="font-bold text-green-200">
                      Transaction:
                    </span>{" "}
                    {row.transaction_id || "—"}
                  </div>

                  <div className="text-green-100/80 break-all">
                    <span className="font-bold text-green-200">
                      Verification:
                    </span>{" "}
                    {row.verification_key || "—"}
                  </div>

                  <div className="text-green-100/80">
                    <span className="font-bold text-green-200">
                      Balance After:
                    </span>{" "}
                    {money(row.balance_after)}
                  </div>

                  <div className="text-green-100/80">
                    <span className="font-bold text-green-200">Time:</span>{" "}
                    {formatDateTime(row.createdAt)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`${cardBase} p-8 text-center text-green-200/70`}>
              No bet history found.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-green-200/75">
              Showing{" "}
              <span className="font-extrabold text-white">
                {items.length ? (page - 1) * 50 + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-extrabold text-white">
                {Math.min(page * 50, meta.total)}
              </span>{" "}
              of <span className="font-extrabold text-white">{meta.total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || refreshing}
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition ${
                  page <= 1 || refreshing
                    ? "opacity-50 cursor-not-allowed border-green-800/30 text-green-200/50"
                    : "border-green-700/40 text-green-100 hover:bg-green-900/20"
                }`}
              >
                <FaChevronLeft />
                Prev
              </button>

              <div className="px-4 py-2 rounded-xl border border-green-700/30 bg-black/30 text-sm font-extrabold text-white">
                Page {page} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || refreshing}
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition ${
                  page >= totalPages || refreshing
                    ? "opacity-50 cursor-not-allowed border-green-800/30 text-green-200/50"
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
