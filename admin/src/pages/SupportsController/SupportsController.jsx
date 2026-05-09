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
  FaHeadset,
  FaSyncAlt,
  FaExternalLinkAlt,
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

const emptyChannel = {
  _id: "",
  name: "",
  label: { bn: "", en: "" },
  icon: "",
  iconUrl: "",
  link: "",
  order: 1,
  isActive: true,
};

const SupportsController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [content, setContent] = useState({
    title: { bn: "", en: "" },
    subtitle: { bn: "", en: "" },
    openText: { bn: "", en: "" },
    liveChatText: { bn: "", en: "" },
    noteText: { bn: "", en: "" },
    messageButtonText: { bn: "", en: "" },
    backgroundImage: "",
    backgroundImageUrl: "",
    channels: [],
    isActive: true,
  });

  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState("");
  const [removeBg, setRemoveBg] = useState(false);

  const [channelForm, setChannelForm] = useState(emptyChannel);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [removeIcon, setRemoveIcon] = useState(false);

  const sortedChannels = useMemo(() => {
    return [...(content.channels || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [content.channels]);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-support-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load support content");
      }

      const doc = data?.data || {};

      setContent({
        title: {
          bn: doc.title?.bn || "",
          en: doc.title?.en || "",
        },
        subtitle: {
          bn: doc.subtitle?.bn || "",
          en: doc.subtitle?.en || "",
        },
        openText: {
          bn: doc.openText?.bn || "",
          en: doc.openText?.en || "",
        },
        liveChatText: {
          bn: doc.liveChatText?.bn || "",
          en: doc.liveChatText?.en || "",
        },
        noteText: {
          bn: doc.noteText?.bn || "",
          en: doc.noteText?.en || "",
        },
        messageButtonText: {
          bn: doc.messageButtonText?.bn || "",
          en: doc.messageButtonText?.en || "",
        },
        backgroundImage: doc.backgroundImage || "",
        backgroundImageUrl: /^https?:\/\//i.test(doc.backgroundImage || "")
          ? doc.backgroundImage
          : "",
        channels: Array.isArray(doc.channels) ? doc.channels : [],
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
          "Failed to load support content",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const updateContentText = (field, lang, value) => {
    setContent((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const updateChannelLabel = (lang, value) => {
    setChannelForm((prev) => ({
      ...prev,
      label: {
        ...prev.label,
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

  const resetChannelForm = () => {
    setChannelForm({
      ...emptyChannel,
      order: Number(content.channels?.length || 0) + 1,
    });
    setIconFile(null);
    setIconPreview("");
    setRemoveIcon(false);
  };

  const editChannel = (item) => {
    setChannelForm({
      _id: item._id || "",
      name: item.name || "",
      label: {
        bn: item.label?.bn || "",
        en: item.label?.en || "",
      },
      icon: item.icon || "",
      iconUrl: /^https?:\/\//i.test(item.icon || "") ? item.icon : "",
      link: item.link || "",
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

      formData.append("subtitleBn", content.subtitle.bn || "");
      formData.append("subtitleEn", content.subtitle.en || "");

      formData.append("openTextBn", content.openText.bn || "");
      formData.append("openTextEn", content.openText.en || "");

      formData.append("liveChatTextBn", content.liveChatText.bn || "");
      formData.append("liveChatTextEn", content.liveChatText.en || "");

      formData.append("noteTextBn", content.noteText.bn || "");
      formData.append("noteTextEn", content.noteText.en || "");

      formData.append(
        "messageButtonTextBn",
        content.messageButtonText.bn || "",
      );
      formData.append(
        "messageButtonTextEn",
        content.messageButtonText.en || "",
      );

      formData.append("backgroundImageUrl", content.backgroundImageUrl || "");
      formData.append("removeBackgroundImage", String(removeBg));
      formData.append("isActive", String(content.isActive));

      if (bgFile) {
        formData.append("backgroundImage", bgFile);
      }

      const { data } = await api.put(
        "/api/aff-support-content/admin",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save section");
      }

      toast.success("Support section updated successfully");
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

  const saveChannel = async (e) => {
    e.preventDefault();

    try {
      if (!channelForm.name.trim()) {
        toast.error("Channel name is required");
        return;
      }

      if (!channelForm.link.trim()) {
        toast.error("Channel link is required");
        return;
      }

      setSavingChannel(true);

      const formData = new FormData();

      formData.append("name", channelForm.name || "");
      formData.append("labelBn", channelForm.label.bn || "");
      formData.append("labelEn", channelForm.label.en || "");
      formData.append("link", channelForm.link || "");
      formData.append("iconUrl", channelForm.iconUrl || "");
      formData.append("order", String(channelForm.order || 0));
      formData.append("isActive", String(channelForm.isActive));
      formData.append("removeIcon", String(removeIcon));

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      const isEdit = Boolean(channelForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-support-content/admin/channels/${channelForm._id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : await api.post("/api/aff-support-content/admin/channels", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save channel");
      }

      toast.success(
        isEdit
          ? "Support channel updated successfully"
          : "Support channel created successfully",
      );

      resetChannelForm();
      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save channel",
      );
    } finally {
      setSavingChannel(false);
    }
  };

  const deleteChannel = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this channel?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const { data } = await api.delete(
        `/api/aff-support-content/admin/channels/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete channel");
      }

      toast.success("Support channel deleted successfully");

      if (channelForm._id === id) resetChannelForm();

      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete channel",
      );
    } finally {
      setDeletingId("");
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaHeadset />
      {title}
    </h2>
  );

  const activeBg =
    bgPreview || (!removeBg && getImageUrl(content.backgroundImage)) || "";

  const activeIcon =
    iconPreview ||
    (!removeIcon && getImageUrl(channelForm.icon)) ||
    channelForm.iconUrl ||
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
              Supports Controller
            </h1>

            <p className="mt-2 text-sm text-green-200/70">
              Manage support section text, background image, channels, icons and
              external links.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchContent(true)}
            disabled={refreshing}
            className={buttonGhost}
          >
            {refreshing ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSyncAlt />
            )}
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
              Support section active
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
                onChange={(e) =>
                  updateContentText("title", "bn", e.target.value)
                }
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
                onChange={(e) =>
                  updateContentText("title", "en", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Subtitle Bangla
              </label>
              <textarea
                value={content.subtitle.bn}
                onChange={(e) =>
                  updateContentText("subtitle", "bn", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Subtitle English
              </label>
              <textarea
                value={content.subtitle.en}
                onChange={(e) =>
                  updateContentText("subtitle", "en", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Open Text Bangla
              </label>
              <textarea
                value={content.openText.bn}
                onChange={(e) =>
                  updateContentText("openText", "bn", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Open Text English
              </label>
              <textarea
                value={content.openText.en}
                onChange={(e) =>
                  updateContentText("openText", "en", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Live Chat Text Bangla
              </label>
              <input
                type="text"
                value={content.liveChatText.bn}
                onChange={(e) =>
                  updateContentText("liveChatText", "bn", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Live Chat Text English
              </label>
              <input
                type="text"
                value={content.liveChatText.en}
                onChange={(e) =>
                  updateContentText("liveChatText", "en", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Note Text Bangla
              </label>
              <input
                type="text"
                value={content.noteText.bn}
                onChange={(e) =>
                  updateContentText("noteText", "bn", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Note Text English
              </label>
              <input
                type="text"
                value={content.noteText.en}
                onChange={(e) =>
                  updateContentText("noteText", "en", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Message Button Bangla
              </label>
              <input
                type="text"
                value={content.messageButtonText.bn}
                onChange={(e) =>
                  updateContentText("messageButtonText", "bn", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Message Button English
              </label>
              <input
                type="text"
                value={content.messageButtonText.en}
                onChange={(e) =>
                  updateContentText("messageButtonText", "en", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Background Upload
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
                Or Background URL
              </label>
              <input
                type="text"
                value={content.backgroundImageUrl}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    backgroundImageUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/support-bg.webp"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <div
                className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-green-700/30 bg-black/40 bg-cover bg-center"
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

              {content.backgroundImage && (
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
                    Remove current background
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

        <form onSubmit={saveChannel} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            channelForm._id ? "Edit Support Channel" : "Create Support Channel",
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Channel Name
              </label>
              <input
                type="text"
                value={channelForm.name}
                onChange={(e) =>
                  setChannelForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Telegram / WhatsApp / Gmail"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">Order</label>
              <input
                type="number"
                value={channelForm.order}
                onChange={(e) =>
                  setChannelForm((prev) => ({
                    ...prev,
                    order: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Label Bangla
              </label>
              <input
                type="text"
                value={channelForm.label.bn}
                onChange={(e) => updateChannelLabel("bn", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Label English
              </label>
              <input
                type="text"
                value={channelForm.label.en}
                onChange={(e) => updateChannelLabel("en", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                External Link
              </label>
              <input
                type="text"
                value={channelForm.link}
                onChange={(e) =>
                  setChannelForm((prev) => ({
                    ...prev,
                    link: e.target.value,
                  }))
                }
                placeholder="https://t.me/your_channel"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">Status</label>
              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-green-700/40 bg-black/50 px-4">
                <input
                  type="checkbox"
                  checked={channelForm.isActive}
                  onChange={(e) =>
                    setChannelForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span className="text-sm font-bold text-green-100">
                  Channel active
                </span>
              </label>
            </div>

            <div className="space-y-3">
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
                value={channelForm.iconUrl}
                onChange={(e) =>
                  setChannelForm((prev) => ({
                    ...prev,
                    iconUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/icon.svg"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-green-700/30 bg-black/40">
                {activeIcon ? (
                  <img
                    src={activeIcon}
                    alt="Support icon"
                    className="max-h-[150px] max-w-[150px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-green-200/60">
                    <FaImage />
                    No icon selected
                  </div>
                )}
              </div>

              {channelForm._id && channelForm.icon && (
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
              disabled={savingChannel}
              className={buttonPrimary}
            >
              {savingChannel ? (
                <FaSpinner className="animate-spin" />
              ) : channelForm._id ? (
                <FaSave />
              ) : (
                <FaPlus />
              )}
              {savingChannel
                ? "Saving..."
                : channelForm._id
                  ? "Update Channel"
                  : "Create Channel"}
            </button>

            {channelForm._id && (
              <button
                type="button"
                onClick={resetChannelForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Support Channels (${sortedChannels.length})`)}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedChannels.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-green-700/30 bg-black/45"
              >
                <div className="relative flex h-48 items-center justify-center bg-black/50">
                  {item.icon ? (
                    <img
                      src={getImageUrl(item.icon)}
                      alt={item.name || ""}
                      className="max-h-[120px] max-w-[120px] object-contain"
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
                  <h3 className="text-xl font-extrabold text-white">
                    {item.name || "No Channel Name"}
                  </h3>

                  <p className="text-sm font-semibold text-green-100/75">
                    EN: {item.label?.en || "No English Label"}
                  </p>

                  <p className="text-sm font-semibold text-green-100/75">
                    BN: {item.label?.bn || "No Bangla Label"}
                  </p>

                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-emerald-300 hover:text-emerald-200"
                    >
                      <FaExternalLinkAlt />
                      Open Link
                    </a>
                  ) : (
                    <p className="text-sm text-red-200">No link added</p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => editChannel(item)}
                      className={buttonGhost}
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteChannel(item._id)}
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

            {!sortedChannels.length && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 text-yellow-100">
                No support channels found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportsController;
