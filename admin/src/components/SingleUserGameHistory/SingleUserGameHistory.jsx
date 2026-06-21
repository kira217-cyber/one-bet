import React, { useEffect, useMemo, useState } from "react";
import {
  FaGamepad,
  FaSearch,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaCoins,
  FaTrophy,
  FaTimesCircle,
} from "react-icons/fa";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (value, currency = "BDT") => {
  const symbol = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(value || 0);

  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "win") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  }

  if (s === "loss") {
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  }

  if (s === "push") {
    return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
  }

  return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
};

const cardClass =
  "rounded-2xl border border-green-700/40 bg-gradient-to-b from-black/95 via-green-950/20 to-black/95 shadow-lg shadow-green-900/20";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/40 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400";

const SingleUserGameHistory = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({});

  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 15,
  });

  const totalBet = Number(summary?.totalLoss || summary?.totalBet || 0);
  const totalWin = Number(summary?.totalWin || 0);
  const totalNet =
    Number(summary?.totalNet || 0) ||
    history.reduce((sum, item) => sum + Number(item?.net_amount || 0), 0);

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get(`/api/single-user-history/${id}`, {
        params: {
          type: "game",
          page,
          limit: 15,
          search,
          status,
        },
      });

      if (data?.success) {
        setHistory(Array.isArray(data?.history) ? data.history : []);
        setSummary(data?.summary || {});
        setPagination(
          data?.pagination || {
            total: 0,
            totalPages: 1,
            currentPage: 1,
            limit: 15,
          },
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load game history",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status]);

  const totalPages = useMemo(() => {
    return Math.max(Number(pagination?.totalPages || 1), 1);
  }, [pagination]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchText.trim());
  };

  const handleReset = () => {
    setSearch("");
    setSearchText("");
    setStatus("");
    setPage(1);
  };

  const handleRefresh = () => {
    fetchHistory(true);
  };

  return (
    <div className="mt-6 text-white">
      <div className={`${cardClass} p-4 md:p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-300 flex items-center gap-3">
              <FaGamepad />
              Single User Game History
            </h2>

            <p className="text-sm text-green-200/70 mt-1">
              View all game history records, win/loss details and balance
              changes
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3 rounded-xl bg-black/60 border border-green-700/50 hover:bg-green-900/20 flex items-center gap-2"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Total Bet"
          value={money(totalBet)}
          valueClass="text-red-300"
          icon={<FaTimesCircle />}
          iconClass="bg-red-500/15 text-red-300"
        />

        <SummaryCard
          label="Total Win"
          value={money(totalWin)}
          valueClass="text-emerald-300"
          icon={<FaTrophy />}
          iconClass="bg-emerald-500/15 text-emerald-300"
        />

        <SummaryCard
          label="Net Amount"
          value={money(totalNet)}
          valueClass={totalNet >= 0 ? "text-emerald-300" : "text-red-300"}
          icon={<FaCoins />}
          iconClass="bg-blue-500/15 text-blue-300"
        />

        <SummaryCard
          label="Total Records"
          value={pagination?.total || 0}
          valueClass="text-yellow-300"
          icon={<FaGamepad />}
          iconClass="bg-yellow-500/15 text-yellow-300"
        />
      </div>

      <div className={`${cardClass} p-4 md:p-5 mb-6`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <div className="relative">
              <input
                type="text"
                placeholder="Search userGamePlayName, member account, game uid, game round, serial number..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={handleSearch}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-green-300 hover:text-white"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All Result Type</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="push">Push</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer w-full h-full min-h-[52px] rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/20 font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full min-w-[1700px]">
            <thead className="bg-green-900/20 border-b border-green-700/30">
              <tr className="text-left">
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  User
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  User Game Play Name
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Member Account
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Game UID
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Game Round
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Serial Number
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Bet Amount
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Win Amount
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Net Amount
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Result Type
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Balance Before
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Balance After
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Currency
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Oracle Time
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                history?.map((item) => (
                  <tr
                    key={item?._id}
                    className="border-b border-green-900/20 hover:bg-green-900/10"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-white">
                      <div>{item?.userId || "—"}</div>
                      <div className="text-xs text-green-200/60 mt-1">
                        {item?.phone || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-green-100 break-all">
                      {item?.userGamePlayName || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-green-100 break-all">
                      {item?.member_account || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-white break-all">
                      {item?.game_uid || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-green-100 break-all">
                      {item?.game_round || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-green-100 break-all">
                      {item?.serial_number || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-red-300">
                      {money(item?.bet_amount, item?.currency)}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-emerald-300">
                      {money(item?.win_amount, item?.currency)}
                    </td>

                    <td
                      className={`px-4 py-4 text-sm font-semibold ${
                        Number(item?.net_amount || 0) >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {money(item?.net_amount, item?.currency)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusClass(
                          item?.resultType,
                        )}`}
                      >
                        {item?.resultType || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-white">
                      {money(item?.balance_before, item?.currency)}
                    </td>

                    <td className="px-4 py-4 text-sm text-yellow-300">
                      {money(item?.balance_after, item?.currency)}
                    </td>

                    <td className="px-4 py-4 text-sm text-green-100">
                      {item?.currency || "BDT"}
                    </td>

                    <td className="px-4 py-4 text-xs text-green-100 whitespace-nowrap">
                      {item?.oracleTimestamp || "—"}
                    </td>

                    <td className="px-4 py-4 text-xs text-green-100">
                      {item?.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="xl:hidden p-4 space-y-4">
          {!loading &&
            history?.map((item) => (
              <div
                key={item?._id}
                className="rounded-2xl border border-green-700/30 bg-black/40 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {item?.game_uid || "—"}
                    </h3>

                    <p className="text-sm text-green-200/70 mt-1">
                      {item?.userGamePlayName || "—"}
                    </p>

                    <p className="text-xs text-green-200/50 mt-1">
                      {item?.member_account || "—"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusClass(
                      item?.resultType,
                    )}`}
                  >
                    {item?.resultType || "—"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoItem
                    label="Bet Amount"
                    value={money(item?.bet_amount, item?.currency)}
                    valueClass="text-red-300"
                  />

                  <InfoItem
                    label="Win Amount"
                    value={money(item?.win_amount, item?.currency)}
                    valueClass="text-emerald-300"
                  />

                  <InfoItem
                    label="Net Amount"
                    value={money(item?.net_amount, item?.currency)}
                    valueClass={
                      Number(item?.net_amount || 0) >= 0
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  />

                  <InfoItem
                    label="Balance After"
                    value={money(item?.balance_after, item?.currency)}
                    valueClass="text-yellow-300"
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-green-900/30 space-y-2">
                  <p className="text-xs text-green-200/60 break-all">
                    User ID: {item?.userId || "—"}
                  </p>

                  <p className="text-xs text-green-200/60 break-all">
                    Phone: {item?.phone || "—"}
                  </p>

                  <p className="text-xs text-green-200/60 break-all">
                    Game Round: {item?.game_round || "—"}
                  </p>

                  <p className="text-xs text-green-200/60 break-all">
                    Serial Number: {item?.serial_number || "—"}
                  </p>

                  <p className="text-xs text-green-200/60">
                    Balance Before:{" "}
                    {money(item?.balance_before, item?.currency)}
                  </p>

                  <p className="text-xs text-green-200/60">
                    Currency: {item?.currency || "BDT"}
                  </p>

                  <p className="text-xs text-green-200/60">
                    Oracle Time: {item?.oracleTimestamp || "—"}
                  </p>

                  <p className="text-xs text-green-200/60">
                    {item?.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {!loading && history?.length === 0 && (
          <div className="p-10 text-center text-green-200/70 font-semibold">
            No Game History Yet!
          </div>
        )}

        {loading && (
          <div className="p-10 text-center">
            <div className="inline-flex items-center gap-3 text-green-300">
              <FaSyncAlt className="animate-spin" />
              Loading game history...
            </div>
          </div>
        )}

        {!loading && history?.length > 0 && (
          <div className="border-t border-green-700/30 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-green-200/70">
                Showing page {pagination?.currentPage} of{" "}
                {pagination?.totalPages}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-10 w-10 rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 flex items-center justify-center"
                >
                  <FaAngleDoubleLeft />
                </button>

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-10 w-10 rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 flex items-center justify-center"
                >
                  <FaChevronLeft />
                </button>

                <div className="px-4 h-10 rounded-xl border border-green-700/40 bg-green-500/10 flex items-center justify-center text-sm font-bold text-green-300">
                  {page}
                </div>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-10 w-10 rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 flex items-center justify-center"
                >
                  <FaChevronRight />
                </button>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-10 w-10 rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 flex items-center justify-center"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, valueClass, icon, iconClass }) => {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-green-200/70">{label}</p>

          <h3 className={`text-2xl font-bold mt-2 ${valueClass}`}>{value}</h3>
        </div>

        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, valueClass = "text-white" }) => {
  return (
    <div className="rounded-xl bg-black/40 border border-green-900/20 p-3">
      <p className="text-xs text-green-200/60 mb-1">{label}</p>

      <p className={`text-sm font-semibold ${valueClass}`}>{value || "—"}</p>
    </div>
  );
};

export default SingleUserGameHistory;
