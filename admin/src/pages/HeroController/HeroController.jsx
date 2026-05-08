import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaImage,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const fileCls =
  "w-full rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white outline-none";

const buttonPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-black/40 hover:bg-green-900/20 border border-green-700/40 text-green-100 transition";

const buttonDanger =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const createTextPair = (obj = {}) => ({
  bn: obj?.bn || "",
  en: obj?.en || "",
});

const fileUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.VITE_APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const HeroController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    unlockText: { bn: "", en: "" },
    title: { bn: "", en: "" },
    subtitle: { bn: "", en: "" },
    termsText: { bn: "", en: "" },
    buttonText: { bn: "", en: "" },
    backgroundImage: "",
    isActive: true,
  });

  const [newBackgroundFile, setNewBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [removeBackgroundImage, setRemoveBackgroundImage] = useState(false);

  const fetchHeroContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-hero-content");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load hero content");
      }

      const doc = data?.data || {};

      setForm({
        unlockText: createTextPair(doc.unlockText),
        title: createTextPair(doc.title),
        subtitle: createTextPair(doc.subtitle),
        termsText: createTextPair(doc.termsText),
        buttonText: createTextPair(doc.buttonText),
        backgroundImage: doc.backgroundImage || "",
        isActive: doc.isActive !== false,
      });

      setNewBackgroundFile(null);
      setBackgroundPreview("");
      setRemoveBackgroundImage(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load hero content",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHeroContent();
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

  const readBackgroundFile = (file) => {
    if (!file) {
      setNewBackgroundFile(null);
      setBackgroundPreview("");
      return;
    }

    setNewBackgroundFile(file);
    setRemoveBackgroundImage(false);

    const reader = new FileReader();
    reader.onloadend = () => setBackgroundPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearNewBackground = () => {
    setNewBackgroundFile(null);
    setBackgroundPreview("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("unlockTextBn", form.unlockText.bn);
      payload.append("unlockTextEn", form.unlockText.en);

      payload.append("titleBn", form.title.bn);
      payload.append("titleEn", form.title.en);

      payload.append("subtitleBn", form.subtitle.bn);
      payload.append("subtitleEn", form.subtitle.en);

      payload.append("termsTextBn", form.termsText.bn);
      payload.append("termsTextEn", form.termsText.en);

      payload.append("buttonTextBn", form.buttonText.bn);
      payload.append("buttonTextEn", form.buttonText.en);

      payload.append("isActive", String(form.isActive));
      payload.append("removeBackgroundImage", String(removeBackgroundImage));

      if (newBackgroundFile) {
        payload.append("backgroundImage", newBackgroundFile);
      }

      const { data } = await api.put("/api/aff-hero-content/admin", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update hero content");
      }

      toast.success("Hero content updated successfully");
      fetchHeroContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update hero content",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete hero content? This action cannot be undone.",
    );

    if (!ok) return;

    try {
      setDeleting(true);

      const { data } = await api.delete("/api/aff-hero-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete hero content");
      }

      toast.success("Hero content deleted successfully");
      fetchHeroContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete hero content",
      );
    } finally {
      setDeleting(false);
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 text-lg font-extrabold text-green-200">{title}</h2>
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
              Hero Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage affiliate hero texts and background image from admin panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchHeroContent(true)}
              disabled={refreshing}
              className={buttonGhost}
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={buttonDanger}
            >
              <FaTrash />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Hero Status")}

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
                Hero section active
              </span>
            </label>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Hero Text Content")}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                ["unlockText", "Unlock Text"],
                ["title", "Main Title"],
                ["subtitle", "Subtitle"],
                ["termsText", "Terms Text"],
                ["buttonText", "Button Text"],
              ].map(([field, label]) => (
                <div key={field} className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    {label}
                  </div>

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
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Background Image")}

            <div className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-700/50 bg-black/40 p-6 text-center hover:bg-green-950/20">
                <FaImage className="mb-3 text-3xl text-green-300" />
                <span className="text-sm font-bold text-green-100">
                  Upload New Background Image
                </span>
                <span className="mt-1 text-xs text-green-200/60">
                  png, jpg, jpeg, webp, svg, avif, gif
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => readBackgroundFile(e.target.files?.[0])}
                  className="mt-4"
                />
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => readBackgroundFile(e.target.files?.[0])}
                className={fileCls}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              {form.backgroundImage && !removeBackgroundImage && (
                <div className="relative overflow-hidden rounded-xl border border-green-700/30">
                  <img
                    src={fileUrl(form.backgroundImage)}
                    alt="Current background"
                    className="h-44 w-80 object-cover"
                  />

                  <div className="absolute left-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                    Current
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRemoveBackgroundImage(true);
                      clearNewBackground();
                    }}
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-red-600 p-2 text-white"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}

              {removeBackgroundImage && form.backgroundImage && (
                <div className="flex h-44 w-80 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/20 text-center text-sm font-bold text-red-200">
                  Current background image will be removed after save.
                </div>
              )}

              {backgroundPreview && (
                <div className="relative overflow-hidden rounded-xl border border-green-700/30">
                  <img
                    src={backgroundPreview}
                    alt="New background preview"
                    className="h-44 w-80 object-cover"
                  />

                  <div className="absolute left-2 top-2 rounded-full bg-green-600/90 px-3 py-1 text-xs font-bold text-white">
                    New Preview
                  </div>

                  <button
                    type="button"
                    onClick={clearNewBackground}
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/70 p-2 text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Live Preview")}

            <div
              className="relative min-h-[420px] overflow-hidden rounded-2xl border border-green-700/30 bg-black"
              style={{
                backgroundImage: `url('${
                  backgroundPreview ||
                  (!removeBackgroundImage && fileUrl(form.backgroundImage)) ||
                  "https://beit365.bet/assets/affiliate/assets/bg/India-Heo.webp"
                }')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/20" />

              <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center px-5 py-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#008f6b] via-[#7e1b14] to-[#b50000] px-6 py-1 text-xs font-bold uppercase tracking-widest">
                  <FaEye />
                  {form.unlockText.en || "UNLOCK SUCCESS"}
                </div>

                <h2 className="mt-8 max-w-4xl text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl">
                  {form.title.en || "EARN BIG UP TO 70% COMMISSION"}
                </h2>

                <p className="mt-7 max-w-4xl text-xl font-semibold uppercase md:text-3xl">
                  {form.subtitle.en || "AND EMBRACE SURPRISES WITH EFFORT!"}
                </p>

                <p className="mt-7 text-sm font-bold uppercase text-white/90 md:text-base">
                  {form.termsText.en || "*TERMS AND CONDITION APPLY"}
                </p>

                <div className="mt-10 inline-flex h-12 min-w-[200px] items-center justify-center rounded-md border border-white px-8 text-sm font-bold uppercase">
                  {form.buttonText.en || "GET STARTED"}
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            <button type="submit" disabled={saving} className={buttonPrimary}>
              <FaSave />
              {saving ? "Saving..." : "Save Hero Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroController;
