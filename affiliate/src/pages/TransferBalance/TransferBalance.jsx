import React, { useEffect, useMemo, useState } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaExchangeAlt,
  FaEye,
  FaEyeSlash,
  FaRedoAlt,
  FaTimes,
  FaTimesCircle,
  FaUserCheck,
  FaUserPlus,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { api } from "../../api/axios";
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

const card =
  "bg-gradient-to-b from-black via-green-950/25 to-black border border-green-800/50 rounded-2xl shadow-2xl shadow-green-900/30";

const labelCls = "text-[13px] font-semibold text-green-100";

const inputCls =
  "mt-2 w-full h-[44px] rounded-xl border border-green-700/50 bg-black/70 px-4 text-[14px] text-white outline-none placeholder-green-300/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all";

const money = (value) => {
  const num = Number(value || 0);

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const TransferBalance = () => {
  const auth = useSelector(selectAuth);
  const token = auth?.token;

  const isAuthed = useSelector(selectIsAuthenticated);
  const me = useSelector(selectUser);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const accountOk = !!token && !!me?._id && !!isAuthed;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [ownUser, setOwnUser] = useState(null);

  const [elig, setElig] = useState({
    eligible: false,
    remaining: 0,
    message: "",
    required: 5,
    activeReferralCount: 0,
    depositedReferralCount: 0,
    remainingReferralCount: 5,
  });

  const [amount, setAmount] = useState("");
  const amountNum = Number(amount || 0);
  const [transferring, setTransferring] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 15,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchOwnUser = async () => {
    const { data } = await api.get("/api/aff-own-user-transfer/my-own-user", {
      headers,
    });

    const payload = data?.data || {};
    setOwnUser(payload?.ownUser || null);
  };

  const fetchEligibility = async () => {
    const { data } = await api.get("/api/aff-own-user-transfer/eligibility", {
      headers,
    });

    const payload = data?.data || data || {};

    setElig({
      eligible: !!payload.eligible,
      remaining: Number(payload.remaining || 0),
      message: payload.message || "",
      required: Number(payload.required || 5),
      activeReferralCount: Number(payload.activeReferralCount || 0),
      depositedReferralCount: Number(payload.depositedReferralCount || 0),
      remainingReferralCount: Number(payload.remainingReferralCount || 0),
      ownUser: payload.ownUser || null,
    });

    if (payload?.ownUser) {
      setOwnUser(payload.ownUser);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const { data } = await api.get("/api/aff-own-user-transfer/history", {
        headers,
        params: {
          page,
          limit: 15,
        },
      });

      setHistory(data?.data || []);
      setPagination(
        data?.pagination || {
          total: 0,
          totalPages: 1,
          currentPage: page,
          limit: 15,
        },
      );
    } catch (error) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAll = async (isRefresh = false) => {
    if (!accountOk) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      await Promise.all([fetchOwnUser(), fetchEligibility()]);
      await fetchHistory();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load transfer data",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (accountOk) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = useMemo(() => {
    return Math.max(Number(pagination?.totalPages || 1), 1);
  }, [pagination]);

  const amountError = useMemo(() => {
    if (!amount) return "";
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return "Enter a valid amount.";
    }
    if (amountNum > Number(elig.remaining || 0)) {
      return `You cannot transfer more than ${money(elig.remaining)}.`;
    }
    return "";
  }, [amount, amountNum, elig.remaining]);

  const canTransfer =
    accountOk &&
    ownUser &&
    elig.eligible &&
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    amountNum <= Number(elig.remaining || 0) &&
    !transferring;

  const handleTransfer = async () => {
    if (!canTransfer) return;

    try {
      setTransferring(true);

      await api.post(
        "/api/aff-own-user-transfer/transfer",
        {
          amount: amountNum,
        },
        {
          headers,
        },
      );

      toast.success("Balance transferred successfully!");
      setAmount("");
      await loadAll(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Transfer failed");
      await loadAll(true);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="w-full text-white">
      <div className={`${card} p-5 sm:p-7`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="text-[22px] font-extrabold text-white tracking-tight flex items-center gap-3">
              <FaExchangeAlt className="text-green-300" />
              Transfer Balance
            </div>

            <div className="mt-1 text-[12px] text-green-200/70">
              Transfer affiliate balance to your own gameplay user
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadAll(true)}
            disabled={refreshing || loading}
            className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 h-10 px-4 rounded-xl border border-green-700/60 bg-green-900/20 hover:bg-green-900/35 text-green-100 text-[13px] font-semibold transition flex items-center gap-2 w-fit"
          >
            <FaRedoAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {!accountOk && (
          <NoticeBox
            type="warning"
            title="Login Required"
            message="Please login to transfer balance."
          />
        )}

        {accountOk && loading && (
          <div className="mt-6 rounded-2xl border border-green-800/50 bg-black/40 p-5 text-green-200/70">
            Loading transfer information...
          </div>
        )}

        {accountOk && !loading && (
          <>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <MiniCard
                label="Transferable Balance"
                value={money(elig.remaining || 0)}
                icon={<FaWallet />}
                valueClass="text-green-300"
                iconClass="bg-green-500/15 text-green-300"
              />

              <MiniCard
                label="Required"
                value={elig.required || 5}
                icon={<FaUsers />}
                valueClass="text-blue-300"
                iconClass="bg-blue-500/15 text-blue-300"
              />

              <MiniCard
                label="Active Referrals"
                value={elig.activeReferralCount || 0}
                icon={<FaUserCheck />}
                valueClass="text-emerald-300"
                iconClass="bg-emerald-500/15 text-emerald-300"
              />

              <MiniCard
                label="Deposited Referrals"
                value={elig.depositedReferralCount || 0}
                icon={<FaCheckCircle />}
                valueClass="text-yellow-300"
                iconClass="bg-yellow-500/15 text-yellow-300"
              />
            </div>

            <div className="mt-5">
              {elig.eligible ? (
                <NoticeBox
                  type="success"
                  title="Transfer Allowed"
                  message="Your referral requirement is complete. You can transfer balance to your own gameplay user."
                />
              ) : (
                <NoticeBox
                  type="danger"
                  title="Transfer Not Allowed"
                  message={elig.message || "You are not eligible right now."}
                />
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
              <div className="rounded-2xl border border-green-800/45 bg-black/40 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-extrabold text-white">
                      My Own Gameplay User
                    </div>
                    <div className="mt-1 text-[12px] text-green-200/65">
                      Balance will be added to this user
                    </div>
                  </div>

                  {!ownUser && (
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="cursor-pointer h-10 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white text-[13px] font-bold flex items-center gap-2"
                    >
                      <FaUserPlus />
                      Create
                    </button>
                  )}
                </div>

                {ownUser ? (
                  <div className="mt-5 space-y-3">
                    <InfoRow label="User ID" value={ownUser?.userId || "—"} />
                    <InfoRow label="Phone" value={ownUser?.phone || "—"} />
                    <InfoRow label="Email" value={ownUser?.email || "—"} />
                    <InfoRow
                      label="Balance"
                      value={money(ownUser?.balance || 0)}
                      valueClass="text-green-300"
                    />
                    <InfoRow
                      label="Status"
                      value={ownUser?.isActive ? "Active" : "Inactive"}
                      valueClass={
                        ownUser?.isActive ? "text-emerald-300" : "text-red-300"
                      }
                    />
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-yellow-200 text-[13px]">
                    You have not created your own gameplay user yet.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-green-800/45 bg-black/40 p-5">
                <div className="text-[15px] font-extrabold text-white">
                  Transfer Amount
                </div>

                <div className="mt-1 text-[12px] text-green-200/65">
                  Enter amount from your affiliate balance
                </div>

                <div className="mt-5 max-w-[520px]">
                  <label className={labelCls}>
                    Amount <span className="text-red-400">*</span>
                  </label>

                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Max ${money(elig.remaining || 0)}`}
                    className={inputCls}
                    inputMode="numeric"
                  />

                  {!!amountError && (
                    <div className="mt-2 text-[12px] text-red-300">
                      {amountError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleTransfer}
                    disabled={!canTransfer}
                    className={`
                      mt-5 w-full h-[50px] rounded-2xl font-extrabold text-[14px] transition flex items-center justify-center gap-2
                      ${
                        canTransfer
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-700/40 border border-green-500/40 cursor-pointer"
                          : "bg-gray-800/60 text-white/30 border border-green-900/40 cursor-not-allowed"
                      }
                    `}
                  >
                    <FaExchangeAlt />
                    {transferring ? "Transferring..." : "TRANSFER BALANCE"}
                  </button>

                  {!canTransfer && (
                    <div className="mt-2 text-[12px] text-green-200/60">
                      {!ownUser
                        ? "Please create your own gameplay user first."
                        : !elig.eligible
                          ? elig.message || "Not eligible right now."
                          : !amount
                            ? "Enter transfer amount."
                            : amountError || "Transfer unavailable."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <TransferHistory
        history={history}
        loading={historyLoading}
        pagination={pagination}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

      {showCreateModal && (
        <CreateOwnUserModal
          headers={headers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false);
            await loadAll(true);
          }}
        />
      )}
    </div>
  );
};

const TransferHistory = ({
  history,
  loading,
  pagination,
  page,
  totalPages,
  setPage,
}) => {
  return (
    <div className={`${card} mt-6 overflow-hidden`}>
      <div className="p-5 border-b border-green-800/40">
        <div className="text-[18px] font-extrabold text-white">
          Transfer History
        </div>
        <div className="mt-1 text-[12px] text-green-200/70">
          Your latest balance transfers
        </div>
      </div>

      <div className="hidden xl:block overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-green-900/20 border-b border-green-700/30">
            <tr className="text-left">
              <th className="px-4 py-4 text-sm font-semibold text-green-200">
                Own User
              </th>
              <th className="px-4 py-4 text-sm font-semibold text-green-200">
                Amount
              </th>
              <th className="px-4 py-4 text-sm font-semibold text-green-200">
                Aff Before
              </th>
              <th className="px-4 py-4 text-sm font-semibold text-green-200">
                Aff After
              </th>
              <th className="px-4 py-4 text-sm font-semibold text-green-200">
                User Before
              </th>
              <th className="px-4 py-4 text-sm font-semibold text-green-200">
                User After
              </th>
              <th className="px-4 py-4 text-sm font-semibold text-green-200">
                Status
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
                    {item?.ownUser?.userId || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-green-300">
                    {money(item?.amount)}
                  </td>
                  <td className="px-4 py-4 text-sm text-yellow-300">
                    {money(item?.affBalanceBefore)}
                  </td>
                  <td className="px-4 py-4 text-sm text-red-300">
                    {money(item?.affBalanceAfter)}
                  </td>
                  <td className="px-4 py-4 text-sm text-blue-300">
                    {money(item?.ownUserBalanceBefore)}
                  </td>
                  <td className="px-4 py-4 text-sm text-emerald-300">
                    {money(item?.ownUserBalanceAfter)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {item?.status || "completed"}
                    </span>
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white">
                    {item?.ownUser?.userId || "—"}
                  </div>
                  <div className="mt-1 text-[12px] text-green-200/60">
                    {item?.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "—"}
                  </div>
                </div>

                <div className="text-green-300 font-extrabold">
                  {money(item?.amount)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoBox
                  label="Aff Before"
                  value={money(item?.affBalanceBefore)}
                />
                <InfoBox
                  label="Aff After"
                  value={money(item?.affBalanceAfter)}
                />
                <InfoBox
                  label="User Before"
                  value={money(item?.ownUserBalanceBefore)}
                />
                <InfoBox
                  label="User After"
                  value={money(item?.ownUserBalanceAfter)}
                />
              </div>
            </div>
          ))}
      </div>

      {!loading && history?.length === 0 && (
        <div className="p-10 text-center text-green-200/70 font-semibold">
          No Transfer History Yet!
        </div>
      )}

      {loading && (
        <div className="p-10 text-center text-green-300">
          Loading transfer history...
        </div>
      )}

      {!loading && history?.length > 0 && (
        <div className="border-t border-green-700/30 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-green-200/70">
              Showing page {pagination?.currentPage} of {pagination?.totalPages}
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
  );
};

const CreateOwnUserModal = ({ headers, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    userId: "",
    phone: "",
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    form.userId.trim().length >= 4 &&
    form.phone.trim().length > 0 &&
    form.password.trim().length >= 6 &&
    !submitting;

  const setVal = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      await api.post(
        "/api/aff-own-user-transfer/create-own-user",
        {
          userId: form.userId.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
        },
        { headers },
      );

      toast.success("Own gameplay user created!");
      onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] rounded-3xl border border-green-700/50 bg-gradient-to-b from-black via-green-950/30 to-black shadow-2xl shadow-green-900/40 overflow-hidden">
        <div className="p-5 border-b border-green-800/40 flex items-center justify-between">
          <div>
            <div className="text-[18px] font-extrabold text-white">
              Create Own Gameplay User
            </div>
            <div className="mt-1 text-[12px] text-green-200/70">
              You can create only one own user
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer h-10 w-10 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>
              User ID <span className="text-red-400">*</span>
            </label>
            <input
              value={form.userId}
              onChange={(e) => setVal("userId", e.target.value.toLowerCase())}
              placeholder="Enter user id"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              value={form.phone}
              onChange={(e) => setVal("phone", e.target.value)}
              placeholder="Enter phone number"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input
              value={form.email}
              onChange={(e) => setVal("email", e.target.value)}
              placeholder="Enter email optional"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Password <span className="text-red-400">*</span>
            </label>

            <div className="relative">
              <input
                value={form.password}
                onChange={(e) => setVal("password", e.target.value)}
                placeholder="Minimum 8 characters"
                type={showPass ? "text" : "password"}
                className={`${inputCls} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                className="cursor-pointer absolute right-4 top-[20px] text-green-300 hover:text-white"
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-400/25 bg-yellow-500/10 p-4 text-[12px] text-yellow-200/90">
            এই user আপনার gameplay site এ login করার জন্য ব্যবহার হবে। Balance
            transfer করলে এই user এর main balance এ add হবে।
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              w-full h-[50px] rounded-2xl font-extrabold text-[14px] transition flex items-center justify-center gap-2
              ${
                canSubmit
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-700/40 border border-green-500/40 cursor-pointer"
                  : "bg-gray-800/60 text-white/30 border border-green-900/40 cursor-not-allowed"
              }
            `}
          >
            <FaUserPlus />
            {submitting ? "Creating..." : "CREATE OWN USER"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MiniCard = ({ label, value, icon, valueClass, iconClass }) => {
  return (
    <div className="rounded-2xl border border-green-800/45 bg-black/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-green-200/70">
            {label}
          </div>

          <div className={`mt-1 text-[20px] font-extrabold ${valueClass}`}>
            {value}
          </div>
        </div>

        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const NoticeBox = ({ type = "success", title, message }) => {
  const styles = {
    success: "border-green-500/30 bg-green-500/10 text-green-200",
    warning: "border-yellow-400/30 bg-yellow-500/10 text-yellow-200",
    danger: "border-red-500/30 bg-red-500/10 text-red-200",
  };

  return (
    <div className={`mt-5 rounded-2xl border p-4 ${styles[type]}`}>
      <div className="text-[14px] font-extrabold">{title}</div>
      <div className="mt-1 text-[13px] opacity-90">{message}</div>
    </div>
  );
};

const InfoRow = ({ label, value, valueClass = "text-white" }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-green-900/40 bg-black/35 px-4 py-3">
      <span className="text-[12px] text-green-200/70">{label}</span>
      <span
        className={`text-[13px] font-bold break-all text-right ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
};

const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-green-900/40 bg-black/35 p-3">
      <div className="text-[11px] text-green-200/60">{label}</div>
      <div className="mt-1 text-[13px] font-bold text-white">{value}</div>
    </div>
  );
};

export default TransferBalance;
