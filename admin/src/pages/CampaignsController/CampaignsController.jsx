import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaImage,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textAreaCls =
  "w-full min-h-[90px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const fileCls =
  "w-full rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white outline-none";

const buttonPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-black/40 hover:bg-green-900/20 border border-green-700/40 text-green-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonDanger =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const API_URL = import.meta.env.VITE_APP_URL || "";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const createTextPair = (obj = {}) => ({
  bn: obj?.bn || "",
  en: obj?.en || "",
});

const emptyCampaign = {
  _id: "",
  title: { bn: "", en: "" },
  date: { bn: "", en: "" },
  image: "",
  imageUrl: "",
  order: 1,
  isActive: true,
};

const CampaignsController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [form, setForm] = useState({
    heading: { bn: "", en: "" },
    moreDetailsText: { bn: "", en: "" },
    signUpText: { bn: "", en: "" },
    isActive: true,
    campaigns: [],
  });

  const [campaignForm, setCampaignForm] = useState(emptyCampaign);
  const [campaignImageFile, setCampaignImageFile] = useState(null);
  const [campaignPreview, setCampaignPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const fetchCampaignContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-campaign-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load campaign content");
      }

      const doc = data?.data || {};

      setForm({
        heading: createTextPair(doc.heading),
        moreDetailsText: createTextPair(doc.moreDetailsText),
        signUpText: createTextPair(doc.signUpText),
        isActive: doc.isActive !== false,
        campaigns: Array.isArray(doc.campaigns) ? doc.campaigns : [],
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load campaign content",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaignContent();
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

  const setCampaignText = (field, lang, value) => {
    setCampaignForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const readCampaignImage = (file) => {
    if (!file) {
      setCampaignImageFile(null);
      setCampaignPreview("");
      return;
    }

    setCampaignImageFile(file);
    setRemoveImage(false);

    const reader = new FileReader();
    reader.onloadend = () => setCampaignPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      ...emptyCampaign,
      order: Number(form.campaigns?.length || 0) + 1,
    });
    setCampaignImageFile(null);
    setCampaignPreview("");
    setRemoveImage(false);
  };

  const editCampaign = (item) => {
    setCampaignForm({
      _id: item._id,
      title: createTextPair(item.title),
      date: createTextPair(item.date),
      image: item.image || "",
      imageUrl: /^https?:\/\//i.test(item.image || "") ? item.image : "",
      order: Number(item.order || 0),
      isActive: item.isActive !== false,
    });

    setCampaignImageFile(null);
    setCampaignPreview("");
    setRemoveImage(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveHeader = async () => {
    try {
      setSavingHeader(true);

      const payload = {
        headingBn: form.heading.bn,
        headingEn: form.heading.en,
        moreDetailsTextBn: form.moreDetailsText.bn,
        moreDetailsTextEn: form.moreDetailsText.en,
        signUpTextBn: form.signUpText.bn,
        signUpTextEn: form.signUpText.en,
        isActive: String(form.isActive),
      };

      const { data } = await api.put(
        "/api/aff-campaign-content/admin",
        payload,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update content");
      }

      toast.success("Campaign section updated successfully");
      fetchCampaignContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update content",
      );
    } finally {
      setSavingHeader(false);
    }
  };

  const saveCampaign = async (e) => {
    e.preventDefault();

    try {
      setSavingCampaign(true);

      const payload = new FormData();

      payload.append("titleBn", campaignForm.title.bn);
      payload.append("titleEn", campaignForm.title.en);
      payload.append("dateBn", campaignForm.date.bn);
      payload.append("dateEn", campaignForm.date.en);
      payload.append("imageUrl", campaignForm.imageUrl || "");
      payload.append("order", String(campaignForm.order || 0));
      payload.append("isActive", String(campaignForm.isActive));
      payload.append("removeImage", String(removeImage));

      if (campaignImageFile) {
        payload.append("image", campaignImageFile);
      }

      const isEdit = Boolean(campaignForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-campaign-content/admin/campaigns/${campaignForm._id}`,
            payload,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : await api.post("/api/aff-campaign-content/admin/campaigns", payload, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save campaign");
      }

      toast.success(
        isEdit
          ? "Campaign updated successfully"
          : "Campaign created successfully",
      );
      resetCampaignForm();
      fetchCampaignContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save campaign",
      );
    } finally {
      setSavingCampaign(false);
    }
  };

  const deleteCampaign = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this campaign?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const { data } = await api.delete(
        `/api/aff-campaign-content/admin/campaigns/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete campaign");
      }

      toast.success("Campaign deleted successfully");

      if (campaignForm._id === id) resetCampaignForm();

      fetchCampaignContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete campaign",
      );
    } finally {
      setDeletingId("");
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
              Campaigns Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage affiliate campaigns text, cards and images.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCampaignContent(true)}
            disabled={refreshing}
            className={buttonGhost}
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle("Section Settings")}

          <div className="mb-5">
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
                Campaign section active
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              ["heading", "Heading"],
              ["moreDetailsText", "More Details Text"],
              ["signUpText", "Sign Up Button Text"],
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
              onClick={saveHeader}
              disabled={savingHeader}
              className={buttonPrimary}
            >
              <FaSave />
              {savingHeader ? "Saving..." : "Save Section Settings"}
            </button>
          </div>
        </div>

        <form onSubmit={saveCampaign} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            campaignForm._id ? "Update Campaign" : "Create Campaign",
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Title</div>

              <input
                type="text"
                value={campaignForm.title.bn}
                onChange={(e) => setCampaignText("title", "bn", e.target.value)}
                placeholder="Title Bangla"
                className={inputCls}
              />

              <input
                type="text"
                value={campaignForm.title.en}
                onChange={(e) => setCampaignText("title", "en", e.target.value)}
                placeholder="Title English"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Order</div>

              <input
                type="number"
                value={campaignForm.order}
                onChange={(e) =>
                  setCampaignForm((prev) => ({
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
                  checked={campaignForm.isActive}
                  onChange={(e) =>
                    setCampaignForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span className="text-sm font-bold text-green-100">
                  Campaign active
                </span>
              </label>
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="text-sm font-bold text-green-300">Date Text</div>

              <textarea
                value={campaignForm.date.bn}
                onChange={(e) => setCampaignText("date", "bn", e.target.value)}
                placeholder="Date Bangla"
                className={textAreaCls}
              />

              <textarea
                value={campaignForm.date.en}
                onChange={(e) => setCampaignText("date", "en", e.target.value)}
                placeholder="Date English"
                className={textAreaCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="text-sm font-bold text-green-300">
                Image Upload
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => readCampaignImage(e.target.files?.[0])}
                className={fileCls}
              />

              <input
                type="text"
                value={campaignForm.imageUrl}
                onChange={(e) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
                placeholder="Or paste external image URL"
                className={inputCls}
              />

              <div className="mt-4 flex flex-wrap gap-4">
                {campaignForm.image && !removeImage && (
                  <div className="relative overflow-hidden rounded-xl border border-green-700/30">
                    <img
                      src={fileUrl(campaignForm.image)}
                      alt=""
                      className="h-36 w-64 object-cover"
                    />

                    <div className="absolute left-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold">
                      Current
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRemoveImage(true);
                        setCampaignImageFile(null);
                        setCampaignPreview("");
                      }}
                      className="absolute right-2 top-2 cursor-pointer rounded-full bg-red-600 p-2 text-white"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}

                {removeImage && campaignForm.image && (
                  <div className="flex h-36 w-64 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-center text-sm font-bold text-red-200">
                    Current image will be removed after save.
                  </div>
                )}

                {campaignPreview && (
                  <div className="relative overflow-hidden rounded-xl border border-green-700/30">
                    <img
                      src={campaignPreview}
                      alt=""
                      className="h-36 w-64 object-cover"
                    />

                    <div className="absolute left-2 top-2 rounded-full bg-green-600/90 px-3 py-1 text-xs font-bold">
                      New Preview
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCampaignImageFile(null);
                        setCampaignPreview("");
                      }}
                      className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/70 p-2 text-white"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingCampaign}
              className={buttonPrimary}
            >
              {campaignForm._id ? <FaSave /> : <FaPlus />}
              {savingCampaign
                ? "Saving..."
                : campaignForm._id
                  ? "Update Campaign"
                  : "Create Campaign"}
            </button>

            {campaignForm._id && (
              <button
                type="button"
                onClick={resetCampaignForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Campaign List (${form.campaigns?.length || 0})`)}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[...(form.campaigns || [])]
              .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
              .map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-green-700/30 bg-black/45"
                >
                  <div className="relative">
                    {item.image ? (
                      <img
                        src={fileUrl(item.image)}
                        alt=""
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-green-950/20">
                        <FaImage className="text-4xl text-green-300/60" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold">
                      Order: {item.order || 0}
                    </div>

                    <div
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                        item.isActive !== false
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {item.isActive !== false ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <h3 className="text-base font-extrabold uppercase text-white">
                      {item.title?.en || "No English Title"}
                    </h3>

                    <p className="text-sm font-semibold text-green-100/80">
                      {item.title?.bn || "No Bangla Title"}
                    </p>

                    <p className="line-clamp-3 text-sm text-white/70">
                      {item.date?.en || item.date?.bn || "No date text"}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => editCampaign(item)}
                        className={buttonGhost}
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteCampaign(item._id)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsController;
