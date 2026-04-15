import React, { useEffect, useMemo, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { api } from "../../api/axios";
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

const card =
  "bg-gradient-to-b from-black via-green-950/25 to-black border border-green-800/50 rounded-2xl shadow-2xl shadow-green-900/30";

const labelCls = "text-[13px] font-semibold text-green-100";
const inputCls =
  "mt-2 w-full h-[44px] rounded-xl border border-green-700/50 bg-black/70 px-4 text-[14px] text-white outline-none placeholder-green-300/40 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all";

const Withdraw = () => {
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const token = auth?.token;

  const isAuthed = useSelector(selectIsAuthenticated);
  const me = useSelector(selectUser);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const notices = useMemo(
    () => [
      {
        title: "Bulk Adjustment First:",
        body: "Bulk Adjustment না হলে affiliate withdraw submit করতে পারবে না.",
      },
      {
        title: "Use Official Withdrawal Method:",
        body: "শুধু এই panel-এর official method ব্যবহার করুন.",
      },
      {
        title: "Correct Account Information:",
        body: "ভুল account number / wallet info দিলে delay বা problem হতে পারে.",
      },
    ],
    [],
  );

  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methods, setMethods] = useState([]);

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.get("/api/aff-withdraw-methods");
      const rows = res?.data?.data || res?.data || [];
      setMethods(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setMethods([]);
      console.error(e);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const [eligLoading, setEligLoading] = useState(false);
  const [elig, setElig] = useState({
    eligible: true,
    remaining: 0,
    message: "",
  });

  const loadEligibility = async () => {
    if (!token) {
      setElig({
        eligible: false,
        remaining: 0,
        message: "Please login to withdraw.",
      });
      return;
    }

    try {
      setEligLoading(true);
      const { data } = await api.get("/api/aff-withdraw-requests/eligibility", {
        headers,
      });
      const payload = data?.data || data || {};
      setElig({
        eligible: !!payload.eligible,
        remaining: Number(payload.remaining || 0),
        message: payload.message || "",
      });
    } catch (e) {
      setElig({
        eligible: false,
        remaining: 0,
        message: e?.response?.data?.message || "Unable to check eligibility.",
      });
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [selectedId, setSelectedId] = useState("");
  const selectedMethod = useMemo(() => {
    if (!methods.length) return null;
    return methods.find((m) => String(m.methodId) === String(selectedId)) || null;
  }, [methods, selectedId]);

  useEffect(() => {
    if (!selectedId && methods.length) {
      setSelectedId(methods[0]?.methodId || "");
    }
  }, [methods, selectedId]);

  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    if (!selectedMethod) return;
    const next = {};
    (selectedMethod.fields || []).forEach((f) => {
      next[f.key] = "";
    });
    setFormValues(next);
  }, [selectedMethod?._id]);

  const setVal = (key, value) => setFormValues((p) => ({ ...p, [key]: value }));

  const [amount, setAmount] = useState("");
  const amountNum = Number(amount || 0);

  const min = useMemo(() => {
    const v = Number(selectedMethod?.minimumWithdrawAmount ?? 0);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [selectedMethod]);

  const max = useMemo(() => {
    const v = Number(selectedMethod?.maximumWithdrawAmount ?? 0);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [selectedMethod]);

  const hasMax = Number(max) > 0;

  const validAmount = useMemo(() => {
    if (!Number.isFinite(amountNum) || amountNum <= 0) return false;
    if (amountNum < Number(min)) return false;
    if (hasMax && amountNum > Number(max)) return false;
    if (amountNum > Number(elig.remaining || 0)) return false;
    return true;
  }, [amountNum, min, max, hasMax, elig.remaining]);

  const amountErrorText = useMemo(() => {
    if (!amount) return "";
    if (!Number.isFinite(amountNum) || amountNum <= 0) return "Enter a valid amount.";
    if (amountNum < Number(min)) {
      return `Minimum withdraw amount is ৳ ${Number(min).toLocaleString()}.`;
    }
    if (hasMax && amountNum > Number(max)) {
      return `Maximum withdraw amount is ৳ ${Number(max).toLocaleString()}.`;
    }
    if (amountNum > Number(elig.remaining || 0)) {
      return `You cannot withdraw more than ৳ ${Number(elig.remaining || 0).toLocaleString()}.`;
    }
    return "";
  }, [amount, amountNum, min, max, hasMax, elig.remaining]);

  const fieldErrors = useMemo(() => {
    const errs = {};
    const fields = selectedMethod?.fields || [];

    fields.forEach((f) => {
      const v = String(formValues?.[f.key] ?? "").trim();

      if (f.required !== false && !v) {
        errs[f.key] = "This field is required";
        return;
      }

      if (v) {
        if (f.type === "email") {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          if (!ok) errs[f.key] = "Enter a valid email";
        }

        if (f.type === "number") {
          const num = Number(v);
          if (!Number.isFinite(num)) errs[f.key] = "Numbers only";
        }

        if (f.type === "tel") {
          const bdOk = /^01[3-9]\d{8}$/.test(v);
          if (v.startsWith("01") && v.length >= 11 && !bdOk) {
            errs[f.key] = "Enter a valid Bangladeshi phone number";
          }
        }
      }
    });

    return errs;
  }, [selectedMethod, formValues]);

  const allRequiredOk = useMemo(() => {
    const fields = selectedMethod?.fields || [];
    for (const f of fields) {
      if (f.required !== false) {
        const v = String(formValues?.[f.key] ?? "").trim();
        if (!v) return false;
      }
    }
    return true;
  }, [selectedMethod, formValues]);

  const noTypeErrors = Object.keys(fieldErrors).length === 0;
  const accountOk = !!token && !!me?._id && !!isAuthed;

  const canSubmit =
    accountOk &&
    !!selectedMethod &&
    validAmount &&
    allRequiredOk &&
    noTypeErrors &&
    elig.eligible;

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;

    const payload = {
      methodId: selectedMethod?.methodId,
      amount: amountNum,
      fields: { ...formValues },
    };

    try {
      setSubmitting(true);
      await api.post("/api/aff-withdraw-requests", payload, { headers });

      toast.success("Withdraw request submitted!");
      navigate("/dashboard/withdraw-history");

      setAmount("");
      const next = {};
      (selectedMethod?.fields || []).forEach((f) => (next[f.key] = ""));
      setFormValues(next);

      loadEligibility();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Withdraw request failed");
      loadEligibility();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className={`${card} p-5 sm:p-7`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[22px] font-extrabold text-white tracking-tight">
                Withdraw
              </div>
              <div className="mt-1 text-[12px] text-green-200/70">
                Submit your affiliate withdraw request
              </div>
            </div>

            <button
              type="button"
              onClick={loadMethods}
              className="cursor-pointer h-10 px-4 rounded-xl border border-green-700/60 bg-green-900/20 hover:bg-green-900/35 text-green-100 text-[13px] font-semibold transition"
            >
              Refresh
            </button>
          </div>

          {!accountOk && (
            <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
              <div className="text-[14px] font-extrabold text-yellow-200">
                Login Required
              </div>
              <div className="mt-1 text-[13px] text-yellow-200/85">
                Please login to submit a withdraw request.
              </div>
            </div>
          )}

          {accountOk && !eligLoading && !elig.eligible && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="text-[14px] font-extrabold text-red-200">
                Withdrawal Not Allowed
              </div>
              <div className="mt-1 text-[13px] text-red-200/85">
                {elig.message || "You are not eligible right now."}
              </div>
            </div>
          )}

          {accountOk && eligLoading && (
            <div className="mt-4 text-[12px] text-green-200/70">
              Checking eligibility…
            </div>
          )}

          {accountOk && !eligLoading && elig.eligible && (
            <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
              <div className="text-[14px] font-extrabold text-green-200">
                Withdrawable Balance
              </div>
              <div className="mt-1 text-[16px] font-extrabold text-white">
                ৳ {Number(elig.remaining || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className={labelCls}>
              Withdrawal Options <span className="text-red-400">*</span>
            </label>

            <div className="mt-3 flex flex-wrap gap-3">
              {loadingMethods ? (
                <div className="text-[13px] text-green-200/70">Loading…</div>
              ) : methods.length ? (
                methods.map((m) => {
                  const active = String(selectedId) === String(m.methodId);
                  const logo = m.logoUrl ? `${import.meta.env.VITE_APP_URL}${m.logoUrl}` : "";

                  return (
                    <button
                      key={m._id || m.methodId}
                      type="button"
                      onClick={() => setSelectedId(m.methodId)}
                      disabled={!accountOk}
                      className={`
                        h-[80px] w-[184px]
                        rounded-xl border bg-black/40
                        flex items-center justify-center
                        transition
                        ${
                          active
                            ? "border-green-300 shadow-[0_10px_30px_rgba(34,197,94,0.18)]"
                            : "border-green-800/50 hover:border-green-600/70"
                        }
                        ${!accountOk ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                      `}
                      title={m?.name?.en || m?.methodId}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={m?.name?.en || m?.methodId}
                          className="max-h-[76px] max-w-[180px] object-contain"
                        />
                      ) : (
                        <div className="text-[11px] font-extrabold text-green-200/80">
                          {m?.name?.en || m?.methodId}
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-[13px] text-green-200/70">
                  No withdraw methods found.
                </div>
              )}
            </div>

            {!!selectedMethod && (
              <div className="mt-3 text-[12px] text-green-200/70">
                Selected:{" "}
                <span className="font-bold text-white">
                  {selectedMethod?.name?.en || selectedMethod?.methodId}
                </span>
              </div>
            )}
          </div>

          {!!selectedMethod?.fields?.length && (
            <div className="mt-7">
              <div className="text-[14px] font-semibold text-white">
                Account Information <span className="text-red-400">*</span>
              </div>

              <div className="mt-3 max-w-[560px] space-y-4">
                {selectedMethod.fields.map((f) => {
                  const label = f?.label?.en || f.key;
                  const placeholder = f?.placeholder?.en || "";
                  const err = fieldErrors?.[f.key];

                  return (
                    <div key={f.key}>
                      <label className="text-[13px] font-semibold text-green-100">
                        {label}{" "}
                        {f.required !== false && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>

                      <input
                        disabled={!accountOk}
                        type={f.type === "number" ? "text" : f.type}
                        value={formValues?.[f.key] ?? ""}
                        onChange={(e) => setVal(f.key, e.target.value)}
                        placeholder={placeholder}
                        className={`${inputCls} ${
                          !accountOk ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        inputMode={f.type === "number" ? "numeric" : undefined}
                      />

                      {!!err && <div className="mt-2 text-[12px] text-red-300">{err}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-7 max-w-[560px]">
            <div className="flex items-center justify-between gap-3">
              <label className={labelCls}>
                Withdraw Amount <span className="text-red-400">*</span>
              </label>
              <FaQuestionCircle className="text-green-200/70" />
            </div>

            <input
              disabled={!accountOk}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={
                hasMax
                  ? `Min ৳ ${Number(min).toLocaleString()} - Max ৳ ${Number(max).toLocaleString()}`
                  : `Min ৳ ${Number(min).toLocaleString()}`
              }
              className={`${inputCls} ${!accountOk ? "opacity-60 cursor-not-allowed" : ""}`}
              inputMode="numeric"
            />

            {!!amountErrorText && (
              <div className="mt-2 text-[12px] text-red-300">{amountErrorText}</div>
            )}
          </div>

          <div className="mt-7 max-w-[560px]">
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={onSubmit}
              className={`
                w-full h-[50px] rounded-2xl font-extrabold text-[14px] transition
                ${
                  canSubmit && !submitting
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-700/40 border border-green-500/40 cursor-pointer"
                    : "bg-gray-800/60 text-white/30 border border-green-900/40 cursor-not-allowed"
                }
              `}
            >
              {submitting ? "Submitting…" : "WITHDRAW"}
            </button>

            {!canSubmit && !submitting && (
              <div className="mt-2 text-[12px] text-green-200/60">
                {!accountOk
                  ? "Please login."
                  : !elig.eligible
                    ? elig.message || "Not eligible right now."
                    : !selectedMethod
                      ? "Select a method."
                      : !allRequiredOk
                        ? "Fill all required fields."
                        : !noTypeErrors
                          ? "Some inputs are invalid."
                          : !validAmount
                            ? "Amount is invalid."
                            : null}
              </div>
            )}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <div className="text-[14px] font-extrabold text-white">
            Important Notice
          </div>
          <div className="mt-4 space-y-4 text-[12px] leading-relaxed text-green-100/80">
            {notices.map((n, idx) => (
              <div key={idx}>
                <div className="font-extrabold text-green-100">
                  {idx + 1}. {n.title}
                </div>
                <p className="mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;