import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  FaSave,
  FaTimes,
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
  FaServer,
} from "react-icons/fa";
import { api } from "../../api/axios";

const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_PROVIDER_KEY = import.meta.env.VITE_ORACLE_TOKEN;

const initialForm = {
  categoryId: "",
  providerId: "",
  providerIcon: null,
  status: "active",
};

const AddProvider = () => {
  const [categories, setCategories] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [savedProviders, setSavedProviders] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [iconPreview, setIconPreview] = useState("");
  const [oldIconUrl, setOldIconUrl] = useState("");
  const [removeOldIcon, setRemoveOldIcon] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    providerId: "",
  });

  const isEdit = useMemo(() => !!editId, [editId]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/game-categories/admin/all");
      setCategories(res?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load categories",
      );
    }
  };

  const loadOracleProviders = async () => {
    try {
      const res = await axios.get(ORACLE_PROVIDER_API, {
        headers: {
          "x-api-key": ORACLE_PROVIDER_KEY,
        },
      });

      setOracleProviders(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load providers from API",
      );
    }
  };

  const loadSavedProviders = async (categoryId) => {
    try {
      if (!categoryId) {
        setSavedProviders([]);
        return;
      }

      setListLoading(true);
      const res = await api.get(`/api/game-providers?categoryId=${categoryId}`);
      setSavedProviders(res?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load providers");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadOracleProviders();
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      loadSavedProviders(form.categoryId);
    } else {
      setSavedProviders([]);
    }
  }, [form.categoryId]);

  useEffect(() => {
    if (form.providerIcon instanceof File) {
      const url = URL.createObjectURL(form.providerIcon);
      setIconPreview(url);

      return () => URL.revokeObjectURL(url);
    } else if (oldIconUrl) {
      setIconPreview(oldIconUrl);
    } else {
      setIconPreview("");
    }
  }, [form.providerIcon, oldIconUrl]);

  const getProviderName = (providerCode) => {
    const found = oracleProviders.find(
      (item) => String(item.providerCode) === String(providerCode),
    );
    return found?.providerName || "Unknown Provider";
  };

  const selectedCategoryName = useMemo(() => {
    const category = categories.find((item) => item._id === form.categoryId);
    return category?.categoryName?.en || "";
  }, [categories, form.categoryId]);

  const selectedProviderName = useMemo(() => {
    return getProviderName(form.providerId);
  }, [form.providerId, oracleProviders]);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setIconPreview("");
    setOldIconUrl("");
    setRemoveOldIcon(false);
  };

  const handleProviderSelect = (providerCode) => {
    setForm((prev) => ({
      ...prev,
      providerId: providerCode,
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      providerIcon: file,
    }));

    setRemoveOldIcon(false);
  };

  const handleRemoveIcon = () => {
    setForm((prev) => ({
      ...prev,
      providerIcon: null,
    }));
    setIconPreview("");

    if (oldIconUrl) {
      setRemoveOldIcon(true);
    }
  };

  const startEdit = (provider) => {
    setEditId(provider._id);
    setForm({
      categoryId: provider?.categoryId?._id || provider?.categoryId || "",
      providerId: provider?.providerId || "",
      providerIcon: null,
      status: provider?.status || "active",
    });
    setOldIconUrl(provider?.providerIconUrl || "");
    setRemoveOldIcon(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId) {
      return toast.error("Please select a category");
    }

    if (!form.providerId) {
      return toast.error("Please select a provider");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("categoryId", form.categoryId);
      fd.append("providerId", form.providerId);
      fd.append("status", form.status);

      if (form.providerIcon instanceof File) {
        fd.append("providerIcon", form.providerIcon);
      }

      if (isEdit) {
        fd.append("removeOldIcon", removeOldIcon ? "true" : "false");

        const res = await api.put(`/api/game-providers/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Provider updated successfully");
      } else {
        const res = await api.post("/api/game-providers", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Provider added successfully");
      }

      const selectedCategory = form.categoryId;
      resetForm();
      setForm((prev) => ({
        ...prev,
        categoryId: selectedCategory,
      }));
      loadSavedProviders(selectedCategory);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (provider) => {
    setDeleteModal({
      open: true,
      id: provider._id,
      providerId: provider.providerId,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
      providerId: "",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/api/game-providers/${deleteModal.id}`);
      toast.success(res?.data?.message || "Provider deleted successfully");

      if (editId === deleteModal.id) {
        resetForm();
      }

      closeDeleteModal();
      if (form.categoryId) {
        loadSavedProviders(form.categoryId);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete provider",
      );
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-green-700/40 bg-gradient-to-r from-green-700/20 via-emerald-600/10 to-green-700/20 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                <FaServer className="text-2xl text-black" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {isEdit ? "Update Game Provider" : "Add Game Provider"}
                </h1>
                <p className="text-sm text-green-200/80 mt-1">
                  Category select করে তার under এ multiple provider add করতে
                  পারবে।
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="p-4 md:p-6 lg:p-8">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
              {/* Left */}
              <div className="xl:col-span-2 space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-green-200">
                    Select Game Category
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                  >
                    <option value="">Choose category...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat?.categoryName?.en} • {cat?.categoryName?.bn}
                      </option>
                    ))}
                  </select>

                  {form.categoryId && (
                    <p className="mt-2 text-xs text-green-300/80">
                      Selected Category:{" "}
                      <span className="font-semibold text-yellow-400">
                        {selectedCategoryName}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-green-200">
                    Select Provider
                  </label>
                  <select
                    value={form.providerId}
                    onChange={(e) => handleProviderSelect(e.target.value)}
                    className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                  >
                    <option value="">Choose provider...</option>
                    {oracleProviders.map((provider) => (
                      <option
                        key={provider._id || provider.providerCode}
                        value={provider.providerCode}
                      >
                        {provider.providerName} ({provider.providerCode})
                      </option>
                    ))}
                  </select>

                  {form.providerId && (
                    <p className="mt-2 text-xs text-green-300/80">
                      Selected Provider:{" "}
                      <span className="font-semibold text-yellow-400">
                        {selectedProviderName}
                      </span>{" "}
                      • Code:{" "}
                      <span className="font-mono text-white">
                        {form.providerId}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-green-200">
                    Provider Icon
                  </label>

                  <label className="cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-green-700/50 bg-black/40 p-6 text-center hover:border-green-400 hover:bg-green-950/20 transition-all">
                    <FaImage className="text-4xl text-green-300 mb-3" />
                    <span className="text-base font-semibold text-white">
                      Click to upload provider icon
                    </span>
                    <span className="text-sm text-green-200/70 mt-1">
                      PNG, JPG, JPEG, WEBP, SVG, AVIF, GIF
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-green-200">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-bold text-black shadow-lg shadow-green-600/40 hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-60"
                  >
                    {isEdit ? <FaSave /> : <FaPlus />}
                    {loading
                      ? isEdit
                        ? "Updating..."
                        : "Adding..."
                      : isEdit
                        ? "Update Provider"
                        : "Add Provider"}
                  </button>

                  {(isEdit || iconPreview) && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-3 font-semibold text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  )}

                  {iconPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveIcon}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-3 font-semibold text-yellow-300 hover:bg-yellow-500/20 transition-all"
                    >
                      Remove Icon
                    </button>
                  )}
                </div>
              </div>

              {/* Right Preview */}
              <div className="xl:col-span-1">
                <div className="sticky top-6 rounded-3xl border border-green-700/40 bg-black/40 p-5">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Live Preview
                  </h3>

                  <div className="rounded-3xl bg-gradient-to-br from-green-950/20 to-black border border-green-700/30 p-5">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-28 h-28 rounded-full bg-[#003F2C] flex items-center justify-center overflow-hidden border border-green-700/40">
                        {iconPreview ? (
                          <img
                            src={iconPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-4xl text-green-300/70" />
                        )}
                      </div>

                      <h4 className="mt-4 text-xl font-bold text-yellow-400">
                        {selectedProviderName !== "Unknown Provider"
                          ? selectedProviderName
                          : "Provider Name"}
                      </h4>

                      <p className="text-sm text-green-200/80 mt-1">
                        {form.providerId || "Provider Code"}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1 text-sm text-green-300">
                          {selectedCategoryName || "No Category"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-sm border ${
                            form.status === "active"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-red-500/15 border-red-500/30 text-red-300"
                          }`}
                        >
                          {form.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="border-t border-green-700/40 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-xl md:text-2xl font-bold">
                Saved Providers
                {form.categoryId && (
                  <span className="text-green-300/80 ml-2">
                    ({selectedCategoryName})
                  </span>
                )}
              </h2>

              {form.categoryId && (
                <button
                  type="button"
                  onClick={() => loadSavedProviders(form.categoryId)}
                  className="cursor-pointer rounded-2xl border border-green-700/40 bg-black/40 px-5 py-2.5 text-sm font-semibold text-green-200 hover:bg-green-950/20 transition-all"
                >
                  Refresh List
                </button>
              )}
            </div>

            {!form.categoryId ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                Select a category to view or add providers
              </div>
            ) : listLoading ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                Loading providers...
              </div>
            ) : savedProviders.length === 0 ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                No providers found in this category
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {savedProviders.map((provider) => (
                  <div
                    key={provider._id}
                    className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-[#003F2C] overflow-hidden flex items-center justify-center border border-green-700/40 shrink-0">
                        {provider.providerIconUrl ? (
                          <img
                            src={provider.providerIconUrl}
                            alt={provider.providerId}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-3xl text-green-300/70" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-yellow-400 truncate">
                          {getProviderName(provider.providerId)}
                        </h3>
                        <p className="text-sm text-green-200/80 mt-1 truncate font-mono">
                          {provider.providerId}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1 text-xs text-green-300">
                            {provider?.categoryId?.categoryName?.en ||
                              "Category"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs border ${
                              provider.status === "active"
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                : "bg-red-500/15 border-red-500/30 text-red-300"
                            }`}
                          >
                            {provider.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(provider)}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-bold text-black hover:from-green-400 hover:to-emerald-400 transition-all"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(provider)}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-bold text-red-300 hover:bg-red-500/20 transition-all"
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
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-gradient-to-br from-black via-red-950/10 to-black p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white">Confirm Delete</h3>
            <p className="mt-3 text-red-200/90">
              তুমি কি নিশ্চিত{" "}
              <span className="font-semibold text-white">
                {deleteModal.providerId}
              </span>{" "}
              provider delete করতে চাও?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={confirmDelete}
                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-500 transition-all"
              >
                <FaTrash />
                Yes, Delete
              </button>

              <button
                onClick={closeDeleteModal}
                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-green-700/40 bg-black/50 px-5 py-3 font-semibold text-white hover:bg-green-950/20 transition-all"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProvider;
