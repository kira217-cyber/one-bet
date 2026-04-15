import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { FaSyncAlt, FaEye } from "react-icons/fa";

import { api } from "../../api/axios";
import {
  selectAuth,
  selectUser,
} from "../../features/auth/authSelectors";

const symbolByCurrency = (c) =>
  String(c || "BDT").toUpperCase() === "USDT" ? "$" : "৳";

const formatMoney = (n, sym = "৳") => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return `${sym} 0.00`;
  return `${sym} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chip = (status) => {
  const s = String(status || "pending");
  if (s === "approved")
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (s === "rejected")
    return "bg-red-500/15 text-red-200 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-200 border-yellow-400/30";
};

const WithdrawHistory = () => {
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const token = auth?.token;
  const user = useSelector(selectUser);

  const currency = user?.currency || "BDT";
  const sym = useMemo(() => symbolByCurrency(currency), [currency]);

  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const fetchData = async (page = 1) => {
    if (!token) {
      setItems([]);
      setMeta((m) => ({ ...m, page: 1, total: 0 }));
      return;
    }

    try {
      setLoading(true);

      const params = { page, limit: meta.limit };
      if (status !== "all") params.status = status;

      const { data } = await api.get("/api/aff-withdraw-requests/my", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = data?.data || [];
      const total = data?.meta?.total ?? rows.length;

      setItems(Array.isArray(rows) ? rows : []);
      setMeta((m) => ({
        ...m,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || m.limit,
        total,
      }));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load withdraw history");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-green-800/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-green-800/40">
          <div>
            <div className="text-[18px] font-extrabold text-white">
              Withdraw History
            </div>
            <div className="mt-1 text-[12px] text-green-200/70">
              Your previous withdraw requests.
            </div>
          </div>

          <button
            onClick={() => fetchData(meta.page)}
            disabled={loading}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-green-700/50 bg-black/40 text-green-100 hover:bg-green-900/30 transition text-[13px] font-extrabold disabled:opacity-60"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-green-200/80">
                Status
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="cursor-pointer w-full py-3 px-3 rounded-xl bg-black/50 border border-green-700/50 text-white outline-none focus:ring-2 focus:ring-green-400/30"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-black/40 border border-green-800/40 px-4 py-3">
              <div className="text-[12px] text-green-200/60">Total</div>
              <div className="text-[14px] font-extrabold text-white">
                {meta.total || 0}
              </div>
            </div>
          </div>

          <div className="mt-5 hidden md:block rounded-2xl border border-green-800/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="bg-black/80">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-[12px] font-extrabold text-green-200/80">
                      Method
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-green-200/80">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-green-200/80">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-green-200/80">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[12px] font-extrabold text-green-200/80">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-black/30">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-green-200/70">
                        Loading...
                      </td>
                    </tr>
                  ) : items.length ? (
                    items.map((r) => {
                      const st = String(r?.status || "pending");
                      const dt = r?.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "—";

                      return (
                        <tr
                          key={r._id}
                          className="border-t border-green-800/30 hover:bg-green-900/10 transition"
                        >
                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {String(r?.methodId || "—").toUpperCase()}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {formatMoney(r?.amount || 0, sym)}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chip(st)}`}
                            >
                              {st.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-[12px] text-green-200/70">
                            {dt}
                          </td>

                          <td className="px-4 py-4">
                            <button
                              onClick={() =>
                                navigate(`/dashboard/withdraw-history/${r._id}`)
                              }
                              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-green-700/50 bg-black/40 text-green-100 hover:bg-green-900/30 transition text-[12px] font-extrabold"
                            >
                              <FaEye />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-green-200/70">
                        No withdraw history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 md:hidden space-y-3">
            {loading ? (
              <div className="p-5 rounded-2xl border border-green-800/40 bg-black/30 text-[13px] text-green-200/70 text-center">
                Loading...
              </div>
            ) : items.length ? (
              items.map((r) => {
                const st = String(r?.status || "pending");
                const dt = r?.createdAt
                  ? new Date(r.createdAt).toLocaleString()
                  : "—";

                return (
                  <div
                    key={r._id}
                    className="rounded-2xl border border-green-800/40 bg-black/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-extrabold text-white">
                          {String(r?.methodId || "—").toUpperCase()}
                        </div>
                        <div className="mt-1 text-[12px] text-green-200/70">{dt}</div>
                      </div>

                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chip(st)}`}
                      >
                        {st.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-3 text-[15px] font-extrabold text-white">
                      {formatMoney(r?.amount || 0, sym)}
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/dashboard/withdraw-history/${r._id}`)
                      }
                      className="cursor-pointer mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-green-700/50 bg-black/40 text-green-100 hover:bg-green-900/30 transition text-[12px] font-extrabold"
                    >
                      <FaEye />
                      Details
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-5 rounded-2xl border border-green-800/40 bg-black/30 text-[13px] text-green-200/70 text-center">
                No withdraw history found.
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-[12px] text-green-200/70">
              Page <span className="font-extrabold text-white">{meta.page}</span> of{" "}
              <span className="font-extrabold text-white">{pageCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(Math.max(1, meta.page - 1))}
                disabled={meta.page <= 1 || loading}
                className={`cursor-pointer px-4 py-2 rounded-xl border border-green-700/50 font-extrabold text-[13px] transition ${
                  meta.page <= 1 || loading
                    ? "opacity-50 cursor-not-allowed text-green-200/60"
                    : "text-green-100 hover:bg-green-900/30"
                }`}
              >
                Prev
              </button>
              <button
                onClick={() => fetchData(Math.min(pageCount, meta.page + 1))}
                disabled={meta.page >= pageCount || loading}
                className={`cursor-pointer px-4 py-2 rounded-xl border border-green-700/50 font-extrabold text-[13px] transition ${
                  meta.page >= pageCount || loading
                    ? "opacity-50 cursor-not-allowed text-green-200/60"
                    : "text-green-100 hover:bg-green-900/30"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {!token && (
            <div className="mt-4 text-[12px] text-green-200/70">
              You are not logged in. Please login to view withdraw history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawHistory;