import React, { useEffect, useMemo, useState } from "react";
import {
  FaExclamationCircle,
  FaQuestionCircle,
  FaTimes,
  FaWallet,
  FaGift,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { api } from "../../api/axios";
import Tab from "../../components/Tab/Tab";
// import Loading from "../../components/Loading/Loading";

const Tag = ({ text = "+0" }) => (
  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md bg-gradient-to-r from-green-400 to-emerald-500 px-2 py-[2px] text-[11px] font-extrabold text-black shadow-lg">
    {text}
  </span>
);

const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const clampNumber = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
};

const getBonusPreviewText = (bonus, isBangla) => {
  if (!bonus) return isBangla ? "কোনো বোনাস নেই" : "No Bonus";

  const bonusType = String(bonus?.bonusType || "fixed").toLowerCase();
  const bonusValue = Number(bonus?.bonusValue || 0);

  if (bonusType === "percent") {
    return `+${bonusValue}%`;
  }

  return `+${money(bonusValue)}`;
};

const calcAutoBonus = (amountNum, selectedBonus) => {
  if (!selectedBonus) {
    return {
      bonusAmount: 0,
      turnoverMultiplier: 1,
      creditedAmount: amountNum,
      targetTurnover: amountNum,
    };
  }

  const bonusType = String(selectedBonus?.bonusType || "fixed").toLowerCase();
  const bonusValue = Number(selectedBonus?.bonusValue || 0);
  const turnoverMultiplier =
    Number(selectedBonus?.turnoverMultiplier || 1) || 1;

  let bonusAmount = 0;

  if (bonusType === "percent") {
    bonusAmount = (amountNum * bonusValue) / 100;
  } else {
    bonusAmount = bonusValue;
  }

  bonusAmount = Math.floor(Number(bonusAmount || 0));
  const creditedAmount = amountNum + bonusAmount;
  const targetTurnover = Math.floor(creditedAmount * turnoverMultiplier);

  return {
    bonusAmount,
    turnoverMultiplier,
    creditedAmount,
    targetTurnover,
  };
};

const DepositDetailsModal = ({ open, onClose, onConfirm, details, t }) => {
  if (!open) return null;

  const Row = ({ k, v }) => (
    <div className="flex items-center justify-between">
      <div className="text-[14px] font-semibold text-white/60">{k}</div>
      <div className="text-[14px] font-extrabold text-white">{v}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative w-[92vw] max-w-[440px] rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-[18px] font-extrabold text-white">
            {t("ডিপোজিট ডিটেইলস", "Deposit Details")}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-2 text-white/70 hover:bg-white/5"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-4 h-px bg-green-700/30" />

        <div className="mt-5 space-y-3">
          <Row
            k={t("ডিপোজিট এমাউন্ট", "Deposit Amount")}
            v={money(details.depositAmount)}
          />
          <Row
            k={t("সিলেক্টেড বোনাস", "Selected Bonus")}
            v={details.bonusTitle}
          />
          <Row
            k={t("বোনাস এমাউন্ট", "Bonus Amount")}
            v={money(details.bonusAmount)}
          />
          <Row
            k={t("মোট ক্রেডিট", "Total Credited")}
            v={money(details.creditedAmount)}
          />
          <Row
            k={t("টার্নওভার মাল্টিপ্লায়ার", "Turnover Multiplier")}
            v={`x${details.turnoverMultiplier}`}
          />
          <Row
            k={t("টার্গেট টার্নওভার", "Target Turnover")}
            v={money(details.targetTurnover)}
          />
          <Row k={t("ইনভয়েস", "Invoice")} v={details.invoiceNumber} />
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 h-[46px] w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 font-extrabold text-black shadow-lg transition hover:from-green-400 hover:to-emerald-400"
        >
          {t("কনফার্ম", "Confirm")}
        </button>
      </div>
    </div>
  );
};

const AutoDeposit = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const user = useSelector(selectUser);
  const userId = user?._id;

  const quickAmounts = useMemo(
    () => [
      { v: 200, tag: "" },
      { v: 1000, tag: "" },
      { v: 5000, tag: "" },
      { v: 10000, tag: "" },
      { v: 20000, tag: "" },
      { v: 30000, tag: "" },
    ],
    [],
  );

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState(5);
  const [maxAmount, setMaxAmount] = useState(0);
  const [bonuses, setBonuses] = useState([]);

  const [amount, setAmount] = useState("1000");
  const [promo, setPromo] = useState("none");
  const [promoOpen, setPromoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoadingStatus(true);

        const { data } = await api.get("/api/auto-deposit/status");

        setEnabled(!!data?.data?.enabled);
        setMinAmount(Number(data?.data?.minAmount || 5));
        setMaxAmount(Number(data?.data?.maxAmount || 0));

        const serverBonuses = Array.isArray(data?.data?.bonuses)
          ? data.data.bonuses
          : [];

        const formatted = serverBonuses.map((b) => ({
          _id: String(b?._id || ""),
          title: {
            bn: b?.title?.bn || "",
            en: b?.title?.en || "",
          },
          bonusType: String(b?.bonusType || "fixed").toLowerCase(),
          bonusValue: Number(b?.bonusValue || 0),
          turnoverMultiplier: Number(b?.turnoverMultiplier || 1),
        }));

        setBonuses(formatted);
      } catch (e) {
        setEnabled(false);
        setMinAmount(5);
        setMaxAmount(0);
        setBonuses([]);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadStatus();
  }, []);

  const promotions = useMemo(() => {
    return [
      {
        _id: "none",
        name: t("কোনো বোনাস নিবো না", "No Bonus Selected"),
        bonusType: "fixed",
        bonusValue: 0,
        turnoverMultiplier: 1,
      },
      ...bonuses.map((b) => ({
        ...b,
        name: isBangla
          ? b?.title?.bn || b?.title?.en
          : b?.title?.en || b?.title?.bn,
      })),
    ];
  }, [bonuses, isBangla]);

  const selectedBonus = useMemo(() => {
    if (promo === "none") return null;
    return bonuses.find((b) => String(b._id) === String(promo)) || null;
  }, [promo, bonuses]);

  const amountNum = clampNumber(amount);
  const amountHasValue = amountNum > 0;

  const inMin = amountNum >= (minAmount > 0 ? minAmount : 0);
  const inMax = maxAmount > 0 ? amountNum <= maxAmount : true;
  const amountValid = amountHasValue && inMin && inMax;

  const amountErrorText = useMemo(() => {
    if (!amountHasValue) return "";
    if (!inMin) {
      return t(
        `ন্যূনতম ডিপোজিট ${money(minAmount)} হতে হবে`,
        `Minimum deposit must be ${money(minAmount)}`,
      );
    }
    if (!inMax) {
      return t(
        `সর্বোচ্চ ডিপোজিট ${money(maxAmount)} পর্যন্ত`,
        `Maximum deposit is ${money(maxAmount)}`,
      );
    }
    return "";
  }, [amountHasValue, inMin, inMax, minAmount, maxAmount, isBangla]);

  const { bonusAmount, turnoverMultiplier, creditedAmount, targetTurnover } =
    calcAutoBonus(amountNum, selectedBonus);

  const selectedBonusLabel = selectedBonus
    ? isBangla
      ? selectedBonus?.title?.bn || selectedBonus?.title?.en
      : selectedBonus?.title?.en || selectedBonus?.title?.bn
    : t("কোনো বোনাস নেই", "No Bonus");

  const modalDetails = {
    depositAmount: amountNum,
    bonusTitle: selectedBonusLabel,
    bonusAmount,
    creditedAmount,
    turnoverMultiplier,
    targetTurnover,
    invoiceNumber: pendingInvoice,
  };

  const canDeposit = enabled && !!userId && amountValid && !processing;

  const handleOpenDeposit = () => {
    if (!enabled) {
      toast.error(t("অটো ডিপোজিট বন্ধ আছে", "Auto deposit is disabled"));
      return;
    }

    if (!userId) {
      toast.error(
        t("অনুগ্রহ করে আবার লগইন করুন", "User not found. Please login again."),
      );
      return;
    }

    if (!canDeposit) {
      if (amountErrorText) toast.error(amountErrorText);
      return;
    }

    const invoice = `AUTO-${userId}-${Date.now()}`;
    setPendingInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleConfirmDeposit = async () => {
    try {
      setProcessing(true);

      const invoiceNumber = pendingInvoice || `AUTO-${userId}-${Date.now()}`;

      const { data } = await api.post("/api/auto-deposit/create", {
        amount: amountNum,
        userIdentity: userId,
        invoiceNumber,
        selectedBonusId: selectedBonus?._id || "",
        checkoutItems: {
          type: "deposit",
          method: "auto",
          gateway: "oraclepay",
          userId: user?.userId || "",
          phone: user?.phone || "",
          username: user?.userId || "",
          selectedBonusId: selectedBonus?._id || "",
        },
      });

      if (data?.success && data?.payment_page_url) {
        window.location.href = data.payment_page_url;
        return;
      }

      toast.error(
        data?.message ||
          t("পেমেন্ট লিংক তৈরি করা যায়নি", "Payment link create failed"),
      );
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          t("পেমেন্ট লিংক তৈরি করা যায়নি", "Payment link create failed"),
      );
    } finally {
      setProcessing(false);
      setDetailsOpen(false);
    }
  };

//   if (loadingStatus) {
//     return <Loading open text={t("লোড হচ্ছে...", "Loading...")} />;
//   }

  if (!enabled) {
    return (
      <>
        <Tab />
        <div className="w-full text-white">
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-5 sm:p-6 shadow-lg shadow-green-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                  <FaWallet className="text-xl" />
                </div>
                <div className="text-[20px] font-extrabold text-white">
                  {t("অটো ডিপোজিট", "Auto Deposit")}
                </div>
              </div>

              <div className="mt-5 text-[14px] text-white/70">
                {t(
                  "এই মুহূর্তে অটো ডিপোজিট বন্ধ আছে। পরে আবার চেষ্টা করুন।",
                  "Auto deposit is currently disabled. Please try again later.",
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Tab />

      <div className="w-full text-white">
        <div className="grid grid-cols-1 gap-4">
          <div className="border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-5 sm:p-6 shadow-lg shadow-green-900/20">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                <FaWallet className="text-xl" />
              </div>
              <div className="text-[20px] font-extrabold text-white">
                {t("অটো ডিপোজিট", "Auto Deposit")}
              </div>
            </div>

            {/* Amount */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[14px] font-semibold text-white">
                  {t("ডিপোজিট এমাউন্ট", "Deposit Amount")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <FaQuestionCircle className="text-white/70" />
              </div>

              <div className="mt-3">
                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className={`w-full max-w-[520px] rounded-xl border px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-green-400/20 ${
                    amountHasValue && !amountValid
                      ? "border-red-400 bg-black/40"
                      : "border-green-700/40 bg-black/40"
                  }`}
                  placeholder="1000"
                  inputMode="numeric"
                />
              </div>

              {(minAmount > 0 || maxAmount > 0) && (
                <div className="mt-2 text-[12px] text-white/60">
                  {minAmount > 0
                    ? `${t("সর্বনিম্ন", "Minimum")}: ${money(minAmount)}`
                    : ""}
                  {minAmount > 0 && maxAmount > 0 ? " — " : ""}
                  {maxAmount > 0
                    ? `${t("সর্বোচ্চ", "Maximum")}: ${money(maxAmount)}`
                    : ""}
                </div>
              )}

              {amountErrorText && (
                <div className="mt-2 text-[12px] font-semibold text-red-400">
                  {amountErrorText}
                </div>
              )}

              <div className="mt-5 grid max-w-[720px] grid-cols-3 gap-4">
                {quickAmounts.map((a) => {
                  const active = String(a.v) === String(amount);

                  return (
                    <button
                      key={a.v}
                      type="button"
                      onClick={() => setAmount(String(a.v))}
                      className={`relative h-[44px] cursor-pointer rounded-xl font-extrabold text-[15px] transition ${
                        active
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black"
                          : "bg-black/30 text-white/60 hover:bg-black/40"
                      }`}
                    >
                      {a.tag ? <Tag text={a.tag} /> : null}
                      {a.v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bonus */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <label className="text-[14px] font-semibold text-white">
                  {t("প্রমোশন", "Promotion")}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <FaExclamationCircle className="text-emerald-300" />
              </div>

              <div className="relative mt-3 max-w-[520px]">
                <button
                  type="button"
                  onClick={() => setPromoOpen((p) => !p)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-green-700/40 bg-black/40 px-4 py-3 text-[14px] hover:border-green-500/60"
                >
                  <span className="font-semibold text-white/90">
                    {promotions.find((x) => x._id === promo)?.name ||
                      t("কোনো বোনাস নিবো না", "No Bonus Selected")}
                  </span>

                  <div className="flex items-center gap-3">
                    {promo !== "none" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromo("none");
                        }}
                        className="cursor-pointer rounded-md p-1 hover:bg-white/5"
                      >
                        <FaTimes className="text-white/40" />
                      </button>
                    )}
                    <span className="text-white/40">▾</span>
                  </div>
                </button>

                {promoOpen && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-green-700/30 bg-black shadow-2xl">
                    {promotions.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          setPromo(p._id);
                          setPromoOpen(false);
                        }}
                        className={`w-full cursor-pointer px-4 py-3 text-left text-[14px] font-semibold transition hover:bg-green-900/30 ${
                          promo === p._id
                            ? "bg-green-900/20 text-green-300"
                            : "text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{p.name}</span>

                          {p._id !== "none" ? (
                            <span className="text-[12px] text-green-300 font-extrabold">
                              {getBonusPreviewText(p, isBangla)} | x
                              {Number(p?.turnoverMultiplier || 1)}
                            </span>
                          ) : (
                            <span className="text-[12px] text-white/40 font-bold">
                              x1
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bonus preview */}
            <div className="mt-6">
              <div className="rounded-xl border border-green-700/40 bg-black/30 p-4 max-w-[520px]">
                <div className="flex items-center gap-2 text-[14px] font-bold text-white">
                  <FaGift className="text-emerald-300" />
                  {t("বোনাস সামারি", "Bonus Summary")}
                </div>

                <div className="mt-3 space-y-2 text-[13px]">
                  <div className="flex items-center justify-between text-white/70">
                    <span>{t("সিলেক্টেড বোনাস", "Selected Bonus")}</span>
                    <span className="font-extrabold text-white">
                      {selectedBonusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-white/70">
                    <span>{t("বোনাস", "Bonus")}</span>
                    <span className="font-extrabold text-emerald-300">
                      {money(bonusAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-white/70">
                    <span>{t("মোট ক্রেডিট", "Total Credited")}</span>
                    <span className="font-extrabold text-green-300">
                      {money(creditedAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-white/70">
                    <span>{t("টার্নওভার", "Turnover")}</span>
                    <span className="font-extrabold text-white">
                      x{turnoverMultiplier} ({money(targetTurnover)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Button */}
            <div className="mt-6 max-w-[520px]">
              <button
                type="button"
                onClick={handleOpenDeposit}
                disabled={!canDeposit}
                className={`h-[46px] w-full rounded-xl font-extrabold text-[14px] transition ${
                  canDeposit
                    ? "cursor-pointer bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg hover:from-green-400 hover:to-emerald-400"
                    : "cursor-not-allowed bg-green-900/30 text-white/50"
                }`}
              >
                {processing
                  ? t("প্রসেস হচ্ছে...", "Processing...")
                  : t("ডিপোজিট", "Deposit")}
              </button>

              <div className="mt-2 text-[12px] text-white/60">
                {t("টার্নওভার", "Turnover")}: x{turnoverMultiplier}
              </div>
            </div>
          </div>
        </div>

        <DepositDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onConfirm={handleConfirmDeposit}
          details={modalDetails}
          t={t}
        />
      </div>

      {/* <Loading open={processing} text={t("প্রসেস হচ্ছে...", "Processing...")} /> */}
    </>
  );
};

export default AutoDeposit;
