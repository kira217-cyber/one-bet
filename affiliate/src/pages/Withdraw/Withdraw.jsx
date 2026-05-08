import React, { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaQuestionCircle,
  FaRedoAlt,
  FaTimesCircle,
  FaUserCheck,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
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

const money = (value) => {
  const num = Number(value || 0);

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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
        title: "Referral Requirement:",
        body: "Withdraw করতে হলে কমপক্ষে ৫ জন active referred user থাকতে হবে এবং প্রত্যেকে অন্তত একবার deposit করতে হবে.",
      },
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

  const [eligLoading, setEligLoading] = useState(false);
  const [elig, setElig] = useState({
    eligible: false,
    remaining: 0,
    message: "",
    required: 5,
    activeReferralCount: 0,
    depositedReferralCount: 0,
    remainingReferralCount: 5,
  });

  const [selectedId, setSelectedId] = useState("");
  const [formValues, setFormValues] = useState({});
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const accountOk = !!token && !!me?._id && !!isAuthed;

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);

      const res = await api.get("/api/aff-withdraw-methods");
      const rows = res?.data?.data || res?.data || [];

      setMethods(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setMethods([]);
      toast.error("Failed to load withdraw methods");
    } finally {
      setLoadingMethods(false);
    }
  };

  const loadEligibility = async () => {
    if (!token) {
      setElig({
        eligible: false,
        remaining: 0,
        message: "Please login to withdraw.",
        required: 5,
        activeReferralCount: 0,
        depositedReferralCount: 0,
        remainingReferralCount: 5,
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
        required: Number(payload.required || 5),
        activeReferralCount: Number(payload.activeReferralCount || 0),
        depositedReferralCount: Number(payload.depositedReferralCount || 0),
        remainingReferralCount: Number(payload.remainingReferralCount || 0),
      });
    } catch (e) {
      setElig({
        eligible: false,
        remaining: 0,
        message: e?.response?.data?.message || "Unable to check eligibility.",
        required: 5,
        activeReferralCount: 0,
        depositedReferralCount: 0,
        remainingReferralCount: 5,
      });
    } finally {
      setEligLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  useEffect(() => {
    if (token) {
      loadEligibility();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  useEffect(() => {
    if (!selectedMethod) return;

    const next = {};

    (selectedMethod.fields || []).forEach((f) => {
      next[f.key] = "";
    });

    setFormValues(next);
  }, [selectedMethod?._id]);

  const setVal = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

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

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return "Enter a valid amount.";
    }

    if (amountNum < Number(min)) {
      return `Minimum withdraw amount is ${money(min)}.`;
    }

    if (hasMax && amountNum > Number(max)) {
      return `Maximum withdraw amount is ${money(max)}.`;
    }

    if (amountNum > Number(elig.remaining || 0)) {
      return `You cannot withdraw more than ${money(elig.remaining)}.`;
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

      if (!v) return;

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

  const canSubmit =
    accountOk &&
    !!selectedMethod &&
    validAmount &&
    allRequiredOk &&
    noTypeErrors &&
    elig.eligible &&
    !eligLoading;

  const refreshAll = () => {
    loadMethods();
    loadEligibility();
  };

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
      (selectedMethod?.fields || []).forEach((f) => {
        next[f.key] = "";
      });

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
              onClick={refreshAll}
              disabled={loadingMethods || eligLoading}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 h-10 px-4 rounded-xl border border-green-700/60 bg-green-900/20 hover:bg-green-900/35 text-green-100 text-[13px] font-semibold transition flex items-center gap-2"
            >
              <FaRedoAlt
                className={loadingMethods || eligLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {!accountOk && (
            <NoticeBox
              type="warning"
              title="Login Required"
              message="Please login to submit a withdraw request."
            />
          )}

          {accountOk && eligLoading && (
            <div className="mt-4 text-[12px] text-green-200/70">
              Checking eligibility…
            </div>
          )}

          {accountOk && !eligLoading && (
            <>
              <EligibilityCards elig={elig} />

              {!elig.eligible ? (
                <NoticeBox
                  type="danger"
                  title="Withdrawal Not Allowed"
                  message={elig.message || "You are not eligible right now."}
                />
              ) : (
                <NoticeBox
                  type="success"
                  title="Withdrawal Allowed"
                  message="Your referral requirement is complete. You can submit withdraw request."
                />
              )}

              <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                <div className="text-[14px] font-extrabold text-green-200">
                  Withdrawable Balance
                </div>

                <div className="mt-1 text-[16px] font-extrabold text-white">
                  {money(elig.remaining || 0)}
                </div>
              </div>
            </>
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

                  const logo = m.logoUrl
                    ? `${import.meta.env.VITE_APP_URL}${m.logoUrl}`
                    : "";

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
                        ${
                          !accountOk
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                        }
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

                      {!!err && (
                        <div className="mt-2 text-[12px] text-red-300">
                          {err}
                        </div>
                      )}
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
                  ? `Min ${money(min)} - Max ${money(max)}`
                  : `Min ${money(min)}`
              }
              className={`${inputCls} ${
                !accountOk ? "opacity-60 cursor-not-allowed" : ""
              }`}
              inputMode="numeric"
            />

            {!!amountErrorText && (
              <div className="mt-2 text-[12px] text-red-300">
                {amountErrorText}
              </div>
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
                  : eligLoading
                    ? "Checking eligibility."
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
            {notices.map((notice, idx) => (
              <div key={idx}>
                <div className="font-extrabold text-green-100">
                  {idx + 1}. {notice.title}
                </div>

                <p className="mt-1">{notice.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EligibilityCards = ({ elig }) => {
  const required = Number(elig?.required || 5);
  const active = Number(elig?.activeReferralCount || 0);
  const deposited = Number(elig?.depositedReferralCount || 0);
  const remaining = Math.max(Number(elig?.remainingReferralCount || 0), 0);

  return (
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <MiniCard
        label="Required"
        value={required}
        icon={<FaUsers />}
        valueClass="text-blue-300"
        iconClass="bg-blue-500/15 text-blue-300"
      />

      <MiniCard
        label="Active Referrals"
        value={active}
        icon={<FaUserCheck />}
        valueClass="text-green-300"
        iconClass="bg-green-500/15 text-green-300"
      />

      <MiniCard
        label="Deposited Referrals"
        value={deposited}
        icon={<FaCheckCircle />}
        valueClass="text-emerald-300"
        iconClass="bg-emerald-500/15 text-emerald-300"
      />

      <MiniCard
        label="Remaining"
        value={remaining}
        icon={remaining > 0 ? <FaTimesCircle /> : <FaCheckCircle />}
        valueClass={remaining > 0 ? "text-red-300" : "text-emerald-300"}
        iconClass={
          remaining > 0
            ? "bg-red-500/15 text-red-300"
            : "bg-emerald-500/15 text-emerald-300"
        }
      />
    </div>
  );
};

const MiniCard = ({ label, value, icon, valueClass, iconClass }) => {
  return (
    <div className="rounded-2xl border border-green-800/45 bg-black/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-green-200/70">
            {label}
          </div>

          <div className={`mt-1 text-[20px] font-extrabold ${valueClass}`}>
            {value}
          </div>
        </div>

        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const NoticeBox = ({ type = "success", title, message }) => {
  const styles = {
    success: "border-green-500/30 bg-green-500/10 text-green-200",
    warning: "border-yellow-400/30 bg-yellow-500/10 text-yellow-200",
    danger: "border-red-500/30 bg-red-500/10 text-red-200",
  };

  return (
    <div className={`mt-5 rounded-2xl border p-4 ${styles[type]}`}>
      <div className="text-[14px] font-extrabold">{title}</div>

      <div className="mt-1 text-[13px] opacity-90">{message}</div>
    </div>
  );
};

export default Withdraw;
