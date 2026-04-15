import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaGlobe, FaImage, FaSave, FaSpinner, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const SiteIdentityController = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title_bn: "",
    title_en: "",
    logo: null,
    favicon: null,
  });

  const [existingData, setExistingData] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");

  const fetchSiteIdentity = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/site-identity");
      const data = res?.data?.data || null;

      setExistingData(data);

      setForm({
        title_bn: data?.title?.bn || "",
        title_en: data?.title?.en || "",
        logo: null,
        favicon: null,
      });

      setLogoPreview(data?.logo || "");
      setFaviconPreview(data?.favicon || "");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load site identity",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteIdentity();
  }, []);

  useEffect(() => {
    if (!form.logo) return;
    const objectUrl = URL.createObjectURL(form.logo);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.logo]);

  useEffect(() => {
    if (!form.favicon) return;
    const objectUrl = URL.createObjectURL(form.favicon);
    setFaviconPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.favicon]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("title_bn", form.title_bn);
      payload.append("title_en", form.title_en);

      if (form.logo) {
        payload.append("logo", form.logo);
      }

      if (form.favicon) {
        payload.append("favicon", form.favicon);
      }

      const res = await api.post("/api/admin/site-identity", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res?.data?.message || "Site identity saved successfully");
      fetchSiteIdentity();

      const logoInput = document.getElementById("site-logo-input");
      const faviconInput = document.getElementById("site-favicon-input");

      if (logoInput) logoInput.value = "";
      if (faviconInput) faviconInput.value = "";
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to save site identity",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLogo = async () => {
    const ok = window.confirm("Are you sure you want to delete the logo?");
    if (!ok) return;

    try {
      const res = await api.delete("/api/admin/site-identity/logo");
      toast.success(res?.data?.message || "Logo deleted successfully");
      fetchSiteIdentity();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete logo");
    }
  };

  const handleDeleteFavicon = async () => {
    const ok = window.confirm("Are you sure you want to delete the favicon?");
    if (!ok) return;

    try {
      const res = await api.delete("/api/admin/site-identity/favicon");
      toast.success(res?.data?.message || "Favicon deleted successfully");
      fetchSiteIdentity();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete favicon");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-black/40 px-5 py-4">
          <FaSpinner className="animate-spin text-green-300" />
          <span>Loading site identity...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-400 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
            Site Identity Controller
          </h1>
          <p className="mt-1 text-sm text-green-200/80 md:text-base">
            Manage website logo, favicon and Bangla/English title.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-green-600/30 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20"
          >
            <div className="border-b border-green-600/20 bg-gradient-to-r from-green-600/20 to-emerald-500/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                  <FaGlobe className="text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">
                    Website Identity
                  </h2>
                  <p className="text-sm text-green-200/80">
                    Upload logo, favicon and titles.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Website Title Bangla
                </label>
                <input
                  type="text"
                  name="title_bn"
                  value={form.title_bn}
                  onChange={handleChange}
                  placeholder="ওয়েবসাইটের বাংলা টাইটেল লিখুন"
                  className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Website Title English
                </label>
                <input
                  type="text"
                  name="title_en"
                  value={form.title_en}
                  onChange={handleChange}
                  placeholder="Write website title in English"
                  className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-100">
                    Logo Upload
                  </label>
                  <label
                    htmlFor="site-logo-input"
                    className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-500/30 bg-black/40 px-4 py-4 text-center transition hover:border-green-400/60 hover:bg-green-950/20"
                  >
                    {logoPreview ? (
                      <img
                        src={`${import.meta.env.VITE_APP_URL}${logoPreview}`}
                        alt="Logo Preview"
                        className="h-28 w-full object-contain"
                      />
                    ) : (
                      <>
                        <FaImage className="mb-3 text-3xl text-green-300" />
                        <p className="font-semibold text-white">
                          Click to upload logo
                        </p>
                      </>
                    )}
                  </label>
                  <input
                    id="site-logo-input"
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {existingData?.logo && (
                    <button
                      type="button"
                      onClick={handleDeleteLogo}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                    >
                      <FaTrash />
                      Delete Logo
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-100">
                    Favicon Upload
                  </label>
                  <label
                    htmlFor="site-favicon-input"
                    className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-500/30 bg-black/40 px-4 py-4 text-center transition hover:border-green-400/60 hover:bg-green-950/20"
                  >
                    {faviconPreview ? (
                      <img
                        src={`${import.meta.env.VITE_APP_URL}${faviconPreview}`}
                        alt="Favicon Preview"
                        className="h-20 w-20 rounded-xl object-contain"
                      />
                    ) : (
                      <>
                        <FaImage className="mb-3 text-3xl text-green-300" />
                        <p className="font-semibold text-white">
                          Click to upload favicon
                        </p>
                      </>
                    )}
                  </label>
                  <input
                    id="site-favicon-input"
                    type="file"
                    name="favicon"
                    accept="image/*,.ico"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {existingData?.favicon && (
                    <button
                      type="button"
                      onClick={handleDeleteFavicon}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                    >
                      <FaTrash />
                      Delete Favicon
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 font-semibold text-black shadow-lg shadow-green-700/20 transition hover:from-green-400 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Site Identity
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="overflow-hidden rounded-3xl border border-green-600/30 bg-gradient-to-br from-black via-green-950/10 to-black shadow-2xl shadow-green-900/20"
          >
            <div className="border-b border-green-600/20 bg-gradient-to-r from-green-600/20 to-emerald-500/10 px-5 py-4">
              <h2 className="text-lg font-bold text-white md:text-xl">
                Current Site Identity
              </h2>
              <p className="mt-1 text-sm text-green-200/80">
                Currently saved website information.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
              <div className="rounded-3xl border border-green-600/20 bg-black/40 p-5">
                <p className="mb-3 text-sm font-semibold text-green-300">
                  Current Logo
                </p>
                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-green-500/20 bg-black/30 p-4">
                  {existingData?.logo ? (
                    <img
                      src={`${import.meta.env.VITE_APP_URL}${existingData.logo}`}
                      alt="Current Logo"
                      className="max-h-36 w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-green-200/60">
                      No logo uploaded
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-green-600/20 bg-black/40 p-5">
                <p className="mb-3 text-sm font-semibold text-green-300">
                  Current Favicon
                </p>
                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-green-500/20 bg-black/30 p-4">
                  {existingData?.favicon ? (
                    <img
                      src={`${import.meta.env.VITE_APP_URL}${existingData.favicon}`}
                      alt="Current Favicon"
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <span className="text-sm text-green-200/60">
                      No favicon uploaded
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-green-600/20 bg-black/40 p-5">
                <p className="text-sm font-semibold text-green-300">
                  Website Title Bangla
                </p>
                <p className="mt-3 text-base text-white">
                  {existingData?.title?.bn || "No Bangla title set"}
                </p>
              </div>

              <div className="rounded-3xl border border-green-600/20 bg-black/40 p-5">
                <p className="text-sm font-semibold text-green-300">
                  Website Title English
                </p>
                <p className="mt-3 text-base text-white">
                  {existingData?.title?.en || "No English title set"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SiteIdentityController;
