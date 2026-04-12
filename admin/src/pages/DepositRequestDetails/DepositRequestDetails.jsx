import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaWallet,
  FaClock,
  FaSyncAlt,
  FaClipboardList,
} from "react-icons/fa";
import { api } from "../../api/axios";


/* helpers */
const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
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
  confirmVariant = "approve",
  note,
  setNote,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const btnClass =
    confirmVariant === "reject"
      ? "from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
      : "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-green-700/40 shadow-2xl">
        <div className="bg-gradient-to-br from-black via-green-950/20 to-black p-5">
          <div className="text-xl font-black text-white">{title}</div>
          <div className="mt-1 text-[13px] text-green-200/80">
            {description}
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-green-200/80">
              Admin Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-green-700/40 bg-black/60 px-4 py-3 text-white placeholder-green-200/30 outline-none focus:ring-2 focus:ring-green-400/30"
              placeholder="Write note..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-green-700/40 px-4 py-2 text-green-100 transition hover:bg-green-900/30"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-xl bg-gradient-to-r px-4 py-2 font-black text-black shadow-lg ${btnClass}`}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 border-b border-green-700/15 py-2">
    <div className="text-[12px] font-black text-green-200/70">{k}</div>
    <div className="break-all text-right text-[13px] font-bold text-white">
      {v}
    </div>
  </div>
);

const DepositRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("approve");
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const canAction = useMemo(() => doc?.status === "pending", [doc?.status]);

  const fetchOne = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/deposit-requests/${id}`);
      setDoc(data?.data || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
  }, [id]);

  const openConfirm = (type) => {
    setConfirmType(type);
    setNote("");
    setConfirmOpen(true);
  };

  const doAction = async () => {
    if (!doc?._id) return;

    try {
      setActionLoading(true);

      if (confirmType === "approve") {
        await api.post(`/api/admin/deposit-requests/${doc._id}/approve`, {
          adminNote: note,
        });
        toast.success("Approved!");
      } else {
        await api.post(`/api/admin/deposit-requests/${doc._id}/reject`, {
          adminNote: note,
        });
        toast.success("Rejected!");
      }

      setConfirmOpen(false);
      await fetchOne();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full text-white">
      {/* Top controls */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-green-700/40 px-4 py-2 text-green-100 transition hover:bg-green-900/30"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchOne}
            className="inline-flex items-center gap-2 rounded-xl border border-green-700/40 px-4 py-2 text-green-100 transition hover:bg-green-900/30"
          >
            <FaSyncAlt />
            Refresh
          </button>

          <button
            onClick={() => openConfirm("approve")}
            disabled={!canAction}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-black text-black shadow-lg ${
              canAction
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
                : "cursor-not-allowed bg-emerald-500/30 text-black/50"
            }`}
          >
            <FaCheckCircle />
            Approve
          </button>

          <button
            onClick={() => openConfirm("reject")}
            disabled={!canAction}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-black text-black shadow-lg ${
              canAction
                ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
                : "cursor-not-allowed bg-red-500/30 text-black/50"
            }`}
          >
            <FaTimesCircle />
            Reject
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-3xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl">
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                <FaClipboardList className="text-2xl" />
              </div>

              <div>
                <div className="text-2xl font-black tracking-tight text-white">
                  Deposit Request Details
                </div>
                <div className="mt-1 text-[13px] text-green-200/80">
                  Request ID:{" "}
                  <span className="font-black text-white">{id}</span>
                </div>
              </div>
            </div>

            <div>
              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-black ${chipClass(
                  doc?.status || "pending",
                )}`}
              >
                {String(doc?.status || "pending").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-5 h-px bg-green-700/25" />

          {loading ? (
            <div className="py-12 text-center text-green-200/70">
              Loading...
            </div>
          ) : !doc ? (
            <div className="py-12 text-center text-green-200/70">
              Not found.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
              {/* Left */}
              <div className="rounded-2xl border border-green-700/30 bg-black/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                    <FaUser />
                  </div>
                  <div>
                    <div className="text-[16px] font-black text-white">
                      {doc?.user?.userId || "—"}
                    </div>
                    <div className="text-[12px] text-green-200/70">
                      {doc?.user?.phone || ""}
                    </div>
                    {doc?.user?.email ? (
                      <div className="text-[12px] text-green-200/55">
                        {doc.user.email}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-green-700/20 bg-black/30 px-4 py-3">
                  <div className="flex items-center gap-2 text-[12px] font-black text-green-200/80">
                    <FaClock />
                    Timeline
                  </div>
                  <div className="mt-2 text-[12px] text-green-200/70">
                    Created:{" "}
                    <span className="font-bold text-white">
                      {new Date(doc.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {doc?.approvedAt && (
                    <div className="mt-1 text-[12px] text-green-200/70">
                      Approved:{" "}
                      <span className="font-bold text-white">
                        {new Date(doc.approvedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {doc?.rejectedAt && (
                    <div className="mt-1 text-[12px] text-green-200/70">
                      Rejected:{" "}
                      <span className="font-bold text-white">
                        {new Date(doc.rejectedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-green-700/20 bg-black/30 px-4 py-3">
                  <div className="text-[12px] font-black text-green-200/80">
                    User Account
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-green-700/15 bg-black/20 px-3 py-2">
                      <div className="text-[11px] text-green-200/60">Role</div>
                      <div className="text-[13px] font-bold text-white">
                        {doc?.user?.role || "—"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-700/15 bg-black/20 px-3 py-2">
                      <div className="text-[11px] text-green-200/60">
                        Balance
                      </div>
                      <div className="text-[13px] font-bold text-white">
                        {money(doc?.user?.balance || 0)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-700/15 bg-black/20 px-3 py-2">
                      <div className="text-[11px] text-green-200/60">
                        Active
                      </div>
                      <div className="text-[13px] font-bold text-white">
                        {doc?.user?.isActive ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[13px] font-black text-green-200/80">
                    Submitted Fields
                  </div>

                  <div className="mt-2 rounded-xl border border-green-700/20 bg-black/30 px-4 py-2">
                    {doc?.fields && Object.keys(doc.fields).length ? (
                      Object.keys(doc.fields).map((k) => (
                        <FieldRow
                          key={k}
                          k={k}
                          v={String(doc.fields[k] ?? "")}
                        />
                      ))
                    ) : (
                      <div className="py-3 text-[12px] text-green-200/70">
                        No fields submitted.
                      </div>
                    )}
                  </div>

                  {doc?.adminNote ? (
                    <div className="mt-4 rounded-xl border border-green-700/20 bg-black/30 px-4 py-3">
                      <div className="text-[12px] font-black text-green-200/80">
                        Admin Note
                      </div>
                      <div className="mt-1 text-[13px] text-white/90">
                        {doc.adminNote}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Right */}
              <div className="rounded-2xl border border-green-700/30 bg-black/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                    <FaWallet />
                  </div>
                  <div>
                    <div className="text-[16px] font-black text-white">
                      Payment Summary
                    </div>
                    <div className="text-[12px] text-green-200/70">
                      Method:{" "}
                      <span className="font-bold text-white">
                        {String(doc.methodId || "").toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[12px] text-green-200/70">
                      Channel:{" "}
                      <span className="font-bold text-white">
                        {doc.channelId || "—"}
                      </span>
                    </div>
                    <div className="text-[12px] text-green-200/70">
                      Promo:{" "}
                      <span className="font-bold text-white">
                        {doc.promoId || "none"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-green-700/20 bg-black/30 px-4 py-3">
                  <FieldRow k="Deposit Amount" v={money(doc.amount)} />
                  <FieldRow
                    k="Promo Bonus"
                    v={money(doc?.calc?.promoBonus || 0)}
                  />
                  <FieldRow
                    k="Channel Bonus"
                    v={money(doc?.calc?.percentBonus || 0)}
                  />
                  <FieldRow
                    k="Total Bonus"
                    v={money(doc?.calc?.totalBonus || 0)}
                  />
                  <FieldRow
                    k="Turnover Multiplier"
                    v={`x${doc?.calc?.turnoverMultiplier ?? 1}`}
                  />
                  <FieldRow
                    k="Target Turnover"
                    v={money(doc?.calc?.targetTurnover || 0)}
                  />

                  <div className="pt-2">
                    <div className="text-[11px] text-green-200/60">
                      On approve: credited amount = deposit + bonus.
                    </div>
                    <div className="mt-2 text-[16px] font-black text-white">
                      Credited Amount: {money(doc?.calc?.creditedAmount || 0)}
                    </div>
                  </div>
                </div>

                {doc?.calc?.affiliateDepositCommission ? (
                  <div className="mt-4 rounded-xl border border-green-700/20 bg-black/30 px-4 py-3">
                    <div className="text-[12px] font-black text-green-200/80">
                      Affiliate Deposit Commission
                    </div>

                    <div className="mt-2 space-y-2">
                      <FieldRow
                        k="Affiliator User ID"
                        v={
                          doc?.calc?.affiliateDepositCommission
                            ?.affiliatorUserId || "—"
                        }
                      />
                      <FieldRow
                        k="Percent"
                        v={`${doc?.calc?.affiliateDepositCommission?.percent || 0}%`}
                      />
                      <FieldRow
                        k="Base Amount"
                        v={money(
                          doc?.calc?.affiliateDepositCommission?.baseAmount ||
                            0,
                        )}
                      />
                      <FieldRow
                        k="Commission Amount"
                        v={money(
                          doc?.calc?.affiliateDepositCommission
                            ?.commissionAmount || 0,
                        )}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 text-[12px] text-green-200/70">
                  {doc.status === "pending"
                    ? "Pending request. You can approve/reject from top buttons."
                    : "This request is already processed."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmType === "approve" ? "Approve Deposit?" : "Reject Deposit?"
        }
        description={
          confirmType === "approve"
            ? "This will add amount + bonus to user balance and create turnover."
            : "This will reject the request. No balance will be added."
        }
        confirmText={confirmType === "approve" ? "Yes, Approve" : "Yes, Reject"}
        confirmVariant={confirmType}
        note={note}
        setNote={setNote}
        loading={actionLoading}
        onClose={() => {
          if (actionLoading) return;
          setConfirmOpen(false);
        }}
        onConfirm={doAction}
      />
    </div>
  );
};

export default DepositRequestDetails;
