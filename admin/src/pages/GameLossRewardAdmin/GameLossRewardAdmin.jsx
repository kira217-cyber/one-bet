import React, { useEffect, useMemo, useState } from "react";
import {
  FaGift,
  FaSave,
  FaSyncAlt,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaHistory,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const emptyForm = {
  title: {
    bn: "",
    en: "",
  },
  periodDays: 7,
  minimumLoss: 100,
  bonusPercent: 20,
  isActive: true,
  order: 0,
};

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const GameLossRewardAdmin = () => {
  const [activeTab, setActiveTab] = useState("settings");

  const [settings, setSettings] = useState([]);
  const [claims, setClaims] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    status: "",
    settingId: "",
    from: "",
    to: "",
    page: 1,
    limit: 15,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const totalActiveSettings = useMemo(
    () => settings.filter((item) => item.isActive).length,
    [settings],
  );

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const { data } = await api.get("/api/game-loss-rewards/admin/settings");
      setSettings(data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load reward settings",
      );
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadClaims = async () => {
    try {
      setLoadingClaims(true);

      const params = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.q) params.q = filters.q;
      if (filters.status) params.status = filters.status;
      if (filters.settingId) params.settingId = filters.settingId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const { data } = await api.get("/api/game-loss-rewards/admin/claims", {
        params,
      });

      setClaims(data?.data || []);
      setPagination(
        data?.pagination || {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load claims");
    } finally {
      setLoadingClaims(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "claims") {
      loadClaims();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters.page, filters.limit]);

  const handleChange = (field, value) => {
    if (field === "title.bn" || field === "title.en") {
      const key = field.split(".")[1];
      setForm((prev) => ({
        ...prev,
        title: {
          ...prev.title,
          [key]: value,
        },
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.en && !form.title.bn) {
      toast.error("Reward title is required");
      return;
    }

    if (Number(form.periodDays) < 1) {
      toast.error("Period days must be minimum 1");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        periodDays: Number(form.periodDays || 1),
        minimumLoss: Number(form.minimumLoss || 0),
        bonusPercent: Number(form.bonusPercent || 0),
        isActive: Boolean(form.isActive),
        order: Number(form.order || 0),
      };

      if (editingId) {
        await api.put(
          `/api/game-loss-rewards/admin/settings/${editingId}`,
          payload,
        );
        toast.success("Reward setting updated");
      } else {
        await api.post("/api/game-loss-rewards/admin/settings", payload);
        toast.success("Reward setting created");
      }

      resetForm();
      loadSettings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (setting) => {
    setEditingId(setting._id);
    setForm({
      title: {
        bn: setting?.title?.bn || "",
        en: setting?.title?.en || "",
      },
      periodDays: setting?.periodDays || 7,
      minimumLoss: setting?.minimumLoss || 0,
      bonusPercent: setting?.bonusPercent || 0,
      isActive: Boolean(setting?.isActive),
      order: setting?.order || 0,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (setting) => {
    try {
      await api.put(`/api/game-loss-rewards/admin/settings/${setting._id}`, {
        isActive: !setting.isActive,
      });
      toast.success(setting.isActive ? "Setting disabled" : "Setting enabled");
      loadSettings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this setting?");
    if (!ok) return;

    try {
      await api.delete(`/api/game-loss-rewards/admin/settings/${id}`);
      toast.success("Reward setting deleted");
      loadSettings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete setting");
    }
  };

  const handleSearchClaims = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
    setTimeout(loadClaims, 0);
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      status: "",
      settingId: "",
      from: "",
      to: "",
      page: 1,
      limit: 15,
    });
    setTimeout(loadClaims, 0);
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/20 to-black text-white">
      <div className="space-y-6">
        <div className="rounded-2xl border border-green-700/40 bg-gradient-to-r from-black/90 via-green-950/50 to-black/90 p-5 shadow-2xl shadow-green-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/40">
                  <FaGift className="text-2xl text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    Game Loss Reward
                  </h1>
                  <p className="text-sm text-green-200/80">
                    Manage game loss cashback bonus and claim history
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                loadSettings();
                if (activeTab === "claims") loadClaims();
              }}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-100 transition hover:bg-green-500/20"
            >
              <FaSyncAlt />
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-green-700/40 bg-black/50 p-4">
              <p className="text-sm text-green-200/70">Total Settings</p>
              <h2 className="mt-1 text-2xl font-black text-white">
                {settings.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-green-700/40 bg-black/50 p-4">
              <p className="text-sm text-green-200/70">Active Settings</p>
              <h2 className="mt-1 text-2xl font-black text-emerald-300">
                {totalActiveSettings}
              </h2>
            </div>

            <div className="rounded-2xl border border-green-700/40 bg-black/50 p-4">
              <p className="text-sm text-green-200/70">Claim Records</p>
              <h2 className="mt-1 text-2xl font-black text-lime-300">
                {pagination.total || 0}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("settings")}
            className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-bold transition ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/30"
                : "border border-green-700/40 bg-black/50 text-green-100 hover:bg-green-900/40"
            }`}
          >
            Reward Settings
          </button>

          <button
            onClick={() => setActiveTab("claims")}
            className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-bold transition ${
              activeTab === "claims"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg shadow-green-500/30"
                : "border border-green-700/40 bg-black/50 text-green-100 hover:bg-green-900/40"
            }`}
          >
            Claim History
          </button>
        </div>

        {activeTab === "settings" && (
          <>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-green-700/40 bg-black/60 p-5 shadow-xl shadow-green-950/20"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">
                    {editingId ? "Update Reward Setting" : "Add Reward Setting"}
                  </h2>
                  <p className="text-sm text-green-200/70">
                    Example: 7 days loss cashback 20%
                  </p>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/20"
                  >
                    <FaTimes />
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Title English"
                  value={form.title.en}
                  onChange={(e) => handleChange("title.en", e.target.value)}
                  placeholder="7 Days Loss Cashback"
                />

                <Input
                  label="Title Bangla"
                  value={form.title.bn}
                  onChange={(e) => handleChange("title.bn", e.target.value)}
                  placeholder="৭ দিনের লস ক্যাশব্যাক"
                />

                <Input
                  label="Period Days"
                  type="number"
                  value={form.periodDays}
                  onChange={(e) => handleChange("periodDays", e.target.value)}
                  placeholder="7"
                />

                <Input
                  label="Minimum Loss"
                  type="number"
                  value={form.minimumLoss}
                  onChange={(e) => handleChange("minimumLoss", e.target.value)}
                  placeholder="100"
                />

                <Input
                  label="Bonus Percent"
                  type="number"
                  value={form.bonusPercent}
                  onChange={(e) => handleChange("bonusPercent", e.target.value)}
                  placeholder="20"
                />

                <Input
                  label="Order"
                  type="number"
                  value={form.order}
                  onChange={(e) => handleChange("order", e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  onClick={() => handleChange("isActive", !form.isActive)}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    form.isActive
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                      : "border-red-400/40 bg-red-500/10 text-red-200"
                  }`}
                >
                  {form.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  {form.isActive ? "Active" : "Inactive"}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-black text-black shadow-lg shadow-green-500/30 transition hover:from-green-400 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
                  {editingId ? "Update Setting" : "Save Setting"}
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-green-700/40 bg-black/60 p-5 shadow-xl shadow-green-950/20">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black text-white">
                  Reward Settings List
                </h2>
                {loadingSettings && (
                  <FaSyncAlt className="animate-spin text-green-300" />
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-sm text-green-200/80">
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Period</th>
                      <th className="px-4 py-2">Minimum Loss</th>
                      <th className="px-4 py-2">Bonus</th>
                      <th className="px-4 py-2">Order</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {settings.map((setting) => (
                      <tr
                        key={setting._id}
                        className="rounded-xl bg-green-950/20 text-sm text-white"
                      >
                        <td className="rounded-l-xl px-4 py-4">
                          <p className="font-bold">
                            {setting?.title?.en || "-"}
                          </p>
                          <p className="text-xs text-green-200/70">
                            {setting?.title?.bn || "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          {setting.periodDays} Days
                        </td>

                        <td className="px-4 py-4">
                          {money(setting.minimumLoss)}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
                            {setting.bonusPercent}%
                          </span>
                        </td>

                        <td className="px-4 py-4">{setting.order}</td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              setting.isActive
                                ? "bg-emerald-500/15 text-emerald-200"
                                : "bg-red-500/15 text-red-200"
                            }`}
                          >
                            {setting.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="rounded-r-xl px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggle(setting)}
                              className="cursor-pointer rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-green-200 hover:bg-green-500/20"
                              title="Toggle Status"
                            >
                              {setting.isActive ? (
                                <FaToggleOn />
                              ) : (
                                <FaToggleOff />
                              )}
                            </button>

                            <button
                              onClick={() => handleEdit(setting)}
                              className="cursor-pointer rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-200 hover:bg-yellow-500/20"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() => handleDelete(setting._id)}
                              className="cursor-pointer rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-200 hover:bg-red-500/20"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loadingSettings && settings.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="rounded-xl bg-green-950/20 px-4 py-10 text-center text-green-200/70"
                        >
                          No reward setting found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "claims" && (
          <div className="rounded-2xl border border-green-700/40 bg-black/60 p-5 shadow-xl shadow-green-950/20">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-black text-white">
                  <FaHistory className="text-green-300" />
                  Claim History
                </h2>
                <p className="text-sm text-green-200/70">
                  All users game loss reward claim records
                </p>
              </div>

              <button
                onClick={loadClaims}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-100 transition hover:bg-green-500/20"
              >
                <FaSyncAlt className={loadingClaims ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            <form
              onSubmit={handleSearchClaims}
              className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6"
            >
              <div className="xl:col-span-2">
                <label className="mb-2 block text-sm font-bold text-green-100">
                  Search User ID
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400" />
                  <input
                    value={filters.q}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        q: e.target.value,
                      }))
                    }
                    placeholder="Search by userId"
                    className="w-full rounded-xl border border-green-700/50 bg-black/70 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-green-300/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
                  />
                </div>
              </div>

              <Select
                label="Setting"
                value={filters.settingId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    settingId: e.target.value,
                  }))
                }
              >
                <option value="">All Settings</option>
                {settings.map((setting) => (
                  <option key={setting._id} value={setting._id}>
                    {setting?.title?.en || setting?.title?.bn || "Untitled"}
                  </option>
                ))}
              </Select>

              <Select
                label="Status"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="">All Status</option>
                <option value="claimed">Claimed</option>
                <option value="cancelled">Cancelled</option>
              </Select>

              <Input
                label="From"
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
              />

              <Input
                label="To"
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    to: e.target.value,
                  }))
                }
              />

              <div className="flex items-end gap-2 xl:col-span-6">
                <button
                  type="submit"
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 font-black text-black shadow-lg shadow-green-500/30"
                >
                  <FaFilter />
                  Filter
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-3 font-bold text-red-200 hover:bg-red-500/20"
                >
                  <FaTimes />
                  Clear
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-green-200/80">
                    <th className="px-4 py-2">User</th>
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
                        <p className="font-bold">{claim.userId}</p>
                        <p className="text-xs text-green-200/70">
                          {claim?.user?.phone || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {claim?.settingTitle?.en ||
                            claim?.setting?.title?.en ||
                            "-"}
                        </p>
                        <p className="text-xs text-green-200/70">
                          {claim.periodDays} days
                        </p>
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
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-200">
                          {money(claim.netLoss)}
                        </span>
                      </td>

                      <td className="px-4 py-4">{claim.bonusPercent}%</td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-bold text-emerald-200">
                          {money(claim.claimAmount)}
                        </span>
                      </td>

                      <td className="rounded-r-xl px-4 py-4">
                        {formatDate(claim.claimedAt)}
                      </td>
                    </tr>
                  ))}

                  {!loadingClaims && claims.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="rounded-xl bg-green-950/20 px-4 py-10 text-center text-green-200/70"
                      >
                        No claim history found
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
        )}
      </div>
    </div>
  );
};

const Input = ({ label, className = "", ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-bold text-green-100">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 text-white outline-none transition placeholder:text-green-300/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
      />
    </div>
  );
};

const Select = ({ label, children, ...props }) => {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-bold text-green-100">
          {label}
        </label>
      )}
      <select
        {...props}
        className="w-full cursor-pointer rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 text-white outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/30"
      >
        {children}
      </select>
    </div>
  );
};

export default GameLossRewardAdmin;