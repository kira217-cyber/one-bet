import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaSave, FaSyncAlt, FaTrash, FaImage, FaTimes } from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textAreaCls =
  "w-full min-h-[110px] rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const fileCls =
  "w-full rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white outline-none";

const buttonPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-black/40 hover:bg-green-900/20 border border-green-700/40 text-green-100 transition";

const createTextPair = (obj = {}) => ({
  bn: obj?.bn || "",
  en: obj?.en || "",
});

const FooterController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    paymentTitle: { bn: "", en: "" },
    responsibleTitle: { bn: "", en: "" },
    communityTitle: { bn: "", en: "" },
    licenseTitle: { bn: "", en: "" },
    appDownloadTitle: { bn: "", en: "" },
    descriptionHeading: { bn: "", en: "" },
    descriptionText1: { bn: "", en: "" },
    descriptionText2: { bn: "", en: "" },
    descriptionText3: { bn: "", en: "" },
    bottomHeading: { bn: "", en: "" },
    bottomCopyright: { bn: "", en: "" },
    appDownloadLink: "",
    paymentImages: [],
    responsibleImages: [],
    communityImages: [],
    licenseImage: "",
    appDownloadImage: "",
  });

  const [newPaymentFiles, setNewPaymentFiles] = useState([]);
  const [newResponsibleFiles, setNewResponsibleFiles] = useState([]);
  const [newCommunityFiles, setNewCommunityFiles] = useState([]);
  const [newLicenseFile, setNewLicenseFile] = useState(null);
  const [newAppDownloadFile, setNewAppDownloadFile] = useState(null);

  const [paymentPreview, setPaymentPreview] = useState([]);
  const [responsiblePreview, setResponsiblePreview] = useState([]);
  const [communityPreview, setCommunityPreview] = useState([]);
  const [licensePreview, setLicensePreview] = useState("");
  const [appDownloadPreview, setAppDownloadPreview] = useState("");

  const [removePaymentImages, setRemovePaymentImages] = useState([]);
  const [removeResponsibleImages, setRemoveResponsibleImages] = useState([]);
  const [removeCommunityImages, setRemoveCommunityImages] = useState([]);
  const [removeLicenseImage, setRemoveLicenseImage] = useState(false);
  const [removeAppDownloadImage, setRemoveAppDownloadImage] = useState(false);

  const fetchFooterContent = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/admin/footer-content");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load footer content");
      }

      const doc = data?.data || {};

      setForm({
        paymentTitle: createTextPair(doc.paymentTitle),
        responsibleTitle: createTextPair(doc.responsibleTitle),
        communityTitle: createTextPair(doc.communityTitle),
        licenseTitle: createTextPair(doc.licenseTitle),
        appDownloadTitle: createTextPair(doc.appDownloadTitle),
        descriptionHeading: createTextPair(doc.descriptionHeading),
        descriptionText1: createTextPair(doc.descriptionText1),
        descriptionText2: createTextPair(doc.descriptionText2),
        descriptionText3: createTextPair(doc.descriptionText3),
        bottomHeading: createTextPair(doc.bottomHeading),
        bottomCopyright: createTextPair(doc.bottomCopyright),
        appDownloadLink: doc.appDownloadLink || "",
        paymentImages: Array.isArray(doc.paymentImages)
          ? doc.paymentImages
          : [],
        responsibleImages: Array.isArray(doc.responsibleImages)
          ? doc.responsibleImages
          : [],
        communityImages: Array.isArray(doc.communityImages)
          ? doc.communityImages
          : [],
        licenseImage: doc.licenseImage || "",
        appDownloadImage: doc.appDownloadImage || "",
      });

      setNewPaymentFiles([]);
      setNewResponsibleFiles([]);
      setNewCommunityFiles([]);
      setNewLicenseFile(null);
      setNewAppDownloadFile(null);

      setPaymentPreview([]);
      setResponsiblePreview([]);
      setCommunityPreview([]);
      setLicensePreview("");
      setAppDownloadPreview("");

      setRemovePaymentImages([]);
      setRemoveResponsibleImages([]);
      setRemoveCommunityImages([]);
      setRemoveLicenseImage(false);
      setRemoveAppDownloadImage(false);
    } catch (error) {
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
    fetchFooterContent();
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

  const appendMultipleFiles = (
    files,
    currentFiles,
    setFiles,
    currentPreview,
    setPreview,
  ) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;

    const nextFiles = [...currentFiles, ...arr];
    setFiles(nextFiles);

    Promise.all(
      arr.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve({
                id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
                url: reader.result,
                name: file.name,
                file,
              });
            reader.readAsDataURL(file);
          }),
      ),
    ).then((results) => {
      setPreview([...currentPreview, ...results]);
    });
  };

  const removeNewPreviewItem = (
    previewId,
    previews,
    setPreviews,
    files,
    setFiles,
  ) => {
    const found = previews.find((item) => item.id === previewId);
    if (!found) return;

    setPreviews(previews.filter((item) => item.id !== previewId));
    setFiles(files.filter((file) => file !== found.file));
  };

  const readSingleFile = (file, setterFile, setterPreview) => {
    if (!file) {
      setterFile(null);
      setterPreview("");
      return;
    }
    setterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setterPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleRemoveFromList = (path, list, setList) => {
    if (list.includes(path)) {
      setList(list.filter((i) => i !== path));
    } else {
      setList([...list, path]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("paymentTitleBn", form.paymentTitle.bn);
      payload.append("paymentTitleEn", form.paymentTitle.en);
      payload.append("responsibleTitleBn", form.responsibleTitle.bn);
      payload.append("responsibleTitleEn", form.responsibleTitle.en);
      payload.append("communityTitleBn", form.communityTitle.bn);
      payload.append("communityTitleEn", form.communityTitle.en);
      payload.append("licenseTitleBn", form.licenseTitle.bn);
      payload.append("licenseTitleEn", form.licenseTitle.en);
      payload.append("appDownloadTitleBn", form.appDownloadTitle.bn);
      payload.append("appDownloadTitleEn", form.appDownloadTitle.en);
      payload.append("descriptionHeadingBn", form.descriptionHeading.bn);
      payload.append("descriptionHeadingEn", form.descriptionHeading.en);
      payload.append("descriptionText1Bn", form.descriptionText1.bn);
      payload.append("descriptionText1En", form.descriptionText1.en);
      payload.append("descriptionText2Bn", form.descriptionText2.bn);
      payload.append("descriptionText2En", form.descriptionText2.en);
      payload.append("descriptionText3Bn", form.descriptionText3.bn);
      payload.append("descriptionText3En", form.descriptionText3.en);
      payload.append("bottomHeadingBn", form.bottomHeading.bn);
      payload.append("bottomHeadingEn", form.bottomHeading.en);
      payload.append("bottomCopyrightBn", form.bottomCopyright.bn);
      payload.append("bottomCopyrightEn", form.bottomCopyright.en);
      payload.append("appDownloadLink", form.appDownloadLink || "");

      payload.append(
        "removePaymentImages",
        JSON.stringify(removePaymentImages),
      );
      payload.append(
        "removeResponsibleImages",
        JSON.stringify(removeResponsibleImages),
      );
      payload.append(
        "removeCommunityImages",
        JSON.stringify(removeCommunityImages),
      );
      payload.append("removeLicenseImage", String(removeLicenseImage));
      payload.append("removeAppDownloadImage", String(removeAppDownloadImage));

      newPaymentFiles.forEach((file) => payload.append("paymentImages", file));
      newResponsibleFiles.forEach((file) =>
        payload.append("responsibleImages", file),
      );
      newCommunityFiles.forEach((file) =>
        payload.append("communityImages", file),
      );

      if (newLicenseFile) payload.append("licenseImage", newLicenseFile);
      if (newAppDownloadFile)
        payload.append("appDownloadImage", newAppDownloadFile);

      const { data } = await api.put("/api/admin/footer-content", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update footer content");
      }

      toast.success("Footer content updated successfully");
      fetchFooterContent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update footer content",
      );
    } finally {
      setSaving(false);
    }
  };

  const fileUrl = (path) =>
    path ? `${import.meta.env.VITE_APP_URL}${path}` : "";

  const sectionTitle = (title) => (
    <h2 className="text-lg font-extrabold text-green-200 mb-4">{title}</h2>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 text-white bg-gradient-to-br from-black via-green-950/15 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="h-40 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 text-white bg-gradient-to-br from-black via-green-950/15 to-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <div
          className={`${cardBase} p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Footer Controller
            </h1>
            <p className="mt-2 text-sm text-green-200/70">
              Manage all footer texts and images from admin panel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchFooterContent(true)}
            disabled={refreshing}
            className={buttonGhost}
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Titles")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                ["paymentTitle", "Payment Title"],
                ["responsibleTitle", "Responsible Title"],
                ["communityTitle", "Community Title"],
                ["licenseTitle", "License Title"],
                ["appDownloadTitle", "App Download Title"],
                ["descriptionHeading", "Description Heading"],
                ["bottomHeading", "Bottom Heading"],
                ["bottomCopyright", "Bottom Copyright"],
              ].map(([field, label]) => (
                <div key={field} className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    {label}
                  </div>
                  <input
                    type="text"
                    value={form[field].bn}
                    onChange={(e) => setTextField(field, "bn", e.target.value)}
                    placeholder={`${label} (Bangla)`}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={form[field].en}
                    onChange={(e) => setTextField(field, "en", e.target.value)}
                    placeholder={`${label} (English)`}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Description Paragraphs")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                ["descriptionText1", "Description Text 1"],
                ["descriptionText2", "Description Text 2"],
                ["descriptionText3", "Description Text 3"],
              ].map(([field, label]) => (
                <div key={field} className="space-y-3">
                  <div className="text-sm font-bold text-green-300">
                    {label}
                  </div>
                  <textarea
                    value={form[field].bn}
                    onChange={(e) => setTextField(field, "bn", e.target.value)}
                    placeholder={`${label} (Bangla)`}
                    className={textAreaCls}
                  />
                  <textarea
                    value={form[field].en}
                    onChange={(e) => setTextField(field, "en", e.target.value)}
                    placeholder={`${label} (English)`}
                    className={textAreaCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("App Download Link")}
            <input
              type="text"
              value={form.appDownloadLink}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  appDownloadLink: e.target.value,
                }))
              }
              placeholder="https://example.com/app-download"
              className={inputCls}
            />
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Payment Images")}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                appendMultipleFiles(
                  e.target.files,
                  newPaymentFiles,
                  setNewPaymentFiles,
                  paymentPreview,
                  setPaymentPreview,
                )
              }
              className={fileCls}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {(form.paymentImages || []).map((img) => (
                <div
                  key={img}
                  className="relative border border-green-700/30 rounded-xl overflow-hidden"
                >
                  <img
                    src={fileUrl(img)}
                    alt=""
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      toggleRemoveFromList(
                        img,
                        removePaymentImages,
                        setRemovePaymentImages,
                      )
                    }
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      removePaymentImages.includes(img)
                        ? "bg-red-600"
                        : "bg-black/70"
                    }`}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              {paymentPreview.map((img) => (
                <div
                  key={img.id}
                  className="relative border border-green-700/30 rounded-xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeNewPreviewItem(
                        img.id,
                        paymentPreview,
                        setPaymentPreview,
                        newPaymentFiles,
                        setNewPaymentFiles,
                      )
                    }
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Responsible Gaming Images")}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                appendMultipleFiles(
                  e.target.files,
                  newResponsibleFiles,
                  setNewResponsibleFiles,
                  responsiblePreview,
                  setResponsiblePreview,
                )
              }
              className={fileCls}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {(form.responsibleImages || []).map((img) => (
                <div
                  key={img}
                  className="relative border border-green-700/30 rounded-xl overflow-hidden"
                >
                  <img
                    src={fileUrl(img)}
                    alt=""
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      toggleRemoveFromList(
                        img,
                        removeResponsibleImages,
                        setRemoveResponsibleImages,
                      )
                    }
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      removeResponsibleImages.includes(img)
                        ? "bg-red-600"
                        : "bg-black/70"
                    }`}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              {responsiblePreview.map((img) => (
                <div
                  key={img.id}
                  className="relative border border-green-700/30 rounded-xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeNewPreviewItem(
                        img.id,
                        responsiblePreview,
                        setResponsiblePreview,
                        newResponsibleFiles,
                        setNewResponsibleFiles,
                      )
                    }
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("Community Images")}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                appendMultipleFiles(
                  e.target.files,
                  newCommunityFiles,
                  setNewCommunityFiles,
                  communityPreview,
                  setCommunityPreview,
                )
              }
              className={fileCls}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {(form.communityImages || []).map((img) => (
                <div
                  key={img}
                  className="relative border border-green-700/30 rounded-xl overflow-hidden"
                >
                  <img
                    src={fileUrl(img)}
                    alt=""
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      toggleRemoveFromList(
                        img,
                        removeCommunityImages,
                        setRemoveCommunityImages,
                      )
                    }
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      removeCommunityImages.includes(img)
                        ? "bg-red-600"
                        : "bg-black/70"
                    }`}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              {communityPreview.map((img) => (
                <div
                  key={img.id}
                  className="relative border border-green-700/30 rounded-xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeNewPreviewItem(
                        img.id,
                        communityPreview,
                        setCommunityPreview,
                        newCommunityFiles,
                        setNewCommunityFiles,
                      )
                    }
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("License Image")}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                readSingleFile(
                  e.target.files?.[0],
                  setNewLicenseFile,
                  setLicensePreview,
                )
              }
              className={fileCls}
            />

            <div className="mt-5 flex gap-4 flex-wrap">
              {form.licenseImage && !removeLicenseImage && (
                <div className="relative border border-green-700/30 rounded-xl overflow-hidden">
                  <img
                    src={fileUrl(form.licenseImage)}
                    alt=""
                    className="w-52 h-28 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveLicenseImage(true)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}

              {licensePreview && (
                <div className="border border-green-700/30 rounded-xl overflow-hidden">
                  <img
                    src={licensePreview}
                    alt=""
                    className="w-52 h-28 object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            {sectionTitle("App Download Image")}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                readSingleFile(
                  e.target.files?.[0],
                  setNewAppDownloadFile,
                  setAppDownloadPreview,
                )
              }
              className={fileCls}
            />

            <div className="mt-5 flex gap-4 flex-wrap">
              {form.appDownloadImage && !removeAppDownloadImage && (
                <div className="relative border border-green-700/30 rounded-xl overflow-hidden">
                  <img
                    src={fileUrl(form.appDownloadImage)}
                    alt=""
                    className="w-52 h-28 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveAppDownloadImage(true)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}

              {appDownloadPreview && (
                <div className="border border-green-700/30 rounded-xl overflow-hidden">
                  <img
                    src={appDownloadPreview}
                    alt=""
                    className="w-52 h-28 object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className={`${cardBase} p-5 sm:p-6`}>
            <button type="submit" disabled={saving} className={buttonPrimary}>
              <FaSave />
              {saving ? "Saving..." : "Save Footer Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FooterController;
