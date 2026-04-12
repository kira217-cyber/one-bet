import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSyncAlt,
  FaSave,
  FaImage,
  FaMoneyCheckAlt,
  FaListAlt,
} from "react-icons/fa";
import { PiHandWithdrawBold } from "react-icons/pi";
import { api } from "../../api/axios";


const emptyBi = { bn: "", en: "" };

const defaultField = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
});

const sectionCard =
  "rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-lg shadow-green-900/20";

const inputBase =
  "w-full h-11 rounded-xl border border-green-700/50 bg-black/60 px-4 text-white placeholder-green-400/50 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400/30";

const labelCls = "mb-2 block text-sm font-medium text-green-100";
const titleCls = "text-xl font-bold text-white";
const subTitleCls = "text-lg font-semibold text-green-200";

const btnBase =
  "cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300";

const btnPrimary = `${btnBase} bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 shadow-lg shadow-green-600/30`;

const btnGhost = `${btnBase} border border-green-700/50 bg-black/40 text-green-200 hover:bg-green-900/30`;

const btnDanger = `${btnBase} border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20`;

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_APP_URL}${url}`;
};

const BiInput = ({ title, bnProps, enProps, bnPlaceholder, enPlaceholder }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className={labelCls}>{title} (BN)</label>
      <input className={inputBase} placeholder={bnPlaceholder} {...bnProps} />
    </div>
    <div>
      <label className={labelCls}>{title} (EN)</label>
      <input className={inputBase} placeholder={enPlaceholder} {...enProps} />
    </div>
  </div>
);

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, methodName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gradient-to-br from-black via-red-950/20 to-black p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white">Delete Confirmation</h3>
        <p className="mt-3 text-sm leading-6 text-red-100/90">
          তুমি কি নিশ্চিত{" "}
          <span className="font-bold text-red-300">
            {methodName || "this withdraw method"}
          </span>{" "}
          delete করতে চাও?
        </p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onConfirm} className={btnDanger}>
            Yes, Delete
          </button>
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AddWithdraw = () => {
  const qc = useQueryClient();

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    },
  });

  const {
    data: responseData = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["withdraw-methods"],
    queryFn: async () => {
      const res = await api.get("/api/withdraw-methods");
      return res.data;
    },
    staleTime: 10000,
  });

  const list = useMemo(() => responseData?.data || [], [responseData]);

  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [deleteName, setDeleteName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [fields, setFields] = useState([
    {
      key: "amount",
      label: { bn: "উত্তোলনের পরিমাণ (৳)", en: "Withdraw Amount (৳)" },
      placeholder: { bn: "500", en: "500" },
      type: "number",
      required: true,
    },
    {
      key: "accountNumber",
      label: { bn: "একাউন্ট নম্বর", en: "Account Number" },
      placeholder: { bn: "01XXXXXXXXX", en: "01XXXXXXXXX" },
      type: "tel",
      required: true,
    },
    {
      key: "accountType",
      label: { bn: "একাউন্ট টাইপ", en: "Account Type" },
      placeholder: {
        bn: "Personal / Agent / Merchant",
        en: "Personal / Agent / Merchant",
      },
      type: "text",
      required: true,
    },
  ]);

  const selected = useMemo(
    () => list.find((item) => item._id === selectedId) || null,
    [list, selectedId],
  );

  const isCreateMode = !selectedId;
  const watchedActive = watch("isActive");

  useEffect(() => {
    if (!logoFile) return;
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!selected) {
      if (isCreateMode) {
        reset({
          methodId: "",
          name_bn: "",
          name_en: "",
          isActive: true,
          minimumWithdrawAmount: 0,
          maximumWithdrawAmount: 0,
        });

        setFields([
          {
            key: "amount",
            label: { bn: "উত্তোলনের পরিমাণ (৳)", en: "Withdraw Amount (৳)" },
            placeholder: { bn: "500", en: "500" },
            type: "number",
            required: true,
          },
        ]);

        setLogoFile(null);
        setLogoPreview("");
      }
      return;
    }

    reset({
      methodId: selected.methodId || "",
      name_bn: selected.name?.bn || "",
      name_en: selected.name?.en || "",
      isActive: selected.isActive ?? true,
      minimumWithdrawAmount: selected.minimumWithdrawAmount ?? 0,
      maximumWithdrawAmount: selected.maximumWithdrawAmount ?? 0,
    });

    setFields(
      Array.isArray(selected.fields) && selected.fields.length
        ? selected.fields
        : [defaultField()],
    );

    setLogoFile(null);
    setLogoPreview(selected?.logoUrl ? getImageUrl(selected.logoUrl) : "");
  }, [selected, reset, isCreateMode]);

  const clearToCreate = () => {
    setSelectedId("");
    setDeleteId("");
    setDeleteName("");
    setLogoFile(null);
    setLogoPreview("");

    reset({
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    });

    setFields([
      {
        key: "amount",
        label: { bn: "উত্তোলনের পরিমাণ (৳)", en: "Withdraw Amount (৳)" },
        placeholder: { bn: "500", en: "500" },
        type: "number",
        required: true,
      },
    ]);
  };

  const patchField = (idx, key, val) =>
    setFields((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );

  const patchFieldBi = (idx, key, lang, val) =>
    setFields((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [key]: { ...(item[key] || emptyBi), [lang]: val } }
          : item,
      ),
    );

  const validateBeforeSave = (values) => {
    const mid = String(values.methodId || "")
      .trim()
      .toUpperCase();

    if (!mid) return "Method ID is required";
    if (!values.name_bn?.trim() || !values.name_en?.trim()) {
      return "Both BN and EN names are required";
    }

    const minW = Number(values.minimumWithdrawAmount ?? 0);
    const maxW = Number(values.maximumWithdrawAmount ?? 0);

    if (Number.isNaN(minW) || minW < 0) return "Minimum withdraw must be >= 0";
    if (Number.isNaN(maxW) || maxW < 0) return "Maximum withdraw must be >= 0";
    if (maxW > 0 && minW > maxW) {
      return "Minimum withdraw cannot be greater than maximum withdraw";
    }

    for (const field of fields) {
      if (!String(field.key || "").trim()) return "Field key cannot be empty";
      if (!field.label?.bn?.trim() || !field.label?.en?.trim()) {
        return "Field label BN/EN both required";
      }
      if (!["text", "number", "tel", "email"].includes(field.type || "text")) {
        return "Invalid field type";
      }
    }

    return null;
  };

  const onSave = async (values) => {
    const err = validateBeforeSave(values);
    if (err) {
      toast.error(err);
      return;
    }

    try {
      const payload = new FormData();

      payload.append(
        "methodId",
        String(values.methodId || "")
          .trim()
          .toUpperCase(),
      );

      payload.append(
        "name",
        JSON.stringify({
          bn: values.name_bn || "",
          en: values.name_en || "",
        }),
      );

      payload.append("isActive", String(!!values.isActive));
      payload.append(
        "minimumWithdrawAmount",
        String(values.minimumWithdrawAmount ?? 0),
      );
      payload.append(
        "maximumWithdrawAmount",
        String(values.maximumWithdrawAmount ?? 0),
      );
      payload.append("fields", JSON.stringify(fields));

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (selected?._id) {
        const res = await api.put(
          `/api/withdraw-methods/${selected._id}`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success(
          res?.data?.message || "Withdraw method updated successfully",
        );
      } else {
        const res = await api.post("/api/withdraw-methods", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(
          res?.data?.message || "Withdraw method created successfully",
        );
      }

      qc.invalidateQueries({ queryKey: ["withdraw-methods"] });
      refetch();

      if (isCreateMode) {
        clearToCreate();
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await api.delete(`/api/withdraw-methods/${deleteId}`);
      toast.success(
        res?.data?.message || "Withdraw method deleted successfully",
      );

      if (selectedId === deleteId) {
        clearToCreate();
      }

      setDeleteId("");
      setDeleteName("");
      qc.invalidateQueries({ queryKey: ["withdraw-methods"] });
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Header */}
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/40">
                <PiHandWithdrawBold className="text-3xl text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Withdraw Method Manager
                </h1>
                <p className="text-sm text-green-200/80">
                  Create, update, delete and control all withdraw methods
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={refetch} className={btnGhost}>
                <span className="flex items-center gap-2">
                  <FaSyncAlt />
                  Refresh
                </span>
              </button>
              <button
                type="button"
                onClick={clearToCreate}
                className={btnPrimary}
              >
                <span className="flex items-center gap-2">
                  <FaPlus />
                  New Method
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={titleCls}>
                {isCreateMode
                  ? "Create Withdraw Method"
                  : "Update Withdraw Method"}
              </h2>
              <p className="mt-1 text-sm text-green-200/70">
                BN + EN দুই ভাষাতেই data fill করো
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isCreateMode && selected?._id && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteId(selected._id);
                    setDeleteName(selected.name?.en || selected.methodId);
                  }}
                  className={btnDanger}
                >
                  Delete Method
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit(onSave)}
                disabled={isSubmitting}
                className={btnPrimary}
              >
                <span className="flex items-center gap-2">
                  <FaSave />
                  {isCreateMode ? "Create Method" : "Update Method"}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className={labelCls}>Method ID (uppercase)</label>
              <input
                {...register("methodId")}
                placeholder="NAGAD / BKASH / ROCKET"
                className={inputBase}
              />
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-5 w-5 cursor-pointer accent-green-500"
                />
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    watchedActive
                      ? "border border-green-500/30 bg-green-500/20 text-green-300"
                      : "border border-red-500/30 bg-red-500/20 text-red-300"
                  }`}
                >
                  {watchedActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>

            <div className="lg:col-span-2">
              <BiInput
                title="Method Name"
                bnProps={register("name_bn")}
                enProps={register("name_en")}
                bnPlaceholder="যেমন: নগদ"
                enPlaceholder="e.g. Nagad"
              />
            </div>

            <div>
              <label className={labelCls}>Minimum Withdraw Amount</label>
              <input
                type="number"
                {...register("minimumWithdrawAmount", { valueAsNumber: true })}
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelCls}>Maximum Withdraw Amount</label>
              <input
                type="number"
                {...register("maximumWithdrawAmount", { valueAsNumber: true })}
                className={inputBase}
              />
            </div>

            <div className="lg:col-span-2">
              <label className={labelCls}>Logo Image</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-green-600/60 bg-black/40 px-4 py-3 hover:bg-green-950/20">
                <FaImage className="text-green-300" />
                <span className="text-sm text-green-100">
                  image upload করতে click করো
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </label>

              {logoPreview && (
                <div className="mt-3 flex items-center gap-4 rounded-2xl border border-green-700/40 bg-black/30 p-3">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-20 w-20 rounded-xl border border-green-600/40 object-cover"
                  />
                  <span className="text-sm text-green-200/80">
                    Logo preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className="mt-8 rounded-2xl border border-green-700/30 bg-black/30 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaListAlt className="text-green-300" />
                <h3 className={subTitleCls}>Withdraw Modal Input Fields</h3>
              </div>
              <button
                type="button"
                onClick={() => setFields((prev) => [...prev, defaultField()])}
                className={btnGhost}
              >
                + Add Field
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-green-700/30 bg-gradient-to-br from-black/80 to-green-950/10 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-green-200">
                      Field #{idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setFields((prev) => prev.filter((_, i) => i !== idx))
                      }
                      disabled={fields.length === 1}
                      className={btnDanger}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>Key</label>
                      <input
                        className={inputBase}
                        value={field.key || ""}
                        onChange={(e) => patchField(idx, "key", e.target.value)}
                        placeholder="amount / accountNumber / email"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        className={inputBase}
                        value={field.type || "text"}
                        onChange={(e) =>
                          patchField(idx, "type", e.target.value)
                        }
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="tel">tel</option>
                        <option value="email">email</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Label"
                      bnProps={{
                        value: field.label?.bn || "",
                        onChange: (e) =>
                          patchFieldBi(idx, "label", "bn", e.target.value),
                      }}
                      enProps={{
                        value: field.label?.en || "",
                        onChange: (e) =>
                          patchFieldBi(idx, "label", "en", e.target.value),
                      }}
                      bnPlaceholder="বাংলা লেবেল"
                      enPlaceholder="English label"
                    />
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Placeholder"
                      bnProps={{
                        value: field.placeholder?.bn || "",
                        onChange: (e) =>
                          patchFieldBi(
                            idx,
                            "placeholder",
                            "bn",
                            e.target.value,
                          ),
                      }}
                      enProps={{
                        value: field.placeholder?.en || "",
                        onChange: (e) =>
                          patchFieldBi(
                            idx,
                            "placeholder",
                            "en",
                            e.target.value,
                          ),
                      }}
                      bnPlaceholder="বাংলা placeholder"
                      enPlaceholder="English placeholder"
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 cursor-pointer accent-green-500"
                        checked={field.required !== false}
                        onChange={(e) =>
                          patchField(idx, "required", e.target.checked)
                        }
                      />
                      <span className="text-green-100 font-medium">
                        Required
                      </span>
                    </label>

                    <div className="text-xs text-green-300/70">
                      Tip: key unique রাখো, যেমন amount, accountNumber, email
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={titleCls}>All Withdraw Methods</h2>
              <p className="mt-1 text-sm text-green-200/70">
                নিচে সব method card আকারে show করবে
              </p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={refetch} className={btnGhost}>
                Refresh List
              </button>
              <button
                type="button"
                onClick={clearToCreate}
                className={btnPrimary}
              >
                + New Method
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-green-700/30 bg-black/20 p-10 text-center text-green-200/70">
              Loading withdraw methods...
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-green-700/30 bg-black/20 p-10 text-center text-green-200/70">
              কোনো withdraw method পাওয়া যায়নি
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {list.map((method) => {
                const displayName =
                  method.name?.bn || method.name?.en || method.methodId;

                return (
                  <div
                    key={method._id}
                    className="rounded-2xl border border-green-700/30 bg-gradient-to-br from-black/80 to-green-950/10 p-5 shadow-lg shadow-green-900/10"
                  >
                    <div className="flex flex-col gap-5 md:flex-row">
                      <div className="shrink-0">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-green-700/40 bg-black/50">
                          {method.logoUrl ? (
                            <img
                              src={getImageUrl(method.logoUrl)}
                              alt={displayName}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <FaImage className="text-3xl text-green-300/60" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {displayName}
                            </h3>
                            <p className="mt-1 text-sm text-green-200/80">
                              ID: {method.methodId}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              method.isActive
                                ? "border border-green-500/30 bg-green-500/20 text-green-300"
                                : "border border-red-500/30 bg-red-500/20 text-red-300"
                            }`}
                          >
                            {method.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-green-700/30 bg-black/30 p-3">
                            <p className="text-sm text-green-300">
                              Min Withdraw
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                              {Number(method.minimumWithdrawAmount ?? 0)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-green-700/30 bg-black/30 p-3">
                            <p className="text-sm text-green-300">
                              Max Withdraw
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                              {Number(method.maximumWithdrawAmount ?? 0)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-green-700/30 bg-black/30 p-3">
                          <p className="mb-2 text-sm font-semibold text-green-300">
                            Total Fields
                          </p>
                          <p className="text-sm text-green-100">
                            {Array.isArray(method.fields)
                              ? method.fields.length
                              : 0}{" "}
                            টি field
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(method._id);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={btnPrimary}
                          >
                            <span className="flex items-center gap-2">
                              <FaEdit />
                              Edit
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(method._id);
                              setDeleteName(displayName);
                            }}
                            className={btnDanger}
                          >
                            <span className="flex items-center gap-2">
                              <FaTrash />
                              Delete
                            </span>
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
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => {
          setDeleteId("");
          setDeleteName("");
        }}
        onConfirm={confirmDelete}
        methodName={deleteName}
      />
    </div>
  );
};

export default AddWithdraw;
