import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaEdit,
  FaTimes,
  FaTable,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const buttonPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-black/40 hover:bg-green-900/20 border border-green-700/40 text-green-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonDanger =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const createTextPair = (obj = {}) => ({
  bn: obj?.bn || "",
  en: obj?.en || "",
});

const emptyPlayer = {
  _id: "",
  name: { bn: "", en: "" },
  winLoss: "",
  deduction: "",
  bonus: "",
  paymentFee: "",
  commission: "-",
  negative: false,
  order: 1,
  isActive: true,
};

const CommissionStructureController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [form, setForm] = useState({
    title: { bn: "", en: "" },
    headers: {
      recruit: { bn: "", en: "" },
      winLoss: { bn: "", en: "" },
      deduction: { bn: "", en: "" },
      bonus: { bn: "", en: "" },
      paymentFee: { bn: "", en: "" },
      commission: { bn: "", en: "" },
    },
    totals: {
      label: { bn: "", en: "" },
      winLoss: "",
      deduction: "",
      bonus: "",
      paymentFee: "",
      commission: "",
    },
    players: [],
    isActive: true,
  });

  const [playerForm, setPlayerForm] = useState(emptyPlayer);

  const sortedPlayers = useMemo(() => {
    return [...(form.players || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [form.players]);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get(
        "/api/aff-commission-structure-content/admin",
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load content");
      }

      const doc = data?.data || {};

      setForm({
        title: createTextPair(doc.title),
        headers: {
          recruit: createTextPair(doc.headers?.recruit),
          winLoss: createTextPair(doc.headers?.winLoss),
          deduction: createTextPair(doc.headers?.deduction),
          bonus: createTextPair(doc.headers?.bonus),
          paymentFee: createTextPair(doc.headers?.paymentFee),
          commission: createTextPair(doc.headers?.commission),
        },
        totals: {
          label: createTextPair(doc.totals?.label),
          winLoss: doc.totals?.winLoss || "",
          deduction: doc.totals?.deduction || "",
          bonus: doc.totals?.bonus || "",
          paymentFee: doc.totals?.paymentFee || "",
          commission: doc.totals?.commission || "",
        },
        players: Array.isArray(doc.players) ? doc.players : [],
        isActive: doc.isActive !== false,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load commission structure",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const setTextPair = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const setHeaderPair = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      headers: {
        ...prev.headers,
        [field]: {
          ...prev.headers[field],
          [lang]: value,
        },
      },
    }));
  };

  const setTotalPair = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      totals: {
        ...prev.totals,
        label: {
          ...prev.totals.label,
          [lang]: value,
        },
      },
    }));
  };

  const setPlayerName = (lang, value) => {
    setPlayerForm((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        [lang]: value,
      },
    }));
  };

  const resetPlayerForm = () => {
    setPlayerForm({
      ...emptyPlayer,
      order: Number(form.players?.length || 0) + 1,
    });
  };

  const editPlayer = (player) => {
    setPlayerForm({
      _id: player._id || "",
      name: createTextPair(player.name),
      winLoss: player.winLoss || "",
      deduction: player.deduction || "",
      bonus: player.bonus || "",
      paymentFee: player.paymentFee || "",
      commission: player.commission || "-",
      negative: player.negative === true,
      order: Number(player.order || 0),
      isActive: player.isActive !== false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSection = async () => {
    try {
      setSavingSection(true);

      const payload = {
        titleBn: form.title.bn,
        titleEn: form.title.en,

        recruitHeaderBn: form.headers.recruit.bn,
        recruitHeaderEn: form.headers.recruit.en,
        winLossHeaderBn: form.headers.winLoss.bn,
        winLossHeaderEn: form.headers.winLoss.en,
        deductionHeaderBn: form.headers.deduction.bn,
        deductionHeaderEn: form.headers.deduction.en,
        bonusHeaderBn: form.headers.bonus.bn,
        bonusHeaderEn: form.headers.bonus.en,
        paymentFeeHeaderBn: form.headers.paymentFee.bn,
        paymentFeeHeaderEn: form.headers.paymentFee.en,
        commissionHeaderBn: form.headers.commission.bn,
        commissionHeaderEn: form.headers.commission.en,

        totalLabelBn: form.totals.label.bn,
        totalLabelEn: form.totals.label.en,
        totalWinLoss: form.totals.winLoss,
        totalDeduction: form.totals.deduction,
        totalBonus: form.totals.bonus,
        totalPaymentFee: form.totals.paymentFee,
        totalCommission: form.totals.commission,

        isActive: String(form.isActive),
      };

      const { data } = await api.put(
        "/api/aff-commission-structure-content/admin",
        payload,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save section");
      }

      toast.success("Commission structure updated successfully");
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save section",
      );
    } finally {
      setSavingSection(false);
    }
  };

  const savePlayer = async (e) => {
    e.preventDefault();

    try {
      setSavingPlayer(true);

      const payload = {
        nameBn: playerForm.name.bn,
        nameEn: playerForm.name.en,
        winLoss: playerForm.winLoss,
        deduction: playerForm.deduction,
        bonus: playerForm.bonus,
        paymentFee: playerForm.paymentFee,
        commission: playerForm.commission,
        negative: String(playerForm.negative),
        order: String(playerForm.order || 0),
        isActive: String(playerForm.isActive),
      };

      const isEdit = Boolean(playerForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-commission-structure-content/admin/players/${playerForm._id}`,
            payload,
          )
        : await api.post(
            "/api/aff-commission-structure-content/admin/players",
            payload,
          );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save player row");
      }

      toast.success(
        isEdit
          ? "Player row updated successfully"
          : "Player row created successfully",
      );

      resetPlayerForm();
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save player row",
      );
    } finally {
      setSavingPlayer(false);
    }
  };

  const deletePlayer = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this row?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const { data } = await api.delete(
        `/api/aff-commission-structure-content/admin/players/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete player row");
      }

      toast.success("Player row deleted successfully");

      if (playerForm._id === id) resetPlayerForm();

      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete player row",
      );
    } finally {
      setDeletingId("");
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaTable />
      {title}
    </h2>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950/15 to-black p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/15 to-black p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div
          className={`${cardBase} flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between`}
        >
          <div>
            <h1 className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
              Commission Structure Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage commission structure title, headers, totals and player
              rows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchContent(true)}
            disabled={refreshing}
            className={buttonGhost}
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle("Section Settings")}

          <label className="mb-5 inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="h-5 w-5 cursor-pointer accent-green-500"
            />
            <span className="text-sm font-bold text-green-100">
              Commission Structure section active
            </span>
          </label>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Title Bangla
              </div>
              <input
                type="text"
                value={form.title.bn}
                onChange={(e) => setTextPair("title", "bn", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Title English
              </div>
              <input
                type="text"
                value={form.title.en}
                onChange={(e) => setTextPair("title", "en", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle("Table Headers")}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["recruit", "Affiliate Recruit"],
              ["winLoss", "Win/Loss"],
              ["deduction", "Deduction"],
              ["bonus", "Bonus"],
              ["paymentFee", "Payment Fee"],
              ["commission", "Commission"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-3">
                <div className="text-sm font-bold text-green-300">{label}</div>

                <input
                  type="text"
                  value={form.headers[field].bn}
                  onChange={(e) => setHeaderPair(field, "bn", e.target.value)}
                  placeholder={`${label} Bangla`}
                  className={inputCls}
                />

                <input
                  type="text"
                  value={form.headers[field].en}
                  onChange={(e) => setHeaderPair(field, "en", e.target.value)}
                  placeholder={`${label} English`}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle("Totals Row")}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Total Label
              </div>

              <input
                type="text"
                value={form.totals.label.bn}
                onChange={(e) => setTotalPair("bn", e.target.value)}
                placeholder="Total Label Bangla"
                className={inputCls}
              />

              <input
                type="text"
                value={form.totals.label.en}
                onChange={(e) => setTotalPair("en", e.target.value)}
                placeholder="Total Label English"
                className={inputCls}
              />
            </div>

            {[
              ["winLoss", "Total Win/Loss"],
              ["deduction", "Total Deduction"],
              ["bonus", "Total Bonus"],
              ["paymentFee", "Total Payment Fee"],
              ["commission", "Total Commission"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-3">
                <div className="text-sm font-bold text-green-300">{label}</div>

                <input
                  type="text"
                  value={form.totals[field]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      totals: {
                        ...prev.totals,
                        [field]: e.target.value,
                      },
                    }))
                  }
                  placeholder={label}
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={saveSection}
              disabled={savingSection}
              className={buttonPrimary}
            >
              <FaSave />
              {savingSection ? "Saving..." : "Save Section Content"}
            </button>
          </div>
        </div>

        <form onSubmit={savePlayer} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            playerForm._id ? "Update Player Row" : "Create Player Row",
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Player Name
              </div>

              <input
                type="text"
                value={playerForm.name.bn}
                onChange={(e) => setPlayerName("bn", e.target.value)}
                placeholder="Name Bangla"
                className={inputCls}
              />

              <input
                type="text"
                value={playerForm.name.en}
                onChange={(e) => setPlayerName("en", e.target.value)}
                placeholder="Name English"
                className={inputCls}
              />
            </div>

            {[
              ["winLoss", "Win/Loss"],
              ["deduction", "Deduction"],
              ["bonus", "Bonus"],
              ["paymentFee", "Payment Fee"],
              ["commission", "Commission"],
              ["order", "Order"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-3">
                <div className="text-sm font-bold text-green-300">{label}</div>

                <input
                  type={field === "order" ? "number" : "text"}
                  value={playerForm[field]}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  placeholder={label}
                  className={inputCls}
                />
              </div>
            ))}

            <div className="space-y-4">
              <div className="text-sm font-bold text-green-300">Status</div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={playerForm.negative}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      negative: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-red-500"
                />
                <span className="text-sm font-bold text-red-100">
                  Negative win/loss color
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={playerForm.isActive}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span className="text-sm font-bold text-green-100">
                  Row active
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingPlayer}
              className={buttonPrimary}
            >
              {playerForm._id ? <FaSave /> : <FaPlus />}
              {savingPlayer
                ? "Saving..."
                : playerForm._id
                  ? "Update Row"
                  : "Create Row"}
            </button>

            {playerForm._id && (
              <button
                type="button"
                onClick={resetPlayerForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Player Rows (${sortedPlayers.length})`)}

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] border-separate border-spacing-y-3">
              <thead>
                <tr className="bg-green-950/40 text-left text-xs uppercase text-green-200">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Win/Loss</th>
                  <th className="px-4 py-3">Deduction</th>
                  <th className="px-4 py-3">Bonus</th>
                  <th className="px-4 py-3">Payment Fee</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {sortedPlayers.map((player) => (
                  <tr key={player._id} className="bg-black/45">
                    <td className="px-4 py-4 text-sm font-bold text-white">
                      {player.order || 0}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-bold text-white">
                        {player.name?.en || "No English Name"}
                      </div>
                      <div className="mt-1 text-sm text-green-100/70">
                        {player.name?.bn || "No Bangla Name"}
                      </div>
                    </td>

                    <td
                      className={`px-4 py-4 text-sm font-bold ${
                        player.negative ? "text-red-400" : "text-white"
                      }`}
                    >
                      {player.winLoss}
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-white">
                      {player.deduction}
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-white">
                      {player.bonus}
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-white">
                      {player.paymentFee}
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-green-300">
                      {player.commission}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          player.isActive !== false
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {player.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editPlayer(player)}
                          className={buttonGhost}
                        >
                          <FaEdit />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deletePlayer(player._id)}
                          disabled={deletingId === player._id}
                          className={buttonDanger}
                        >
                          <FaTrash />
                          {deletingId === player._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!sortedPlayers.length && (
                  <tr>
                    <td
                      colSpan={9}
                      className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 px-4 py-6 text-center text-yellow-100"
                    >
                      No player rows found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionStructureController;
