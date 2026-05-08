import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaEdit,
  FaTimes,
  FaImage,
  FaListOl,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textAreaCls =
  "w-full min-h-[105px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

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

const emptyStep = {
  _id: "",
  number: "",
  title: { bn: "", en: "" },
  description: { bn: "", en: "" },
  order: 1,
  isHighlighted: false,
  isActive: true,
};

const HowToJoinController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [form, setForm] = useState({
    title: { bn: "", en: "" },
    heroText: { bn: "", en: "" },
    buttonText: { bn: "", en: "" },
    image: "",
    imageUrl: "",
    steps: [],
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const [stepForm, setStepForm] = useState(emptyStep);

  const sortedSteps = useMemo(() => {
    return [...(form.steps || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [form.steps]);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-how-to-join-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load how to join content");
      }

      const doc = data?.data || {};

      setForm({
        title: createTextPair(doc.title),
        heroText: createTextPair(doc.heroText),
        buttonText: createTextPair(doc.buttonText),
        image: doc.image || "",
        imageUrl: /^https?:\/\//i.test(doc.image || "") ? doc.image : "",
        steps: Array.isArray(doc.steps) ? doc.steps : [],
        isActive: doc.isActive !== false,
      });

      setImageFile(null);
      setImagePreview("");
      setRemoveImage(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load how to join content",
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

  const setStepText = (field, lang, value) => {
    setStepForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const readImage = (file) => {
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    setImageFile(file);
    setRemoveImage(false);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetStepForm = () => {
    setStepForm({
      ...emptyStep,
      order: Number(form.steps?.length || 0) + 1,
    });
  };

  const editStep = (step) => {
    setStepForm({
      _id: step._id || "",
      number: step.number || "",
      title: createTextPair(step.title),
      description: createTextPair(step.description),
      order: Number(step.order || 0),
      isHighlighted: step.isHighlighted === true,
      isActive: step.isActive !== false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSection = async (e) => {
    e.preventDefault();

    try {
      setSavingSection(true);

      const payload = new FormData();

      payload.append("titleBn", form.title.bn);
      payload.append("titleEn", form.title.en);

      payload.append("heroTextBn", form.heroText.bn);
      payload.append("heroTextEn", form.heroText.en);

      payload.append("buttonTextBn", form.buttonText.bn);
      payload.append("buttonTextEn", form.buttonText.en);

      payload.append("imageUrl", form.imageUrl || "");
      payload.append("removeImage", String(removeImage));
      payload.append("isActive", String(form.isActive));

      if (imageFile) {
        payload.append("image", imageFile);
      }

      const { data } = await api.put(
        "/api/aff-how-to-join-content/admin",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update section");
      }

      toast.success("How To Join section updated successfully");
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update section",
      );
    } finally {
      setSavingSection(false);
    }
  };

  const saveStep = async (e) => {
    e.preventDefault();

    try {
      setSavingStep(true);

      const payload = {
        number: stepForm.number,
        titleBn: stepForm.title.bn,
        titleEn: stepForm.title.en,
        descriptionBn: stepForm.description.bn,
        descriptionEn: stepForm.description.en,
        order: String(stepForm.order || 0),
        isHighlighted: String(stepForm.isHighlighted),
        isActive: String(stepForm.isActive),
      };

      const isEdit = Boolean(stepForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-how-to-join-content/admin/steps/${stepForm._id}`,
            payload,
          )
        : await api.post("/api/aff-how-to-join-content/admin/steps", payload);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save step");
      }

      toast.success(
        isEdit ? "Step updated successfully" : "Step created successfully",
      );
      resetStepForm();
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save step",
      );
    } finally {
      setSavingStep(false);
    }
  };

  const deleteStep = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this step?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const { data } = await api.delete(
        `/api/aff-how-to-join-content/admin/steps/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete step");
      }

      toast.success("Step deleted successfully");

      if (stepForm._id === id) resetStepForm();

      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete step",
      );
    } finally {
      setDeletingId("");
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaListOl />
      {title}
    </h2>
  );

  const activeImage =
    imagePreview || (!removeImage && fileUrl(form.image)) || "";

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
              How To Join Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage affiliate How To Join section, image and steps.
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

        <form onSubmit={saveSection} className="space-y-6">
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
                How To Join section active
              </span>
            </label>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Text Content")}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                ["title", "Title"],
                ["heroText", "Hero Text"],
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
            {sectionTitle("Main Image")}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => readImage(e.target.files?.[0])}
                  className={fileCls}
                />

                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="Or paste external image URL"
                  className={inputCls}
                />

                <label className="inline-flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => {
                      setRemoveImage(e.target.checked);
                      if (e.target.checked) {
                        setImageFile(null);
                        setImagePreview("");
                      }
                    }}
                    className="h-5 w-5 cursor-pointer accent-red-500"
                  />
                  <span className="text-sm font-bold text-red-100">
                    Remove current image
                  </span>
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className={buttonDanger}
                  >
                    <FaTimes />
                    Clear new preview
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-green-700/30 bg-black/40">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt="How to join"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-green-200/60">
                    <FaImage className="mr-2" />
                    No image
                  </div>
                )}

                <div className="p-3 text-xs font-bold text-green-200/70">
                  {imagePreview ? "New Preview" : "Current Image"}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={savingSection}
                className={buttonPrimary}
              >
                <FaSave />
                {savingSection ? "Saving..." : "Save Section Content"}
              </button>
            </div>
          </div>
        </form>

        <form onSubmit={saveStep} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(stepForm._id ? "Update Step" : "Create Step")}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">
                Step Number
              </div>

              <input
                type="text"
                value={stepForm.number}
                onChange={(e) =>
                  setStepForm((prev) => ({
                    ...prev,
                    number: e.target.value,
                  }))
                }
                placeholder="01"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Order</div>

              <input
                type="number"
                value={stepForm.order}
                onChange={(e) =>
                  setStepForm((prev) => ({
                    ...prev,
                    order: e.target.value,
                  }))
                }
                placeholder="Order"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Step Title</div>

              <input
                type="text"
                value={stepForm.title.bn}
                onChange={(e) => setStepText("title", "bn", e.target.value)}
                placeholder="Title Bangla"
                className={inputCls}
              />

              <input
                type="text"
                value={stepForm.title.en}
                onChange={(e) => setStepText("title", "en", e.target.value)}
                placeholder="Title English"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Status</div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={stepForm.isHighlighted}
                  onChange={(e) =>
                    setStepForm((prev) => ({
                      ...prev,
                      isHighlighted: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-yellow-500"
                />
                <span className="text-sm font-bold text-yellow-100">
                  Highlighted step
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={stepForm.isActive}
                  onChange={(e) =>
                    setStepForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span className="text-sm font-bold text-green-100">
                  Step active
                </span>
              </label>
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="text-sm font-bold text-green-300">
                Step Description
              </div>

              <textarea
                value={stepForm.description.bn}
                onChange={(e) =>
                  setStepText("description", "bn", e.target.value)
                }
                placeholder="Description Bangla"
                className={textAreaCls}
              />

              <textarea
                value={stepForm.description.en}
                onChange={(e) =>
                  setStepText("description", "en", e.target.value)
                }
                placeholder="Description English"
                className={textAreaCls}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingStep}
              className={buttonPrimary}
            >
              {stepForm._id ? <FaSave /> : <FaPlus />}
              {savingStep
                ? "Saving..."
                : stepForm._id
                  ? "Update Step"
                  : "Create Step"}
            </button>

            {stepForm._id && (
              <button
                type="button"
                onClick={resetStepForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Steps (${sortedSteps.length})`)}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedSteps.map((step) => (
              <div
                key={step._id}
                className={`rounded-2xl border p-4 ${
                  step.isHighlighted
                    ? "border-yellow-500/40 bg-yellow-950/20"
                    : "border-green-700/30 bg-black/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-4xl font-extrabold text-[#d8b067]">
                      {step.number || "00"}
                    </div>

                    <h3 className="mt-2 font-extrabold text-white">
                      {step.title?.en || "No English Title"}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-green-100/75">
                      {step.title?.bn || "No Bangla Title"}
                    </p>

                    <p className="mt-2 text-xs text-green-200/60">
                      Order: {step.order || 0}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      step.isActive !== false
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {step.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/70">
                  {step.description?.en ||
                    step.description?.bn ||
                    "No description"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editStep(step)}
                    className={buttonGhost}
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteStep(step._id)}
                    disabled={deletingId === step._id}
                    className={buttonDanger}
                  >
                    <FaTrash />
                    {deletingId === step._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}

            {!sortedSteps.length && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 text-yellow-100">
                No steps found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToJoinController;
