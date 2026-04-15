import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSyncAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaImage,
  FaFutbol,
} from "react-icons/fa";
import { api } from "../../api/axios";

const cardBase =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20";

const inputCls =
  "w-full h-11 rounded-xl border border-green-700/40 bg-black/50 px-4 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const textAreaCls =
  "w-full rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 text-sm text-white placeholder-green-200/35 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition";

const buttonPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 shadow-lg shadow-green-700/30 transition disabled:opacity-60 disabled:cursor-not-allowed";

const buttonGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-black/40 hover:bg-green-900/20 border border-green-700/40 text-green-100 transition disabled:opacity-60 disabled:cursor-not-allowed";

const emptyForm = {
  name_bn: "",
  name_en: "",
  gameId: "",
  order: 0,
  isActive: true,
};

const AddSports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [iconFile, setIconFile] = useState(null);
  const [preview, setPreview] = useState("");

  const isEditMode = !!editingId;

  const fetchSports = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/admin/sports");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load sports");
      }

      setList(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load sports",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSports(false);
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
    setIconFile(null);
    setPreview("");
  };

  const onChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setIconFile(null);
      setPreview("");
      return;
    }

    setIconFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onEdit = (row) => {
    setEditingId(row._id);
    setForm({
      name_bn: row?.name?.bn || "",
      name_en: row?.name?.en || "",
      gameId: row?.gameId || "",
      order: Number(row?.order || 0),
      isActive: row?.isActive !== false,
    });
    setIconFile(null);
    setPreview(
      row?.iconImage ? `${import.meta.env.VITE_API_URL}${row.iconImage}` : "",
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    if (!String(form.name_bn || "").trim()) {
      return "Bangla sport name is required";
    }
    if (!String(form.name_en || "").trim()) {
      return "English sport name is required";
    }
    if (!String(form.gameId || "").trim()) {
      return "Game ID is required";
    }
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("name_bn", String(form.name_bn || "").trim());
      payload.append("name_en", String(form.name_en || "").trim());
      payload.append("gameId", String(form.gameId || "").trim());
      payload.append("order", String(form.order || 0));
      payload.append("isActive", String(!!form.isActive));

      if (iconFile) {
        payload.append("iconImage", iconFile);
      }

      if (isEditMode) {
        const { data } = await api.put(
          `/api/admin/sports/${editingId}`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (!data?.success) {
          throw new Error(data?.message || "Failed to update sport");
        }

        toast.success("Sport updated successfully");
      } else {
        const { data } = await api.post("/api/admin/sports", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (!data?.success) {
          throw new Error(data?.message || "Failed to create sport");
        }

        toast.success("Sport created successfully");
      }

      resetForm();
      fetchSports(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this sport?");
    if (!ok) return;

    try {
      const { data } = await api.delete(`/api/admin/sports/${id}`);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete sport");
      }

      toast.success("Sport deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchSports(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Delete failed",
      );
    }
  };

  const totalSports = useMemo(() => list.length, [list]);
  const activeSports = useMemo(
    () => list.filter((item) => item.isActive !== false).length,
    [list],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/15 to-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top */}
        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Add Sports
              </h1>
              <p className="mt-2 text-sm text-green-200/70">
                Create, update and delete sports for your client site.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fetchSports(true)}
                disabled={loading || refreshing}
                className={buttonGhost}
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={resetForm}
                className={buttonPrimary}
              >
                <FaPlus />
                New Sport
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className={`${cardBase} p-5`}>
            <div className="text-sm text-green-200/70 font-semibold">
              Total Sports
            </div>
            <div className="mt-2 text-3xl font-extrabold text-white">
              {totalSports}
            </div>
          </div>

          <div className={`${cardBase} p-5`}>
            <div className="text-sm text-green-200/70 font-semibold">
              Active Sports
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-300">
              {activeSports}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`${cardBase} p-5 sm:p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <FaFutbol className="text-green-300 text-lg" />
            <h2 className="text-lg font-extrabold text-green-200">
              {isEditMode ? "Update Sport" : "Create Sport"}
            </h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Sport Name (Bangla)
                </label>
                <input
                  type="text"
                  value={form.name_bn}
                  onChange={(e) => onChange("name_bn", e.target.value)}
                  placeholder="যেমন: ফুটবল"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Sport Name (English)
                </label>
                <input
                  type="text"
                  value={form.name_en}
                  onChange={(e) => onChange("name_en", e.target.value)}
                  placeholder="e.g. Football"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Game ID
                </label>
                <input
                  type="text"
                  value={form.gameId}
                  onChange={(e) => onChange("gameId", e.target.value)}
                  placeholder="Enter game id"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => onChange("order", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Status
                </label>
                <select
                  value={String(form.isActive)}
                  onChange={(e) =>
                    onChange("isActive", e.target.value === "true")
                  }
                  className={inputCls}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-green-200/75 block mb-2">
                  Icon Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className={textAreaCls}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-32 h-32 rounded-2xl border border-green-700/30 bg-black/40 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-green-300/50">
                    <FaImage className="text-2xl" />
                    <span className="text-xs mt-2">No image</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={saving}
                  className={buttonPrimary}
                >
                  {isEditMode ? <FaSave /> : <FaPlus />}
                  {saving
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Sport"
                      : "Create Sport"}
                </button>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={buttonGhost}
                  >
                    <FaTimes />
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* List */}
        <div className={`${cardBase} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold text-green-200 mb-5">
            All Sports
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : list.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {list.map((row) => (
                <div
                  key={row._id}
                  className="rounded-2xl border border-green-700/30 bg-black/35 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl border border-green-700/30 bg-black/40 overflow-hidden flex items-center justify-center shrink-0">
                      {row.iconImage ? (
                        <img
                          src={`${import.meta.env.VITE_APP_URL}${row.iconImage}`}
                          alt={row?.name?.en || "sport"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaFutbol className="text-3xl text-green-300/60" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-extrabold text-white">
                        {row?.name?.en || "—"}
                      </div>
                      <div className="text-sm text-green-200/70 mt-1">
                        {row?.name?.bn || "—"}
                      </div>
                      <div className="text-xs text-green-200/55 mt-2 break-all">
                        Game ID: {row?.gameId || "—"}
                      </div>
                      <div className="text-xs text-green-200/55 mt-1">
                        Order: {Number(row?.order || 0)}
                      </div>
                      <div
                        className={`mt-2 inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${
                          row?.isActive !== false
                            ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30"
                            : "bg-red-500/15 text-red-200 border-red-400/30"
                        }`}
                      >
                        {row?.isActive !== false ? "ACTIVE" : "INACTIVE"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/30 font-bold"
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(row._id)}
                      className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-500/30 font-bold"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-green-200/70">
              No sports found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSports;
