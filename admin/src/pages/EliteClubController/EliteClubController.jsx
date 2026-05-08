import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaImage,
  FaTimes,
  FaCrown,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textAreaCls =
  "w-full min-h-[100px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

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
  "";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const createTextPair = (obj = {}) => ({
  bn: obj?.bn || "",
  en: obj?.en || "",
});

const EliteClubController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: { bn: "", en: "" },
    subtitle: { bn: "", en: "" },
    backgroundImage: "",
    backgroundImageUrl: "",
    crestImage: "",
    crestImageUrl: "",
    isActive: true,
  });

  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [removeBackgroundImage, setRemoveBackgroundImage] = useState(false);

  const [crestFile, setCrestFile] = useState(null);
  const [crestPreview, setCrestPreview] = useState("");
  const [removeCrestImage, setRemoveCrestImage] = useState(false);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-elite-club-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load elite club content");
      }

      const doc = data?.data || {};

      setForm({
        title: createTextPair(doc.title),
        subtitle: createTextPair(doc.subtitle),
        backgroundImage: doc.backgroundImage || "",
        backgroundImageUrl: /^https?:\/\//i.test(doc.backgroundImage || "")
          ? doc.backgroundImage
          : "",
        crestImage: doc.crestImage || "",
        crestImageUrl: /^https?:\/\//i.test(doc.crestImage || "")
          ? doc.crestImage
          : "",
        isActive: doc.isActive !== false,
      });

      setBackgroundFile(null);
      setBackgroundPreview("");
      setRemoveBackgroundImage(false);

      setCrestFile(null);
      setCrestPreview("");
      setRemoveCrestImage(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load elite club content",
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

  const readFile = (file, type) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === "background") {
        setBackgroundFile(file);
        setBackgroundPreview(reader.result);
        setRemoveBackgroundImage(false);
      }

      if (type === "crest") {
        setCrestFile(file);
        setCrestPreview(reader.result);
        setRemoveCrestImage(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const saveContent = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("titleBn", form.title.bn);
      payload.append("titleEn", form.title.en);

      payload.append("subtitleBn", form.subtitle.bn);
      payload.append("subtitleEn", form.subtitle.en);

      payload.append("backgroundImageUrl", form.backgroundImageUrl || "");
      payload.append("crestImageUrl", form.crestImageUrl || "");

      payload.append("removeBackgroundImage", String(removeBackgroundImage));
      payload.append("removeCrestImage", String(removeCrestImage));
      payload.append("isActive", String(form.isActive));

      if (backgroundFile) {
        payload.append("backgroundImage", backgroundFile);
      }

      if (crestFile) {
        payload.append("crestImage", crestFile);
      }

      const { data } = await api.put(
        "/api/aff-elite-club-content/admin",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update elite club content");
      }

      toast.success("Elite Club content updated successfully");
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update elite club content",
      );
    } finally {
      setSaving(false);
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaCrown />
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

  const activeBackground =
    backgroundPreview ||
    (!removeBackgroundImage && fileUrl(form.backgroundImage)) ||
    "";

  const activeCrest =
    crestPreview || (!removeCrestImage && fileUrl(form.crestImage)) || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/15 to-black p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div
          className={`${cardBase} flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between`}
        >
          <div>
            <h1 className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
              Elite Club Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage affiliate Elite Club text, background image and crest
              image.
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

        <form onSubmit={saveContent} className="space-y-6">
          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Section Settings")}

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
                Elite Club section active
              </span>
            </label>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Text Content")}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <div className="text-sm font-bold text-green-300">Title</div>

                <input
                  type="text"
                  value={form.title.bn}
                  onChange={(e) => setTextField("title", "bn", e.target.value)}
                  placeholder="Title Bangla"
                  className={inputCls}
                />

                <input
                  type="text"
                  value={form.title.en}
                  onChange={(e) => setTextField("title", "en", e.target.value)}
                  placeholder="Title English"
                  className={inputCls}
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-bold text-green-300">Subtitle</div>

                <textarea
                  value={form.subtitle.bn}
                  onChange={(e) =>
                    setTextField("subtitle", "bn", e.target.value)
                  }
                  placeholder="Subtitle Bangla"
                  className={textAreaCls}
                />

                <textarea
                  value={form.subtitle.en}
                  onChange={(e) =>
                    setTextField("subtitle", "en", e.target.value)
                  }
                  placeholder="Subtitle English"
                  className={textAreaCls}
                />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Images")}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-green-700/30 bg-black/40 p-4">
                <div className="mb-3 flex items-center gap-2 font-bold text-green-200">
                  <FaImage />
                  Background Image
                </div>

                <div className="overflow-hidden rounded-xl border border-green-700/30 bg-black/50">
                  {activeBackground ? (
                    <img
                      src={activeBackground}
                      alt="Background"
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-green-200/60">
                      No image
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      readFile(e.target.files?.[0], "background")
                    }
                    className={fileCls}
                  />

                  <input
                    type="text"
                    value={form.backgroundImageUrl}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        backgroundImageUrl: e.target.value,
                      }))
                    }
                    placeholder="Or paste external background image URL"
                    className={inputCls}
                  />

                  <label className="inline-flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={removeBackgroundImage}
                      onChange={(e) => {
                        setRemoveBackgroundImage(e.target.checked);
                        if (e.target.checked) {
                          setBackgroundFile(null);
                          setBackgroundPreview("");
                        }
                      }}
                      className="h-5 w-5 cursor-pointer accent-red-500"
                    />
                    <span className="text-sm font-bold text-red-100">
                      Remove background image
                    </span>
                  </label>

                  {backgroundPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setBackgroundFile(null);
                        setBackgroundPreview("");
                      }}
                      className={buttonDanger}
                    >
                      <FaTimes />
                      Clear new preview
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-green-700/30 bg-black/40 p-4">
                <div className="mb-3 flex items-center gap-2 font-bold text-green-200">
                  <FaCrown />
                  Crest Image
                </div>

                <div className="overflow-hidden rounded-xl border border-green-700/30 bg-black/50">
                  {activeCrest ? (
                    <img
                      src={activeCrest}
                      alt="Crest"
                      className="h-56 w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-green-200/60">
                      No image
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => readFile(e.target.files?.[0], "crest")}
                    className={fileCls}
                  />

                  <input
                    type="text"
                    value={form.crestImageUrl}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        crestImageUrl: e.target.value,
                      }))
                    }
                    placeholder="Or paste external crest image URL"
                    className={inputCls}
                  />

                  <label className="inline-flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={removeCrestImage}
                      onChange={(e) => {
                        setRemoveCrestImage(e.target.checked);
                        if (e.target.checked) {
                          setCrestFile(null);
                          setCrestPreview("");
                        }
                      }}
                      className="h-5 w-5 cursor-pointer accent-red-500"
                    />
                    <span className="text-sm font-bold text-red-100">
                      Remove crest image
                    </span>
                  </label>

                  {crestPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setCrestFile(null);
                        setCrestPreview("");
                      }}
                      className={buttonDanger}
                    >
                      <FaTimes />
                      Clear new preview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Live Preview")}

            <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-black">
              {activeBackground && (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('${activeBackground}')`,
                  }}
                />
              )}

              <div className="relative z-10 flex min-h-[430px] flex-col items-center justify-center px-5 py-10 text-center">
                {activeCrest && (
                  <img
                    src={activeCrest}
                    alt="Crest preview"
                    className="mb-5 h-auto w-[180px] object-contain"
                  />
                )}

                <h2
                  className="text-[56px] font-normal uppercase leading-none text-[#d4aa12] sm:text-[72px]"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", Times, serif',
                  }}
                >
                  {form.title.en || "ELITE CLUB"}
                </h2>

                <p className="mt-5 max-w-[520px] text-lg font-semibold text-white/80">
                  {form.subtitle.en ||
                    "Premium privileges specially for our elites."}
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            <button type="submit" disabled={saving} className={buttonPrimary}>
              <FaSave />
              {saving ? "Saving..." : "Save Elite Club Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EliteClubController;
