import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaImage,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaLink,
  FaTable,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const categories = [
  "Favorites",
  "Casino",
  "Slots",
  "Sports",
  "Live",
  "Table",
  "Fishing",
  "Lottery",
];

const ToolbarButton = ({ onClick, children, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="flex h-10 w-10 items-center justify-center rounded-xl border border-green-500/20 bg-black/40 text-white transition hover:bg-green-900/20"
  >
    {children}
  </button>
);

const AddPromotion = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeEditor, setActiveEditor] = useState("bn");

  const [form, setForm] = useState({
    category: "Favorites",
    title_bn: "",
    title_en: "",
    description_bn: "",
    description_en: "",
    status: "active",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const bnEditorRef = useRef(null);
  const enEditorRef = useRef(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/promotions");
      setPromotions(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load promotions",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
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

  useEffect(() => {
    if (
      bnEditorRef.current &&
      bnEditorRef.current.innerHTML !== form.description_bn
    ) {
      bnEditorRef.current.innerHTML = form.description_bn || "";
    }
    if (
      enEditorRef.current &&
      enEditorRef.current.innerHTML !== form.description_en
    ) {
      enEditorRef.current.innerHTML = form.description_en || "";
    }
  }, [form.description_bn, form.description_en]);

  const sortedPromotions = useMemo(() => {
    return [...promotions].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0),
    );
  }, [promotions]);

  const resetForm = () => {
    setForm({
      category: "Favorites",
      title_bn: "",
      title_en: "",
      description_bn: "",
      description_en: "",
      status: "active",
      image: null,
    });
    setPreview("");
    setExistingImage("");
    setEditingId(null);
    setActiveEditor("bn");

    if (bnEditorRef.current) bnEditorRef.current.innerHTML = "";
    if (enEditorRef.current) enEditorRef.current.innerHTML = "";

    const fileInput = document.getElementById("promotion-image-input");
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
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

  const handleEditorInput = (type) => {
    if (type === "bn" && bnEditorRef.current) {
      setForm((prev) => ({
        ...prev,
        description_bn: bnEditorRef.current.innerHTML,
      }));
    }

    if (type === "en" && enEditorRef.current) {
      setForm((prev) => ({
        ...prev,
        description_en: enEditorRef.current.innerHTML,
      }));
    }
  };

  const runCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorInput(activeEditor);
  };

  const insertLink = () => {
    const url = window.prompt("Enter link URL");
    if (!url) return;
    runCommand("createLink", url);
  };

  const insertTable = () => {
    const rows = Number(window.prompt("How many rows?", "2"));
    const cols = Number(window.prompt("How many columns?", "2"));

    if (!rows || !cols || rows < 1 || cols < 1) return;

    let html =
      '<table border="1" style="width:100%; border-collapse:collapse; margin-top:10px;">';

    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #999; padding:8px;">&nbsp;</td>';
      }
      html += "</tr>";
    }

    html += "</table><p><br/></p>";

    runCommand("insertHTML", html);
  };

  const validateForm = () => {
    if (!form.category) {
      toast.error("Category is required");
      return false;
    }

    if (!form.title_bn.trim()) {
      toast.error("Bangla title is required");
      return false;
    }

    if (!form.title_en.trim()) {
      toast.error("English title is required");
      return false;
    }

    if (!editingId && !form.image) {
      toast.error("Promotion image is required");
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
      payload.append("category", form.category);
      payload.append("title_bn", form.title_bn.trim());
      payload.append("title_en", form.title_en.trim());
      payload.append("description_bn", form.description_bn || "");
      payload.append("description_en", form.description_en || "");
      payload.append("status", form.status);

      if (form.image) {
        payload.append("image", form.image);
      }

      if (editingId) {
        const res = await api.put(
          `/api/admin/promotions/${editingId}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        toast.success(res?.data?.message || "Promotion updated successfully");
      } else {
        const res = await api.post("/api/admin/promotions", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(res?.data?.message || "Promotion created successfully");
      }

      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save promotion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setExistingImage(
      item?.image
        ? item.image.startsWith("http")
          ? item.image
          : `${import.meta.env.VITE_APP_URL}${item.image}`
        : "",
    );

    setForm({
      category: item?.category || "Favorites",
      title_bn: item?.title?.bn || "",
      title_en: item?.title?.en || "",
      description_bn: item?.description?.bn || "",
      description_en: item?.description?.en || "",
      status: item?.status || "active",
      image: null,
    });

    if (bnEditorRef.current) {
      bnEditorRef.current.innerHTML = item?.description?.bn || "";
    }
    if (enEditorRef.current) {
      enEditorRef.current.innerHTML = item?.description?.en || "";
    }

    const fileInput = document.getElementById("promotion-image-input");
    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this promotion?",
    );
    if (!ok) return;

    try {
      const res = await api.delete(`/api/admin/promotions/${id}`);
      toast.success(res?.data?.message || "Promotion deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchPromotions();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to delete promotion",
      );
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-400 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              Promotion Controller
            </h1>
            <p className="mt-1 text-sm text-green-200/80 md:text-base">
              Add, edit and delete promotions with rich description and tables.
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-black/40 px-4 py-3 shadow-lg shadow-green-900/20 backdrop-blur-md">
            <p className="text-sm text-green-200/80">Total Promotions</p>
            <p className="text-2xl font-bold text-white">{promotions.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-green-600/30 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl shadow-green-900/20"
          >
            <div className="border-b border-green-600/20 bg-gradient-to-r from-green-600/20 to-emerald-500/10 px-5 py-4">
              <h2 className="text-lg font-bold text-white md:text-xl">
                {editingId ? "Edit Promotion" : "Add New Promotion"}
              </h2>
              <p className="text-sm text-green-200/80">
                Select category, add titles, rich description and image.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-black"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Title Bangla
                </label>
                <input
                  type="text"
                  name="title_bn"
                  value={form.title_bn}
                  onChange={handleChange}
                  placeholder="বাংলা টাইটেল লিখুন"
                  className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Title English
                </label>
                <input
                  type="text"
                  name="title_en"
                  value={form.title_en}
                  onChange={handleChange}
                  placeholder="Write English title"
                  className="w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-green-200/35 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-green-100">
                  Description Toolbar
                </label>

                <div className="flex flex-wrap gap-2">
                  <ToolbarButton
                    title="Bold"
                    onClick={() => runCommand("bold")}
                  >
                    <FaBold />
                  </ToolbarButton>
                  <ToolbarButton
                    title="Italic"
                    onClick={() => runCommand("italic")}
                  >
                    <FaItalic />
                  </ToolbarButton>
                  <ToolbarButton
                    title="Underline"
                    onClick={() => runCommand("underline")}
                  >
                    <FaUnderline />
                  </ToolbarButton>
                  <ToolbarButton
                    title="Bullet List"
                    onClick={() => runCommand("insertUnorderedList")}
                  >
                    <FaListUl />
                  </ToolbarButton>
                  <ToolbarButton
                    title="Numbered List"
                    onClick={() => runCommand("insertOrderedList")}
                  >
                    <FaListOl />
                  </ToolbarButton>
                  <ToolbarButton title="Link" onClick={insertLink}>
                    <FaLink />
                  </ToolbarButton>
                  <ToolbarButton title="Insert Table" onClick={insertTable}>
                    <FaTable />
                  </ToolbarButton>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Description Bangla
                </label>
                <div
                  ref={bnEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => setActiveEditor("bn")}
                  onInput={() => handleEditorInput("bn")}
                  className="min-h-[180px] w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none focus:border-green-400"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Description English
                </label>
                <div
                  ref={enEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => setActiveEditor("en")}
                  onInput={() => handleEditorInput("en")}
                  className="min-h-[180px] w-full rounded-2xl border border-green-600/30 bg-black/50 px-4 py-3 text-white outline-none focus:border-green-400"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-100">
                  Promotion Image
                </label>

                <label
                  htmlFor="promotion-image-input"
                  className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-500/30 bg-black/40 px-4 py-6 text-center transition hover:border-green-400/60 hover:bg-green-950/20"
                >
                  {preview || existingImage ? (
                    <div className="w-full">
                      <img
                        src={preview || existingImage}
                        alt="Promotion Preview"
                        className="mx-auto h-48 w-full rounded-2xl object-contain"
                      />
                      <p className="mt-3 text-sm text-green-200/80">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-300">
                        <FaImage />
                      </div>
                      <p className="text-base font-semibold text-white">
                        Click to upload promotion image
                      </p>
                    </>
                  )}
                </label>

                <input
                  id="promotion-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
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
                      Update Promotion
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Promotion
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
                All Promotions
              </h2>
              <p className="mt-1 text-sm text-green-200/80">
                Manage all promotions from here.
              </p>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-black/40 px-5 py-4 text-green-200">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Loading promotions...</span>
                  </div>
                </div>
              ) : sortedPromotions.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-green-500/20 bg-black/30 px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-300">
                    <FaImage />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    No promotions found
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-green-200/70">
                    Add your first promotion from the form.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPromotions.map((item) => {
                    const imageSrc = item?.image
                      ? item.image.startsWith("http")
                        ? item.image
                        : `${import.meta.env.VITE_APP_URL}${item.image}`
                      : "";

                    return (
                      <div
                        key={item._id}
                        className="overflow-hidden rounded-3xl border border-green-600/20 bg-black/40 shadow-lg shadow-green-900/10 transition hover:border-green-500/40"
                      >
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[180px_minmax(0,1fr)]">
                          <div className="relative flex items-center justify-center rounded-2xl bg-black/60 p-4">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt="promotion"
                                className="h-36 w-full rounded-2xl object-contain"
                              />
                            ) : (
                              <div className="text-green-300">
                                <FaImage className="text-4xl" />
                              </div>
                            )}

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

                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-200">
                                {item?.category || "-"}
                              </span>
                              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                                {item?.createdAt
                                  ? new Date(
                                      item.createdAt,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-green-300/70">
                                Bangla Title
                              </p>
                              <p className="mt-1 text-base font-bold text-white">
                                {item?.title?.bn || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-green-300/70">
                                English Title
                              </p>
                              <p className="mt-1 text-base font-bold text-white">
                                {item?.title?.en || "-"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-3 text-sm font-semibold text-black transition hover:from-green-400 hover:to-emerald-400"
                              >
                                <FaEdit />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(item._id)}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-3 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
                              >
                                <FaTrash />
                                Delete
                              </button>
                            </div>
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

export default AddPromotion;
