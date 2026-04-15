import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { api } from "../../api/axios";

const money = (n, currency = "BDT") => {
  const sym = String(currency || "BDT").toUpperCase() === "USDT" ? "$" : "৳";
  const num = Number(n || 0);
  if (Number.isNaN(num)) return `${sym} 0.00`;
  return `${sym} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "approved") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  }
  if (status === "rejected") {
    return "bg-red-500/15 text-red-200 border-red-400/30";
  }
  return "bg-yellow-500/15 text-yellow-200 border-yellow-400/30";
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText,
  confirmClass,
  loading,
  note,
  setNote,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-2xl border border-green-700/30 bg-gradient-to-b from-black via-green-950/20 to-black shadow-2xl">
        <div className="p-5 border-b border-green-700/30">
          <div className="text-[16px] font-extrabold text-green-200">{title}</div>
          <div className="mt-1 text-[12px] text-green-200/70">{description}</div>
        </div>

        <div className="p-5">
          <div className="text-[12px] font-bold text-green-200/80">
            Admin Note (optional)
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a note for affiliate..."
            className="mt-2 w-full min-h-[90px] rounded-xl bg-black/60 border border-green-700/40 text-white placeholder-green-200/40 p-3 outline-none focus:ring-2 focus:ring-green-400/30"
          />
        </div>

        <div className="p-5 pt-0 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-xl border border-green-700/40 text-green-100 hover:bg-green-900/30 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer px-4 py-2 rounded-xl font-extrabold transition ${confirmClass} ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const AffWithdrawRequest = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const fetchData = async (page = meta.page, nextQ = q, nextStatus = status) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: meta.limit,
      };

      if (nextQ) params.q = nextQ;
      if (nextStatus !== "all") params.status = nextStatus;

      const { data } = await api.get("/api/admin/aff-withdraw-requests", {
        params,
      });

      const items = data?.data || [];
      const total = data?.meta?.total ?? items.length;

      setList(items);
      setMeta((m) => ({
        ...m,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || m.limit,
        total,
      }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load withdraw requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const next = qInput.trim();
    setQ(next);
    fetchData(1, next, status);
  };

  const openApprove = (row) => {
    setSelected(row);
    setNote("");
    setApproveOpen(true);
  };

  const openReject = (row) => {
    setSelected(row);
    setNote("");
    setRejectOpen(true);
  };

  const approveNow = async () => {
    if (!selected?._id) return;
    try {
      setActing(true);
      await api.patch(`/api/admin/aff-withdraw-requests/${selected._id}/approve`, {
        adminNote: note,
      });
      toast.success("Withdraw approved");
      setApproveOpen(false);
      setSelected(null);
      fetchData(meta.page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    if (!selected?._id) return;
    try {
      setActing(true);
      await api.patch(`/api/admin/aff-withdraw-requests/${selected._id}/reject`, {
        adminNote: note,
      });
      toast.success("Withdraw rejected");
      setRejectOpen(false);
      setSelected(null);
      fetchData(meta.page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-green-700/30">
          <div>
            <div className="text-[18px] font-extrabold text-white">
              Affiliate Withdraw Requests
            </div>
            <div className="mt-1 text-[12px] text-green-200/70">
              Approve or reject affiliate withdrawal requests.
            </div>
          </div>

          <button
            onClick={() => fetchData(meta.page)}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-green-700/40 bg-black/40 text-green-100 hover:bg-green-900/30 transition text-[13px] font-extrabold"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_180px] gap-3">
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-200/60" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search: userId / phone / email / method..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-green-700/40 text-white placeholder-green-200/40 outline-none focus:ring-2 focus:ring-green-400/30"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-green-200/80">
                Status
              </div>
              <select
                value={status}
                onChange={(e) => {
                  const next = e.target.value;
                  setStatus(next);
                  fetchData(1, q, next);
                }}
                className="cursor-pointer w-full py-3 px-3 rounded-xl bg-black/50 border border-green-700/40 text-white outline-none focus:ring-2 focus:ring-green-400/30"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-black/40 border border-green-700/30 px-4 py-3">
              <div className="text-[12px] text-green-200/60">Total</div>
              <div className="text-[14px] font-extrabold text-white">
                {meta.total || 0}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-green-700/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="bg-black/70">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-[12px] font-extrabold text-green-200/80">
                      Affiliate
                    </th>
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

                <tbody className="bg-black/40">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-green-200/70">
                        Loading...
                      </td>
                    </tr>
                  ) : list.length ? (
                    list.map((r) => {
                      const statusText = String(r?.status || "pending");
                      const createdAt = r?.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "—";

                      const name = r?.user?.fullName || "No Name";
                      const userId = r?.user?.userId || "—";
                      const phone = r?.user?.phone || "—";
                      const currency = r?.user?.currency || "BDT";

                      return (
                        <tr
                          key={r._id}
                          className="border-t border-green-700/20 hover:bg-green-900/10 transition"
                        >
                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">{name}</div>
                            <div className="text-[12px] text-green-200/60">{userId}</div>
                            <div className="text-[12px] text-green-200/60">{phone}</div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {String(r?.methodId || "—").toUpperCase()}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-[13px] font-extrabold text-white">
                              {money(r?.amount || 0, currency)}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chipClass(
                                statusText,
                              )}`}
                            >
                              {statusText.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-[12px] text-green-200/70">
                            {createdAt}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/aff-withdraw-request-details/${r._id}`)
                                }
                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-green-700/40 bg-black/40 text-green-100 hover:bg-green-900/30 transition text-[12px] font-extrabold"
                              >
                                <FaEye />
                                Details
                              </button>

                              <button
                                onClick={() => openApprove(r)}
                                disabled={statusText !== "pending"}
                                className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-extrabold transition ${
                                  statusText === "pending"
                                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25"
                                    : "opacity-50 cursor-not-allowed bg-emerald-500/10 text-emerald-200/70 border border-emerald-400/20"
                                }`}
                              >
                                <FaCheckCircle />
                                Approve
                              </button>

                              <button
                                onClick={() => openReject(r)}
                                disabled={statusText !== "pending"}
                                className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-extrabold transition ${
                                  statusText === "pending"
                                    ? "bg-red-500/20 text-red-200 border border-red-400/30 hover:bg-red-500/25"
                                    : "opacity-50 cursor-not-allowed bg-red-500/10 text-red-200/70 border border-red-400/20"
                                }`}
                              >
                                <FaTimesCircle />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-green-200/70">
                        No affiliate withdraw requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                className={`cursor-pointer px-4 py-2 rounded-xl border border-green-700/40 font-extrabold text-[13px] transition ${
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
                className={`cursor-pointer px-4 py-2 rounded-xl border border-green-700/40 font-extrabold text-[13px] transition ${
                  meta.page >= pageCount || loading
                    ? "opacity-50 cursor-not-allowed text-green-200/60"
                    : "text-green-100 hover:bg-green-900/30"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={approveOpen}
        title="Approve Affiliate Withdraw Request"
        description={`You are going to approve this request. Amount: ${money(
          selected?.amount || 0,
          selected?.user?.currency || "BDT",
        )}`}
        confirmText="Approve"
        confirmClass="bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/35"
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setApproveOpen(false);
          setSelected(null);
        }}
        onConfirm={approveNow}
      />

      <ConfirmModal
        open={rejectOpen}
        title="Reject Affiliate Withdraw Request"
        description="Rejecting will refund the affiliate user's balance."
        confirmText="Reject"
        confirmClass="bg-red-500/30 border border-red-400/40 text-red-100 hover:bg-red-500/35"
        loading={acting}
        note={note}
        setNote={setNote}
        onClose={() => {
          if (acting) return;
          setRejectOpen(false);
          setSelected(null);
        }}
        onConfirm={rejectNow}
      />
    </div>
  );
};

export default AffWithdrawRequest;