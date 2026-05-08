import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaEdit,
  FaTimes,
  FaQuestionCircle,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textAreaCls =
  "w-full min-h-[105px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

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

const emptyTab = {
  _id: "",
  tabKey: "",
  label: { bn: "", en: "" },
  order: 1,
  isActive: true,
};

const emptyItem = {
  _id: "",
  question: { bn: "", en: "" },
  answer: { bn: "", en: "" },
  order: 1,
  isActive: true,
};

const FAQController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [savingSection, setSavingSection] = useState(false);
  const [savingTab, setSavingTab] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const [deletingTabId, setDeletingTabId] = useState("");
  const [deletingItemId, setDeletingItemId] = useState("");

  const [form, setForm] = useState({
    isActive: true,
    tabs: [],
  });

  const [activeTabId, setActiveTabId] = useState("");
  const [tabForm, setTabForm] = useState(emptyTab);
  const [itemForm, setItemForm] = useState(emptyItem);

  const sortedTabs = useMemo(() => {
    return [...(form.tabs || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [form.tabs]);

  const activeTab = useMemo(() => {
    return sortedTabs.find((tab) => tab._id === activeTabId) || sortedTabs[0];
  }, [sortedTabs, activeTabId]);

  const sortedItems = useMemo(() => {
    return [...(activeTab?.items || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [activeTab]);

  const fetchFaqContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-faq-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load FAQ content");
      }

      const doc = data?.data || {};
      const tabs = Array.isArray(doc.tabs) ? doc.tabs : [];

      setForm({
        isActive: doc.isActive !== false,
        tabs,
      });

      setActiveTabId((prev) => {
        if (prev && tabs.some((tab) => tab._id === prev)) return prev;
        return tabs?.[0]?._id || "";
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load FAQ content",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFaqContent();
  }, []);

  const resetTabForm = () => {
    setTabForm({
      ...emptyTab,
      order: Number(form.tabs?.length || 0) + 1,
    });
  };

  const resetItemForm = () => {
    setItemForm({
      ...emptyItem,
      order: Number(activeTab?.items?.length || 0) + 1,
    });
  };

  const editTab = (tab) => {
    setTabForm({
      _id: tab._id || "",
      tabKey: tab.tabKey || "",
      label: createTextPair(tab.label),
      order: Number(tab.order || 0),
      isActive: tab.isActive !== false,
    });
    setActiveTabId(tab._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editItem = (item) => {
    setItemForm({
      _id: item._id || "",
      question: createTextPair(item.question),
      answer: createTextPair(item.answer),
      order: Number(item.order || 0),
      isActive: item.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSection = async () => {
    try {
      setSavingSection(true);

      const { data } = await api.put("/api/aff-faq-content/admin", {
        isActive: String(form.isActive),
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update FAQ section");
      }

      toast.success("FAQ section updated successfully");
      fetchFaqContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update FAQ section",
      );
    } finally {
      setSavingSection(false);
    }
  };

  const saveTab = async (e) => {
    e.preventDefault();

    try {
      setSavingTab(true);

      const payload = {
        tabKey: tabForm.tabKey,
        labelBn: tabForm.label.bn,
        labelEn: tabForm.label.en,
        order: String(tabForm.order || 0),
        isActive: String(tabForm.isActive),
      };

      const isEdit = Boolean(tabForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-faq-content/admin/tabs/${tabForm._id}`,
            payload,
          )
        : await api.post("/api/aff-faq-content/admin/tabs", payload);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save FAQ tab");
      }

      toast.success(
        isEdit
          ? "FAQ tab updated successfully"
          : "FAQ tab created successfully",
      );

      const newTabs = data?.data?.tabs || [];
      const nextActiveId = isEdit
        ? tabForm._id
        : newTabs?.[newTabs.length - 1]?._id || "";

      resetTabForm();
      await fetchFaqContent(true);

      if (nextActiveId) setActiveTabId(nextActiveId);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save FAQ tab",
      );
    } finally {
      setSavingTab(false);
    }
  };

  const saveItem = async (e) => {
    e.preventDefault();

    if (!activeTab?._id) {
      toast.error("Please create or select a tab first");
      return;
    }

    try {
      setSavingItem(true);

      const payload = {
        questionBn: itemForm.question.bn,
        questionEn: itemForm.question.en,
        answerBn: itemForm.answer.bn,
        answerEn: itemForm.answer.en,
        order: String(itemForm.order || 0),
        isActive: String(itemForm.isActive),
      };

      const isEdit = Boolean(itemForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-faq-content/admin/tabs/${activeTab._id}/items/${itemForm._id}`,
            payload,
          )
        : await api.post(
            `/api/aff-faq-content/admin/tabs/${activeTab._id}/items`,
            payload,
          );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save FAQ item");
      }

      toast.success(
        isEdit
          ? "FAQ item updated successfully"
          : "FAQ item created successfully",
      );
      resetItemForm();
      fetchFaqContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save FAQ item",
      );
    } finally {
      setSavingItem(false);
    }
  };

  const deleteTab = async (tabId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this FAQ tab with all items?",
    );
    if (!ok) return;

    try {
      setDeletingTabId(tabId);

      const { data } = await api.delete(
        `/api/aff-faq-content/admin/tabs/${tabId}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete FAQ tab");
      }

      toast.success("FAQ tab deleted successfully");

      if (activeTabId === tabId) setActiveTabId("");

      resetTabForm();
      resetItemForm();
      fetchFaqContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete FAQ tab",
      );
    } finally {
      setDeletingTabId("");
    }
  };

  const deleteItem = async (itemId) => {
    if (!activeTab?._id) return;

    const ok = window.confirm("Are you sure you want to delete this FAQ item?");
    if (!ok) return;

    try {
      setDeletingItemId(itemId);

      const { data } = await api.delete(
        `/api/aff-faq-content/admin/tabs/${activeTab._id}/items/${itemId}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete FAQ item");
      }

      toast.success("FAQ item deleted successfully");

      if (itemForm._id === itemId) resetItemForm();

      fetchFaqContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete FAQ item",
      );
    } finally {
      setDeletingItemId("");
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaQuestionCircle />
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
              FAQ Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage affiliate FAQ tabs, questions and answers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchFaqContent(true)}
            disabled={refreshing}
            className={buttonGhost}
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle("FAQ Section Status")}

          <label className="inline-flex cursor-pointer items-center gap-3">
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
              FAQ section active
            </span>
          </label>

          <div className="mt-5">
            <button
              type="button"
              onClick={saveSection}
              disabled={savingSection}
              className={buttonPrimary}
            >
              <FaSave />
              {savingSection ? "Saving..." : "Save Section Status"}
            </button>
          </div>
        </div>

        <form onSubmit={saveTab} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(tabForm._id ? "Update FAQ Tab" : "Create FAQ Tab")}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Tab Key</div>

              <input
                type="text"
                value={tabForm.tabKey}
                onChange={(e) =>
                  setTabForm((prev) => ({
                    ...prev,
                    tabKey: e.target.value,
                  }))
                }
                placeholder="general / account / payment"
                className={inputCls}
              />

              <p className="text-xs text-green-200/60">
                Use lowercase key without spaces. Example: general, account.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Order</div>

              <input
                type="number"
                value={tabForm.order}
                onChange={(e) =>
                  setTabForm((prev) => ({
                    ...prev,
                    order: e.target.value,
                  }))
                }
                placeholder="Order"
                className={inputCls}
              />

              <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={tabForm.isActive}
                  onChange={(e) =>
                    setTabForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span className="text-sm font-bold text-green-100">
                  Tab active
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Tab Label Bangla
              </div>

              <input
                type="text"
                value={tabForm.label.bn}
                onChange={(e) =>
                  setTabForm((prev) => ({
                    ...prev,
                    label: { ...prev.label, bn: e.target.value },
                  }))
                }
                placeholder="Tab label Bangla"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Tab Label English
              </div>

              <input
                type="text"
                value={tabForm.label.en}
                onChange={(e) =>
                  setTabForm((prev) => ({
                    ...prev,
                    label: { ...prev.label, en: e.target.value },
                  }))
                }
                placeholder="Tab label English"
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingTab}
              className={buttonPrimary}
            >
              {tabForm._id ? <FaSave /> : <FaPlus />}
              {savingTab
                ? "Saving..."
                : tabForm._id
                  ? "Update Tab"
                  : "Create Tab"}
            </button>

            {tabForm._id && (
              <button
                type="button"
                onClick={resetTabForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`FAQ Tabs (${sortedTabs.length})`)}

          <div className="flex flex-wrap gap-3">
            {sortedTabs.map((tab) => {
              const selected = activeTab?._id === tab._id;

              return (
                <button
                  key={tab._id}
                  type="button"
                  onClick={() => {
                    setActiveTabId(tab._id);
                    resetItemForm();
                  }}
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selected
                      ? "border-green-400 bg-green-600 text-white"
                      : "border-green-700/40 bg-black/40 text-green-100 hover:bg-green-900/20"
                  }`}
                >
                  {tab.label?.en || tab.tabKey}
                  <span className="ml-2 rounded-full bg-black/35 px-2 py-0.5 text-xs">
                    {tab.items?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedTabs.map((tab) => (
              <div
                key={tab._id}
                className="rounded-2xl border border-green-700/30 bg-black/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-white">
                      {tab.label?.en || "No English Label"}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-green-100/75">
                      {tab.label?.bn || "No Bangla Label"}
                    </p>
                    <p className="mt-2 text-xs text-green-200/60">
                      Key: {tab.tabKey} | Order: {tab.order || 0}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      tab.isActive !== false
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {tab.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editTab(tab)}
                    className={buttonGhost}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteTab(tab._id)}
                    disabled={deletingTabId === tab._id}
                    className={buttonDanger}
                  >
                    <FaTrash />
                    {deletingTabId === tab._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={saveItem} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            itemForm._id
              ? `Update FAQ Item - ${activeTab?.label?.en || ""}`
              : `Create FAQ Item - ${activeTab?.label?.en || "Select Tab"}`,
          )}

          {!activeTab ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-4 text-yellow-100">
              Please create a FAQ tab first.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    Question Bangla
                  </div>

                  <input
                    type="text"
                    value={itemForm.question.bn}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        question: {
                          ...prev.question,
                          bn: e.target.value,
                        },
                      }))
                    }
                    placeholder="Question Bangla"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    Question English
                  </div>

                  <input
                    type="text"
                    value={itemForm.question.en}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        question: {
                          ...prev.question,
                          en: e.target.value,
                        },
                      }))
                    }
                    placeholder="Question English"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="text-sm font-bold text-green-300">
                    Answer Bangla
                  </div>

                  <textarea
                    value={itemForm.answer.bn}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        answer: {
                          ...prev.answer,
                          bn: e.target.value,
                        },
                      }))
                    }
                    placeholder="Answer Bangla"
                    className={textAreaCls}
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="text-sm font-bold text-green-300">
                    Answer English
                  </div>

                  <textarea
                    value={itemForm.answer.en}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        answer: {
                          ...prev.answer,
                          en: e.target.value,
                        },
                      }))
                    }
                    placeholder="Answer English"
                    className={textAreaCls}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">Order</div>

                  <input
                    type="number"
                    value={itemForm.order}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        order: e.target.value,
                      }))
                    }
                    placeholder="Order"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-green-300">Status</div>

                  <label className="inline-flex cursor-pointer items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      checked={itemForm.isActive}
                      onChange={(e) =>
                        setItemForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 cursor-pointer accent-green-500"
                    />
                    <span className="text-sm font-bold text-green-100">
                      FAQ item active
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingItem}
                  className={buttonPrimary}
                >
                  {itemForm._id ? <FaSave /> : <FaPlus />}
                  {savingItem
                    ? "Saving..."
                    : itemForm._id
                      ? "Update FAQ Item"
                      : "Create FAQ Item"}
                </button>

                {itemForm._id && (
                  <button
                    type="button"
                    onClick={resetItemForm}
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
            `FAQ Items - ${activeTab?.label?.en || "No Tab"} (${sortedItems.length})`,
          )}

          {!activeTab ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-4 text-yellow-100">
              No FAQ tab found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {sortedItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-green-700/30 bg-black/40 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-white">
                        {item.question?.en || "No English Question"}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-green-100/75">
                        {item.question?.bn || "No Bangla Question"}
                      </p>

                      <p className="mt-2 text-xs text-green-200/60">
                        Order: {item.order || 0}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        item.isActive !== false
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {item.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-white/70">
                    {item.answer?.en || item.answer?.bn || "No answer"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editItem(item)}
                      className={buttonGhost}
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteItem(item._id)}
                      disabled={deletingItemId === item._id}
                      className={buttonDanger}
                    >
                      <FaTrash />
                      {deletingItemId === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQController;
