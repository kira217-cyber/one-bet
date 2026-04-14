import React, { useEffect, useMemo, useState } from "react";
import { FaQuestionCircle, FaWallet } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { api } from "../../api/axios";
import { selectIsAuthenticated, selectUser } from "../../features/auth/authSelectors";
import Tab from "../../components/Tab/Tab";

const Withdraw = () => {
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);

  const isActiveUser = user?.isActive === true;

  const notices = useMemo(
    () => [
      {
        title: "Use Official Deposit & Withdrawal Channels Only:",
        body: "Kindly withdraw funds through the designated official channels available on our website. Avoid any unofficial or third-party platforms.",
      },
      {
        title: "Live Chat Support for Pending Transactions:",
        body: "If your withdrawal remains pending for more than 15 minutes, please contact our live chat support.",
      },
      {
        title: "Caution Regarding Cash-Outs:",
        body: "During withdrawal, use the correct wallet/number. Wrong numbers may cause delays or issues.",
      },
      {
        title: "Turnover Rule:",
        body: "If you have a running turnover, withdrawal will remain blocked until the turnover is completed.",
      },
    ],
    [],
  );

  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methods, setMethods] = useState([]);

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      const res = await api.get("/api/withdraw-methods");
      const rows = res?.data?.data || [];
      setMethods(
        Array.isArray(rows) ? rows.filter((m) => m?.isActive !== false) : [],
      );
    } catch (e) {
      setMethods([]);
      console.error("Failed to load withdraw methods", e);
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
    hasRunningTurnover: false,
    remaining: 0,
    message: "",
  });

  const loadEligibility = async () => {
    if (!isAuthed) {
      setElig({
        eligible: false,
        hasRunningTurnover: false,
        remaining: 0,
        message: "Please login to withdraw.",
      });
      return;
    }

    try {
      setEligLoading(true);
      const { data } = await api.get("/api/withdraw-requests/eligibility");
      const payload = data?.data || {};
      setElig({
        eligible: !!payload.eligible,
        hasRunningTurnover: !!payload.hasRunningTurnover,
        remaining: Number(payload.remaining || 0),
        message: payload.message || "",
      });
    } catch (e) {
      setElig((p) => ({ ...p, eligible: true }));
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
  }, [isAuthed]);

  const [selectedId, setSelectedId] = useState("");

  const selectedMethod = useMemo(() => {
    if (!methods.length) return null;
    return (
      methods.find((m) => String(m.methodId) === String(selectedId)) || null
    );
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

  const setVal = (key, value) => {
    setFormValues((p) => ({ ...p, [key]: value }));
  };

  const [amount, setAmount] = useState("");

  const min = useMemo(() => {
    const v = Number(selectedMethod?.minimumWithdrawAmount ?? 500);
    return Number.isFinite(v) && v >= 0 ? v : 500;
  }, [selectedMethod]);

  const max = useMemo(() => {
    const v = Number(selectedMethod?.maximumWithdrawAmount ?? 30000);
    return Number.isFinite(v) && v >= 0 ? v : 30000;
  }, [selectedMethod]);

  const amountNum = Number(amount || 0);
  const hasMax = Number(max) > 0;

  const validAmount = useMemo(() => {
    if (!Number.isFinite(amountNum)) return false;
    if (amountNum < Number(min)) return false;
    if (hasMax && amountNum > Number(max)) return false;
    return true;
  }, [amountNum, min, max, hasMax]);

  const amountErrorText = useMemo(() => {
    if (!amount) return "";
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return "Enter a valid amount.";
    }
    if (amountNum < Number(min)) {
      return `Minimum withdraw amount is ৳ ${Number(min).toLocaleString()}.`;
    }
    if (hasMax && amountNum > Number(max)) {
      return `Maximum withdraw amount is ৳ ${Number(max).toLocaleString()}.`;
    }
    return "";
  }, [amount, amountNum, min, max, hasMax]);

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

        if (f.type === "tel") {
          const bdOk = /^01[3-9]\d{8}$/.test(v);
          if (v.startsWith("01") && v.length >= 11 && !bdOk) {
            errs[f.key] = "Enter a valid Bangladeshi phone number";
          }
        }

        if (f.type === "number") {
          const n = Number(v);
          if (!Number.isFinite(n)) errs[f.key] = "Numbers only";
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
  const accountOk = isAuthed && isActiveUser;

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

      await api.post("/api/withdraw-requests", payload);

      toast.success("Withdraw request submitted!");
      navigate("/withdraw");

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
    <>
    <Tab />
    <div className="w-full text-white">
      <div className="grid grid-cols-1 gap-4 ">
        <div className="border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-5 shadow-lg shadow-green-900/20 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
              <FaWallet className="text-xl" />
            </div>
            <div className="text-[20px] font-extrabold text-white">
              Withdrawal
            </div>
          </div>

          {!isAuthed && (
            <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4">
              <div className="text-[14px] font-extrabold text-yellow-200">
                Login Required
              </div>
              <div className="mt-1 text-[13px] text-yellow-100/90">
                Please login to submit a withdraw request.
              </div>
            </div>
          )}

          {isAuthed && !isActiveUser && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
              <div className="text-[14px] font-extrabold text-red-300">
                Account Inactive
              </div>
              <div className="mt-1 text-[13px] text-red-200/90">
                Your account is inactive. Please contact support.
              </div>
            </div>
          )}

          {isAuthed && !eligLoading && !elig.eligible && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
              <div className="text-[14px] font-extrabold text-red-300">
                Withdrawal Not Allowed
              </div>
              <div className="mt-1 text-[13px] text-red-200/90">
                {elig.message ||
                  "You have an active turnover. Complete it first."}
              </div>
              {elig.remaining > 0 && (
                <div className="mt-2 text-[13px] font-bold text-red-300">
                  Remaining turnover: ৳ {elig.remaining.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {isAuthed && eligLoading && (
            <div className="mt-4 text-[12px] text-white/60">
              Checking turnover...
            </div>
          )}

          <div className="mt-5">
            <label className="text-[14px] font-semibold text-white">
              Withdrawal Options <span className="text-red-400">*</span>
            </label>

            <div className="mt-3 flex flex-wrap gap-3">
              {loadingMethods ? (
                <div className="text-[13px] text-white/60">Loading...</div>
              ) : methods.length ? (
                methods.map((m) => {
                  const active = String(selectedId) === String(m.methodId);
                  const logo = m.logoUrl
                    ? `${import.meta.env.VITE_APP_URL}${m.logoUrl}`
                    : "";

                  return (
                    <button
                      key={m._id || m.methodId}
                      type="button"
                      onClick={() => setSelectedId(m.methodId)}
                      disabled={!accountOk}
                      className={`flex h-[56px] w-[92px] items-center justify-center rounded-xl border-2 bg-black/40 transition sm:w-[110px] ${
                        active
                          ? "border-green-400 shadow-lg shadow-green-500/20"
                          : "border-green-700/40 hover:border-green-500/60"
                      } ${!accountOk ? "opacity-60 cursor-not-allowed" : ""}`}
                      title={m?.name?.en || m?.methodId}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={m?.name?.en || m?.methodId}
                          className="max-h-[32px] max-w-[80px] object-contain"
                        />
                      ) : (
                        <div className="text-[11px] font-extrabold text-white/50">
                          {m?.name?.en || m?.methodId}
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-[13px] text-white/60">
                  No withdraw methods found.
                </div>
              )}
            </div>

            {!!selectedMethod && (
              <div className="mt-3 text-[12px] text-white/60">
                Selected:{" "}
                <span className="font-bold text-white">
                  {selectedMethod?.name?.en}
                </span>
              </div>
            )}
          </div>

          {!!selectedMethod?.fields?.length && (
            <div className="mt-6">
              <div className="text-[14px] font-semibold text-white">
                Account Information <span className="text-red-400">*</span>
              </div>

              <div className="mt-3 max-w-[520px] space-y-4">
                {selectedMethod.fields.map((f) => {
                  const label = f?.label?.en;
                  const placeholder = f?.placeholder?.en;
                  const err = fieldErrors?.[f.key];

                  return (
                    <div key={f.key}>
                      <label className="text-[14px] font-semibold text-white">
                        {label || f.key}{" "}
                        {f.required !== false && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>

                      <input
                        disabled={!accountOk}
                        type={f.type === "number" ? "text" : f.type}
                        value={formValues?.[f.key] ?? ""}
                        onChange={(e) => setVal(f.key, e.target.value)}
                        placeholder={placeholder || ""}
                        className={`mt-3 h-[44px] w-full rounded-xl border border-green-700/40 bg-black/40 px-4 text-[14px] text-white outline-none focus:ring-2 focus:ring-green-400/20 ${
                          !accountOk ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        inputMode={f.type === "number" ? "numeric" : undefined}
                      />

                      {!!err && (
                        <div className="mt-2 text-[12px] text-red-400">
                          {err}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex max-w-[520px] items-center justify-between gap-3">
              <label className="text-[14px] font-semibold text-white">
                Withdrawable Amount <span className="text-red-400">*</span>
              </label>
              <FaQuestionCircle className="text-white/70" />
            </div>

            <div className="mt-3 max-w-[520px]">
              <input
                disabled={!accountOk}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={
                  hasMax
                    ? `Min ৳ ${Number(min).toLocaleString()} - Max ৳ ${Number(max).toLocaleString()}`
                    : `Min ৳ ${Number(min).toLocaleString()}`
                }
                className={`h-[44px] w-full rounded-xl border border-green-700/40 bg-black/40 px-4 text-[14px] text-white outline-none focus:ring-2 focus:ring-green-400/20 ${
                  !accountOk ? "opacity-60 cursor-not-allowed" : ""
                }`}
                inputMode="numeric"
              />

              {!!amountErrorText && (
                <div className="mt-2 text-[12px] text-red-400">
                  {amountErrorText}
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 max-w-[520px]">
            <button
              type="button"
              disabled={!canSubmit || submitting}
              className={`h-[48px] w-full rounded-full text-[14px] font-extrabold transition ${
                canSubmit && !submitting
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400"
                  : "cursor-not-allowed bg-green-900/30 text-white/40"
              }`}
              onClick={onSubmit}
            >
              {submitting ? "Submitting..." : "WITHDRAWAL"}
            </button>

            {!canSubmit && !submitting && (
              <div className="mt-2 text-[12px] text-white/45">
                {!isAuthed
                  ? "Please login."
                  : !isActiveUser
                    ? "Account inactive."
                    : !elig.eligible
                      ? "Complete turnover first."
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

        {/* <div className="rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-4 shadow-lg shadow-green-900/20">
          <div className="text-[14px] font-extrabold text-white">
            Important Notice
          </div>
          <div className="mt-3 space-y-4 text-[12px] leading-relaxed text-white/70">
            {notices.map((n, idx) => (
              <div key={idx}>
                <div className="font-extrabold text-white/90">
                  {idx + 1}. {n.title}
                </div>
                <p className="mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
    </>
  );
};

export default Withdraw;
