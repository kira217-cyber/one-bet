import React, { useEffect, useMemo, useState } from "react";
import {
  FaSave,
  FaSyncAlt,
  FaImage,
  FaTrash,
  FaExternalLinkAlt,
  FaPlay,
  FaGlobe,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const cardBase =
  "rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-black via-cyan-950/10 to-black shadow-[0_0_40px_rgba(6,182,212,0.08)]";

const inputCls =
  "w-full rounded-2xl border border-cyan-500/20 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

const textareaCls =
  "w-full min-h-[120px] rounded-2xl border border-cyan-500/20 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

const sectionTitle =
  "mb-5 text-lg font-extrabold uppercase tracking-wide text-cyan-200";

const buttonPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

const buttonDanger =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20";

const getImageUrl = (path = "") => {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const API =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_REACT_APP_BACKEND_API2 ||
    "http://localhost:5002";

  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
};

const CommissionController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [removeLeftBackgroundImage, setRemoveLeftBackgroundImage] =
    useState(false);

  const [removeGrowthImage, setRemoveGrowthImage] = useState(false);

  const [removeCountryFlagImage, setRemoveCountryFlagImage] = useState(false);

  const [leftBackgroundImageFile, setLeftBackgroundImageFile] = useState(null);

  const [growthImageFile, setGrowthImageFile] = useState(null);

  const [countryFlagImageFile, setCountryFlagImageFile] = useState(null);

  const [form, setForm] = useState({
    title: { bn: "", en: "" },
    subtitle: { bn: "", en: "" },

    structureTitle: { bn: "", en: "" },

    winLossText: { bn: "", en: "" },
    bonusText: { bn: "", en: "" },
    deductionText: { bn: "", en: "" },
    paymentFeeText: { bn: "", en: "" },

    registerButtonText: { bn: "", en: "" },
    watchButtonText: { bn: "", en: "" },

    countryTitle: { bn: "", en: "" },
    countryDescription: { bn: "", en: "" },

    paymentTitle: { bn: "", en: "" },
    paymentDescription: { bn: "", en: "" },

    bonusTitle: { bn: "", en: "" },
    bonusDescription: { bn: "", en: "" },

    netProfitTitle: { bn: "", en: "" },
    netProfitDescription: { bn: "", en: "" },

    ratingText: "",

    leftBackgroundImage: "",
    growthImage: "",
    countryFlagImage: "",

    videoUrl: "",

    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/aff-commission-content/admin");

      if (data?.success && data?.data) {
        setForm(data.data);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to load commission content",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updatePair = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const imagePreviewData = useMemo(() => {
    return {
      leftBackgroundImage: leftBackgroundImageFile
        ? URL.createObjectURL(leftBackgroundImageFile)
        : getImageUrl(form.leftBackgroundImage),

      growthImage: growthImageFile
        ? URL.createObjectURL(growthImageFile)
        : getImageUrl(form.growthImage),

      countryFlagImage: countryFlagImageFile
        ? URL.createObjectURL(countryFlagImageFile)
        : getImageUrl(form.countryFlagImage),
    };
  }, [
    form.leftBackgroundImage,
    form.growthImage,
    form.countryFlagImage,

    leftBackgroundImageFile,
    growthImageFile,
    countryFlagImageFile,
  ]);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("titleBn", form.title.bn || "");
      formData.append("titleEn", form.title.en || "");

      formData.append("subtitleBn", form.subtitle.bn || "");
      formData.append("subtitleEn", form.subtitle.en || "");

      formData.append("structureTitleBn", form.structureTitle.bn || "");

      formData.append("structureTitleEn", form.structureTitle.en || "");

      formData.append("winLossTextBn", form.winLossText.bn || "");
      formData.append("winLossTextEn", form.winLossText.en || "");

      formData.append("bonusTextBn", form.bonusText.bn || "");
      formData.append("bonusTextEn", form.bonusText.en || "");

      formData.append("deductionTextBn", form.deductionText.bn || "");

      formData.append("deductionTextEn", form.deductionText.en || "");

      formData.append("paymentFeeTextBn", form.paymentFeeText.bn || "");

      formData.append("paymentFeeTextEn", form.paymentFeeText.en || "");

      formData.append("registerButtonTextBn", form.registerButtonText.bn || "");

      formData.append("registerButtonTextEn", form.registerButtonText.en || "");

      formData.append("watchButtonTextBn", form.watchButtonText.bn || "");

      formData.append("watchButtonTextEn", form.watchButtonText.en || "");

      formData.append("countryTitleBn", form.countryTitle.bn || "");

      formData.append("countryTitleEn", form.countryTitle.en || "");

      formData.append("countryDescriptionBn", form.countryDescription.bn || "");

      formData.append("countryDescriptionEn", form.countryDescription.en || "");

      formData.append("paymentTitleBn", form.paymentTitle.bn || "");

      formData.append("paymentTitleEn", form.paymentTitle.en || "");

      formData.append("paymentDescriptionBn", form.paymentDescription.bn || "");

      formData.append("paymentDescriptionEn", form.paymentDescription.en || "");

      formData.append("bonusTitleBn", form.bonusTitle.bn || "");

      formData.append("bonusTitleEn", form.bonusTitle.en || "");

      formData.append("bonusDescriptionBn", form.bonusDescription.bn || "");

      formData.append("bonusDescriptionEn", form.bonusDescription.en || "");

      formData.append("netProfitTitleBn", form.netProfitTitle.bn || "");

      formData.append("netProfitTitleEn", form.netProfitTitle.en || "");

      formData.append(
        "netProfitDescriptionBn",
        form.netProfitDescription.bn || "",
      );

      formData.append(
        "netProfitDescriptionEn",
        form.netProfitDescription.en || "",
      );

      formData.append("ratingText", form.ratingText || "");
      formData.append("videoUrl", form.videoUrl || "");

      formData.append("isActive", String(form.isActive));

      formData.append(
        "removeLeftBackgroundImage",
        String(removeLeftBackgroundImage),
      );

      formData.append("removeGrowthImage", String(removeGrowthImage));

      formData.append("removeCountryFlagImage", String(removeCountryFlagImage));

      if (leftBackgroundImageFile) {
        formData.append("leftBackgroundImage", leftBackgroundImageFile);
      }

      if (growthImageFile) {
        formData.append("growthImage", growthImageFile);
      }

      if (countryFlagImageFile) {
        formData.append("countryFlagImage", countryFlagImageFile);
      }

      const { data } = await api.put(
        "/api/aff-commission-content/admin",
        formData,
      );

      if (data?.success) {
        toast.success("Commission content updated successfully");

        setRemoveLeftBackgroundImage(false);
        setRemoveGrowthImage(false);
        setRemoveCountryFlagImage(false);

        setLeftBackgroundImageFile(null);
        setGrowthImageFile(null);
        setCountryFlagImageFile(null);

        fetchData();
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to update commission content",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div
          className={`${cardBase} flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between`}
        >
          <div>
            <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-extrabold uppercase tracking-wide text-transparent">
              Commission Controller
            </h1>

            <p className="mt-2 text-sm text-cyan-100/60">
              Manage affiliate commission section content, images and video.
            </p>
          </div>

          <button type="button" onClick={fetchData} className={buttonPrimary}>
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className={`${cardBase} p-6`}>
            <div className={sectionTitle}>Section Status</div>

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
                className="h-5 w-5"
              />

              <span className="font-semibold text-cyan-100">
                Commission Section Active
              </span>
            </label>
          </div>

          {/* TITLE */}
          <div className={`${cardBase} p-6`}>
            <div className={sectionTitle}>Main Content</div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-cyan-200">
                  Title Bangla
                </label>

                <input
                  type="text"
                  value={form.title?.bn || ""}
                  onChange={(e) => updatePair("title", "bn", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-cyan-200">
                  Title English
                </label>

                <input
                  type="text"
                  value={form.title?.en || ""}
                  onChange={(e) => updatePair("title", "en", e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-cyan-200">
                  Subtitle Bangla
                </label>

                <textarea
                  value={form.subtitle?.bn || ""}
                  onChange={(e) => updatePair("subtitle", "bn", e.target.value)}
                  className={textareaCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-cyan-200">
                  Subtitle English
                </label>

                <textarea
                  value={form.subtitle?.en || ""}
                  onChange={(e) => updatePair("subtitle", "en", e.target.value)}
                  className={textareaCls}
                />
              </div>
            </div>
          </div>

          {/* IMAGES */}
          <div className={`${cardBase} p-6`}>
            <div className={sectionTitle}>Images & Media</div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* BG IMAGE */}
              <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                <div className="mb-4 flex items-center gap-2 text-cyan-200">
                  <FaImage />
                  <span className="font-bold">Background Image</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-cyan-500/20">
                  <img
                    src={imagePreviewData.leftBackgroundImage}
                    alt="Background"
                    className="h-[200px] w-full object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setLeftBackgroundImageFile(e.target.files?.[0] || null)
                  }
                  className="mt-4 w-full text-sm"
                />

                <label className="mt-4 inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={removeLeftBackgroundImage}
                    onChange={(e) =>
                      setRemoveLeftBackgroundImage(e.target.checked)
                    }
                  />
                  Remove Image
                </label>
              </div>

              {/* GROWTH */}
              <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                <div className="mb-4 flex items-center gap-2 text-cyan-200">
                  <FaImage />
                  <span className="font-bold">Growth Image</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-cyan-500/20">
                  <img
                    src={imagePreviewData.growthImage}
                    alt="Growth"
                    className="h-[200px] w-full object-contain bg-black"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setGrowthImageFile(e.target.files?.[0] || null)
                  }
                  className="mt-4 w-full text-sm"
                />

                <label className="mt-4 inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={removeGrowthImage}
                    onChange={(e) => setRemoveGrowthImage(e.target.checked)}
                  />
                  Remove Image
                </label>
              </div>

              {/* FLAG */}
              <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                <div className="mb-4 flex items-center gap-2 text-cyan-200">
                  <FaGlobe />
                  <span className="font-bold">Country Flag</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-cyan-500/20">
                  <img
                    src={imagePreviewData.countryFlagImage}
                    alt="Flag"
                    className="h-[200px] w-full object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCountryFlagImageFile(e.target.files?.[0] || null)
                  }
                  className="mt-4 w-full text-sm"
                />

                <label className="mt-4 inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={removeCountryFlagImage}
                    onChange={(e) =>
                      setRemoveCountryFlagImage(e.target.checked)
                    }
                  />
                  Remove Image
                </label>
              </div>
            </div>
          </div>

          {/* VIDEO */}
          <div className={`${cardBase} p-6`}>
            <div className={sectionTitle}>Video & Rating</div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-200">
                  <FaPlay />
                  Video URL
                </label>

                <input
                  type="text"
                  value={form.videoUrl || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      videoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://youtube.com/..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-200">
                  <FaExternalLinkAlt />
                  Rating Text
                </label>

                <input
                  type="text"
                  value={form.ratingText || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ratingText: e.target.value,
                    }))
                  }
                  placeholder="(396)"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-6`}>
            <div className="flex flex-wrap gap-4">
              <button type="submit" disabled={saving} className={buttonPrimary}>
                <FaSave />

                {saving ? "Saving..." : "Save Commission Content"}
              </button>

              <button
                type="button"
                onClick={fetchData}
                className={buttonDanger}
              >
                <FaTrash />
                Reset Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionController;
