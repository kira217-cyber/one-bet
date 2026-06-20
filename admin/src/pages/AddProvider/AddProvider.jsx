import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSave,
  FaTimes,
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
  FaServer,
  FaHome,
  FaSync,
  FaSearch,
} from "react-icons/fa";
import { api } from "../../api/axios";

const initialForm = {
  categoryId: "",
  providerId: "",
  providerIcon: null,
  providerImage: null,
  isHome: false,
  status: "active",
};

const AddProvider = () => {
  const [categories, setCategories] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [savedProviders, setSavedProviders] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [iconPreview, setIconPreview] = useState("");
  const [oldIconUrl, setOldIconUrl] = useState("");
  const [removeOldIcon, setRemoveOldIcon] = useState(false);

  const [imagePreview, setImagePreview] = useState("");
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [removeOldImage, setRemoveOldImage] = useState(false);

  const [oracleSearch, setOracleSearch] = useState("");
  const [savedSearch, setSavedSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    providerId: "",
  });

  const isEdit = useMemo(() => !!editId, [editId]);

  const cleanText = (value = "") => String(value || "").trim();
  const cleanProviderCode = (value = "") => cleanText(value).toUpperCase();

  const normalizeOracleProviders = (payload) => {
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.providers)
          ? payload.providers
          : [];

    return list
      .filter(
        (item) =>
          item?.providerCode ||
          item?.providerId ||
          item?.code ||
          item?.providerName ||
          item?.name,
      )
      .map((item) => {
        const code = cleanProviderCode(
          item.providerCode || item.providerId || item.code,
        );

        return {
          ...item,
          providerCode: code,
          providerId: code,
          providerName:
            cleanText(item.providerName || item.name) || code || "Unknown",
          image: item.image || item.providerIcon || item.providerImage || "",
        };
      })
      .filter((item) => item.providerCode);
  };

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
      setOracleLoading(true);
      const res = await api.get("/api/game-providers/oracle/list");
      setOracleProviders(
        normalizeOracleProviders(res?.data?.data || res?.data),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load Oracle providers",
      );
    } finally {
      setOracleLoading(false);
    }
  };

  const loadSavedProviders = async (categoryId = form.categoryId) => {
    try {
      if (!categoryId) {
        setSavedProviders([]);
        return;
      }

      setListLoading(true);

      const res = await api.get("/api/game-providers", {
        params: {
          categoryId,
          search: savedSearch,
          limit: 200,
        },
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.categoryId, savedSearch]);

  useEffect(() => {
    if (form.providerIcon instanceof File) {
      const url = URL.createObjectURL(form.providerIcon);
      setIconPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (oldIconUrl && !removeOldIcon) {
      setIconPreview(oldIconUrl);
      return;
    }

    const selected = oracleProviders.find(
      (item) => item.providerCode === form.providerId,
    );

    if (!isEdit && selected?.image) {
      setIconPreview(selected.image);
      return;
    }

    setIconPreview("");
  }, [
    form.providerIcon,
    form.providerId,
    oldIconUrl,
    removeOldIcon,
    oracleProviders,
    isEdit,
  ]);

  useEffect(() => {
    if (form.providerImage instanceof File) {
      const url = URL.createObjectURL(form.providerImage);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (oldImageUrl && !removeOldImage) {
      setImagePreview(oldImageUrl);
      return;
    }

    const selected = oracleProviders.find(
      (item) => item.providerCode === form.providerId,
    );

    if (!isEdit && selected?.image) {
      setImagePreview(selected.image);
      return;
    }

    setImagePreview("");
  }, [
    form.providerImage,
    form.providerId,
    oldImageUrl,
    removeOldImage,
    oracleProviders,
    isEdit,
  ]);

  const getProviderName = (providerCode) => {
    const found = oracleProviders.find(
      (item) =>
        String(item.providerCode) === String(providerCode) ||
        String(item.providerId) === String(providerCode),
    );

    return found?.providerName || providerCode || "Unknown Provider";
  };

  const selectedCategoryName = useMemo(() => {
    const category = categories.find((item) => item._id === form.categoryId);
    return category?.categoryName?.en || "";
  }, [categories, form.categoryId]);

  const selectedProviderName = useMemo(() => {
    return getProviderName(form.providerId);
  }, [form.providerId, oracleProviders]);

  const filteredOracleProviders = useMemo(() => {
    const q = oracleSearch.trim().toLowerCase();

    if (!q) return [];

    return oracleProviders
      .filter((provider) => {
        const code = String(provider.providerCode || "").toLowerCase();
        const name = String(provider.providerName || "").toLowerCase();

        return code.includes(q) || name.includes(q);
      })
      .slice(0, 30);
  }, [oracleProviders, oracleSearch]);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);

    setIconPreview("");
    setOldIconUrl("");
    setRemoveOldIcon(false);

    setImagePreview("");
    setOldImageUrl("");
    setRemoveOldImage(false);
  };

  const handleProviderSelect = (providerCode) => {
    const code = cleanProviderCode(providerCode);

    setForm((prev) => ({
      ...prev,
      providerId: code,
    }));

    const selected = oracleProviders.find((item) => item.providerCode === code);

    if (selected) {
      setOracleSearch(`${selected.providerName} (${selected.providerCode})`);
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      providerIcon: file,
    }));

    setRemoveOldIcon(false);
    e.target.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      providerImage: file,
    }));

    setRemoveOldImage(false);
    e.target.value = "";
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

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      providerImage: null,
    }));

    setImagePreview("");

    if (oldImageUrl) {
      setRemoveOldImage(true);
    }
  };

  const startEdit = (provider) => {
    setEditId(provider._id);

    setForm({
      categoryId: provider?.categoryId?._id || provider?.categoryId || "",
      providerId: provider?.providerId || provider?.providerCode || "",
      providerIcon: null,
      providerImage: null,
      isHome: provider?.isHome === true,
      status: provider?.status || "active",
    });

    setOldIconUrl(provider?.providerIconUrl || "");
    setRemoveOldIcon(false);

    setOldImageUrl(provider?.providerImageUrl || "");
    setRemoveOldImage(false);

    setOracleSearch("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSyncSelectedOracle = async () => {
    if (!form.categoryId) {
      return toast.error("Please select a category first");
    }

    if (!form.providerId) {
      return toast.error("Please select a provider first");
    }

    const selected = oracleProviders.find(
      (item) => item.providerCode === form.providerId,
    );

    try {
      setSyncLoading(true);

      const res = await api.post("/api/game-providers/oracle/sync", {
        categoryId: form.categoryId,
        providers: [
          {
            providerId: form.providerId,
            providerCode: form.providerId,
            providerName: selected?.providerName || form.providerId,
            image: selected?.image || "",
          },
        ],
      });

      toast.success(res?.data?.message || "Provider synced successfully");

      const selectedCategory = form.categoryId;
      resetForm();
      setForm((prev) => ({
        ...prev,
        categoryId: selectedCategory,
      }));
      setOracleSearch("");
      loadSavedProviders(selectedCategory);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Provider sync failed");
    } finally {
      setSyncLoading(false);
    }
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
      fd.append("providerId", cleanProviderCode(form.providerId));
      fd.append("status", form.status);
      fd.append("isHome", form.isHome ? "true" : "false");

      if (form.providerIcon instanceof File) {
        fd.append("providerIcon", form.providerIcon);
      }

      if (form.providerImage instanceof File) {
        fd.append("providerImage", form.providerImage);
      }

      if (isEdit) {
        fd.append("removeOldIcon", removeOldIcon ? "true" : "false");
        fd.append("removeOldImage", removeOldImage ? "true" : "false");

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
      setOracleSearch("");
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
      providerId: provider.providerId || provider.providerCode,
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

      const deletedGames = res?.data?.data?.deletedGames;

      toast.success(
        deletedGames !== undefined
          ? `${res?.data?.message || "Provider deleted successfully"} | Deleted games: ${deletedGames}`
          : res?.data?.message || "Provider deleted successfully",
      );

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

          <div className="p-4 md:p-6 lg:p-8">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
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
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="block text-sm font-semibold text-green-200">
                      Search Oracle Provider
                    </label>

                    <button
                      type="button"
                      onClick={loadOracleProviders}
                      disabled={oracleLoading}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-green-700/40 bg-black/40 px-4 py-2 text-xs font-semibold text-green-200 hover:bg-green-950/20 transition-all disabled:opacity-60"
                    >
                      <FaSync className={oracleLoading ? "animate-spin" : ""} />
                      {oracleLoading ? "Loading..." : "Refresh Oracle"}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3">
                    <FaSearch className="text-green-300" />
                    <input
                      value={oracleSearch}
                      onChange={(e) => setOracleSearch(e.target.value)}
                      placeholder="Search provider name or code..."
                      className="w-full bg-transparent text-white outline-none placeholder:text-green-200/50"
                    />
                  </div>

                  {oracleSearch.trim() && (
                    <div className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-green-700/40 bg-black/80 p-2 shadow-2xl">
                      {filteredOracleProviders.length === 0 ? (
                        <div className="rounded-xl px-4 py-4 text-center text-sm text-green-200/70">
                          No provider found
                        </div>
                      ) : (
                        filteredOracleProviders.map((provider) => (
                          <button
                            key={provider._id || provider.providerCode}
                            type="button"
                            onClick={() =>
                              handleProviderSelect(provider.providerCode)
                            }
                            className={`cursor-pointer mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-green-950/30 ${
                              form.providerId === provider.providerCode
                                ? "border border-green-500/40 bg-green-500/10"
                                : "border border-transparent"
                            }`}
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-green-700/40 bg-[#003F2C] flex items-center justify-center">
                              {provider.image ? (
                                <img
                                  src={provider.image}
                                  alt={provider.providerName}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <FaImage className="text-xl text-green-300/70" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-yellow-400">
                                {provider.providerName}
                              </p>
                              <p className="mt-1 truncate text-xs font-mono text-green-200/80">
                                {provider.providerCode}
                              </p>
                            </div>

                            {form.providerId === provider.providerCode && (
                              <span className="rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
                                Selected
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      Provider Image
                    </label>

                    <label className="cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-700/50 bg-black/40 p-6 text-center hover:border-emerald-400 hover:bg-emerald-950/20 transition-all">
                      <FaImage className="text-4xl text-emerald-300 mb-3" />
                      <span className="text-base font-semibold text-white">
                        Click to upload provider image
                      </span>
                      <span className="text-sm text-green-200/70 mt-1">
                        PNG, JPG, JPEG, WEBP, SVG, AVIF, GIF
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-green-200">
                    Show On Home
                  </label>
                  <select
                    value={form.isHome ? "true" : "false"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isHome: e.target.value === "true",
                      }))
                    }
                    className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
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

                  {!isEdit && (
                    <button
                      type="button"
                      onClick={handleSyncSelectedOracle}
                      disabled={syncLoading}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-green-700/40 bg-black/40 px-6 py-3 font-semibold text-green-200 hover:bg-green-950/20 transition-all disabled:opacity-60"
                    >
                      <FaSync className={syncLoading ? "animate-spin" : ""} />
                      {syncLoading ? "Syncing..." : "Sync Selected Oracle"}
                    </button>
                  )}

                  {(isEdit || iconPreview || imagePreview) && (
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

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-orange-500/40 bg-orange-500/10 px-6 py-3 font-semibold text-orange-300 hover:bg-orange-500/20 transition-all"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              <div className="xl:col-span-1">
                <div className="sticky top-6 rounded-3xl border border-green-700/40 bg-black/40 p-5">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Live Preview
                  </h3>

                  <div className="rounded-3xl bg-gradient-to-br from-green-950/20 to-black border border-green-700/30 p-5">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-full h-36 rounded-3xl bg-[#003F2C] flex items-center justify-center overflow-hidden border border-green-700/40 mb-4">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Provider Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <FaImage className="text-4xl text-green-300/70" />
                        )}
                      </div>

                      <div className="w-28 h-28 rounded-full bg-[#003F2C] flex items-center justify-center overflow-hidden border border-green-700/40">
                        {iconPreview ? (
                          <img
                            src={iconPreview}
                            alt="Icon Preview"
                            className="w-full h-full object-contain"
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

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border ${
                            form.isHome
                              ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-300"
                              : "bg-slate-500/15 border-slate-500/30 text-slate-300"
                          }`}
                        >
                          <FaHome />
                          {form.isHome ? "Home" : "Not Home"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-green-700/40 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-4 mb-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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

              {form.categoryId && (
                <div className="flex items-center gap-3 rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3">
                  <FaSearch className="text-green-300" />
                  <input
                    value={savedSearch}
                    onChange={(e) => setSavedSearch(e.target.value)}
                    placeholder="Search saved provider code..."
                    className="w-full bg-transparent text-white outline-none placeholder:text-green-200/50"
                  />
                </div>
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
                    <div className="mb-4 h-32 rounded-2xl bg-[#003F2C] overflow-hidden flex items-center justify-center border border-green-700/40">
                      {provider.providerImageUrl ? (
                        <img
                          src={provider.providerImageUrl}
                          alt={provider.providerId}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaImage className="text-3xl text-green-300/70" />
                      )}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-[#003F2C] overflow-hidden flex items-center justify-center border border-green-700/40 shrink-0">
                        {provider.providerIconUrl ? (
                          <img
                            src={provider.providerIconUrl}
                            alt={provider.providerId}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <FaImage className="text-3xl text-green-300/70" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-yellow-400 truncate">
                          {getProviderName(
                            provider.providerId || provider.providerCode,
                          )}
                        </h3>

                        <p className="text-sm text-green-200/80 mt-1 truncate font-mono">
                          {provider.providerId || provider.providerCode}
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

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border ${
                              provider.isHome
                                ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-300"
                                : "bg-slate-500/15 border-slate-500/30 text-slate-300"
                            }`}
                          >
                            <FaHome />
                            {provider.isHome ? "Home" : "Not Home"}
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
                type="button"
                onClick={confirmDelete}
                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-500 transition-all"
              >
                <FaTrash />
                Yes, Delete
              </button>

              <button
                type="button"
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
