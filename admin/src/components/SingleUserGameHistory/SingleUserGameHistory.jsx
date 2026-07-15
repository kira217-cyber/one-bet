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

const numberValue = (value = 0) => {
  const num = Number(value || 0);

  return Number.isFinite(num) ? num : 0;
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

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "win") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  }

  if (value === "loss") {
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  }

  if (value === "push") {
    return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
  }

  return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
};

const providerClass = (provider) => {
  const value = String(provider || "").toLowerCase();

  if (value === "ninewicket") {
    return "border border-cyan-500/30 bg-cyan-500/15 text-cyan-300";
  }

  return "border border-violet-500/30 bg-violet-500/15 text-violet-300";
};

const nineWicketStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "settled") {
    return "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
  }

  if (value === "open") {
    return "border border-amber-500/30 bg-amber-500/15 text-amber-300";
  }

  if (value === "cancelled" || value === "canceled" || value === "void") {
    return "border border-red-500/30 bg-red-500/15 text-red-300";
  }

  return "border border-white/15 bg-white/5 text-white/70";
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
  const [provider, setProvider] = useState("");

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

  const currentExposure = Number(summary?.currentExposure || 0);

  const totalMatchStake =
    Number(summary?.totalMatchStake || 0) ||
    history.reduce((sum, item) => sum + numberValue(item?.matchStake), 0);

  const nineWicketCount =
    Number(summary?.nineWicketCount || 0) ||
    history.filter(
      (item) => String(item?.provider || "").toLowerCase() === "ninewicket",
    ).length;

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get(`/api/single-user-history/${id}`, {
        params: {
          type: "game",
          page,
          limit: 15,
          search,
          status,
          provider,
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
  }, [page, search, status, provider]);

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
    setProvider("");
    setPage(1);
  };

  const handleRefresh = () => {
    fetchHistory(true);
  };

  return (
    <div className="mt-6 text-white">
      <div className={`${cardClass} mb-6 p-4 md:p-6`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-green-300">
              <FaGamepad />
              Single User Game History
            </h2>

            <p className="mt-1 text-sm text-green-200/70">
              View all game history records, win/loss details and balance
              changes
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-green-700/50 bg-black/60 px-5 py-3 hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
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

        <SummaryCard
          label="Nine Wicket Records"
          value={nineWicketCount}
          valueClass="text-cyan-300"
          icon={<FaGamepad />}
          iconClass="bg-cyan-500/15 text-cyan-300"
        />

        <SummaryCard
          label="Current Exposure"
          value={money(currentExposure)}
          valueClass="text-orange-300"
          icon={<FaCoins />}
          iconClass="bg-orange-500/15 text-orange-300"
        />
      </div>

      <div className={`${cardClass} mb-6 p-4 md:p-5`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search username, member account, game uid, round, serial, bet id, event..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-green-300 hover:text-white"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
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
            <select
              value={provider}
              onChange={(event) => {
                setProvider(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All Provider</option>
              <option value="oracle">Oracle</option>
              <option value="ninewicket">Nine Wicket</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={handleReset}
              className="h-full min-h-[52px] w-full cursor-pointer rounded-xl border border-red-500/30 bg-red-500/15 font-medium text-red-300 hover:bg-red-500/20"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[3500px]">
            <thead className="border-b border-green-700/30 bg-green-900/20">
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

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Provider
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Nine Wicket Username
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Bet ID
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Bet Status
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Match Stake
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Profit / Loss
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Event Type
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Event Name
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Market
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Competition
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Exposure Change
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-cyan-300">
                  Exposure After
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                history.map((item) => {
                  const currentProvider = String(
                    item?.provider || "oracle",
                  ).toLowerCase();

                  const isNineWicket = currentProvider === "ninewicket";

                  return (
                    <tr
                      key={item?._id}
                      className="border-b border-green-900/20 hover:bg-green-900/10"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-white">
                        <div>{item?.userId || "—"}</div>

                        <div className="mt-1 text-xs text-green-200/60">
                          {item?.phone || "—"}
                        </div>
                      </td>

                      <td className="break-all px-4 py-4 text-sm text-green-100">
                        {item?.userGamePlayName || "—"}
                      </td>

                      <td className="break-all px-4 py-4 text-sm text-green-100">
                        {item?.member_account || "—"}
                      </td>

                      <td className="break-all px-4 py-4 text-sm text-white">
                        {item?.game_uid || "—"}
                      </td>

                      <td className="break-all px-4 py-4 text-sm text-green-100">
                        {item?.game_round || "—"}
                      </td>

                      <td className="break-all px-4 py-4 text-sm text-green-100">
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
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
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

                      <td className="whitespace-nowrap px-4 py-4 text-xs text-green-100">
                        {item?.oracleTimestamp || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-xs text-green-100">
                        {formatDateTime(item?.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${providerClass(
                            currentProvider,
                          )}`}
                        >
                          {isNineWicket ? "Nine Wicket" : "Oracle"}
                        </span>
                      </td>

                      <td className="break-all px-4 py-4 text-sm font-semibold text-cyan-200">
                        {isNineWicket
                          ? item?.nineWicketUsername ||
                            item?.member_account ||
                            "—"
                          : "—"}
                      </td>

                      <td className="break-all px-4 py-4 text-sm text-green-100">
                        {isNineWicket ? item?.nineWicketBetId || "—" : "—"}
                      </td>

                      <td className="px-4 py-4">
                        {isNineWicket ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${nineWicketStatusClass(
                              item?.nineWicketBetStatus,
                            )}`}
                          >
                            {item?.nineWicketBetStatus || "—"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-cyan-300">
                        {isNineWicket
                          ? money(item?.matchStake, item?.currency)
                          : "—"}
                      </td>

                      <td
                        className={`px-4 py-4 text-sm font-bold ${
                          numberValue(item?.profitLoss) >= 0
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {isNineWicket
                          ? money(item?.profitLoss, item?.currency)
                          : "—"}
                      </td>

                      <td className="break-all px-4 py-4 text-sm text-green-100">
                        {isNineWicket ? item?.eventTypeName || "—" : "—"}
                      </td>

                      <td className="max-w-[260px] break-words px-4 py-4 text-sm text-white">
                        {isNineWicket ? item?.eventName || "—" : "—"}
                      </td>

                      <td className="max-w-[260px] break-words px-4 py-4 text-sm text-green-100">
                        {isNineWicket ? item?.marketName || "—" : "—"}
                      </td>

                      <td className="max-w-[260px] break-words px-4 py-4 text-sm text-green-100">
                        {isNineWicket ? item?.competitionName || "—" : "—"}
                      </td>

                      <td
                        className={`px-4 py-4 text-sm font-bold ${
                          numberValue(item?.exposureChange) > 0
                            ? "text-red-300"
                            : numberValue(item?.exposureChange) < 0
                              ? "text-emerald-300"
                              : "text-white/60"
                        }`}
                      >
                        {isNineWicket
                          ? money(item?.exposureChange, item?.currency)
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-yellow-300">
                        {isNineWicket
                          ? money(item?.exposureAfter, item?.currency)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 p-4 xl:hidden">
          {!loading &&
            history.map((item) => {
              const currentProvider = String(
                item?.provider || "oracle",
              ).toLowerCase();

              const isNineWicket = currentProvider === "ninewicket";

              return (
                <div
                  key={item?._id}
                  className="rounded-2xl border border-green-700/30 bg-black/40 p-4"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {item?.game_uid || "—"}
                      </h3>

                      <p className="mt-1 text-sm text-green-200/70">
                        {item?.userGamePlayName || "—"}
                      </p>

                      <p className="mt-1 text-xs text-green-200/50">
                        {item?.member_account || "—"}
                      </p>

                      {isNineWicket && (
                        <p className="mt-1 text-xs font-semibold text-cyan-300">
                          Nine Wicket:{" "}
                          {item?.nineWicketUsername ||
                            item?.member_account ||
                            "—"}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                          item?.resultType,
                        )}`}
                      >
                        {item?.resultType || "—"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${providerClass(
                          currentProvider,
                        )}`}
                      >
                        {isNineWicket ? "Nine Wicket" : "Oracle"}
                      </span>
                    </div>
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

                    {isNineWicket && (
                      <>
                        <InfoItem
                          label="Match Stake"
                          value={money(item?.matchStake, item?.currency)}
                          valueClass="text-cyan-300"
                        />

                        <InfoItem
                          label="Exposure After"
                          value={money(item?.exposureAfter, item?.currency)}
                          valueClass="text-yellow-300"
                        />
                      </>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-green-900/30 pt-4">
                    <p className="break-all text-xs text-green-200/60">
                      User ID: {item?.userId || "—"}
                    </p>

                    <p className="break-all text-xs text-green-200/60">
                      Phone: {item?.phone || "—"}
                    </p>

                    <p className="break-all text-xs text-green-200/60">
                      Game Round: {item?.game_round || "—"}
                    </p>

                    <p className="break-all text-xs text-green-200/60">
                      Serial Number: {item?.serial_number || "—"}
                    </p>

                    <p className="text-xs text-green-200/60">
                      Balance Before:{" "}
                      {money(item?.balance_before, item?.currency)}
                    </p>

                    <p className="text-xs text-green-200/60">
                      Currency: {item?.currency || "BDT"}
                    </p>

                    {isNineWicket && (
                      <>
                        <p className="break-all text-xs text-cyan-200/70">
                          Bet ID: {item?.nineWicketBetId || "—"}
                        </p>

                        <p className="text-xs text-cyan-200/70">
                          Bet Status: {item?.nineWicketBetStatus || "—"}
                        </p>

                        <p className="text-xs text-cyan-200/70">
                          Profit/Loss: {money(item?.profitLoss, item?.currency)}
                        </p>

                        <p className="break-all text-xs text-cyan-200/70">
                          Event Type: {item?.eventTypeName || "—"}
                        </p>

                        <p className="break-all text-xs text-cyan-200/70">
                          Event: {item?.eventName || "—"}
                        </p>

                        <p className="break-all text-xs text-cyan-200/70">
                          Market: {item?.marketName || "—"}
                        </p>

                        <p className="break-all text-xs text-cyan-200/70">
                          Competition: {item?.competitionName || "—"}
                        </p>

                        <p className="text-xs text-cyan-200/70">
                          Exposure Change:{" "}
                          {money(item?.exposureChange, item?.currency)}
                        </p>
                      </>
                    )}

                    <p className="text-xs text-green-200/60">
                      Oracle Time: {item?.oracleTimestamp || "—"}
                    </p>

                    <p className="text-xs text-green-200/60">
                      {formatDateTime(item?.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        {!loading && history.length === 0 && (
          <div className="p-10 text-center font-semibold text-green-200/70">
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

        {!loading && history.length > 0 && (
          <div className="border-t border-green-700/30 p-4">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-green-200/70">
                Showing page {pagination?.currentPage} of{" "}
                {pagination?.totalPages}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaAngleDoubleLeft />
                </button>

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((previous) => Math.max(previous - 1, 1))
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft />
                </button>

                <div className="flex h-10 items-center justify-center rounded-xl border border-green-700/40 bg-green-500/10 px-4 text-sm font-bold text-green-300">
                  {page}
                </div>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((previous) => Math.min(previous + 1, totalPages))
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronRight />
                </button>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-green-700/40 bg-black/50 hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-40"
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

          <h3 className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</h3>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, valueClass = "text-white" }) => {
  return (
    <div className="rounded-xl border border-green-900/20 bg-black/40 p-3">
      <p className="mb-1 text-xs text-green-200/60">{label}</p>

      <p className={`text-sm font-semibold ${valueClass}`}>{value || "—"}</p>
    </div>
  );
};

export default SingleUserGameHistory;
