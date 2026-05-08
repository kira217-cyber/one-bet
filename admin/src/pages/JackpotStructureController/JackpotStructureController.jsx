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

const textAreaCls =
  "w-full min-h-[110px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const selectCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

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

const emptyScenario = {
  _id: "",
  scenarioKey: "",
  title: { bn: "", en: "" },
  subtitle: { bn: "", en: "" },
  smallTitle: { bn: "", en: "" },
  jackpotCostLabel: { bn: "", en: "" },
  jackpotCost: "",
  jackpotCostColorType: "red",
  calcTitle: { bn: "", en: "" },
  netProfitLabel: { bn: "", en: "" },
  netProfit: "",
  affiliateTitle: { bn: "", en: "" },
  affiliateValue: "",
  descriptionTitle: { bn: "", en: "" },
  description: { bn: "", en: "" },
  order: 1,
  isActive: true,
};

const emptyRow = {
  _id: "",
  label: { bn: "", en: "" },
  value: "",
  colorType: "white",
  order: 1,
};

const JackpotStructureController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [savingSection, setSavingSection] = useState(false);
  const [savingScenario, setSavingScenario] = useState(false);
  const [savingRow, setSavingRow] = useState(false);

  const [deletingScenarioId, setDeletingScenarioId] = useState("");
  const [deletingRowId, setDeletingRowId] = useState("");

  const [form, setForm] = useState({
    footerTitle: { bn: "", en: "" },
    footerText: { bn: "", en: "" },
    buttonText: { bn: "", en: "" },
    scenarios: [],
    isActive: true,
  });

  const [activeScenarioId, setActiveScenarioId] = useState("");
  const [scenarioForm, setScenarioForm] = useState(emptyScenario);
  const [rowForm, setRowForm] = useState(emptyRow);
  const [rowType, setRowType] = useState("small-rows");

  const sortedScenarios = useMemo(() => {
    return [...(form.scenarios || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [form.scenarios]);

  const activeScenario = useMemo(() => {
    return (
      sortedScenarios.find((item) => item._id === activeScenarioId) ||
      sortedScenarios[0]
    );
  }, [sortedScenarios, activeScenarioId]);

  const activeRows = useMemo(() => {
    const rows =
      rowType === "small-rows"
        ? activeScenario?.smallRows || []
        : activeScenario?.calcRows || [];

    return [...rows].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [activeScenario, rowType]);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get(
        "/api/aff-jackpot-structure-content/admin",
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load content");
      }

      const doc = data?.data || {};
      const scenarios = Array.isArray(doc.scenarios) ? doc.scenarios : [];

      setForm({
        footerTitle: createTextPair(doc.footerTitle),
        footerText: createTextPair(doc.footerText),
        buttonText: createTextPair(doc.buttonText),
        scenarios,
        isActive: doc.isActive !== false,
      });

      setActiveScenarioId((prev) => {
        if (prev && scenarios.some((item) => item._id === prev)) return prev;
        return scenarios?.[0]?._id || "";
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load jackpot structure",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const setTextField = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const setScenarioText = (field, lang, value) => {
    setScenarioForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const setRowText = (lang, value) => {
    setRowForm((prev) => ({
      ...prev,
      label: {
        ...prev.label,
        [lang]: value,
      },
    }));
  };

  const resetScenarioForm = () => {
    setScenarioForm({
      ...emptyScenario,
      order: Number(form.scenarios?.length || 0) + 1,
    });
  };

  const resetRowForm = () => {
    const rows =
      rowType === "small-rows"
        ? activeScenario?.smallRows || []
        : activeScenario?.calcRows || [];

    setRowForm({
      ...emptyRow,
      order: Number(rows.length || 0) + 1,
    });
  };

  const editScenario = (scenario) => {
    setScenarioForm({
      _id: scenario._id || "",
      scenarioKey: scenario.scenarioKey || "",
      title: createTextPair(scenario.title),
      subtitle: createTextPair(scenario.subtitle),
      smallTitle: createTextPair(scenario.smallTitle),
      jackpotCostLabel: createTextPair(scenario.jackpotCostLabel),
      jackpotCost: scenario.jackpotCost || "",
      jackpotCostColorType: scenario.jackpotCostColorType || "red",
      calcTitle: createTextPair(scenario.calcTitle),
      netProfitLabel: createTextPair(scenario.netProfitLabel),
      netProfit: scenario.netProfit || "",
      affiliateTitle: createTextPair(scenario.affiliateTitle),
      affiliateValue: scenario.affiliateValue || "",
      descriptionTitle: createTextPair(scenario.descriptionTitle),
      description: createTextPair(scenario.description),
      order: Number(scenario.order || 0),
      isActive: scenario.isActive !== false,
    });

    setActiveScenarioId(scenario._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editRow = (row) => {
    setRowForm({
      _id: row._id || "",
      label: createTextPair(row.label),
      value: row.value || "",
      colorType: row.colorType || "white",
      order: Number(row.order || 0),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSection = async () => {
    try {
      setSavingSection(true);

      const payload = {
        footerTitleBn: form.footerTitle.bn,
        footerTitleEn: form.footerTitle.en,
        footerTextBn: form.footerText.bn,
        footerTextEn: form.footerText.en,
        buttonTextBn: form.buttonText.bn,
        buttonTextEn: form.buttonText.en,
        isActive: String(form.isActive),
      };

      const { data } = await api.put(
        "/api/aff-jackpot-structure-content/admin",
        payload,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save section");
      }

      toast.success("Jackpot structure section updated successfully");
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

  const saveScenario = async (e) => {
    e.preventDefault();

    try {
      setSavingScenario(true);

      const payload = {
        scenarioKey: scenarioForm.scenarioKey,

        titleBn: scenarioForm.title.bn,
        titleEn: scenarioForm.title.en,

        subtitleBn: scenarioForm.subtitle.bn,
        subtitleEn: scenarioForm.subtitle.en,

        smallTitleBn: scenarioForm.smallTitle.bn,
        smallTitleEn: scenarioForm.smallTitle.en,

        jackpotCostLabelBn: scenarioForm.jackpotCostLabel.bn,
        jackpotCostLabelEn: scenarioForm.jackpotCostLabel.en,
        jackpotCost: scenarioForm.jackpotCost,
        jackpotCostColorType: scenarioForm.jackpotCostColorType,

        calcTitleBn: scenarioForm.calcTitle.bn,
        calcTitleEn: scenarioForm.calcTitle.en,

        netProfitLabelBn: scenarioForm.netProfitLabel.bn,
        netProfitLabelEn: scenarioForm.netProfitLabel.en,
        netProfit: scenarioForm.netProfit,

        affiliateTitleBn: scenarioForm.affiliateTitle.bn,
        affiliateTitleEn: scenarioForm.affiliateTitle.en,
        affiliateValue: scenarioForm.affiliateValue,

        descriptionTitleBn: scenarioForm.descriptionTitle.bn,
        descriptionTitleEn: scenarioForm.descriptionTitle.en,
        descriptionBn: scenarioForm.description.bn,
        descriptionEn: scenarioForm.description.en,

        order: String(scenarioForm.order || 0),
        isActive: String(scenarioForm.isActive),
      };

      const isEdit = Boolean(scenarioForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-jackpot-structure-content/admin/scenarios/${scenarioForm._id}`,
            payload,
          )
        : await api.post(
            "/api/aff-jackpot-structure-content/admin/scenarios",
            payload,
          );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save scenario");
      }

      toast.success(
        isEdit
          ? "Scenario updated successfully"
          : "Scenario created successfully",
      );

      const newScenarios = data?.data?.scenarios || [];
      const nextActiveId = isEdit
        ? scenarioForm._id
        : newScenarios?.[newScenarios.length - 1]?._id || "";

      resetScenarioForm();
      await fetchContent(true);

      if (nextActiveId) setActiveScenarioId(nextActiveId);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save scenario",
      );
    } finally {
      setSavingScenario(false);
    }
  };

  const saveRow = async (e) => {
    e.preventDefault();

    if (!activeScenario?._id) {
      toast.error("Please create or select a scenario first");
      return;
    }

    try {
      setSavingRow(true);

      const payload = {
        labelBn: rowForm.label.bn,
        labelEn: rowForm.label.en,
        value: rowForm.value,
        colorType: rowForm.colorType,
        order: String(rowForm.order || 0),
      };

      const isEdit = Boolean(rowForm._id);

      const urlBase = `/api/aff-jackpot-structure-content/admin/scenarios/${activeScenario._id}/${rowType}`;

      const { data } = isEdit
        ? await api.put(`${urlBase}/${rowForm._id}`, payload)
        : await api.post(urlBase, payload);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save row");
      }

      toast.success(
        isEdit ? "Row updated successfully" : "Row created successfully",
      );
      resetRowForm();
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save row",
      );
    } finally {
      setSavingRow(false);
    }
  };

  const deleteScenario = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this scenario?");
    if (!ok) return;

    try {
      setDeletingScenarioId(id);

      const { data } = await api.delete(
        `/api/aff-jackpot-structure-content/admin/scenarios/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete scenario");
      }

      toast.success("Scenario deleted successfully");

      if (activeScenarioId === id) setActiveScenarioId("");
      if (scenarioForm._id === id) resetScenarioForm();

      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete scenario",
      );
    } finally {
      setDeletingScenarioId("");
    }
  };

  const deleteRow = async (id) => {
    if (!activeScenario?._id) return;

    const ok = window.confirm("Are you sure you want to delete this row?");
    if (!ok) return;

    try {
      setDeletingRowId(id);

      const { data } = await api.delete(
        `/api/aff-jackpot-structure-content/admin/scenarios/${activeScenario._id}/${rowType}/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete row");
      }

      toast.success("Row deleted successfully");

      if (rowForm._id === id) resetRowForm();

      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete row",
      );
    } finally {
      setDeletingRowId("");
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
              Jackpot Structure Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage jackpot scenarios, calculation rows and footer CTA.
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
          {sectionTitle("Section Footer CTA")}

          <label className="mb-5 inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="h-5 w-5 cursor-pointer accent-green-500"
            />
            <span className="text-sm font-bold text-green-100">
              Jackpot Structure section active
            </span>
          </label>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              ["footerTitle", "Footer Title"],
              ["footerText", "Footer Text"],
              ["buttonText", "Button Text"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-3">
                <div className="text-sm font-bold text-green-300">{label}</div>

                <input
                  type="text"
                  value={form[field].bn}
                  onChange={(e) => setTextField(field, "bn", e.target.value)}
                  placeholder={`${label} Bangla`}
                  className={inputCls}
                />

                <input
                  type="text"
                  value={form[field].en}
                  onChange={(e) => setTextField(field, "en", e.target.value)}
                  placeholder={`${label} English`}
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
              {savingSection ? "Saving..." : "Save Section Footer"}
            </button>
          </div>
        </div>

        <form onSubmit={saveScenario} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            scenarioForm._id ? "Update Scenario" : "Create Scenario",
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Scenario Key
              </div>

              <input
                type="text"
                value={scenarioForm.scenarioKey}
                onChange={(e) =>
                  setScenarioForm((prev) => ({
                    ...prev,
                    scenarioKey: e.target.value,
                  }))
                }
                placeholder="A / B"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Order</div>

              <input
                type="number"
                value={scenarioForm.order}
                onChange={(e) =>
                  setScenarioForm((prev) => ({
                    ...prev,
                    order: e.target.value,
                  }))
                }
                className={inputCls}
              />

              <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={scenarioForm.isActive}
                  onChange={(e) =>
                    setScenarioForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span className="text-sm font-bold text-green-100">
                  Scenario active
                </span>
              </label>
            </div>

            {[
              ["title", "Title"],
              ["subtitle", "Subtitle"],
              ["smallTitle", "Small Card Title"],
              ["jackpotCostLabel", "Jackpot Cost Label"],
              ["calcTitle", "Calculation Title"],
              ["netProfitLabel", "Net Profit Label"],
              ["affiliateTitle", "Affiliate Title"],
              ["descriptionTitle", "Description Title"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-3">
                <div className="text-sm font-bold text-green-300">{label}</div>

                <input
                  type="text"
                  value={scenarioForm[field].bn}
                  onChange={(e) => setScenarioText(field, "bn", e.target.value)}
                  placeholder={`${label} Bangla`}
                  className={inputCls}
                />

                <input
                  type="text"
                  value={scenarioForm[field].en}
                  onChange={(e) => setScenarioText(field, "en", e.target.value)}
                  placeholder={`${label} English`}
                  className={inputCls}
                />
              </div>
            ))}

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Jackpot Cost
              </div>

              <input
                type="text"
                value={scenarioForm.jackpotCost}
                onChange={(e) =>
                  setScenarioForm((prev) => ({
                    ...prev,
                    jackpotCost: e.target.value,
                  }))
                }
                className={inputCls}
              />

              <select
                value={scenarioForm.jackpotCostColorType}
                onChange={(e) =>
                  setScenarioForm((prev) => ({
                    ...prev,
                    jackpotCostColorType: e.target.value,
                  }))
                }
                className={selectCls}
              >
                <option value="white">White</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Net Profit</div>

              <input
                type="text"
                value={scenarioForm.netProfit}
                onChange={(e) =>
                  setScenarioForm((prev) => ({
                    ...prev,
                    netProfit: e.target.value,
                  }))
                }
                className={inputCls}
              />

              <input
                type="text"
                value={scenarioForm.affiliateValue}
                onChange={(e) =>
                  setScenarioForm((prev) => ({
                    ...prev,
                    affiliateValue: e.target.value,
                  }))
                }
                placeholder="Affiliate Value"
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="text-sm font-bold text-green-300">
                Description
              </div>

              <textarea
                value={scenarioForm.description.bn}
                onChange={(e) =>
                  setScenarioText("description", "bn", e.target.value)
                }
                placeholder="Description Bangla"
                className={textAreaCls}
              />

              <textarea
                value={scenarioForm.description.en}
                onChange={(e) =>
                  setScenarioText("description", "en", e.target.value)
                }
                placeholder="Description English"
                className={textAreaCls}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingScenario}
              className={buttonPrimary}
            >
              {scenarioForm._id ? <FaSave /> : <FaPlus />}
              {savingScenario
                ? "Saving..."
                : scenarioForm._id
                  ? "Update Scenario"
                  : "Create Scenario"}
            </button>

            {scenarioForm._id && (
              <button
                type="button"
                onClick={resetScenarioForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Scenarios (${sortedScenarios.length})`)}

          <div className="flex flex-wrap gap-3">
            {sortedScenarios.map((scenario) => {
              const selected = activeScenario?._id === scenario._id;

              return (
                <button
                  key={scenario._id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioId(scenario._id);
                    resetRowForm();
                  }}
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selected
                      ? "border-green-400 bg-green-600 text-white"
                      : "border-green-700/40 bg-black/40 text-green-100 hover:bg-green-900/20"
                  }`}
                >
                  {scenario.title?.en || scenario.scenarioKey || "Scenario"}
                  <span className="ml-2 rounded-full bg-black/35 px-2 py-0.5 text-xs">
                    {(scenario.smallRows?.length || 0) +
                      (scenario.calcRows?.length || 0)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {sortedScenarios.map((scenario) => (
              <div
                key={scenario._id}
                className="rounded-2xl border border-green-700/30 bg-black/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-white">
                      {scenario.title?.en || "No English Title"}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-green-100/75">
                      {scenario.subtitle?.en || "No subtitle"}
                    </p>
                    <p className="mt-2 text-xs text-green-200/60">
                      Key: {scenario.scenarioKey || "-"} | Order:{" "}
                      {scenario.order || 0}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      scenario.isActive !== false
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {scenario.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editScenario(scenario)}
                    className={buttonGhost}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteScenario(scenario._id)}
                    disabled={deletingScenarioId === scenario._id}
                    className={buttonDanger}
                  >
                    <FaTrash />
                    {deletingScenarioId === scenario._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={saveRow} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            rowForm._id
              ? `Update Row - ${activeScenario?.title?.en || ""}`
              : `Create Row - ${activeScenario?.title?.en || "Select Scenario"}`,
          )}

          <div className="mb-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setRowType("small-rows");
                resetRowForm();
              }}
              className={rowType === "small-rows" ? buttonPrimary : buttonGhost}
            >
              Small Rows
            </button>

            <button
              type="button"
              onClick={() => {
                setRowType("calc-rows");
                resetRowForm();
              }}
              className={rowType === "calc-rows" ? buttonPrimary : buttonGhost}
            >
              Calculation Rows
            </button>
          </div>

          {!activeScenario ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-4 text-yellow-100">
              Please create or select a scenario first.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    Label Bangla
                  </div>

                  <input
                    type="text"
                    value={rowForm.label.bn}
                    onChange={(e) => setRowText("bn", e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    Label English
                  </div>

                  <input
                    type="text"
                    value={rowForm.label.en}
                    onChange={(e) => setRowText("en", e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">Value</div>

                  <input
                    type="text"
                    value={rowForm.value}
                    onChange={(e) =>
                      setRowForm((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">Order</div>

                  <input
                    type="number"
                    value={rowForm.order}
                    onChange={(e) =>
                      setRowForm((prev) => ({
                        ...prev,
                        order: e.target.value,
                      }))
                    }
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    Color Type
                  </div>

                  <select
                    value={rowForm.colorType}
                    onChange={(e) =>
                      setRowForm((prev) => ({
                        ...prev,
                        colorType: e.target.value,
                      }))
                    }
                    className={selectCls}
                  >
                    <option value="white">White</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingRow}
                  className={buttonPrimary}
                >
                  {rowForm._id ? <FaSave /> : <FaPlus />}
                  {savingRow
                    ? "Saving..."
                    : rowForm._id
                      ? "Update Row"
                      : "Create Row"}
                </button>

                {rowForm._id && (
                  <button
                    type="button"
                    onClick={resetRowForm}
                    className={buttonGhost}
                  >
                    <FaTimes />
                    Cancel Edit
                  </button>
                )}
              </div>
            </>
          )}
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            `${rowType === "small-rows" ? "Small Rows" : "Calculation Rows"} - ${
              activeScenario?.title?.en || "No Scenario"
            } (${activeRows.length})`,
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activeRows.map((row) => (
              <div
                key={row._id}
                className="rounded-2xl border border-green-700/30 bg-black/40 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-white">
                      {row.label?.en || "No English Label"}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-green-100/75">
                      {row.label?.bn || "No Bangla Label"}
                    </p>

                    <p className="mt-2 text-xs text-green-200/60">
                      Order: {row.order || 0} | Color: {row.colorType}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      row.colorType === "red"
                        ? "bg-red-600 text-white"
                        : row.colorType === "green"
                          ? "bg-green-600 text-white"
                          : "bg-white/15 text-white"
                    }`}
                  >
                    {row.value || "-"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editRow(row)}
                    className={buttonGhost}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteRow(row._id)}
                    disabled={deletingRowId === row._id}
                    className={buttonDanger}
                  >
                    <FaTrash />
                    {deletingRowId === row._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}

            {!activeRows.length && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 text-yellow-100">
                No rows found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotStructureController;
