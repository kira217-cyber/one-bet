import React, { useEffect, useState } from "react";
import {
  FaGift,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaReceipt,
} from "react-icons/fa";
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
  if (!date) return "—";
  return new Date(date).toLocaleString();
};

const SingleUserGameLossBonusClaimHistory = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const fetchHistory = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const { data } = await api.get(
        `/api/game-loss-rewards/admin/users/${userId}/claims`,
        {
          params: {
            page,
            limit: 15,
          },
        },
      );

      if (data?.success) {
        setClaims(data?.data || []);
        setPagination(
          data?.pagination || {
            page: 1,
            limit: 15,
            total: 0,
            totalPages: 1,
          },
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load game loss bonus claim history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, page]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  return (
    <div className="mt-6 rounded-2xl border border-green-700/40 bg-gradient-to-b from-black/95 via-green-950/20 to-black/95 p-4 md:p-6 text-white shadow-lg shadow-green-900/20">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-green-300">
            <FaGift />
            Game Loss Bonus Claim History
          </h2>
          <p className="mt-1 text-sm text-green-200/70">
            Single user cashback claim records
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-700/50 bg-black/60 px-4 py-3 text-sm font-semibold text-white hover:bg-green-900/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-green-700/40 bg-black/40 p-4">
          <p className="text-sm text-green-200/70">Total Claims</p>
          <h3 className="mt-1 text-2xl font-bold text-white">
            {pagination.total}
          </h3>
        </div>

        <div className="rounded-xl border border-green-700/40 bg-black/40 p-4">
          <p className="text-sm text-green-200/70">Current Page</p>
          <h3 className="mt-1 text-2xl font-bold text-green-300">
            {pagination.page}
          </h3>
        </div>

        <div className="rounded-xl border border-green-700/40 bg-black/40 p-4">
          <p className="text-sm text-green-200/70">User ID</p>
          <h3 className="mt-1 break-all text-lg font-bold text-white">
            {userId || "—"}
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-sm text-green-200/80">
              <th className="px-4 py-2">Reward</th>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Total Bet</th>
              <th className="px-4 py-2">Total Win</th>
              <th className="px-4 py-2">Net Loss</th>
              <th className="px-4 py-2">Bonus</th>
              <th className="px-4 py-2">Claim Amount</th>
              <th className="px-4 py-2">Claimed At</th>
            </tr>
          </thead>

          <tbody>
            {claims.map((claim) => (
              <tr
                key={claim._id}
                className="rounded-xl bg-green-950/20 text-sm text-white"
              >
                <td className="rounded-l-xl px-4 py-4">
                  <div className="flex items-center gap-2">
                    <FaReceipt className="text-green-300" />
                    <div>
                      <p className="font-bold">
                        {claim?.settingTitle?.en ||
                          claim?.setting?.title?.en ||
                          "Game Loss Cashback"}
                      </p>
                      <p className="text-xs text-green-200/70">
                        {claim?.settingTitle?.bn ||
                          claim?.setting?.title?.bn ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p>{formatDate(claim.periodStart)}</p>
                  <p className="text-xs text-green-200/70">
                    to {formatDate(claim.periodEnd)}
                  </p>
                </td>

                <td className="px-4 py-4">{money(claim.totalBet)}</td>
                <td className="px-4 py-4">{money(claim.totalWin)}</td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-red-500/15 px-3 py-1 font-semibold text-red-200">
                    {money(claim.netLoss)}
                  </span>
                </td>

                <td className="px-4 py-4">{claim.bonusPercent}%</td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-green-500/15 px-3 py-1 font-bold text-green-300">
                    {money(claim.claimAmount)}
                  </span>
                </td>

                <td className="rounded-r-xl px-4 py-4">
                  {formatDate(claim.claimedAt)}
                </td>
              </tr>
            ))}

            {!loading && claims.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="rounded-xl bg-green-950/20 px-4 py-10 text-center text-green-200/70"
                >
                  No game loss bonus claim history found
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan="8"
                  className="rounded-xl bg-green-950/20 px-4 py-10 text-center text-green-200/70"
                >
                  Loading claim history...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-green-200/70">
          Total: {pagination.total} | Page {pagination.page} /{" "}
          {pagination.totalPages}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-green-700/50 bg-black/60 px-4 py-2 text-sm font-bold text-green-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft />
            Previous
          </button>

          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-green-700/50 bg-black/60 px-4 py-2 text-sm font-bold text-green-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleUserGameLossBonusClaimHistory;
