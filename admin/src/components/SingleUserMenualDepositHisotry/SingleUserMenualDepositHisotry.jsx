import React, { useEffect, useMemo, useState } from "react";
import {
  FaMoneyBillWave,
  FaSearch,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaGift,
} from "react-icons/fa";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (value) => {
  const num = Number(value || 0);

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const cardClass =
  "rounded-2xl border border-green-700/40 bg-gradient-to-b from-black/95 via-green-950/20 to-black/95 shadow-lg shadow-green-900/20";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/40 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400";

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "approved") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  }

  if (s === "rejected") {
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  }

  return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30";
};

const SingleUserMenualDepositHisotry = () => {
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

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get(`/api/single-user-history/${id}`, {
        params: {
          type: "manual-deposit",
          page,
          limit: 15,
          search,
          status,
        },
      });

      if (data?.success) {
        setHistory(data?.history || []);
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
        error?.response?.data?.message ||
          "Failed to load manual deposit history",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search, status]);

  const totalPages = useMemo(() => {
    return Math.max(Number(pagination?.totalPages || 1), 1);
  }, [pagination]);

  const totalApprovedAmount = useMemo(() => {
    return history
      ?.filter((item) => item?.status === "approved")
      ?.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [history]);

  const totalBonusOnPage = useMemo(() => {
    return history?.reduce(
      (sum, item) => sum + Number(item?.calc?.totalBonus || 0),
      0,
    );
  }, [history]);

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
              <FaMoneyBillWave />
              Single User Manual Deposit History
            </h2>

            <p className="text-sm text-green-200/70 mt-1">
              View manual deposit requests, bonus, status and credited amounts
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
          label="Approved Amount"
          value={money(summary?.totalDeposit || 0)}
          valueClass="text-emerald-300"
          icon={<FaCheckCircle />}
          iconClass="bg-emerald-500/15 text-emerald-300"
        />

        <SummaryCard
          label="Pending Requests"
          value={summary?.manualDeposit?.pending || 0}
          valueClass="text-yellow-300"
          icon={<FaClock />}
          iconClass="bg-yellow-500/15 text-yellow-300"
        />

        <SummaryCard
          label="Approved Requests"
          value={summary?.manualDeposit?.approved || 0}
          valueClass="text-blue-300"
          icon={<FaMoneyBillWave />}
          iconClass="bg-blue-500/15 text-blue-300"
        />

        <SummaryCard
          label="Page Bonus Total"
          value={money(totalBonusOnPage || 0)}
          valueClass="text-purple-300"
          icon={<FaGift />}
          iconClass="bg-purple-500/15 text-purple-300"
        />
      </div>

      <div className={`${cardClass} p-4 md:p-5 mb-6`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <div className="relative">
              <input
                type="text"
                placeholder="Search method id, channel id..."
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
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
          <table className="w-full min-w-[1400px]">
            <thead className="bg-green-900/20 border-b border-green-700/30">
              <tr className="text-left">
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Method
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Channel
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Amount
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Bonus
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Credited
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Turnover
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Status
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-green-200">
                  Admin Note
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
                      {item?.methodId || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-green-100">
                      {item?.channelId || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-emerald-300">
                      {money(item?.amount)}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-purple-300">
                      {money(item?.calc?.totalBonus)}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-blue-300">
                      {money(item?.calc?.creditedAmount || item?.amount)}
                    </td>

                    <td className="px-4 py-4 text-sm text-yellow-300">
                      {money(item?.calc?.targetTurnover)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusClass(
                          item?.status,
                        )}`}
                      >
                        {item?.status || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-green-100 max-w-[220px] truncate">
                      {item?.adminNote || "—"}
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
                      {item?.methodId || "—"}
                    </h3>

                    <p className="text-sm text-green-200/70 mt-1">
                      Channel: {item?.channelId || "—"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusClass(
                      item?.status,
                    )}`}
                  >
                    {item?.status || "—"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoItem
                    label="Amount"
                    value={money(item?.amount)}
                    valueClass="text-emerald-300"
                  />

                  <InfoItem
                    label="Bonus"
                    value={money(item?.calc?.totalBonus)}
                    valueClass="text-purple-300"
                  />

                  <InfoItem
                    label="Credited"
                    value={money(item?.calc?.creditedAmount || item?.amount)}
                    valueClass="text-blue-300"
                  />

                  <InfoItem
                    label="Turnover"
                    value={money(item?.calc?.targetTurnover)}
                    valueClass="text-yellow-300"
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-green-900/30">
                  <p className="text-xs text-green-200/60 break-all">
                    Note: {item?.adminNote || "—"}
                  </p>

                  <p className="text-xs text-green-200/60 mt-2">
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
            No Manual Deposit History Yet!
          </div>
        )}

        {loading && (
          <div className="p-10 text-center">
            <div className="inline-flex items-center gap-3 text-green-300">
              <FaSyncAlt className="animate-spin" />
              Loading manual deposit history...
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

export default SingleUserMenualDepositHisotry;
