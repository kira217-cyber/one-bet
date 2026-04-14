import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaWallet,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "--";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status = "") => {
  const s = String(status).toLowerCase();

  if (s === "approved") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  }

  if (s === "rejected") {
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  }

  return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
};

const getTransactionText = (item) => {
  return (
    item?.display?.transactionId ||
    item?.fields?.transactionId ||
    item?.display?.invoiceNumber ||
    item?.fields?.invoiceNumber ||
    item?._id ||
    "N/A"
  );
};

const getSenderText = (item) => {
  return (
    item?.fields?.senderNumber ||
    item?.fields?.number ||
    item?.fields?.accountNumber ||
    item?.fields?.walletNumber ||
    "N/A"
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/5 py-2 last:border-b-0">
    <span className="text-[12px] font-semibold text-white/60">{label}</span>
    <span className="text-right text-[12px] font-bold text-white">
      {value || "N/A"}
    </span>
  </div>
);

const DepositHistory = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    search: "",
  });

  const [searchInput, setSearchInput] = useState("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    if (filters.startDate) {
      params.append("from", filters.startDate);
    }

    if (filters.endDate) {
      params.append("to", filters.endDate);
    }

    if (filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    return params.toString();
  }, [page, limit, filters]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["deposit-history", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/history/me/deposits?${queryParams}`);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 15000,
    retry: 1,
  });

  const rows = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta?.totalPages || 1;

  const handleApplyFilters = () => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      search: searchInput,
    }));
  };

  const handleResetFilters = () => {
    setPage(1);
    setSearchInput("");
    setFilters({
      startDate: "",
      endDate: "",
      status: "all",
      search: "",
    });
    toast.success("Filters cleared");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <div className="w-full text-white">
      <div className="grid grid-cols-1 gap-4">
        {/* Top Card */}
        <div className="border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-4 shadow-lg shadow-green-900/20 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
              <FaWallet className="text-lg" />
            </div>
            <div>
              <h2 className="text-[20px] font-extrabold text-white">
                Deposit History
              </h2>
              <p className="text-[12px] text-white/60">
                View all your deposit transactions
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 grid grid-cols-1 gap-3">
            {/* Start Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
                <FaCalendarAlt className="text-emerald-300" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }));
                }}
                className="h-[46px] w-full rounded-xl border border-green-700/40 bg-black/40 px-4 text-[14px] text-white outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
                <FaCalendarAlt className="text-emerald-300" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }));
                }}
                className="h-[46px] w-full rounded-xl border border-green-700/40 bg-black/40 px-4 text-[14px] text-white outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
                <FaFilter className="text-emerald-300" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }));
                }}
                className="h-[46px] w-full rounded-xl border border-green-700/40 bg-black/40 px-4 text-[14px] text-white outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
              >
                <option value="all" className="bg-[#0a0a0a]">
                  All Status
                </option>
                <option value="pending" className="bg-[#0a0a0a]">
                  Pending
                </option>
                <option value="approved" className="bg-[#0a0a0a]">
                  Approved
                </option>
                <option value="rejected" className="bg-[#0a0a0a]">
                  Rejected
                </option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
                <FaSearch className="text-emerald-300" />
                Search Transaction ID
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Enter transaction id..."
                    className="h-[46px] w-full rounded-xl border border-green-700/40 bg-black/40 pl-10 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/35 focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="h-[46px] rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 font-extrabold text-black shadow-lg transition hover:from-green-400 hover:to-emerald-400"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-green-700/40 bg-black/30 px-4 text-[13px] font-bold text-white transition hover:border-green-500/60 hover:bg-black/40"
            >
              <FaSyncAlt />
              Reset Filters
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-[13px] font-bold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Desktop and mobile Table */}
        <div className="overflow-hidden border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-lg shadow-green-900/20 md:block">
          <div className="overflow-x-auto ">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-green-700/30 bg-white/[0.03] text-left">
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    #
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Date
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Method
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Channel
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Bonus
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Credited
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Transaction
                  </th>
                  <th className="px-4 py-4 text-[13px] font-extrabold text-white">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="h-12 animate-pulse rounded-xl bg-white/5" />
                      </td>
                    </tr>
                  ))
                ) : rows.length ? (
                  rows.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4 text-[13px] font-semibold text-white/70">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-white">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-bold text-white">
                        {item.methodId || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-white/80">
                        {item.channelId || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-extrabold text-white">
                        {money(item.amount)}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-emerald-300">
                        {money(item?.calc?.totalBonus || 0)}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-extrabold text-yellow-300">
                        {money(item?.calc?.creditedAmount || 0)}
                      </td>
                      <td className="max-w-[180px] px-4 py-4 text-[12px] font-semibold text-white/75">
                        <span className="line-clamp-2 break-all">
                          {getTransactionText(item)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[12px] font-extrabold ${getStatusClass(
                            item.status,
                          )}`}
                        >
                          {item.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <div className="text-[15px] font-bold text-white/70">
                        No deposit history found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-4 shadow-lg shadow-green-900/20 sm:flex-row">
          <div className="text-[13px] font-semibold text-white/70">
            Total:{" "}
            <span className="font-extrabold text-white">
              {meta?.total || 0}
            </span>{" "}
            items
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition ${
                page <= 1
                  ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                  : "border-green-700/40 bg-black/30 text-white hover:border-green-500/60 hover:bg-black/40"
              }`}
            >
              <FaChevronLeft />
            </button>

            <div className="rounded-xl border border-green-700/40 bg-black/30 px-4 py-2 text-[13px] font-extrabold text-white">
              Page {page} / {totalPages}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition ${
                page >= totalPages
                  ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                  : "border-green-700/40 bg-black/30 text-white hover:border-green-500/60 hover:bg-black/40"
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositHistory;
