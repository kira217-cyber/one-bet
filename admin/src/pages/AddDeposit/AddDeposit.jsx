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
  FaLayerGroup,
  FaGift,
  FaListAlt,
} from "react-icons/fa";
import { PiHandDepositBold } from "react-icons/pi";
import { api } from "../../api/axios";


const emptyBi = { bn: "", en: "" };

const defaultChannel = () => ({
  id: "",
  name: { ...emptyBi },
  tagText: "+0%",
  bonusTitle: { ...emptyBi },
  bonusPercent: 0,
  isActive: true,
});

const defaultPromotion = () => ({
  id: "",
  name: { ...emptyBi },
  bonusType: "fixed",
  bonusValue: 0,
  turnoverMultiplier: 1,
  sort: 0,
  isActive: true,
});

const defaultInput = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
  minLength: 0,
  maxLength: 0,
});

const defaultContact = () => ({
  id: "",
  label: { ...emptyBi },
  number: "",
  isActive: true,
  sort: 0,
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
            {methodName || "this deposit method"}
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

const AddDeposit = () => {
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
      methodName_bn: "",
      methodName_en: "",
      isActive: true,
      minDepositAmount: 0,
      maxDepositAmount: 0,
      turnoverMultiplier: 1,
      instructions_bn: "",
      instructions_en: "",
    },
  });

  const {
    data: responseData = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
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

  const [channels, setChannels] = useState([defaultChannel()]);
  const [promotions, setPromotions] = useState([defaultPromotion()]);
  const [contacts, setContacts] = useState([defaultContact()]);
  const [inputs, setInputs] = useState([
    {
      key: "amount",
      label: { bn: "পরিমাণ (৳)", en: "Amount (৳)" },
      placeholder: { bn: "1000", en: "1000" },
      type: "number",
      required: true,
      minLength: 0,
      maxLength: 0,
    },
    {
      key: "senderNumber",
      label: { bn: "প্রেরকের নম্বর", en: "Sender Number" },
      placeholder: { bn: "01XXXXXXXXX", en: "01XXXXXXXXX" },
      type: "tel",
      required: true,
      minLength: 8,
      maxLength: 14,
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
          methodName_bn: "",
          methodName_en: "",
          isActive: true,
          minDepositAmount: 0,
          maxDepositAmount: 0,
          turnoverMultiplier: 1,
          instructions_bn: "",
          instructions_en: "",
        });
        setChannels([defaultChannel()]);
        setPromotions([defaultPromotion()]);
        setContacts([defaultContact()]);
        setInputs([defaultInput()]);
        setLogoFile(null);
        setLogoPreview("");
      }
      return;
    }

    reset({
      methodId: selected.methodId || "",
      methodName_bn: selected.methodName?.bn || "",
      methodName_en: selected.methodName?.en || "",
      isActive: selected.isActive ?? true,
      minDepositAmount: selected.minDepositAmount ?? 0,
      maxDepositAmount: selected.maxDepositAmount ?? 0,
      turnoverMultiplier: selected.turnoverMultiplier ?? 1,
      instructions_bn: selected.details?.instructions?.bn || "",
      instructions_en: selected.details?.instructions?.en || "",
    });

    setChannels(
      Array.isArray(selected.channels) && selected.channels.length
        ? selected.channels
        : [defaultChannel()],
    );

    setPromotions(
      Array.isArray(selected.promotions) && selected.promotions.length
        ? selected.promotions
        : [defaultPromotion()],
    );

    setContacts(
      Array.isArray(selected.details?.contacts) &&
        selected.details.contacts.length
        ? selected.details.contacts
        : [defaultContact()],
    );

    setInputs(
      Array.isArray(selected.details?.inputs) && selected.details.inputs.length
        ? selected.details.inputs
        : [defaultInput()],
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
      methodName_bn: "",
      methodName_en: "",
      isActive: true,
      minDepositAmount: 0,
      maxDepositAmount: 0,
      turnoverMultiplier: 1,
      instructions_bn: "",
      instructions_en: "",
    });
    setChannels([defaultChannel()]);
    setPromotions([defaultPromotion()]);
    setContacts([defaultContact()]);
    setInputs([defaultInput()]);
  };

  const patchArray = (setter, idx, key, value) => {
    setter((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchArrayBi = (setter, idx, key, lang, value) => {
    setter((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [key]: { ...(item[key] || emptyBi), [lang]: value } }
          : item,
      ),
    );
  };

  const validateBeforeSave = (values) => {
    const mid = String(values.methodId || "")
      .trim()
      .toLowerCase();
    if (!mid) return "Method ID লাগবে";
    if (!values.methodName_bn?.trim() || !values.methodName_en?.trim()) {
      return "Method name এর BN আর EN দুটোই লাগবে";
    }

    const minA = Number(values.minDepositAmount ?? 0);
    const maxA = Number(values.maxDepositAmount ?? 0);

    if (minA < 0) return "Min deposit 0 এর কম হতে পারবে না";
    if (maxA < 0) return "Max deposit 0 এর কম হতে পারবে না";
    if (maxA > 0 && minA > maxA)
      return "Min deposit Max deposit এর চেয়ে বড় হতে পারবে না";

    for (const c of contacts) {
      if (!String(c.number || "").trim())
        return "সব contact number fill করতে হবে";
      if (
        !String(c.label?.bn || "").trim() ||
        !String(c.label?.en || "").trim()
      ) {
        return "সব contact label এর BN/EN fill করতে হবে";
      }
    }

    for (const c of channels) {
      if (!String(c.id || "").trim()) return "Channel ID ফাঁকা রাখা যাবে না";
      if (
        !String(c.name?.bn || "").trim() ||
        !String(c.name?.en || "").trim()
      ) {
        return "Channel name এর BN/EN লাগবে";
      }
    }

    for (const p of promotions) {
      if (!String(p.id || "").trim()) return "Promotion ID ফাঁকা রাখা যাবে না";
      if (
        !String(p.name?.bn || "").trim() ||
        !String(p.name?.en || "").trim()
      ) {
        return "Promotion name এর BN/EN লাগবে";
      }
      if (Number(p.turnoverMultiplier || 0) < 0) {
        return "Promotion turnover 0 এর কম হতে পারবে না";
      }
    }

    for (const f of inputs) {
      if (!String(f.key || "").trim()) return "Input key ফাঁকা রাখা যাবে না";
      if (
        !String(f.label?.bn || "").trim() ||
        !String(f.label?.en || "").trim()
      ) {
        return "Input label এর BN/EN লাগবে";
      }
    }

    return null;
  };

  const onSave = async (values) => {
    const errorMessage = validateBeforeSave(values);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const payload = new FormData();

      payload.append(
        "methodId",
        String(values.methodId || "")
          .trim()
          .toLowerCase(),
      );
      payload.append(
        "methodName",
        JSON.stringify({
          bn: values.methodName_bn || "",
          en: values.methodName_en || "",
        }),
      );
      payload.append("isActive", String(!!values.isActive));
      payload.append("minDepositAmount", String(values.minDepositAmount ?? 0));
      payload.append("maxDepositAmount", String(values.maxDepositAmount ?? 0));
      payload.append(
        "turnoverMultiplier",
        String(values.turnoverMultiplier ?? 1),
      );
      payload.append("channels", JSON.stringify(channels));
      payload.append("promotions", JSON.stringify(promotions));
      payload.append("contacts", JSON.stringify(contacts));
      payload.append(
        "instructions",
        JSON.stringify({
          bn: values.instructions_bn || "",
          en: values.instructions_en || "",
        }),
      );
      payload.append("inputs", JSON.stringify(inputs));

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (selected?._id) {
        const res = await api.put(
          `/api/deposit-methods/${selected._id}`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success(res?.data?.message || "Deposit method update হয়েছে");
      } else {
        const res = await api.post("/api/deposit-methods", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(res?.data?.message || "Deposit method create হয়েছে");
      }

      qc.invalidateQueries({ queryKey: ["deposit-methods"] });
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
      const res = await api.delete(`/api/deposit-methods/${deleteId}`);
      toast.success(res?.data?.message || "Deposit method delete হয়েছে");

      if (selectedId === deleteId) {
        clearToCreate();
      }

      setDeleteId("");
      setDeleteName("");
      qc.invalidateQueries({ queryKey: ["deposit-methods"] });
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/40">
                <PiHandDepositBold className="text-3xl text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Deposit Method Manager
                </h1>
                <p className="text-sm text-green-200/80">
                  Create, update, delete and control all deposit methods
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

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={titleCls}>
                {isCreateMode
                  ? "Create Deposit Method"
                  : "Update Deposit Method"}
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
                    setDeleteName(selected.methodName?.en || selected.methodId);
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
              <label className={labelCls}>Method ID</label>
              <input
                {...register("methodId")}
                placeholder="bkash / nagad / rocket"
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
                bnProps={register("methodName_bn")}
                enProps={register("methodName_en")}
                bnPlaceholder="যেমন: বিকাশ"
                enPlaceholder="e.g. bKash"
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

            <div>
              <label className={labelCls}>Minimum Deposit Amount</label>
              <input
                type="number"
                {...register("minDepositAmount", { valueAsNumber: true })}
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelCls}>Maximum Deposit Amount</label>
              <input
                type="number"
                {...register("maxDepositAmount", { valueAsNumber: true })}
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelCls}>Method Turnover Multiplier</label>
              <input
                type="number"
                {...register("turnoverMultiplier", { valueAsNumber: true })}
                className={inputBase}
              />
            </div>

            <div className="lg:col-span-2">
              <BiInput
                title="Instructions"
                bnProps={register("instructions_bn")}
                enProps={register("instructions_en")}
                bnPlaceholder="বাংলা instruction..."
                enPlaceholder="English instruction..."
              />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-green-700/30 bg-black/30 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiHandDepositBold className="text-green-300" />
                <h3 className={subTitleCls}>Numbers / Contacts</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setContacts((prev) => [...prev, defaultContact()])
                }
                className={btnGhost}
              >
                + Add Number
              </button>
            </div>

            <div className="space-y-4">
              {contacts.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-green-700/30 bg-gradient-to-br from-black/80 to-green-950/10 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-green-200">
                      Number #{idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setContacts((prev) => prev.filter((_, i) => i !== idx))
                      }
                      disabled={contacts.length === 1}
                      className={btnDanger}
                    >
                      Remove
                    </button>
                  </div>

                  <BiInput
                    title="Label"
                    bnProps={{
                      value: item.label?.bn || "",
                      onChange: (e) =>
                        patchArrayBi(
                          setContacts,
                          idx,
                          "label",
                          "bn",
                          e.target.value,
                        ),
                    }}
                    enProps={{
                      value: item.label?.en || "",
                      onChange: (e) =>
                        patchArrayBi(
                          setContacts,
                          idx,
                          "label",
                          "en",
                          e.target.value,
                        ),
                    }}
                    bnPlaceholder="যেমন: এজেন্ট নাম্বার"
                    enPlaceholder="e.g. Agent Number"
                  />

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelCls}>Number</label>
                      <input
                        className={inputBase}
                        value={item.number || ""}
                        onChange={(e) =>
                          patchArray(setContacts, idx, "number", e.target.value)
                        }
                        placeholder="01XXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Sort</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.sort ?? 0)}
                        onChange={(e) =>
                          patchArray(
                            setContacts,
                            idx,
                            "sort",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer accent-green-500"
                          checked={item.isActive ?? true}
                          onChange={(e) =>
                            patchArray(
                              setContacts,
                              idx,
                              "isActive",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-green-100 font-medium">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-green-700/30 bg-black/30 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaLayerGroup className="text-green-300" />
                <h3 className={subTitleCls}>Deposit Channels</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setChannels((prev) => [...prev, defaultChannel()])
                }
                className={btnGhost}
              >
                + Add Channel
              </button>
            </div>

            <div className="space-y-4">
              {channels.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-green-700/30 bg-gradient-to-br from-black/80 to-green-950/10 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-green-200">
                      Channel #{idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setChannels((prev) => prev.filter((_, i) => i !== idx))
                      }
                      disabled={channels.length === 1}
                      className={btnDanger}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>Channel ID</label>
                      <input
                        className={inputBase}
                        value={item.id || ""}
                        onChange={(e) =>
                          patchArray(setChannels, idx, "id", e.target.value)
                        }
                        placeholder="zappay / dpay"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Tag Text</label>
                      <input
                        className={inputBase}
                        value={item.tagText || ""}
                        onChange={(e) =>
                          patchArray(
                            setChannels,
                            idx,
                            "tagText",
                            e.target.value,
                          )
                        }
                        placeholder="+3%"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Channel Name"
                      bnProps={{
                        value: item.name?.bn || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setChannels,
                            idx,
                            "name",
                            "bn",
                            e.target.value,
                          ),
                      }}
                      enProps={{
                        value: item.name?.en || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setChannels,
                            idx,
                            "name",
                            "en",
                            e.target.value,
                          ),
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>Bonus Percent</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.bonusPercent ?? 0)}
                        onChange={(e) =>
                          patchArray(
                            setChannels,
                            idx,
                            "bonusPercent",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer accent-green-500"
                          checked={item.isActive ?? true}
                          onChange={(e) =>
                            patchArray(
                              setChannels,
                              idx,
                              "isActive",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-green-100 font-medium">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Bonus Title"
                      bnProps={{
                        value: item.bonusTitle?.bn || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setChannels,
                            idx,
                            "bonusTitle",
                            "bn",
                            e.target.value,
                          ),
                      }}
                      enProps={{
                        value: item.bonusTitle?.en || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setChannels,
                            idx,
                            "bonusTitle",
                            "en",
                            e.target.value,
                          ),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-green-700/30 bg-black/30 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaGift className="text-green-300" />
                <h3 className={subTitleCls}>Promotions</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPromotions((prev) => [...prev, defaultPromotion()])
                }
                className={btnGhost}
              >
                + Add Promotion
              </button>
            </div>

            <div className="space-y-4">
              {promotions.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-green-700/30 bg-gradient-to-br from-black/80 to-green-950/10 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-green-200">
                      Promotion #{idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setPromotions((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      disabled={promotions.length === 1}
                      className={btnDanger}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>Promotion ID</label>
                      <input
                        className={inputBase}
                        value={item.id || ""}
                        onChange={(e) =>
                          patchArray(
                            setPromotions,
                            idx,
                            "id",
                            String(e.target.value || "").toLowerCase(),
                          )
                        }
                        placeholder="welcome / reload"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer accent-green-500"
                          checked={item.isActive ?? true}
                          onChange={(e) =>
                            patchArray(
                              setPromotions,
                              idx,
                              "isActive",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-green-100 font-medium">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Promotion Name"
                      bnProps={{
                        value: item.name?.bn || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setPromotions,
                            idx,
                            "name",
                            "bn",
                            e.target.value,
                          ),
                      }}
                      enProps={{
                        value: item.name?.en || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setPromotions,
                            idx,
                            "name",
                            "en",
                            e.target.value,
                          ),
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <label className={labelCls}>Bonus Type</label>
                      <select
                        className={inputBase}
                        value={item.bonusType || "fixed"}
                        onChange={(e) =>
                          patchArray(
                            setPromotions,
                            idx,
                            "bonusType",
                            e.target.value,
                          )
                        }
                      >
                        <option value="fixed">fixed</option>
                        <option value="percent">percent</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Bonus Value</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.bonusValue ?? 0)}
                        onChange={(e) =>
                          patchArray(
                            setPromotions,
                            idx,
                            "bonusValue",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Promotion Turnover</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.turnoverMultiplier ?? 1)}
                        onChange={(e) =>
                          patchArray(
                            setPromotions,
                            idx,
                            "turnoverMultiplier",
                            Number(e.target.value || 1),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Sort</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.sort ?? 0)}
                        onChange={(e) =>
                          patchArray(
                            setPromotions,
                            idx,
                            "sort",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-green-700/30 bg-black/30 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaListAlt className="text-green-300" />
                <h3 className={subTitleCls}>Deposit Modal Inputs</h3>
              </div>
              <button
                type="button"
                onClick={() => setInputs((prev) => [...prev, defaultInput()])}
                className={btnGhost}
              >
                + Add Field
              </button>
            </div>

            <div className="space-y-4">
              {inputs.map((item, idx) => (
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
                        setInputs((prev) => prev.filter((_, i) => i !== idx))
                      }
                      disabled={inputs.length === 1}
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
                        value={item.key || ""}
                        onChange={(e) =>
                          patchArray(setInputs, idx, "key", e.target.value)
                        }
                        placeholder="amount / trxId"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        className={inputBase}
                        value={item.type || "text"}
                        onChange={(e) =>
                          patchArray(setInputs, idx, "type", e.target.value)
                        }
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="tel">tel</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Label"
                      bnProps={{
                        value: item.label?.bn || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setInputs,
                            idx,
                            "label",
                            "bn",
                            e.target.value,
                          ),
                      }}
                      enProps={{
                        value: item.label?.en || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setInputs,
                            idx,
                            "label",
                            "en",
                            e.target.value,
                          ),
                      }}
                    />
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Placeholder"
                      bnProps={{
                        value: item.placeholder?.bn || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setInputs,
                            idx,
                            "placeholder",
                            "bn",
                            e.target.value,
                          ),
                      }}
                      enProps={{
                        value: item.placeholder?.en || "",
                        onChange: (e) =>
                          patchArrayBi(
                            setInputs,
                            idx,
                            "placeholder",
                            "en",
                            e.target.value,
                          ),
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer accent-green-500"
                          checked={!!item.required}
                          onChange={(e) =>
                            patchArray(
                              setInputs,
                              idx,
                              "required",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-green-100 font-medium">
                          Required
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className={labelCls}>Min Length</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.minLength ?? 0)}
                        onChange={(e) =>
                          patchArray(
                            setInputs,
                            idx,
                            "minLength",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Max Length</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.maxLength ?? 0)}
                        onChange={(e) =>
                          patchArray(
                            setInputs,
                            idx,
                            "maxLength",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={titleCls}>All Deposit Methods</h2>
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
              Loading deposit methods...
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-green-700/30 bg-black/20 p-10 text-center text-green-200/70">
              কোনো deposit method পাওয়া যায়নি
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {list.map((method) => {
                const displayName =
                  method.methodName?.bn ||
                  method.methodName?.en ||
                  method.methodId;

                const numbers =
                  method?.details?.contacts
                    ?.map((item) => item.number)
                    .filter(Boolean) || [];

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
                              Method Turnover
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                              {method.turnoverMultiplier}x
                            </p>
                          </div>

                          <div className="rounded-xl border border-green-700/30 bg-black/30 p-3">
                            <p className="text-sm text-green-300">
                              Deposit Range
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                              {method.minDepositAmount} -{" "}
                              {method.maxDepositAmount}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-green-700/30 bg-black/30 p-3">
                          <p className="mb-2 text-sm font-semibold text-green-300">
                            Added Numbers
                          </p>

                          {numbers.length ? (
                            <div className="flex flex-wrap gap-2">
                              {numbers.map((num, idx) => (
                                <span
                                  key={`${num}-${idx}`}
                                  className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-100"
                                >
                                  {num}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-green-200/70">
                              কোনো number নেই
                            </p>
                          )}
                        </div>

                        <div className="mt-4 rounded-xl border border-green-700/30 bg-black/30 p-3">
                          <p className="mb-2 text-sm font-semibold text-green-300">
                            Promotions
                          </p>
                          {method.promotions?.length ? (
                            <div className="space-y-2">
                              {method.promotions.map((promo, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-green-700/20 bg-black/20 px-3 py-2"
                                >
                                  <span className="text-sm text-green-100">
                                    {promo?.name?.bn ||
                                      promo?.name?.en ||
                                      promo?.id}
                                  </span>
                                  <span className="text-xs text-green-300">
                                    Turnover: {promo?.turnoverMultiplier || 1}x
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-green-200/70">
                              কোনো promotion নেই
                            </p>
                          )}
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

export default AddDeposit;
