import React, { useEffect, useMemo, useState } from "react";
import { FaRegCopy, FaChevronRight, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";


const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(r).padStart(2, "0");
  return `${mm}:${ss}`;
};

const safeCopy = async (text) => {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    return true;
  } catch {
    return false;
  }
};

const FallbackLogo = ({ methodId }) => (
  <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-green-500 bg-white">
    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-green-500">
      <div className="text-center text-[12px] font-extrabold text-green-700">
        {(methodId || "PAY").toUpperCase()}
      </div>
    </div>
  </div>
);

const InputRow = ({
  label,
  value,
  onChange,
  placeholder,
  copyable,
  onCopy,
  disabled,
  type = "text",
}) => (
  <div className="mt-3">
    <div className="text-[13px] font-semibold text-white">{label}</div>
    <div className="relative mt-1">
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        type={type}
        placeholder={placeholder}
        className={`h-[42px] w-full rounded-lg border border-green-700/30 bg-black/40 px-3 pr-10 text-[14px] outline-none focus:ring-2 focus:ring-green-400/20 ${
          disabled ? "text-white/70" : "text-white"
        }`}
      />
      {copyable ? (
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-2 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg"
          title="Copy"
        >
          <FaRegCopy className="text-[14px]" />
        </button>
      ) : null}
    </div>
  </div>
);

const DepositModal = ({
  open,
  onClose,
  data,
  details,
  methodDoc,
  channelDoc,
}) => {
  const apiBase = import.meta.env.VITE_APP_URL || "";
  const methodId = data?.methodId || methodDoc?.methodId || "pay";
  const navigate = useNavigate();

  const logoUrl = useMemo(() => {
    const u = methodDoc?.logoUrl;
    return u ? `${apiBase}${u}` : "";
  }, [apiBase, methodDoc?.logoUrl]);

  const inputDefs = useMemo(() => {
    const arr = methodDoc?.details?.inputs;
    return Array.isArray(arr) ? arr : [];
  }, [methodDoc]);

  const contacts = useMemo(() => {
    const arr = methodDoc?.details?.contacts;
    const list = Array.isArray(arr) ? arr : [];
    return [...list].sort(
      (a, b) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0),
    );
  }, [methodDoc]);

  const instructions = useMemo(() => {
    return (
      methodDoc?.details?.instructions?.en ||
      "Transfer to the number shown below and provide the correct transaction ID."
    );
  }, [methodDoc]);

  const [values, setValues] = useState({});
  const [seconds, setSeconds] = useState(0);
  const [howOpen, setHowOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSeconds(15 * 60);
    setHowOpen(false);

    const initial = {};

    if (inputDefs.length) {
      for (const f of inputDefs) {
        if (f.key === "amount") {
          initial[f.key] = String(data?.amount ?? "");
        } else {
          initial[f.key] = "";
        }
      }
    } else {
      initial.amount = String(data?.amount ?? "");
      initial.senderNumber = "";
      initial.trxId = "";
    }

    setValues(initial);

    const id = setInterval(() => {
      setSeconds((p) => (p > 0 ? p - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [open, data?.amount, inputDefs]);

  const setField = (key, val) => setValues((p) => ({ ...p, [key]: val }));

  const validateField = (def, val) => {
    const v = String(val ?? "").trim();
    if (def?.required && !v) return false;
    if (def?.minLength && v.length < def.minLength) return false;
    if (def?.maxLength && v.length > def.maxLength) return false;
    return true;
  };

  const canSubmit = useMemo(() => {
    if (seconds <= 0) return false;

    if (inputDefs.length) {
      for (const def of inputDefs) {
        if (!validateField(def, values[def.key])) return false;
      }

      if ("amount" in values) {
        const amt = Number(values.amount || 0);
        if (!Number.isFinite(amt) || amt <= 0) return false;
      }

      return true;
    }

    return (
      Number(values.amount || 0) > 0 &&
      String(values.senderNumber || "").trim().length >= 8 &&
      String(values.trxId || "").trim().length >= 6
    );
  }, [seconds, inputDefs, values]);

  const handleCopy = async (txt) => {
    const ok = await safeCopy(txt);
    if (ok) toast.success("Copied");
    else toast.error("Copy failed");
  };

  const buildPayload = () => {
    const submittedFields = {};

    Object.keys(values || {}).forEach((k) => {
      submittedFields[k] = String(values[k] ?? "");
    });

    return {
      methodId: data?.methodId,
      channelId: data?.channelId,
      promoId: data?.promoId || "none",
      amount: Number(values.amount ?? data?.amount ?? 0) || 0,
      clientCalc: {
        promoBonus: Number(details?.promoBonus ?? 0) || 0,
        percentBonus: Number(details?.percentBonus ?? 0) || 0,
        targetTurnover: Number(details?.targetTurnover ?? 0) || 0,
      },
      fields: submittedFields,
      display: {
        methodName: methodDoc?.methodName,
        channelName: channelDoc?.name,
        channelTagText: channelDoc?.tagText,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      const payload = buildPayload();

      const res = await api.post("/api/deposit-requests", payload);

      if (res?.data?.success) {
        toast.success("Deposit request submitted!");
        onClose?.();
        navigate("/deposit");
      } else {
        toast.error(res?.data?.message || "Deposit request failed");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";

      toast.error(msg);

      if (msg === "User not found") {
        toast.error("Login session mismatch. Please login again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const showContacts = Array.isArray(contacts) && contacts.length > 0;

  return (
    <div className="fixed inset-0 z-[99999]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 bg-[#0d1f18]">
        <div className="flex h-full w-full items-center justify-center px-4 py-8">
          <div className="h-[620px] w-full max-w-[640px] overflow-y-auto rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={methodId}
                      className="h-[64px] w-[64px] rounded-full bg-white object-cover"
                    />
                  ) : (
                    <FallbackLogo methodId={methodId} />
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[14px] font-extrabold text-white">
                    Time left{" "}
                    <span className="text-red-400">{formatTime(seconds)}</span>
                  </div>
                </div>
              </div>

              {/* Instruction */}
              <div className="mt-3 text-center text-[12px] leading-relaxed text-white/70">
                {instructions}
              </div>

              <div className="mt-4 h-px bg-green-700/30" />

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-3">
                {inputDefs.length ? (
                  inputDefs.map((def) => {
                    const label = def?.label?.en || def?.label?.bn || def.key;
                    const placeholder =
                      def?.placeholder?.en || def?.placeholder?.bn || "";
                    const isAmount = def.key === "amount";

                    return (
                      <InputRow
                        key={def.key}
                        label={`${label}${def.required ? " *" : ""}`}
                        value={values[def.key] ?? ""}
                        onChange={(e) => setField(def.key, e.target.value)}
                        placeholder={placeholder}
                        type={def.type || "text"}
                        copyable={isAmount}
                        onCopy={() => handleCopy(values[def.key] ?? "")}
                      />
                    );
                  })
                ) : (
                  <>
                    <InputRow
                      label="Amount (৳):"
                      value={values.amount || ""}
                      onChange={(e) => setField("amount", e.target.value)}
                      placeholder="1000"
                      copyable
                      onCopy={() => handleCopy(values.amount || "")}
                      type="number"
                    />

                    <InputRow
                      label="Sender number:"
                      value={values.senderNumber || ""}
                      onChange={(e) => setField("senderNumber", e.target.value)}
                      placeholder="01XXXXXXXXX"
                      type="tel"
                    />

                    <InputRow
                      label="Transaction ID:"
                      value={values.trxId || ""}
                      onChange={(e) => setField("trxId", e.target.value)}
                      placeholder="e.g. 9A7B6C5D"
                    />
                  </>
                )}

                {/* Contacts */}
                {showContacts ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {contacts
                      .filter((c) => c?.isActive !== false)
                      .map((c, idx) => {
                        const labelText =
                          c?.label?.en || c?.label?.bn || "Number";
                        const num = String(c?.number || "").trim();

                        return (
                          <InputRow
                            key={c?.id || `${idx}`}
                            label={`${labelText}:`}
                            value={num || "Not set"}
                            onChange={() => {}}
                            disabled
                            copyable={!!num}
                            onCopy={() => handleCopy(num)}
                          />
                        );
                      })}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className={`mt-4 h-[46px] w-full rounded-xl text-[15px] font-extrabold transition ${
                    canSubmit && !submitting
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400"
                      : "cursor-not-allowed bg-green-900/30 text-white/50"
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>

                {/* How to deposit accordion */}
                <button
                  type="button"
                  onClick={() => setHowOpen((p) => !p)}
                  className="mt-4 flex h-[44px] w-full items-center justify-between rounded-xl border border-green-700/30 bg-black/20 px-3"
                >
                  <div className="flex items-center gap-2 text-[14px] font-extrabold text-white">
                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded border border-white/20">
                      <FaChevronRight
                        className={`text-[12px] transition ${howOpen ? "rotate-90" : ""}`}
                      />
                    </span>
                    How to deposit?
                  </div>
                </button>

                {howOpen && (
                  <div className="mt-2 rounded-xl border border-green-700/20 bg-black/20 p-3 text-[12px] leading-relaxed text-white/70">
                    <ol className="list-decimal space-y-1 pl-5">
                      <li>Open your wallet app</li>
                      <li>Choose Send Money / Cash Out</li>
                      <li>Send to the number above</li>
                      <li>Paste the transaction ID here</li>
                      <li>Submit when done</li>
                    </ol>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-white/60">
                  <FaLock className="text-[12px]" />
                  <span>You’re in a secure place.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/90 shadow"
        aria-label="Close"
      >
        <span className="text-[20px] leading-none text-black/70">
          <IoMdClose />
        </span>
      </button>
    </div>
  );
};

export default DepositModal;
