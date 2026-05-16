import React, { useEffect, useMemo, useState } from "react";
import {
  FaGift,
  FaSave,
  FaSyncAlt,
  FaUsers,
  FaHistory,
  FaSearch,
  FaCoins,
  FaToggleOn,
  FaToggleOff,
  FaWallet,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (n) => {
  const num = Number(n || 0);

  if (!Number.isFinite(num)) return "৳ 0.00";

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const num = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n : 0;
};

const UserReferRedeem = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [q, setQ] = useState("");

  const [histories, setHistories] = useState([]);

  const [summary, setSummary] = useState({
    totalRedeem: 0,
    totalPointsUsed: 0,
    totalUsers: 0,
    totalRedeemCount: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [form, setForm] = useState({
    referAmountForAllUsers: 0,
    minimumRedeemAmount: 100,
    maximumRedeemAmount: 1000,
    redeemPoint: 1000,
    redeemMoney: 100,
    isActive: true,
  });

  const conversionPreview = useMemo(() => {
    const point = num(form.redeemPoint);
    const taka = num(form.redeemMoney);

    if (point <= 0 || taka <= 0) return "Invalid Conversion";

    return `${point.toLocaleString("en-US")} Point = ${money(taka)}`;
  }, [form.redeemPoint, form.redeemMoney]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/refer-redeem/settings");

      const s = data?.data || {};

      setForm({
        referAmountForAllUsers: s.referAmountForAllUsers ?? 0,
        minimumRedeemAmount: s.minimumRedeemAmount ?? 100,
        maximumRedeemAmount: s.maximumRedeemAmount ?? 1000,
        redeemPoint: s.redeemPoint ?? 1000,
        redeemMoney: s.redeemMoney ?? 100,
        isActive: Boolean(s.isActive),
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistories = async (page = 1, search = q) => {
    try {
      setHistoryLoading(true);

      const { data } = await api.get("/api/admin/refer-redeem/histories", {
        params: {
          page,
          limit: pagination.limit,
          q: search,
        },
      });

      const historyData = Array.isArray(data?.data) ? data.data : [];

      setHistories(historyData);

      setPagination(
        data?.pagination || {
          page,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      );

      const totalRedeem = historyData.reduce(
        (sum, item) => sum + Number(item.redeemAmount || 0),
        0,
      );

      const totalPointsUsed = historyData.reduce(
        (sum, item) => sum + Number(item.pointsUsed || 0),
        0,
      );

      const users = new Set(historyData.map((item) => item.userId));

      setSummary({
        totalRedeem,
        totalPointsUsed,
        totalUsers: users.size,
        totalRedeemCount: historyData.length,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load histories");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchHistories(1, "");
  }, []);

  const validate = () => {
    if (num(form.referAmountForAllUsers) < 0) {
      toast.error("Refer amount cannot be negative");
      return false;
    }

    if (
      num(form.minimumRedeemAmount) < 0 ||
      num(form.maximumRedeemAmount) < 0
    ) {
      toast.error("Minimum and maximum redeem amount cannot be negative");

      return false;
    }

    if (
      num(form.maximumRedeemAmount) > 0 &&
      num(form.maximumRedeemAmount) < num(form.minimumRedeemAmount)
    ) {
      toast.error("Maximum redeem amount must be greater than minimum amount");

      return false;
    }

    if (num(form.redeemPoint) <= 0 || num(form.redeemMoney) <= 0) {
      toast.error("Redeem point and redeem money must be greater than 0");

      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        referAmountForAllUsers: num(form.referAmountForAllUsers),
        minimumRedeemAmount: num(form.minimumRedeemAmount),
        maximumRedeemAmount: num(form.maximumRedeemAmount),
        redeemPoint: num(form.redeemPoint),
        redeemMoney: num(form.redeemMoney),
        isActive: Boolean(form.isActive),
      };

      const { data } = await api.put(
        "/api/admin/refer-redeem/settings",
        payload,
      );

      toast.success(data?.message || "Settings updated successfully");

      fetchSettings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToUsers = async () => {
    const ok = window.confirm(
      "Are you sure? This will update referCommission for all users.",
    );

    if (!ok) return;

    try {
      setApplying(true);

      const { data } = await api.post("/api/admin/refer-redeem/apply-to-users");

      toast.success(data?.message || "Refer amount applied successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to apply refer amount",
      );
    } finally {
      setApplying(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistories(1, q);
  };

  return (
    <div className="min-h-screen rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/20 to-black p-4 text-white shadow-2xl shadow-black/30 md:p-6">
      <div className="mb-6 rounded-3xl border border-green-700/30 bg-black/40 p-5 shadow-xl shadow-green-900/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
              <FaGift className="text-3xl text-black" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-wide text-white">
                Refer & Redeem System
              </h1>

              <p className="mt-1 text-sm font-semibold text-green-200/80">
                Manage referral rewards, redeem settings and user redemption
                history
              </p>
            </div>
          </div>

          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 font-black text-green-100 transition hover:bg-green-500/20 disabled:opacity-50"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<FaWallet />}
          label="Total Redeem"
          value={money(summary.totalRedeem)}
        />

        <SummaryCard
          icon={<FaCoins />}
          label="Total Points Used"
          value={summary.totalPointsUsed.toLocaleString()}
        />

        <SummaryCard
          icon={<FaUsers />}
          label="Redeem Users"
          value={summary.totalUsers}
        />

        <SummaryCard
          icon={<FaChartLine />}
          label="Total Redeems"
          value={summary.totalRedeemCount}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-3xl border border-green-700/30 bg-black/40 p-5 shadow-xl shadow-green-900/20">
            <div className="mb-5 flex items-center gap-3">
              <FaCoins className="text-2xl text-green-300" />

              <h2 className="text-2xl font-black text-white">
                Redeem Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputBox
                label="Refer Reward For All Users"
                value={form.referAmountForAllUsers}
                onChange={(v) => updateField("referAmountForAllUsers", v)}
                hint="Every referral reward amount"
              />

              <InputBox
                label="Minimum Redeem Amount"
                value={form.minimumRedeemAmount}
                onChange={(v) => updateField("minimumRedeemAmount", v)}
                hint="User cannot redeem below this amount"
              />

              <InputBox
                label="Maximum Redeem Amount"
                value={form.maximumRedeemAmount}
                onChange={(v) => updateField("maximumRedeemAmount", v)}
                hint="0 means unlimited"
              />

              <InputBox
                label="Redeem Point"
                value={form.redeemPoint}
                onChange={(v) => updateField("redeemPoint", v)}
                hint="Example: 1000 point"
              />

              <InputBox
                label="Redeem Money"
                value={form.redeemMoney}
                onChange={(v) => updateField("redeemMoney", v)}
                hint="Example: 100 taka"
              />

              <div className="rounded-2xl border border-green-700/30 bg-green-500/5 p-4">
                <p className="mb-2 text-sm font-bold text-green-200/70">
                  System Status
                </p>

                <button
                  type="button"
                  onClick={() => updateField("isActive", !form.isActive)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 font-black transition ${
                    form.isActive
                      ? "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                      : "bg-red-500/20 text-red-100 hover:bg-red-500/30"
                  }`}
                >
                  <span>{form.isActive ? "Active" : "Inactive"}</span>

                  {form.isActive ? (
                    <FaToggleOn className="text-3xl" />
                  ) : (
                    <FaToggleOff className="text-3xl" />
                  )}
                </button>

                <p className="mt-2 text-xs text-green-200/60">
                  If inactive users cannot redeem points
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5">
              <p className="text-sm font-bold text-green-200/70">
                Conversion Preview
              </p>

              <h3 className="mt-1 text-3xl font-black text-white">
                {conversionPreview}
              </h3>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-black text-black shadow-lg shadow-green-600/30 transition hover:from-green-400 hover:to-emerald-400 disabled:opacity-50"
              >
                <FaSave />

                {saving ? "Saving..." : "Save Settings"}
              </button>

              <button
                onClick={handleApplyToUsers}
                disabled={applying}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-3 font-black text-green-100 transition hover:bg-green-500/20 disabled:opacity-50"
              >
                <FaUsers />

                {applying ? "Applying..." : "Apply To All Users"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-green-700/30 bg-black/40 p-5 shadow-xl shadow-green-900/20">
          <div className="mb-5 flex items-center gap-3">
            <FaCheckCircle className="text-2xl text-green-300" />

            <h2 className="text-2xl font-black">Current Summary</h2>
          </div>

          <SummaryInfo
            label="Refer Reward"
            value={money(form.referAmountForAllUsers)}
          />

          <SummaryInfo
            label="Minimum Redeem"
            value={money(form.minimumRedeemAmount)}
          />

          <SummaryInfo
            label="Maximum Redeem"
            value={
              num(form.maximumRedeemAmount) > 0
                ? money(form.maximumRedeemAmount)
                : "Unlimited"
            }
          />

          <SummaryInfo label="Conversion" value={conversionPreview} />

          <SummaryInfo
            label="System Status"
            value={form.isActive ? "Active" : "Inactive"}
            good={form.isActive}
          />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-green-700/30 bg-black/40 p-5 shadow-xl shadow-green-900/20">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <FaHistory className="text-2xl text-green-300" />

            <div>
              <h2 className="text-2xl font-black">Redeem Histories</h2>

              <p className="text-sm text-green-200/70">
                User redemption logs and points usage
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex w-full gap-2 lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300/50" />

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search userId..."
                className="w-full rounded-2xl border border-green-700/30 bg-black/50 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-green-200/40 focus:border-green-400"
              />
            </div>

            <button
              type="submit"
              className="cursor-pointer rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 font-black text-black shadow-lg shadow-green-600/30 transition hover:from-green-400 hover:to-emerald-400"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-green-700/30">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead>
              <tr className="bg-green-500/10 text-left text-sm text-green-100">
                <Th>User</Th>
                <Th>Points Used</Th>
                <Th>Redeem Amount</Th>
                <Th>Balance</Th>
                <Th>Points</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>

            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center font-black">
                    Loading histories...
                  </td>
                </tr>
              ) : histories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center font-black">
                    No redeem history found
                  </td>
                </tr>
              ) : (
                histories.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-green-700/20 transition hover:bg-green-500/5"
                  >
                    <Td>
                      <div>
                        <p className="font-black">{item.userId}</p>

                        <p className="text-xs text-green-200/60">
                          {item?.user?.phone || "N/A"}
                        </p>
                      </div>
                    </Td>

                    <Td>{Number(item.pointsUsed || 0).toLocaleString()}</Td>

                    <Td>{money(item.redeemAmount)}</Td>

                    <Td>
                      <div className="space-y-1 text-sm">
                        <p>Before: {money(item.balanceBefore)}</p>

                        <p>After: {money(item.balanceAfter)}</p>
                      </div>
                    </Td>

                    <Td>
                      <div className="space-y-1 text-sm">
                        <p>
                          Before:{" "}
                          {Number(item.pointsBefore || 0).toLocaleString()}
                        </p>

                        <p>
                          After:{" "}
                          {Number(item.pointsAfter || 0).toLocaleString()}
                        </p>
                      </div>
                    </Td>

                    <Td>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-100">
                        {item.status}
                      </span>
                    </Td>

                    <Td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "-"}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-sm font-bold text-green-200/70">
            Total Histories: {pagination.total || 0}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchHistories(pagination.page - 1, q)}
              className="cursor-pointer rounded-xl border border-green-700/30 bg-green-500/10 px-4 py-2 font-bold transition hover:bg-green-500/20 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="rounded-xl bg-green-500/10 px-4 py-2 font-black">
              {pagination.page} / {pagination.totalPages || 1}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchHistories(pagination.page + 1, q)}
              className="cursor-pointer rounded-xl border border-green-700/30 bg-green-500/10 px-4 py-2 font-bold transition hover:bg-green-500/20 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputBox = ({ label, value, onChange, hint }) => {
  return (
    <label className="block rounded-2xl border border-green-700/30 bg-green-500/5 p-4">
      <span className="mb-2 block text-sm font-bold text-green-200/80">
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-green-700/30 bg-black/50 px-4 py-3 font-black text-white outline-none transition placeholder:text-green-200/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
      />

      {hint && (
        <p className="mt-2 text-xs font-medium text-green-200/55">{hint}</p>
      )}
    </label>
  );
};

const SummaryCard = ({ icon, label, value }) => {
  return (
    <div className="rounded-3xl border border-green-700/30 bg-black/40 p-5 shadow-lg shadow-green-900/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-green-200/70">{label}</p>

          <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-2xl text-black shadow-lg shadow-green-500/30">
          {icon}
        </div>
      </div>
    </div>
  );
};

const SummaryInfo = ({ label, value, good }) => {
  return (
    <div className="mb-3 rounded-2xl border border-green-700/30 bg-green-500/5 p-4">
      <p className="text-sm font-bold text-green-200/70">{label}</p>

      <p
        className={`mt-1 text-xl font-black ${
          good === true
            ? "text-emerald-300"
            : good === false
              ? "text-red-300"
              : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const Th = ({ children }) => {
  return <th className="px-4 py-4 font-black">{children}</th>;
};

const Td = ({ children }) => {
  return (
    <td className="px-4 py-4 text-sm font-semibold text-green-50">
      {children}
    </td>
  );
};

export default UserReferRedeem;
