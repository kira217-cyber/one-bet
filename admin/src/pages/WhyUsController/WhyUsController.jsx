import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSave,
  FaTrash,
  FaEdit,
  FaTimes,
  FaImage,
  FaSpinner,
  FaQuestionCircle,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textareaCls =
  "w-full min-h-[110px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const fileCls =
  "w-full rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white outline-none";

const buttonPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-black/40 hover:bg-green-900/20 border border-green-700/40 text-green-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonDanger =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const API_URL =
  import.meta.env.VITE_APP_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_REACT_APP_BACKEND_API2 ||
  "http://localhost:5002";

const getImageUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const emptyItem = {
  _id: "",
  title: { bn: "", en: "" },
  description: { bn: "", en: "" },
  icon: "",
  iconUrl: "",
  order: 1,
  isActive: true,
};

const WhyUsController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [content, setContent] = useState({
    title: { bn: "", en: "" },
    cardBackgroundImage: "",
    cardBackgroundImageUrl: "",
    items: [],
    isActive: true,
  });

  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState("");
  const [removeBg, setRemoveBg] = useState(false);

  const [itemForm, setItemForm] = useState(emptyItem);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [removeIcon, setRemoveIcon] = useState(false);

  const sortedItems = useMemo(() => {
    return [...(content.items || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [content.items]);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-why-us-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load Why Us content");
      }

      const doc = data?.data || {};

      setContent({
        title: {
          bn: doc.title?.bn || "",
          en: doc.title?.en || "",
        },
        cardBackgroundImage: doc.cardBackgroundImage || "",
        cardBackgroundImageUrl: /^https?:\/\//i.test(
          doc.cardBackgroundImage || "",
        )
          ? doc.cardBackgroundImage
          : "",
        items: Array.isArray(doc.items) ? doc.items : [],
        isActive: doc.isActive !== false,
      });

      setBgFile(null);
      setBgPreview("");
      setRemoveBg(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Why Us content",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const updateTitle = (lang, value) => {
    setContent((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: value,
      },
    }));
  };

  const updateItemText = (field, lang, value) => {
    setItemForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const readFile = (file, type) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === "bg") {
        setBgFile(file);
        setBgPreview(reader.result);
        setRemoveBg(false);
      }

      if (type === "icon") {
        setIconFile(file);
        setIconPreview(reader.result);
        setRemoveIcon(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const resetItemForm = () => {
    setItemForm({
      ...emptyItem,
      order: Number(content.items?.length || 0) + 1,
    });
    setIconFile(null);
    setIconPreview("");
    setRemoveIcon(false);
  };

  const editItem = (item) => {
    setItemForm({
      _id: item._id || "",
      title: {
        bn: item.title?.bn || "",
        en: item.title?.en || "",
      },
      description: {
        bn: item.description?.bn || "",
        en: item.description?.en || "",
      },
      icon: item.icon || "",
      iconUrl: /^https?:\/\//i.test(item.icon || "") ? item.icon : "",
      order: Number(item.order || 0),
      isActive: item.isActive !== false,
    });

    setIconFile(null);
    setIconPreview("");
    setRemoveIcon(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSection = async () => {
    try {
      setSavingSection(true);

      const formData = new FormData();

      formData.append("titleBn", content.title.bn || "");
      formData.append("titleEn", content.title.en || "");
      formData.append(
        "cardBackgroundImageUrl",
        content.cardBackgroundImageUrl || "",
      );
      formData.append("removeCardBackgroundImage", String(removeBg));
      formData.append("isActive", String(content.isActive));

      if (bgFile) {
        formData.append("cardBackgroundImage", bgFile);
      }

      const { data } = await api.put(
        "/api/aff-why-us-content/admin",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save section");
      }

      toast.success("Why Us section updated successfully");
      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save section",
      );
    } finally {
      setSavingSection(false);
    }
  };

  const saveItem = async (e) => {
    e.preventDefault();

    try {
      if (!itemForm.title.en.trim()) {
        toast.error("English title is required");
        return;
      }

      setSavingItem(true);

      const formData = new FormData();

      formData.append("titleBn", itemForm.title.bn || "");
      formData.append("titleEn", itemForm.title.en || "");
      formData.append("descriptionBn", itemForm.description.bn || "");
      formData.append("descriptionEn", itemForm.description.en || "");
      formData.append("iconUrl", itemForm.iconUrl || "");
      formData.append("order", String(itemForm.order || 0));
      formData.append("isActive", String(itemForm.isActive));
      formData.append("removeIcon", String(removeIcon));

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      const isEdit = Boolean(itemForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-why-us-content/admin/items/${itemForm._id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : await api.post("/api/aff-why-us-content/admin/items", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save item");
      }

      toast.success(
        isEdit
          ? "Why Us item updated successfully"
          : "Why Us item created successfully",
      );

      resetItemForm();
      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save item",
      );
    } finally {
      setSavingItem(false);
    }
  };

  const deleteItem = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this item?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const { data } = await api.delete(
        `/api/aff-why-us-content/admin/items/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete item");
      }

      toast.success("Why Us item deleted successfully");

      if (itemForm._id === id) resetItemForm();

      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete item",
      );
    } finally {
      setDeletingId("");
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaQuestionCircle />
      {title}
    </h2>
  );

  const activeBg =
    bgPreview || (!removeBg && getImageUrl(content.cardBackgroundImage)) || "";

  const activeIcon =
    iconPreview ||
    (!removeIcon && getImageUrl(itemForm.icon)) ||
    itemForm.iconUrl ||
    "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950/15 to-black p-6 text-white">
        <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-green-400" />
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
              Why Us Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage affiliate Why Us title, background image, cards and icons.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchContent(true)}
            disabled={refreshing}
            className={buttonGhost}
          >
            {refreshing ? <FaSpinner className="animate-spin" /> : null}
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle("Section Settings")}

          <label className="mb-5 inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={content.isActive}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="h-5 w-5 cursor-pointer accent-green-500"
            />
            <span className="text-sm font-bold text-green-100">
              Why Us section active
            </span>
          </label>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Title Bangla
              </label>
              <input
                type="text"
                value={content.title.bn}
                onChange={(e) => updateTitle("bn", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Title English
              </label>
              <input
                type="text"
                value={content.title.en}
                onChange={(e) => updateTitle("en", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Card Background Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => readFile(e.target.files?.[0], "bg")}
                className={fileCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Or Card Background URL
              </label>
              <input
                type="text"
                value={content.cardBackgroundImageUrl}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    cardBackgroundImageUrl: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <div
                className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-green-700/30 bg-black/40 bg-cover bg-center"
                style={{
                  backgroundImage: activeBg ? `url('${activeBg}')` : "none",
                }}
              >
                {!activeBg && (
                  <div className="flex items-center gap-2 text-green-200/60">
                    <FaImage />
                    No background selected
                  </div>
                )}
              </div>

              {content.cardBackgroundImage && (
                <label className="mt-4 inline-flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={removeBg}
                    onChange={(e) => {
                      setRemoveBg(e.target.checked);
                      if (e.target.checked) {
                        setBgFile(null);
                        setBgPreview("");
                      }
                    }}
                    className="h-5 w-5 cursor-pointer accent-red-500"
                  />
                  <span className="text-sm font-bold text-red-100">
                    Remove current card background
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={saveSection}
              disabled={savingSection}
              className={buttonPrimary}
            >
              {savingSection ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSave />
              )}
              {savingSection ? "Saving..." : "Save Section"}
            </button>
          </div>
        </div>

        <form onSubmit={saveItem} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            itemForm._id ? "Edit Why Us Item" : "Create Why Us Item",
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Title Bangla
              </label>
              <input
                type="text"
                value={itemForm.title.bn}
                onChange={(e) => updateItemText("title", "bn", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Title English
              </label>
              <input
                type="text"
                value={itemForm.title.en}
                onChange={(e) => updateItemText("title", "en", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Description Bangla
              </label>
              <textarea
                value={itemForm.description.bn}
                onChange={(e) =>
                  updateItemText("description", "bn", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Description English
              </label>
              <textarea
                value={itemForm.description.en}
                onChange={(e) =>
                  updateItemText("description", "en", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">Order</label>
              <input
                type="number"
                value={itemForm.order}
                onChange={(e) =>
                  setItemForm((prev) => ({
                    ...prev,
                    order: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">Status</label>
              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-green-700/40 bg-black/50 px-4">
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
                  Item active
                </span>
              </label>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Icon Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => readFile(e.target.files?.[0], "icon")}
                className={fileCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Or Icon URL
              </label>
              <input
                type="text"
                value={itemForm.iconUrl}
                onChange={(e) =>
                  setItemForm((prev) => ({
                    ...prev,
                    iconUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/icon.png"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-green-700/30 bg-black/40">
                {activeIcon ? (
                  <img
                    src={activeIcon}
                    alt="Why us icon"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-green-200/60">
                    <FaImage />
                    No icon selected
                  </div>
                )}
              </div>

              {itemForm._id && itemForm.icon && (
                <label className="mt-4 inline-flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={removeIcon}
                    onChange={(e) => {
                      setRemoveIcon(e.target.checked);
                      if (e.target.checked) {
                        setIconFile(null);
                        setIconPreview("");
                      }
                    }}
                    className="h-5 w-5 cursor-pointer accent-red-500"
                  />
                  <span className="text-sm font-bold text-red-100">
                    Remove current icon
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingItem}
              className={buttonPrimary}
            >
              {savingItem ? (
                <FaSpinner className="animate-spin" />
              ) : itemForm._id ? (
                <FaSave />
              ) : (
                <FaPlus />
              )}
              {savingItem
                ? "Saving..."
                : itemForm._id
                  ? "Update Item"
                  : "Create Item"}
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
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Why Us Items (${sortedItems.length})`)}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedItems.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-green-700/30 bg-black/45"
              >
                <div
                  className="relative flex h-48 items-center justify-center bg-cover bg-center"
                  style={{
                    backgroundImage: activeBg ? `url('${activeBg}')` : "none",
                  }}
                >
                  {item.icon ? (
                    <img
                      src={getImageUrl(item.icon)}
                      alt={item.title?.en || ""}
                      className="object-cover"
                    />
                  ) : (
                    <FaImage className="text-4xl text-green-200/60" />
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                      item.isActive !== false
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {item.isActive !== false ? "Active" : "Inactive"}
                  </span>

                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                    Order: {item.order || 0}
                  </span>
                </div>

                <div className="space-y-3 p-4">
                  <h3 className="text-base font-extrabold text-white">
                    {item.title?.en || "No English Title"}
                  </h3>

                  <p className="text-sm font-semibold text-green-100/75">
                    {item.title?.bn || "No Bangla Title"}
                  </p>

                  <p className="line-clamp-3 text-sm leading-6 text-white/60">
                    {item.description?.en ||
                      item.description?.bn ||
                      "No description"}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
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
                      disabled={deletingId === item._id}
                      className={buttonDanger}
                    >
                      <FaTrash />
                      {deletingId === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!sortedItems.length && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 text-yellow-100">
                No items found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUsController;
