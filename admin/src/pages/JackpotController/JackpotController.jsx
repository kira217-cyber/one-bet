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
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textAreaCls =
  "w-full min-h-[120px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

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

const emptyCard = {
  _id: "",
  title: { bn: "", en: "" },
  description: { bn: "", en: "" },
  image: "",
  imageUrl: "",
  order: 1,
  isActive: true,
};

const JackpotController = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [savingSection, setSavingSection] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [form, setForm] = useState({
    title: { bn: "", en: "" },
    infoTitle: { bn: "", en: "" },
    infoText: { bn: "", en: "" },
    benefitsTitle: { bn: "", en: "" },
    mainImage: "",
    mainImageUrl: "",
    cards: [],
    isActive: true,
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainPreview, setMainPreview] = useState("");
  const [removeMainImage, setRemoveMainImage] = useState(false);

  const [cardForm, setCardForm] = useState(emptyCard);
  const [cardImageFile, setCardImageFile] = useState(null);
  const [cardPreview, setCardPreview] = useState("");
  const [removeCardImage, setRemoveCardImage] = useState(false);

  const sortedCards = useMemo(() => {
    return [...(form.cards || [])].sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0),
    );
  }, [form.cards]);

  const fetchContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/aff-jackpot-content/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load jackpot content");
      }

      const doc = data?.data || {};

      setForm({
        title: createTextPair(doc.title),
        infoTitle: createTextPair(doc.infoTitle),
        infoText: createTextPair(doc.infoText),
        benefitsTitle: createTextPair(doc.benefitsTitle),
        mainImage: doc.mainImage || "",
        mainImageUrl: /^https?:\/\//i.test(doc.mainImage || "")
          ? doc.mainImage
          : "",
        cards: Array.isArray(doc.cards) ? doc.cards : [],
        isActive: doc.isActive !== false,
      });

      setMainImageFile(null);
      setMainPreview("");
      setRemoveMainImage(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load jackpot content",
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

  const setCardText = (field, lang, value) => {
    setCardForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const readMainImage = (file) => {
    if (!file) {
      setMainImageFile(null);
      setMainPreview("");
      return;
    }

    setMainImageFile(file);
    setRemoveMainImage(false);

    const reader = new FileReader();
    reader.onloadend = () => setMainPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const readCardImage = (file) => {
    if (!file) {
      setCardImageFile(null);
      setCardPreview("");
      return;
    }

    setCardImageFile(file);
    setRemoveCardImage(false);

    const reader = new FileReader();
    reader.onloadend = () => setCardPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetCardForm = () => {
    setCardForm({
      ...emptyCard,
      order: Number(form.cards?.length || 0) + 1,
    });
    setCardImageFile(null);
    setCardPreview("");
    setRemoveCardImage(false);
  };

  const editCard = (card) => {
    setCardForm({
      _id: card._id || "",
      title: createTextPair(card.title),
      description: createTextPair(card.description),
      image: card.image || "",
      imageUrl: /^https?:\/\//i.test(card.image || "") ? card.image : "",
      order: Number(card.order || 0),
      isActive: card.isActive !== false,
    });

    setCardImageFile(null);
    setCardPreview("");
    setRemoveCardImage(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSection = async (e) => {
    e.preventDefault();

    try {
      setSavingSection(true);

      const payload = new FormData();

      payload.append("titleBn", form.title.bn);
      payload.append("titleEn", form.title.en);

      payload.append("infoTitleBn", form.infoTitle.bn);
      payload.append("infoTitleEn", form.infoTitle.en);

      payload.append("infoTextBn", form.infoText.bn);
      payload.append("infoTextEn", form.infoText.en);

      payload.append("benefitsTitleBn", form.benefitsTitle.bn);
      payload.append("benefitsTitleEn", form.benefitsTitle.en);

      payload.append("mainImageUrl", form.mainImageUrl || "");
      payload.append("removeMainImage", String(removeMainImage));
      payload.append("isActive", String(form.isActive));

      if (mainImageFile) {
        payload.append("mainImage", mainImageFile);
      }

      const { data } = await api.put(
        "/api/aff-jackpot-content/admin",
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save jackpot section");
      }

      toast.success("Jackpot section updated successfully");
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save jackpot section",
      );
    } finally {
      setSavingSection(false);
    }
  };

  const saveCard = async (e) => {
    e.preventDefault();

    try {
      setSavingCard(true);

      const payload = new FormData();

      payload.append("titleBn", cardForm.title.bn);
      payload.append("titleEn", cardForm.title.en);

      payload.append("descriptionBn", cardForm.description.bn);
      payload.append("descriptionEn", cardForm.description.en);

      payload.append("imageUrl", cardForm.imageUrl || "");
      payload.append("order", String(cardForm.order || 0));
      payload.append("isActive", String(cardForm.isActive));
      payload.append("removeImage", String(removeCardImage));

      if (cardImageFile) {
        payload.append("image", cardImageFile);
      }

      const isEdit = Boolean(cardForm._id);

      const { data } = isEdit
        ? await api.put(
            `/api/aff-jackpot-content/admin/cards/${cardForm._id}`,
            payload,
            { headers: { "Content-Type": "multipart/form-data" } },
          )
        : await api.post("/api/aff-jackpot-content/admin/cards", payload, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to save jackpot card");
      }

      toast.success(
        isEdit
          ? "Jackpot card updated successfully"
          : "Jackpot card created successfully",
      );

      resetCardForm();
      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save jackpot card",
      );
    } finally {
      setSavingCard(false);
    }
  };

  const deleteCard = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this card?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const { data } = await api.delete(
        `/api/aff-jackpot-content/admin/cards/${id}`,
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete jackpot card");
      }

      toast.success("Jackpot card deleted successfully");

      if (cardForm._id === id) resetCardForm();

      fetchContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete jackpot card",
      );
    } finally {
      setDeletingId("");
    }
  };

  const sectionTitle = (title) => (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-green-200">
      <FaImage />
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
              Jackpot Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage jackpot section texts, main image and benefit cards.
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
                Jackpot section active
              </span>
            </label>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                ["title", "Main Title"],
                ["infoTitle", "Info Title"],
                ["benefitsTitle", "Benefits Title"],
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

              <div className="space-y-3 md:col-span-2">
                <div className="text-sm font-bold text-green-300">
                  Info Text
                </div>

                <textarea
                  value={form.infoText.bn}
                  onChange={(e) =>
                    setTextField("infoText", "bn", e.target.value)
                  }
                  placeholder="Info Text Bangla"
                  className={textAreaCls}
                />

                <textarea
                  value={form.infoText.en}
                  onChange={(e) =>
                    setTextField("infoText", "en", e.target.value)
                  }
                  placeholder="Info Text English"
                  className={textAreaCls}
                />
              </div>
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Main Image")}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => readMainImage(e.target.files?.[0])}
                  className={fileCls}
                />

                <input
                  type="text"
                  value={form.mainImageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      mainImageUrl: e.target.value,
                    }))
                  }
                  placeholder="Or paste external main image URL"
                  className={inputCls}
                />

                <label className="inline-flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={removeMainImage}
                    onChange={(e) => {
                      setRemoveMainImage(e.target.checked);
                      if (e.target.checked) {
                        setMainImageFile(null);
                        setMainPreview("");
                      }
                    }}
                    className="h-5 w-5 cursor-pointer accent-red-500"
                  />
                  <span className="text-sm font-bold text-red-100">
                    Remove current main image
                  </span>
                </label>
              </div>

              <div className="overflow-hidden rounded-2xl border border-green-700/30 bg-black/40">
                {mainPreview ? (
                  <img
                    src={mainPreview}
                    alt="New main preview"
                    className="h-48 w-full object-cover"
                  />
                ) : form.mainImage && !removeMainImage ? (
                  <img
                    src={fileUrl(form.mainImage)}
                    alt="Main"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-green-200/60">
                    No image
                  </div>
                )}

                <div className="p-3 text-xs font-bold text-green-200/70">
                  {mainPreview ? "New Preview" : "Current Image"}
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
                {savingSection ? "Saving..." : "Save Jackpot Section"}
              </button>
            </div>
          </div>
        </form>

        <form onSubmit={saveCard} className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(
            cardForm._id ? "Update Benefit Card" : "Create Benefit Card",
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Card Title</div>

              <input
                type="text"
                value={cardForm.title.bn}
                onChange={(e) => setCardText("title", "bn", e.target.value)}
                placeholder="Card Title Bangla"
                className={inputCls}
              />

              <input
                type="text"
                value={cardForm.title.en}
                onChange={(e) => setCardText("title", "en", e.target.value)}
                placeholder="Card Title English"
                className={inputCls}
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-green-300">Order</div>

              <input
                type="number"
                value={cardForm.order}
                onChange={(e) =>
                  setCardForm((prev) => ({
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
                  checked={cardForm.isActive}
                  onChange={(e) =>
                    setCardForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span className="text-sm font-bold text-green-100">
                  Card active
                </span>
              </label>
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="text-sm font-bold text-green-300">
                Description
              </div>

              <textarea
                value={cardForm.description.bn}
                onChange={(e) =>
                  setCardText("description", "bn", e.target.value)
                }
                placeholder="Description Bangla"
                className={textAreaCls}
              />

              <textarea
                value={cardForm.description.en}
                onChange={(e) =>
                  setCardText("description", "en", e.target.value)
                }
                placeholder="Description English"
                className={textAreaCls}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="text-sm font-bold text-green-300">Card Image</div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => readCardImage(e.target.files?.[0])}
                className={fileCls}
              />

              <input
                type="text"
                value={cardForm.imageUrl}
                onChange={(e) =>
                  setCardForm((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
                placeholder="Or paste external card image URL"
                className={inputCls}
              />

              <div className="mt-4 flex flex-wrap gap-4">
                {cardForm.image && !removeCardImage && (
                  <div className="relative overflow-hidden rounded-xl border border-green-700/30">
                    <img
                      src={fileUrl(cardForm.image)}
                      alt=""
                      className="h-36 w-64 object-cover"
                    />

                    <div className="absolute left-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold">
                      Current
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRemoveCardImage(true);
                        setCardImageFile(null);
                        setCardPreview("");
                      }}
                      className="absolute right-2 top-2 cursor-pointer rounded-full bg-red-600 p-2 text-white"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}

                {removeCardImage && cardForm.image && (
                  <div className="flex h-36 w-64 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-center text-sm font-bold text-red-200">
                    Current image will be removed after save.
                  </div>
                )}

                {cardPreview && (
                  <div className="relative overflow-hidden rounded-xl border border-green-700/30">
                    <img
                      src={cardPreview}
                      alt=""
                      className="h-36 w-64 object-cover"
                    />

                    <div className="absolute left-2 top-2 rounded-full bg-green-600/90 px-3 py-1 text-xs font-bold">
                      New Preview
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCardImageFile(null);
                        setCardPreview("");
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
              disabled={savingCard}
              className={buttonPrimary}
            >
              {cardForm._id ? <FaSave /> : <FaPlus />}
              {savingCard
                ? "Saving..."
                : cardForm._id
                  ? "Update Card"
                  : "Create Card"}
            </button>

            {cardForm._id && (
              <button
                type="button"
                onClick={resetCardForm}
                className={buttonGhost}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className={`${cardBase} p-5 sm:p-6`}>
          {sectionTitle(`Benefit Cards (${sortedCards.length})`)}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedCards.map((card) => (
              <div
                key={card._id}
                className="overflow-hidden rounded-2xl border border-green-700/30 bg-black/45"
              >
                <div className="relative">
                  {card.image ? (
                    <img
                      src={fileUrl(card.image)}
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-green-950/20">
                      <FaImage className="text-4xl text-green-300/60" />
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold">
                    Order: {card.order || 0}
                  </div>

                  <div
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                      card.isActive !== false
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {card.isActive !== false ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <h3 className="text-base font-extrabold text-white">
                    {card.title?.en || "No English Title"}
                  </h3>

                  <p className="text-sm font-semibold text-green-100/80">
                    {card.title?.bn || "No Bangla Title"}
                  </p>

                  <p className="line-clamp-3 text-sm text-white/70">
                    {card.description?.en ||
                      card.description?.bn ||
                      "No description"}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => editCard(card)}
                      className={buttonGhost}
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCard(card._id)}
                      disabled={deletingId === card._id}
                      className={buttonDanger}
                    >
                      <FaTrash />
                      {deletingId === card._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!sortedCards.length && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-5 text-yellow-100">
                No cards found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotController;
