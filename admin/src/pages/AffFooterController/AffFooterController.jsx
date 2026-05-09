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
  FaSyncAlt,
  FaExternalLinkAlt,
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookF,
  FaYoutube,
  FaLink,
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

const emptySocial = {
  _id: "",
  platform: "",
  label: "",
  iconType: "custom",
  icon: "",
  iconUrl: "",
  href: "",
  order: 1,
  isActive: true,
};

const iconTypeOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "custom", label: "Custom Image" },
];

const renderIcon = (iconType, className = "text-4xl") => {
  if (iconType === "whatsapp") return <FaWhatsapp className={className} />;
  if (iconType === "telegram") return <FaTelegramPlane className={className} />;
  if (iconType === "facebook") return <FaFacebookF className={className} />;
  if (iconType === "youtube") return <FaYoutube className={className} />;
  return <FaLink className={className} />;
};

const AffFooterController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [content, setContent] = useState({
    title: { bn: "", en: "" },
    desc: { bn: "", en: "" },
    termsText: { bn: "", en: "" },
    termsLink: "",
    copyright: { bn: "", en: "" },
    backgroundImage: "",
    backgroundImageUrl: "",
    socialLinks: [],
    isActive: true,
  });

  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState("");
  const [removeBg, setRemoveBg] = useState(false);

  const [socialForm, setSocialForm] = useState(emptySocial);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [removeIcon, setRemoveIcon] = useState(false);

  const sortedSocialLinks = useMemo(() => {
    return [...(content.socialLinks || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [content.socialLinks]);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-footer-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load footer content");
      }

      const doc = data?.data || {};

      setContent({
        title: {
          bn: doc.title?.bn || "",
          en: doc.title?.en || "",
        },
        desc: {
          bn: doc.desc?.bn || "",
          en: doc.desc?.en || "",
        },
        termsText: {
          bn: doc.termsText?.bn || "",
          en: doc.termsText?.en || "",
        },
        termsLink: doc.termsLink || "",
        copyright: {
          bn: doc.copyright?.bn || "",
          en: doc.copyright?.en || "",
        },
        backgroundImage: doc.backgroundImage || "",
        backgroundImageUrl: /^https?:\/\//i.test(doc.backgroundImage || "")
          ? doc.backgroundImage
          : "",
        socialLinks: Array.isArray(doc.socialLinks) ? doc.socialLinks : [],
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
          "Failed to load footer content",
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

  const resetSocialForm = () => {
    setSocialForm({
      ...emptySocial,
      order: Number(content.socialLinks?.length || 0) + 1,
    });
    setIconFile(null);
    setIconPreview("");
    setRemoveIcon(false);
  };

  const editSocial = (item) => {
    setSocialForm({
      _id: item._id || "",
      platform: item.platform || "",
      label: item.label || "",
      iconType: item.iconType || "custom",
      icon: item.icon || "",
      iconUrl: /^https?:\/\//i.test(item.icon || "") ? item.icon : "",
      href: item.href || "",
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

      formData.append("descBn", content.desc.bn || "");
      formData.append("descEn", content.desc.en || "");

      formData.append("termsTextBn", content.termsText.bn || "");
      formData.append("termsTextEn", content.termsText.en || "");
      formData.append("termsLink", content.termsLink || "");

      formData.append("copyrightBn", content.copyright.bn || "");
      formData.append("copyrightEn", content.copyright.en || "");

      formData.append("backgroundImageUrl", content.backgroundImageUrl || "");
      formData.append("removeBackgroundImage", String(removeBg));
      formData.append("isActive", String(content.isActive));

      if (bgFile) {
        formData.append("backgroundImage", bgFile);
      }

      const { data } = await api.put(
        "/api/aff-footer-content/admin",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save footer section");
      }

      toast.success("Footer section updated successfully");
      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save footer section",
      );
    } finally {
      setSavingSection(false);
    }
  };

  const saveSocial = async (e) => {
    e.preventDefault();

    try {
      if (!socialForm.platform.trim()) {
        toast.error("Platform name is required");
        return;
      }

      if (!socialForm.label.trim()) {
        toast.error("Label is required");
        return;
      }

      if (!socialForm.href.trim()) {
        toast.error("Link is required");
        return;
      }

      setSavingSocial(true);

      const formData = new FormData();

      formData.append("platform", socialForm.platform || "");
      formData.append("label", socialForm.label || "");
      formData.append("iconType", socialForm.iconType || "custom");
      formData.append("iconUrl", socialForm.iconUrl || "");
      formData.append("href", socialForm.href || "");
      formData.append("order", String(socialForm.order || 0));
      formData.append("isActive", String(socialForm.isActive));
      formData.append("removeIcon", String(removeIcon));

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      const isEdit = Boolean(socialForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-footer-content/admin/social-links/${socialForm._id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : await api.post(
            "/api/aff-footer-content/admin/social-links",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save social link");
      }

      toast.success(
        isEdit
          ? "Social link updated successfully"
          : "Social link created successfully",
      );

      resetSocialForm();
      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save social link",
      );
    } finally {
      setSavingSocial(false);
    }
  };

  const deleteSocial = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this social link?",
    );
    if (!ok) return;

    try {
      setDeletingId(id);

      const { data } = await api.delete(
        `/api/aff-footer-content/admin/social-links/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete social link");
      }

      toast.success("Social link deleted successfully");

      if (socialForm._id === id) resetSocialForm();

      fetchContent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete social link",
      );
    } finally {
      setDeletingId("");
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaLink />
      {title}
    </h2>
  );

  const activeBg =
    bgPreview || (!removeBg && getImageUrl(content.backgroundImage)) || "";

  const activeIcon =
    iconPreview ||
    (!removeIcon && getImageUrl(socialForm.icon)) ||
    socialForm.iconUrl ||
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
              Footer Controller
            </h1>

            <p className="mt-2 text-sm text-green-200/70">
              Manage affiliate footer text, background image, terms link and
              social media links.
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
          {sectionTitle("Footer Section Settings")}

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
              Footer section active
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
                Description Bangla
              </label>

              <textarea
                value={content.desc.bn}
                onChange={(e) =>
                  updateContentText("desc", "bn", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Description English
              </label>

              <textarea
                value={content.desc.en}
                onChange={(e) =>
                  updateContentText("desc", "en", e.target.value)
                }
                className={textareaCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Terms Text Bangla
              </label>

              <input
                type="text"
                value={content.termsText.bn}
                onChange={(e) =>
                  updateContentText("termsText", "bn", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Terms Text English
              </label>

              <input
                type="text"
                value={content.termsText.en}
                onChange={(e) =>
                  updateContentText("termsText", "en", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Terms Link
              </label>

              <input
                type="text"
                value={content.termsLink}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    termsLink: e.target.value,
                  }))
                }
                placeholder="/terms-and-conditions or https://example.com/terms"
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Copyright Bangla
              </label>

              <input
                type="text"
                value={content.copyright.bn}
                onChange={(e) =>
                  updateContentText("copyright", "bn", e.target.value)
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">
                Copyright English
              </label>

              <input
                type="text"
                value={content.copyright.en}
                onChange={(e) =>
                  updateContentText("copyright", "en", e.target.value)
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
                placeholder="https://example.com/footer-bg.png"
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

        <form onSubmit={saveSocial} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            socialForm._id ? "Edit Social Link" : "Create Social Link",
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Platform Name
              </label>

              <input
                type="text"
                value={socialForm.platform}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    platform: e.target.value,
                  }))
                }
                placeholder="WhatsApp / Telegram / Facebook"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">Label</label>

              <input
                type="text"
                value={socialForm.label}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                placeholder="WhatsApp"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Icon Type
              </label>

              <select
                value={socialForm.iconType}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    iconType: e.target.value,
                  }))
                }
                className={inputCls}
              >
                {iconTypeOptions.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    className="bg-black text-white"
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">Order</label>

              <input
                type="number"
                value={socialForm.order}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    order: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-green-300">Link</label>

              <input
                type="text"
                value={socialForm.href}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    href: e.target.value,
                  }))
                }
                placeholder="https://facebook.com/your-page"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">Status</label>

              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-green-700/40 bg-black/50 px-4">
                <input
                  type="checkbox"
                  checked={socialForm.isActive}
                  onChange={(e) =>
                    setSocialForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />

                <span className="text-sm font-bold text-green-100">
                  Social link active
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-green-300">
                Custom Icon Upload
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
                Or Custom Icon URL
              </label>

              <input
                type="text"
                value={socialForm.iconUrl}
                onChange={(e) =>
                  setSocialForm((prev) => ({
                    ...prev,
                    iconUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/icon.svg"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-green-700/30 bg-black/40 text-green-200">
                {activeIcon ? (
                  <img
                    src={activeIcon}
                    alt="Social icon"
                    className="max-h-[120px] max-w-[120px] object-contain"
                  />
                ) : (
                  renderIcon(socialForm.iconType, "text-6xl")
                )}
              </div>

              {socialForm._id && socialForm.icon && (
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
                    Remove current custom icon
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingSocial}
              className={buttonPrimary}
            >
              {savingSocial ? (
                <FaSpinner className="animate-spin" />
              ) : socialForm._id ? (
                <FaSave />
              ) : (
                <FaPlus />
              )}

              {savingSocial
                ? "Saving..."
                : socialForm._id
                  ? "Update Social Link"
                  : "Create Social Link"}
            </button>

            {socialForm._id && (
              <button
                type="button"
                onClick={resetSocialForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Social Links (${sortedSocialLinks.length})`)}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedSocialLinks.map((item) => {
              const itemIcon = getImageUrl(item.icon);

              return (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-green-700/30 bg-black/45"
                >
                  <div className="relative flex h-48 items-center justify-center bg-black/50 text-green-200">
                    {itemIcon ? (
                      <img
                        src={itemIcon}
                        alt={item.label || item.platform || ""}
                        className="max-h-[120px] max-w-[120px] object-contain"
                      />
                    ) : (
                      renderIcon(item.iconType, "text-6xl")
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
                      {item.platform || "No Platform"}
                    </h3>

                    <p className="text-sm font-semibold text-green-100/75">
                      Label: {item.label || "No Label"}
                    </p>

                    <p className="text-sm font-semibold text-green-100/75">
                      Icon Type: {item.iconType || "custom"}
                    </p>

                    {item.href ? (
                      <a
                        href={item.href}
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
                        onClick={() => editSocial(item)}
                        className={buttonGhost}
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSocial(item._id)}
                        disabled={deletingId === item._id}
                        className={buttonDanger}
                      >
                        <FaTrash />
                        {deletingId === item._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {!sortedSocialLinks.length && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 text-yellow-100">
                No social links found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffFooterController;
