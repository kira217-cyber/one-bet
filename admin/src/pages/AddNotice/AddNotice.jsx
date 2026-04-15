import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBullhorn,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AddNotice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    text_bn: "",
    text_en: "",
    order: 0,
    status: "active",
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/notices");
      setNotices(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const sortedNotices = useMemo(() => {
    return [...notices].sort((a, b) => {
      if ((a?.order ?? 0) !== (b?.order ?? 0)) {
        return (a?.order ?? 0) - (b?.order ?? 0);
      }
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });
  }, [notices]);

  const resetForm = () => {
    setForm({
      text_bn: "",
      text_en: "",
      order: 0,
      status: "active",
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? value : value,
    }));
  };

  const validateForm = () => {
    if (!form.text_bn.trim()) {
      toast.error("Bangla notice is required");
      return false;
    }

    if (!form.text_en.trim()) {
      toast.error("English notice is required");
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

      const payload = {
        text_bn: form.text_bn.trim(),
        text_en: form.text_en.trim(),
        order: Number(form.order || 0),
        status: form.status,
      };

      if (editingId) {
        const res = await api.put(`/api/admin/notices/${editingId}`, payload);
        toast.success(res?.data?.message || "Notice updated successfully");
      } else {
        const res = await api.post("/api/admin/notices", payload);
        toast.success(res?.data?.message || "Notice created successfully");
      }

      resetForm();
      fetchNotices();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      text_bn: item?.text?.bn || "",
      text_en: item?.text?.en || "",
      order: item?.order ?? 0,
      status: item?.status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this notice?");
    if (!ok) return;

    try {
      const res = await api.delete(`/api/admin/notices/${id}`);
      toast.success(res?.data?.message || "Notice deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchNotices();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete notice");
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-400 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              Notice Controller
            </h1>
            <p className="mt-1 text-sm text-green-200/80 md:text-base">
              Add, edit and delete Bangla and English notices.
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-black/40 px-4 py-3 shadow-lg shadow-green-900/20 backdrop-blur-md">
            <p className="text-sm text-green-200/80">Total Notices</p>
            <p className="text-2xl font-bold text-white">{notices.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-green-600/30 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20"
          >
            <div className="border-b border-green-600/20 bg-gradient-to-r from-green-600/20 to-emerald-500/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                  <FaBullhorn className="text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">
                    {editingId ? "Edit Notice" : "Add New Notice"}
                  </h2>
                  <p className="text-sm text-green-200/80">
                    Manage Bangla and English notice text.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Bangla Notice
                </label>
                <textarea
                  name="text_bn"
                  value={form.text_bn}
                  onChange={handleChange}
                  rows={5}
                  placeholder="বাংলা নোটিশ লিখুন"
                  className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  English Notice
                </label>
                <textarea
                  name="text_en"
                  value={form.text_en}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write English notice"
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
                    className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
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
                      Update Notice
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Notice
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
                All Notices
              </h2>
              <p className="mt-1 text-sm text-green-200/80">
                Manage all notice texts from here.
              </p>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-black/40 px-5 py-4 text-green-200">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Loading notices...</span>
                  </div>
                </div>
              ) : sortedNotices.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-green-500/20 bg-black/30 px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-300">
                    <FaBullhorn />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    No notices found
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-green-200/70">
                    Add your first notice from the form.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedNotices.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-3xl border border-green-600/20 bg-black/40 p-4 shadow-lg shadow-green-900/10 transition hover:border-green-500/40"
                    >
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-green-300/70">
                              Bangla
                            </p>
                            <p className="mt-1 text-sm leading-6 text-white">
                              {item?.text?.bn || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-green-300/70">
                              English
                            </p>
                            <p className="mt-1 text-sm leading-6 text-white">
                              {item?.text?.en || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                            Order: {item?.order ?? 0}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item?.status === "active"
                                ? "bg-emerald-500 text-black"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item?.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-2xl border border-green-500/15 bg-green-950/10 p-3">
                          <p className="text-xs text-green-200/60">Created</p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-green-500/15 bg-green-950/10 p-3">
                          <p className="text-xs text-green-200/60">Updated</p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {item.updatedAt
                              ? new Date(item.updatedAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

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
                          onClick={() => handleDelete(item._id)}
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                        >
                          <FaTrash />
                          Delete
                        </button>
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

export default AddNotice;
