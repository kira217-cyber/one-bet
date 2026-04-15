import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaLink,
  FaImage,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AddAffSocialLink = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    url: "",
    order: 0,
    isActive: true,
    icon: null,
  });

  const [preview, setPreview] = useState("");
  const [existingIcon, setExistingIcon] = useState("");

  const fetchAffSocialLinks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/aff-social-link");
      const allItems = Array.isArray(res?.data?.data?.items)
        ? res.data.data.items
        : [];
      setItems(allItems);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to load affiliate social links",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffSocialLinks();
  }, []);

  useEffect(() => {
    if (!form.icon) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(form.icon);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.icon]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if ((a?.order ?? 0) !== (b?.order ?? 0)) {
        return (a?.order ?? 0) - (b?.order ?? 0);
      }
      return String(b?._id || "").localeCompare(String(a?._id || ""));
    });
  }, [items]);

  const resetForm = () => {
    setForm({
      url: "",
      order: 0,
      isActive: true,
      icon: null,
    });
    setPreview("");
    setExistingIcon("");
    setEditingId(null);

    const fileInput = document.getElementById("aff-social-icon-input");
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setForm((prev) => ({
      ...prev,
      isActive: value,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      icon: file,
    }));
  };

  const validateForm = () => {
    if (!form.url.trim()) {
      toast.error("Affiliate social link URL is required");
      return false;
    }

    if (!editingId && !form.icon) {
      toast.error("Affiliate social icon is required");
      return false;
    }

    if (editingId && !form.icon && !existingIcon) {
      toast.error("Affiliate social icon is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("url", form.url.trim());
      payload.append("order", Number(form.order || 0));
      payload.append("isActive", String(form.isActive));

      if (form.icon) {
        payload.append("icon", form.icon);
      }

      if (editingId) {
        const res = await api.put(
          `/api/admin/aff-social-link/${editingId}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        toast.success(
          res?.data?.message || "Affiliate social link updated successfully",
        );
      } else {
        const res = await api.post("/api/admin/aff-social-link", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(
          res?.data?.message || "Affiliate social link added successfully",
        );
      }

      resetForm();
      fetchAffSocialLinks();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to save affiliate social link",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setExistingIcon(
      item?.iconUrl
        ? item.iconUrl.startsWith("http")
          ? item.iconUrl
          : `${import.meta.env.VITE_APP_URL}${item.iconUrl}`
        : "",
    );
    setPreview("");
    setForm({
      url: item?.url || "",
      order: item?.order ?? 0,
      isActive: !!item?.isActive,
      icon: null,
    });

    const fileInput = document.getElementById("aff-social-icon-input");
    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this affiliate social link?",
    );
    if (!ok) return;

    try {
      const res = await api.delete(`/api/admin/aff-social-link/${id}`);
      toast.success(
        res?.data?.message || "Affiliate social link deleted successfully",
      );

      if (editingId === id) {
        resetForm();
      }

      fetchAffSocialLinks();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete affiliate social link",
      );
    }
  };

  const handleQuickToggle = async (item) => {
    try {
      const payload = new FormData();
      payload.append("url", item?.url || "");
      payload.append("order", Number(item?.order || 0));
      payload.append("isActive", String(!item?.isActive));

      const res = await api.put(
        `/api/admin/aff-social-link/${item._id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(res?.data?.message || "Status updated successfully");
      fetchAffSocialLinks();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update affiliate social link status",
      );
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-400 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              Affiliate Social Link Controller
            </h1>
            <p className="mt-1 text-sm text-green-200/80 md:text-base">
              Add, edit, delete and manage affiliate floating social icons.
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-black/40 px-4 py-3 shadow-lg shadow-green-900/20 backdrop-blur-md">
            <p className="text-sm text-green-200/80">Total Social Icons</p>
            <p className="text-2xl font-bold text-white">{items.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-green-600/30 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20"
          >
            <div className="border-b border-green-600/20 bg-gradient-to-r from-green-600/20 to-emerald-500/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                  <FaLink className="text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">
                    {editingId
                      ? "Edit Affiliate Social Link"
                      : "Add New Affiliate Social Link"}
                  </h2>
                  <p className="text-sm text-green-200/80">
                    Upload icon and set affiliate target URL.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Social Icon
                </label>

                <label
                  htmlFor="aff-social-icon-input"
                  className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-500/30 bg-black/40 px-4 py-6 text-center transition hover:border-green-400/60 hover:bg-green-950/20"
                >
                  {preview || existingIcon ? (
                    <div className="w-full">
                      <img
                        src={preview || existingIcon}
                        alt="Affiliate Social Icon Preview"
                        className="mx-auto h-36 w-full rounded-2xl object-contain"
                      />
                      <p className="mt-3 text-sm text-green-200/80">
                        Click to change icon
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-300 transition group-hover:scale-105">
                        <FaImage />
                      </div>
                      <p className="text-base font-semibold text-white">
                        Click to upload affiliate social icon
                      </p>
                      <p className="mt-1 text-sm text-green-200/70">
                        PNG, JPG, JPEG, WEBP, SVG, AVIF, GIF
                      </p>
                    </>
                  )}
                </label>

                <input
                  id="aff-social-icon-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  URL
                </label>
                <input
                  type="text"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://wa.me/... or https://t.me/..."
                  className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-100">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    min="0"
                    value={form.order}
                    onChange={handleChange}
                    placeholder="Enter order"
                    className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-100">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(true)}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        form.isActive
                          ? "bg-emerald-500 text-black"
                          : "border border-green-600/30 bg-black/40 text-white"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(false)}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        !form.isActive
                          ? "bg-red-500 text-white"
                          : "border border-green-600/30 bg-black/40 text-white"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 font-semibold text-black shadow-lg shadow-green-700/20 transition hover:from-green-400 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {editingId ? "Updating..." : "Saving..."}
                    </>
                  ) : editingId ? (
                    <>
                      <FaSave />
                      Update Affiliate Social Link
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Affiliate Social Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-black/40 px-5 py-3 font-semibold text-white transition hover:bg-green-900/20"
                >
                  <FaTimes />
                  Reset
                </button>
              </div>
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
                All Affiliate Social Links
              </h2>
              <p className="mt-1 text-sm text-green-200/80">
                Manage all affiliate social icons from here.
              </p>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-black/40 px-5 py-4 text-green-200">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Loading affiliate social links...</span>
                  </div>
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-green-500/20 bg-black/30 px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-300">
                    <FaLink />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    No affiliate social links found
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-green-200/70">
                    Add your first affiliate social icon from the form.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {sortedItems.map((item) => {
                    const iconSrc = item?.iconUrl
                      ? item.iconUrl.startsWith("http")
                        ? item.iconUrl
                        : `${import.meta.env.VITE_APP_URL}${item.iconUrl}`
                      : "";

                    return (
                      <div
                        key={item._id}
                        className="overflow-hidden rounded-3xl border border-green-600/20 bg-black/40 shadow-lg shadow-green-900/10 transition hover:border-green-500/40"
                      >
                        <div className="relative flex h-44 items-center justify-center bg-black/60 p-6">
                          {iconSrc ? (
                            <img
                              src={iconSrc}
                              alt="affiliate-social-icon"
                              className="h-20 w-20 object-contain"
                            />
                          ) : (
                            <div className="text-green-300">
                              <FaImage className="text-4xl" />
                            </div>
                          )}

                          <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                            Order: {item.order ?? 0}
                          </div>

                          <div
                            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                              item.isActive
                                ? "bg-emerald-500 text-black"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item.isActive ? "active" : "inactive"}
                          </div>
                        </div>

                        <div className="space-y-4 p-4">
                          <div className="rounded-2xl border border-green-500/15 bg-green-950/10 p-3">
                            <p className="text-xs text-green-200/60">URL</p>
                            <p className="mt-1 break-all text-sm font-medium text-white">
                              {item?.url || "-"}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2.5 text-sm font-semibold text-black transition hover:from-green-400 hover:to-emerald-400"
                            >
                              <FaEdit />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickToggle(item)}
                              className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                                item.isActive
                                  ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                  : "bg-blue-500 text-white hover:bg-blue-400"
                              }`}
                            >
                              {item.isActive ? (
                                <>
                                  <FaToggleOn />
                                  Off
                                </>
                              ) : (
                                <>
                                  <FaToggleOff />
                                  On
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddAffSocialLink;
