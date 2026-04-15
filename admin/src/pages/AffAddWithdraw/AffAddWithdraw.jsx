import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const emptyBi = { bn: "", en: "" };

const defaultField = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
});

const cardBase =
  "bg-gradient-to-br from-black via-green-950/30 to-black rounded-2xl border border-green-700/40 shadow-2xl shadow-green-900/20 overflow-hidden";

const headCls = "text-lg font-bold text-green-300 tracking-tight";
const subheadCls = "text-base font-semibold text-green-200/90 mb-3";
const labelCls = "text-sm font-medium text-green-100/90 block mb-1.5";
const inputBase =
  "w-full h-11 bg-black/60 border border-green-700/50 rounded-xl px-4 text-white placeholder-green-400/50 focus:outline-none focus:border-green-400/70 focus:ring-2 focus:ring-green-400/30 transition-all";

const btnBase =
  "cursor-pointer h-10 px-5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm";
const btnPrimary = `${btnBase} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black border border-green-400/40 hover:shadow-green-600/30`;
const btnGhost = `${btnBase} bg-transparent border border-green-700/60 text-green-300 hover:bg-green-900/40 hover:border-green-500/60`;
const btnDanger = `${btnBase} bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white border border-red-600/50 hover:shadow-red-700/30`;
const btnSmall = "h-8 px-3 text-xs";

const BiInput = ({ title, bnProps, enProps }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className={labelCls}>{title} (BN)</label>
      <input className={inputBase} {...bnProps} />
    </div>
    <div>
      <label className={labelCls}>{title} (EN)</label>
      <input className={inputBase} {...enProps} />
    </div>
  </div>
);

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, methodName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`${cardBase} w-full max-w-md p-6`}>
        <h3 className="text-xl font-bold text-green-200 mb-4">Confirm Delete</h3>
        <p className="text-green-100/90 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-green-300">
            {methodName || "this method"}
          </span>
          ?
        </p>
        <div className="flex items-center justify-end gap-4">
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button onClick={onConfirm} className={btnDanger}>
            Delete Method
          </button>
        </div>
      </div>
    </div>
  );
};

const AffAddWithdraw = () => {
  const qc = useQueryClient();

  const {
    data: list = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-aff-withdraw-methods"],
    queryFn: async () => {
      const res = await api.get("/api/admin/aff-withdraw-methods");
      return res.data || [];
    },
    staleTime: 10000,
  });

  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const [fields, setFields] = useState([defaultField()]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const isCreateMode = selectedId === "";

  const selected = useMemo(
    () => list.find((x) => x._id === selectedId) || null,
    [list, selectedId],
  );

  const { register, reset, watch, handleSubmit } = useForm({
    defaultValues: {
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    },
  });

  useEffect(() => {
    setLogoFile(null);
    setLogoPreview(null);

    if (!selected) {
      reset({
        methodId: "",
        name_bn: "",
        name_en: "",
        isActive: true,
        minimumWithdrawAmount: 0,
        maximumWithdrawAmount: 0,
      });
      setFields([defaultField()]);
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

    if (selected.logoUrl) {
      setLogoPreview(`${import.meta.env.VITE_API_URL}${selected.logoUrl}`);
    }
  }, [selected, reset]);

  const clearToCreate = () => {
    setSelectedId("");
    reset({
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    });
    setFields([defaultField()]);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const addField = () => setFields((p) => [...p, defaultField()]);
  const removeField = (idx) => setFields((p) => p.filter((_, i) => i !== idx));

  const patchField = (idx, key, val) =>
    setFields((p) => p.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));

  const patchFieldBi = (idx, key, lang, val) =>
    setFields((p) =>
      p.map((x, i) =>
        i === idx
          ? { ...x, [key]: { ...(x[key] || emptyBi), [lang]: val } }
          : x,
      ),
    );

  const validateBeforeSave = (values) => {
    const mid = String(values.methodId || "").trim().toUpperCase();
    if (!mid) return "Method ID is required";
    if (!values.name_bn?.trim() || !values.name_en?.trim()) {
      return "Both BN and EN method names are required";
    }

    const minW = Number(values.minimumWithdrawAmount ?? 0);
    const maxW = Number(values.maximumWithdrawAmount ?? 0);

    if (Number.isNaN(minW) || minW < 0) return "Minimum withdraw must be valid";
    if (Number.isNaN(maxW) || maxW < 0) return "Maximum withdraw must be valid";
    if (maxW > 0 && minW > maxW) {
      return "Minimum withdraw cannot be greater than maximum withdraw";
    }

    for (const f of fields) {
      if (!String(f.key || "").trim()) return "Field key is required";
      if (!f.label?.bn?.trim() || !f.label?.en?.trim()) {
        return "Field label BN and EN are required";
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
      setSaving(true);

      const payload = new FormData();

      payload.append(
        "methodId",
        String(values.methodId || "").trim().toUpperCase(),
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
        await api.put(`/api/admin/aff-withdraw-methods/${selected._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Withdraw method updated successfully");
      } else {
        await api.post("/api/admin/aff-withdraw-methods", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Withdraw method created successfully");
      }

      qc.invalidateQueries({ queryKey: ["admin-aff-withdraw-methods"] });
      refetch();
      if (isCreateMode) clearToCreate();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setSaving(true);
      await api.delete(`/api/admin/aff-withdraw-methods/${deleteId}`);
      toast.success("Withdraw method deleted successfully");
      setDeleteId(null);
      setDeleteName("");
      qc.invalidateQueries({ queryKey: ["admin-aff-withdraw-methods"] });
      refetch();
      if (selectedId === deleteId) clearToCreate();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const currentLogoUrl = selected?.logoUrl
    ? `${import.meta.env.VITE_API_URL}${selected.logoUrl}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/20 to-black text-white p-4 md:p-6">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        <div className={`${cardBase} p-6 md:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className={headCls}>
                {isCreateMode ? "Create Affiliate Withdraw Method" : "Update Affiliate Withdraw Method"}
              </h2>
              <p className="text-sm text-green-400/70 mt-1">
                Fill BN + EN fields for both languages
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {!isCreateMode && selected?._id && (
                <button
                  type="button"
                  onClick={() =>
                    requestDelete(
                      selected._id,
                      watch("name_en") || watch("methodId") || "this method",
                    )
                  }
                  disabled={saving}
                  className={btnDanger}
                >
                  Delete Method
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit(onSave)}
                disabled={saving}
                className={btnPrimary}
              >
                {saving ? "Saving..." : isCreateMode ? "Create Method" : "Update Method"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <div>
              <label className={labelCls}>Method ID (unique, uppercase)</label>
              <input
                className={inputBase}
                placeholder="NAGAD / BKASH / ROCKET"
                {...register("methodId")}
              />
            </div>

            <div className="flex items-end pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-green-500 bg-black border-green-600"
                  {...register("isActive")}
                />
                <span className="text-green-100 font-medium">Active</span>
              </label>
            </div>

            <div className="lg:col-span-2">
              <BiInput
                title="Method Name"
                bnProps={{
                  ...register("name_bn"),
                  placeholder: "যেমন: নগদ",
                }}
                enProps={{
                  ...register("name_en"),
                  placeholder: "e.g. Nagad",
                }}
              />
            </div>

            <div>
              <label className={labelCls}>Minimum Withdraw Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className={inputBase}
                {...register("minimumWithdrawAmount", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className={labelCls}>Maximum Withdraw Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className={inputBase}
                {...register("maximumWithdrawAmount", { valueAsNumber: true })}
              />
            </div>

            <div className="lg:col-span-2">
              <label className={labelCls}>Logo</label>

              <div className="mt-3 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-green-600/60 bg-black/40 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : currentLogoUrl ? (
                    <img
                      src={currentLogoUrl}
                      alt="Current logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-green-500/50 text-sm font-medium text-center px-4">
                      No logo
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="logo-upload-aff"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-green-900/30 hover:bg-green-800/40 border border-green-600/50 rounded-lg text-green-300 text-sm transition-colors"
                  >
                    Choose Image
                  </label>
                  <input
                    id="logo-upload-aff"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoFile && (
                    <span className="text-xs text-green-400/80">
                      Selected: {logoFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className={subheadCls}>Withdraw Form Fields</h3>
              <button type="button" onClick={addField} className={btnGhost}>
                + Add Field
              </button>
            </div>

            <div className="space-y-5">
              {fields.map((f, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-black/40 rounded-xl border border-green-800/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-green-200 font-medium">
                      Field #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      disabled={fields.length === 1}
                      className={`${btnDanger} ${btnSmall}`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Key</label>
                      <input
                        className={inputBase}
                        value={f.key || ""}
                        onChange={(e) => patchField(idx, "key", e.target.value)}
                        placeholder="accountNumber / walletType / email"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        className={inputBase}
                        value={f.type || "text"}
                        onChange={(e) => patchField(idx, "type", e.target.value)}
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="tel">tel</option>
                        <option value="email">email</option>
                      </select>
                    </div>
                  </div>

                  <BiInput
                    title="Label"
                    bnProps={{
                      value: f.label?.bn || "",
                      onChange: (e) =>
                        patchFieldBi(idx, "label", "bn", e.target.value),
                      placeholder: "বাংলা লেবেল",
                    }}
                    enProps={{
                      value: f.label?.en || "",
                      onChange: (e) =>
                        patchFieldBi(idx, "label", "en", e.target.value),
                      placeholder: "English label",
                    }}
                  />

                  <div className="mt-4">
                    <BiInput
                      title="Placeholder"
                      bnProps={{
                        value: f.placeholder?.bn || "",
                        onChange: (e) =>
                          patchFieldBi(idx, "placeholder", "bn", e.target.value),
                        placeholder: "বাংলা placeholder",
                      }}
                      enProps={{
                        value: f.placeholder?.en || "",
                        onChange: (e) =>
                          patchFieldBi(idx, "placeholder", "en", e.target.value),
                        placeholder: "English placeholder",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-end pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-green-500"
                          checked={f.required !== false}
                          onChange={(e) =>
                            patchField(idx, "required", e.target.checked)
                          }
                        />
                        <span className="text-green-100 font-medium">
                          Required
                        </span>
                      </label>
                    </div>

                    <div className="text-xs text-green-400/70 flex items-end">
                      Tip: key must be unique
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${cardBase} p-6 md:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className={headCls}>All Affiliate Withdraw Methods</h2>
            <div className="flex items-center gap-3">
              <button onClick={refetch} className={btnGhost}>
                Refresh List
              </button>
              <button onClick={clearToCreate} className={btnPrimary}>
                + New Method
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-green-400/60 text-center py-16">
              Loading withdraw methods...
            </div>
          ) : list.length === 0 ? (
            <div className="text-green-400/50 text-center py-16">
              No withdraw methods found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {list.map((m) => {
                const displayName = m.name?.en || m.methodId || "Unnamed";
                return (
                  <div
                    key={m._id}
                    className="p-5 bg-black/40 rounded-xl border border-green-800/30 hover:border-green-600/50 transition-all duration-200"
                  >
                    <div className="flex items-start gap-5 mb-4">
                      <div className="w-20 h-20 rounded-xl border border-green-700/50 overflow-hidden bg-black/50 flex-shrink-0 shadow-sm">
                        {m.logoUrl ? (
                          <img
                            src={`${import.meta.env.VITE_APP_URL}${m.logoUrl}`}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-green-500/40 text-xs font-bold">
                            NO LOGO
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-green-100 text-lg truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-green-400/80 mt-1">
                          ID: {m.methodId} • {m.isActive ? "Active" : "Inactive"}
                        </div>
                        <div className="text-[11px] text-green-400/70 mt-1">
                          Min: {Number(m.minimumWithdrawAmount ?? 0)} • Max:{" "}
                          {Number(m.maximumWithdrawAmount ?? 0)}
                        </div>
                        <div className="text-[11px] text-green-400/70 mt-1">
                          Fields: {Array.isArray(m.fields) ? m.fields.length : 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setSelectedId(m._id)}
                        className={`${btnPrimary} ${btnSmall} flex-1`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => requestDelete(m._id, displayName)}
                        className={`${btnDanger} ${btnSmall}`}
                      >
                        Delete
                      </button>
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
          setDeleteId(null);
          setDeleteName("");
        }}
        onConfirm={confirmDelete}
        methodName={deleteName}
      />
    </div>
  );
};

export default AffAddWithdraw;