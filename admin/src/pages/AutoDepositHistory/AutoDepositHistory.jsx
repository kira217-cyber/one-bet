import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaSearch,
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaFilter,
  FaReceipt,
  FaUser,
  FaPhoneAlt,
  FaCircle,
  FaGift,
  FaPercentage,
} from "react-icons/fa";

const money = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusChip = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  if (s === "PAID")
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (s === "FAILED") return "bg-red-500/15 text-red-200 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-200 border-yellow-400/30";
};

const statusDot = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  if (s === "PAID") return "text-emerald-300";
  if (s === "FAILED") return "text-red-300";
  return "text-yellow-300";
};

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-green-700/20">
    <div className="text-[12px] font-bold text-green-100/70">{k}</div>
    <div className="text-[13px] font-extrabold text-white/90 text-right break-all">
      {v}
    </div>
  </div>
);

const AutoDepositHistory = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  const page = pagination.page;
  const limit = pagination.limit;
  const totalPages = pagination.totalPages;

  const fetchData = async ({
    page: p = page,
    limit: l = limit,
    qv = q,
    sv = status,
  } = {}) => {
    try {
      if (!refreshing) setLoading(true);

      const params = { page: p, limit: l };
      if (qv) params.q = qv;
      if (sv !== "ALL") params.status = sv;

      const { data } = await api.get("/api/auto-deposit/deposits/admin", {
        params,
      });

      if (!data?.success) throw new Error(data?.message || "Fetch failed");

      setRows(Array.isArray(data?.data) ? data.data : []);
      setPagination({
        page: data?.pagination?.page || p,
        limit: data?.pagination?.limit || l,
        total: data?.pagination?.total || 0,
        totalPages: data?.pagination?.totalPages || 1,
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ page: 1, qv: "", sv: "ALL" });
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const query = qInput.trim();
    setQ(query);
    setExpandedId("");
    fetchData({ page: 1, qv: query, sv: status });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setExpandedId("");
    await fetchData({ page, qv: q, sv: status });
    toast.info("Refreshed");
  };

  const onChangeStatus = (val) => {
    setStatus(val);
    setExpandedId("");
    fetchData({ page: 1, qv: q, sv: val });
  };

  const onPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setExpandedId("");
    fetchData({ page: newPage, qv: q, sv: status });
  };

  const headerStats = useMemo(() => {
    const total = Number(pagination.total || 0);
    const showing = Array.isArray(rows) ? rows.length : 0;
    return { total, showing };
  }, [pagination.total, rows]);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black text-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-green-700/40 bg-gradient-to-r from-green-700 via-emerald-600 to-green-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black/35 flex items-center justify-center">
                <FaReceipt className="text-white text-xl" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight">
                  Auto Deposit History
                </div>
                <div className="text-xs text-white/85">
                  Bonus, credited amount, turnover and affiliate info
                </div>
              </div>
            </div>

            <button
              onClick={onRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-black bg-white/90 hover:bg-white transition border border-black/20 disabled:opacity-60 cursor-pointer"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-5 md:p-6 border-b border-green-700/30">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search: userId / phone / invoice / transaction / bonus"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-green-700/50 text-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-green-100/80 inline-flex items-center gap-2">
                <FaFilter className="text-green-300" />
                Status
              </div>
              <select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value)}
                className="w-full py-3 px-3 rounded-xl bg-black/50 border border-green-700/50 text-white outline-none cursor-pointer"
              >
                <option value="ALL">All</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-green-100/80">
                Per Page
              </div>
              <select
                value={limit}
                onChange={(e) =>
                  fetchData({
                    page: 1,
                    limit: Number(e.target.value || 20),
                    qv: q,
                    sv: status,
                  })
                }
                className="w-full py-3 px-3 rounded-xl bg-black/50 border border-green-700/50 text-white outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/60">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-white/60">No records found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-green-200/90 text-sm">
                    <th className="px-6 py-4 font-semibold">Invoice</th>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Deposit</th>
                    <th className="px-6 py-4 font-semibold">Bonus</th>
                    <th className="px-6 py-4 font-semibold">Credited</th>
                    <th className="px-6 py-4 font-semibold">Turnover</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item) => {
                    const isExpanded = expandedId === item._id;
                    const bonusType = item?.selectedBonus?.bonusType || "";
                    const bonusTitle =
                      item?.selectedBonus?.title?.en ||
                      item?.selectedBonus?.title?.bn ||
                      "No Bonus";

                    return (
                      <React.Fragment key={item._id}>
                        <tr className="border-b border-green-900/20 hover:bg-black/30">
                          <td className="px-6 py-4 text-sm font-medium text-white/90 break-all">
                            {item.invoiceNumber || "—"}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="inline-flex items-center gap-2">
                                <FaUser className="text-green-400/70" />
                                <span className="font-extrabold text-white/90">
                                  {item.userDbUserId || "Unknown"}
                                </span>
                              </div>

                              <div className="inline-flex items-center gap-2 text-[12px] text-green-100/70">
                                <FaPhoneAlt className="text-green-300/70" />
                                <span>{item.userPhone || "—"}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-extrabold text-green-300">
                            {money(item.amount)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-white/85">
                              {bonusType === "percent" ? (
                                <FaPercentage className="text-emerald-300" />
                              ) : (
                                <FaGift className="text-emerald-300" />
                              )}
                              {bonusTitle}
                            </div>
                            <div className="mt-1 text-xs text-green-100/65">
                              {bonusType === "percent"
                                ? `${Number(item?.selectedBonus?.bonusValue || 0)}%`
                                : money(item?.selectedBonus?.bonusValue || 0)}
                              {" | "}+{money(item?.calc?.bonusAmount || 0)}
                            </div>
                          </td>

                          <td className="px-6 py-4 font-extrabold text-emerald-300">
                            {money(item?.calc?.creditedAmount || item.amount)}
                          </td>

                          <td className="px-6 py-4 text-white/90">
                            x{Number(item?.calc?.turnoverMultiplier || 1)} /{" "}
                            {money(item?.calc?.targetTurnover || item.amount)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusChip(
                                item.status,
                              )}`}
                            >
                              <FaCircle
                                className={`text-[10px] ${statusDot(item.status)}`}
                              />
                              {String(item.status || "PENDING").toUpperCase()}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                              {item.footprint ? (
                                <a
                                  href={item.footprint}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-green-700/50 bg-black/40 hover:bg-green-900/25 text-green-200 font-extrabold text-[12px] transition cursor-pointer"
                                >
                                  <FaExternalLinkAlt className="text-[11px]" />
                                  Footprint
                                </a>
                              ) : (
                                <span className="text-[12px] text-green-100/40">
                                  No link
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(isExpanded ? "" : item._id)
                                }
                                className="p-2 rounded-lg border border-green-700/50 bg-black/40 hover:bg-green-900/25 text-green-200 transition cursor-pointer"
                              >
                                {isExpanded ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-black/40">
                              <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <div className="rounded-2xl border border-green-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-green-200 mb-2">
                                    Payment
                                  </div>
                                  <FieldRow
                                    k="Invoice"
                                    v={item.invoiceNumber || "—"}
                                  />
                                  <FieldRow
                                    k="Deposit Amount"
                                    v={money(item.amount)}
                                  />
                                  <FieldRow k="Bank" v={item.bank || "—"} />
                                  <FieldRow k="Status" v={item.status || "—"} />
                                </div>

                                <div className="rounded-2xl border border-green-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-green-200 mb-2">
                                    Bonus & Turnover
                                  </div>
                                  <FieldRow
                                    k="Bonus Title"
                                    v={
                                      item?.selectedBonus?.title?.en ||
                                      item?.selectedBonus?.title?.bn ||
                                      "No Bonus"
                                    }
                                  />
                                  <FieldRow
                                    k="Bonus Type"
                                    v={item?.selectedBonus?.bonusType || "none"}
                                  />
                                  <FieldRow
                                    k="Bonus Value"
                                    v={
                                      item?.selectedBonus?.bonusType ===
                                      "percent"
                                        ? `${Number(item?.selectedBonus?.bonusValue || 0)}%`
                                        : money(
                                            item?.selectedBonus?.bonusValue ||
                                              0,
                                          )
                                    }
                                  />
                                  <FieldRow
                                    k="Bonus Amount"
                                    v={money(item?.calc?.bonusAmount || 0)}
                                  />
                                  <FieldRow
                                    k="Credited Amount"
                                    v={money(
                                      item?.calc?.creditedAmount || item.amount,
                                    )}
                                  />
                                  <FieldRow
                                    k="Target Turnover"
                                    v={money(
                                      item?.calc?.targetTurnover || item.amount,
                                    )}
                                  />
                                </div>

                                <div className="rounded-2xl border border-green-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-green-200 mb-2">
                                    Transaction
                                  </div>
                                  <FieldRow
                                    k="Transaction ID"
                                    v={item.transactionId || "—"}
                                  />
                                  <FieldRow
                                    k="Session Code"
                                    v={item.sessionCode || "—"}
                                  />
                                  <FieldRow
                                    k="Balance Added"
                                    v={item.balanceAdded ? "YES" : "NO"}
                                  />
                                </div>

                                <div className="rounded-2xl border border-green-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-green-200 mb-2">
                                    User & Affiliate
                                  </div>
                                  <FieldRow
                                    k="User ID"
                                    v={item.userDbUserId || "Unknown"}
                                  />
                                  <FieldRow
                                    k="Phone"
                                    v={item.userPhone || "—"}
                                  />
                                  <FieldRow
                                    k="Role"
                                    v={item.userRole || "user"}
                                  />
                                  <FieldRow
                                    k="Affiliate Commission"
                                    v={money(
                                      item?.calc?.affiliateDepositCommission
                                        ?.commissionAmount || 0,
                                    )}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-5 border-t border-green-700/30 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-green-100/70">
                  Showing{" "}
                  <span className="font-extrabold text-white">
                    {(page - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-extrabold text-white">
                    {Math.min(page * limit, pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-extrabold text-white">
                    {pagination.total}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-black/50 border border-green-700/50 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-900/30 transition cursor-pointer"
                  >
                    Previous
                  </button>

                  <div className="px-4 py-2 rounded-lg border border-green-700/40 bg-black/35 text-green-100">
                    Page{" "}
                    <span className="font-extrabold text-white">{page}</span> /{" "}
                    <span className="font-extrabold text-white">
                      {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-black/50 border border-green-700/50 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-900/30 transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AutoDepositHistory;
