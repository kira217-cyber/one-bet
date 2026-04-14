import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaImage,
  FaLayerGroup,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const initialForm = {
  categoryNameBn: "",
  categoryNameEn: "",
  categoryTitleBn: "",
  categoryTitleEn: "",
  order: 0,
  status: "active",
  iconImage: null,
};

const AddCategory = () => {
  const [formData, setFormData] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [removeOldImage, setRemoveOldImage] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    title: "",
  });

  const isEdit = useMemo(() => !!editId, [editId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/game-categories/admin/all");
      setCategories(res?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData(initialForm);
    setPreview("");
    setEditId(null);
    setOldImageUrl("");
    setRemoveOldImage(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      iconImage: file,
    }));

    setRemoveOldImage(false);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      iconImage: null,
    }));
    setPreview("");
    if (oldImageUrl) {
      setRemoveOldImage(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const body = new FormData();
      body.append("categoryNameBn", formData.categoryNameBn);
      body.append("categoryNameEn", formData.categoryNameEn);
      body.append("categoryTitleBn", formData.categoryTitleBn);
      body.append("categoryTitleEn", formData.categoryTitleEn);
      body.append("order", formData.order);
      body.append("status", formData.status);

      if (formData.iconImage) {
        body.append("iconImage", formData.iconImage);
      }

      if (isEdit) {
        body.append("removeOldImage", removeOldImage ? "true" : "false");
        const res = await api.put(`/api/game-categories/${editId}`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(res?.data?.message || "Category updated successfully");
      } else {
        const res = await api.post("/api/game-categories", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(res?.data?.message || "Category added successfully");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      categoryNameBn: item?.categoryName?.bn || "",
      categoryNameEn: item?.categoryName?.en || "",
      categoryTitleBn: item?.categoryTitle?.bn || "",
      categoryTitleEn: item?.categoryTitle?.en || "",
      order: item?.order || 0,
      status: item?.status || "active",
      iconImage: null,
    });
    setPreview(item?.iconImageUrl || "");
    setOldImageUrl(item?.iconImageUrl || "");
    setRemoveOldImage(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openDeleteModal = (item) => {
    setDeleteModal({
      open: true,
      id: item._id,
      title: item?.categoryTitle?.en || item?.categoryName?.en || "Category",
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
      title: "",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/api/game-categories/${deleteModal.id}`);
      toast.success(res?.data?.message || "Category deleted successfully");

      if (editId === deleteModal.id) {
        resetForm();
      }

      closeDeleteModal();
      fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete category");
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
                <FaLayerGroup className="text-2xl text-black" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {isEdit ? "Update Game Category" : "Add Game Category"}
                </h1>
                <p className="text-sm text-green-200/80 mt-1">
                  Sports and Hot Games fixed থাকবে, বাকিগুলো এখান থেকে manage হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 md:p-6 lg:p-8">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
              {/* Left Form */}
              <div className="xl:col-span-2 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-200">
                      Category Name (Bangla)
                    </label>
                    <input
                      type="text"
                      name="categoryNameBn"
                      value={formData.categoryNameBn}
                      onChange={handleChange}
                      placeholder="যেমন: ক্যাসিনো"
                      className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-200">
                      Category Name (English)
                    </label>
                    <input
                      type="text"
                      name="categoryNameEn"
                      value={formData.categoryNameEn}
                      onChange={handleChange}
                      placeholder="Like: Casino"
                      className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-200">
                      Category Title (Bangla)
                    </label>
                    <input
                      type="text"
                      name="categoryTitleBn"
                      value={formData.categoryTitleBn}
                      onChange={handleChange}
                      placeholder="যেমন: ক্যাসিনো গেমস"
                      className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-200">
                      Category Title (English)
                    </label>
                    <input
                      type="text"
                      name="categoryTitleEn"
                      value={formData.categoryTitleEn}
                      onChange={handleChange}
                      placeholder="Like: Casino Games"
                      className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-200">
                      Order Number
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-green-200">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-green-200">
                    Icon Image
                  </label>

                  <label className="cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-green-700/50 bg-black/40 p-6 text-center hover:border-green-400 hover:bg-green-950/20 transition-all">
                    <FaImage className="text-4xl text-green-300 mb-3" />
                    <span className="text-base font-semibold text-white">
                      Click to upload icon image
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

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-bold text-black shadow-lg shadow-green-600/40 hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-60"
                  >
                    {isEdit ? <FaSave /> : <FaPlus />}
                    {submitLoading
                      ? isEdit
                        ? "Updating..."
                        : "Adding..."
                      : isEdit
                      ? "Update Category"
                      : "Add Category"}
                  </button>

                  {(isEdit || preview) && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-3 font-semibold text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  )}

                  {preview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-3 font-semibold text-yellow-300 hover:bg-yellow-500/20 transition-all"
                    >
                      Remove Image
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
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-4xl text-green-300/70" />
                        )}
                      </div>

                      <h4 className="mt-4 text-xl font-bold text-yellow-400">
                        {formData.categoryTitleEn || "Category Title"}
                      </h4>

                      <p className="text-sm text-green-200/80 mt-1">
                        {formData.categoryTitleBn || "ক্যাটাগরি টাইটেল"}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1 text-sm text-green-300">
                          Order: {formData.order || 0}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-sm border ${
                            formData.status === "active"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-red-500/15 border-red-500/30 text-red-300"
                          }`}
                        >
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Category List */}
          <div className="border-t border-green-700/40 p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-xl md:text-2xl font-bold">All Categories</h2>
              <span className="text-sm text-green-200/80">
                Total: {categories.length}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-10 text-green-200">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                No category found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {categories.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-[#003F2C] overflow-hidden flex items-center justify-center border border-green-700/40 shrink-0">
                        {item.iconImageUrl ? (
                          <img
                            src={item.iconImageUrl}
                            alt={item?.categoryTitle?.en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-3xl text-green-300/70" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-yellow-400 truncate">
                          {item?.categoryTitle?.en || "No Title"}
                        </h3>
                        <p className="text-sm text-green-200/80 mt-1 truncate">
                          {item?.categoryTitle?.bn || "No Bangla Title"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1 text-xs text-green-300">
                            Order: {item.order}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs border ${
                              item.status === "active"
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                : "bg-red-500/15 border-red-500/30 text-red-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-bold text-black hover:from-green-400 hover:to-emerald-400 transition-all"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(item)}
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
              তুমি কি নিশ্চিত "{deleteModal.title}" category delete করতে চাও?
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

export default AddCategory;