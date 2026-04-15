import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaImage,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AddSlider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    order: 0,
    status: "active",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/sliders");
      setSliders(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load sliders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    if (!form.image) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(form.image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  const sortedSliders = useMemo(() => {
    return [...sliders].sort((a, b) => {
      if ((a?.order ?? 0) !== (b?.order ?? 0)) {
        return (a?.order ?? 0) - (b?.order ?? 0);
      }
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });
  }, [sliders]);

  const resetForm = () => {
    setForm({
      order: 0,
      status: "active",
      image: null,
    });
    setPreview("");
    setExistingImage("");
    setEditingId(null);

    const fileInput = document.getElementById("slider-image-input");
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? value : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const validateForm = () => {
    if (!editingId && !form.image) {
      toast.error("Slider image is required");
      return false;
    }

    if (editingId && !form.image && !existingImage) {
      toast.error("Slider image is required");
      return false;
    }

    if (!["active", "inactive"].includes(form.status)) {
      toast.error("Invalid status");
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
      payload.append("order", Number(form.order || 0));
      payload.append("status", form.status);

      if (form.image) {
        payload.append("image", form.image);
      }

      if (editingId) {
        const res = await api.put(`/api/admin/sliders/${editingId}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(res?.data?.message || "Slider updated successfully");
      } else {
        const res = await api.post("/api/admin/sliders", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(res?.data?.message || "Slider created successfully");
      }

      resetForm();
      fetchSliders();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save slider");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setExistingImage(item.image || "");
    setPreview("");
    setForm({
      order: item.order ?? 0,
      status: item.status || "active",
      image: null,
    });

    const fileInput = document.getElementById("slider-image-input");
    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this slider?");
    if (!ok) return;

    try {
      const res = await api.delete(`/api/admin/sliders/${id}`);
      toast.success(res?.data?.message || "Slider deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchSliders();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete slider");
    }
  };

  const handleQuickStatusToggle = async (item) => {
    try {
      const payload = new FormData();
      payload.append("order", Number(item.order || 0));
      payload.append(
        "status",
        item.status === "active" ? "inactive" : "active",
      );

      const res = await api.put(`/api/admin/sliders/${item._id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res?.data?.message || "Status updated");
      fetchSliders();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-400 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              Slider Controller
            </h1>
            <p className="mt-1 text-sm text-green-200/80 md:text-base">
              Add, preview, edit, delete and manage client site sliders.
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-black/40 px-4 py-3 shadow-lg shadow-green-900/20 backdrop-blur-md">
            <p className="text-sm text-green-200/80">Total Sliders</p>
            <p className="text-2xl font-bold text-white">{sliders.length}</p>
          </div>
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
                  <FaImage className="text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">
                    {editingId ? "Edit Slider" : "Add New Slider"}
                  </h2>
                  <p className="text-sm text-green-200/80">
                    Upload slider image and control visibility.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Slider Image
                </label>

                <label
                  htmlFor="slider-image-input"
                  className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-500/30 bg-black/40 px-4 py-6 text-center transition hover:border-green-400/60 hover:bg-green-950/20"
                >
                  {preview || existingImage ? (
                    <div className="w-full">
                      <img
                        src={preview || existingImage}
                        alt="Slider Preview"
                        className="mx-auto h-48 w-full rounded-2xl object-contain"
                      />
                      <p className="mt-3 text-sm text-green-200/80">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-300 transition group-hover:scale-105">
                        <FaImage />
                      </div>
                      <p className="text-base font-semibold text-white">
                        Click to upload slider image
                      </p>
                      <p className="mt-1 text-sm text-green-200/70">
                        PNG, JPG, JPEG, WEBP, SVG, AVIF, GIF
                      </p>
                      <p className="mt-1 text-xs text-green-200/50">
                        Max file size: 10MB
                      </p>
                    </>
                  )}
                </label>

                <input
                  id="slider-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
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
                    placeholder="Enter slider order"
                    className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-100">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                  >
                    <option value="active" className="bg-black">
                      Active
                    </option>
                    <option value="inactive" className="bg-black">
                      Inactive
                    </option>
                  </select>
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
                      Update Slider
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Slider
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
                All Sliders
              </h2>
              <p className="mt-1 text-sm text-green-200/80">
                Manage all slider images from here.
              </p>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-black/40 px-5 py-4 text-green-200">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Loading sliders...</span>
                  </div>
                </div>
              ) : sortedSliders.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-green-500/20 bg-black/30 px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-300">
                    <FaImage />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    No sliders found
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-green-200/70">
                    Add your first slider from the form. Active sliders will be
                    shown on the client site.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {sortedSliders.map((item, index) => (
                    <div
                      key={item._id}
                      className="overflow-hidden rounded-3xl border border-green-600/20 bg-black/40 shadow-lg shadow-green-900/10 transition hover:border-green-500/40"
                    >
                      <div className="relative">
                        <img
                          src={`${import.meta.env.VITE_APP_URL}${item.image}`}
                          alt={`slider-${index}`}
                          className="h-44 w-full bg-black object-contain"
                        />

                        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          Order: {item.order ?? 0}
                        </div>

                        <div
                          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                            item.status === "active"
                              ? "bg-emerald-500 text-black"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {item.status}
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-green-500/15 bg-green-950/10 p-3">
                            <p className="text-xs text-green-200/60">Created</p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-green-500/15 bg-green-950/10 p-3">
                            <p className="text-xs text-green-200/60">Status</p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {item.status}
                            </p>
                          </div>
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
                            onClick={() => handleQuickStatusToggle(item)}
                            className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                              item.status === "active"
                                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                : "bg-blue-500 text-white hover:bg-blue-400"
                            }`}
                          >
                            {item.status === "active" ? (
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
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddSlider;
