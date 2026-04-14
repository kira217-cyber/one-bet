import React, { useEffect, useMemo, useState } from "react";
import {
  FaExclamationCircle,
  FaQuestionCircle,
  FaTimes,
  FaWallet,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import DepositModal from "./DepositModal";
import { api } from "../../api/axios";
import Tab from "../../components/Tab/Tab";

const OptionLogo = ({ type }) => {
  const base = "w-10 h-10 rounded-full flex items-center justify-center";
  return (
    <div className={`${base} bg-green-100`}>
      <span className="font-extrabold text-green-700 text-[13px]">
        {(type || "P").slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
};

const Tag = ({ text = "+0%" }) => (
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

const parsePercentFromTag = (tagText) => {
  if (typeof tagText !== "string") return 0;
  if (!tagText.includes("%")) return 0;
  const p = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(p) ? p : 0;
};

const calcBonus = (
  amountNum,
  promoId,
  channelTagText,
  methodPromotions = [],
) => {
  const percent = parsePercentFromTag(channelTagText);
  const percentBonus = (amountNum * percent) / 100;

  const promoDoc = (methodPromotions || []).find(
    (p) =>
      String(p?.id || "").toLowerCase() === String(promoId || "").toLowerCase(),
  );

  let promoBonus = 0;
  let promoTurnover = null;

  if (promoDoc && promoId !== "none" && promoDoc?.isActive !== false) {
    const bonusValue = Number(promoDoc?.bonusValue ?? 0) || 0;

    if (promoDoc?.bonusType === "percent") {
      promoBonus = (amountNum * bonusValue) / 100;
    } else {
      promoBonus = bonusValue;
    }

    promoTurnover = Number(promoDoc?.turnoverMultiplier ?? 0) || null;
  }

  return {
    promoBonus,
    percentBonus,
    percent,
    promoTurnover,
    totalBonus: promoBonus + percentBonus,
  };
};

const DepositDetailsModal = ({ open, onClose, onConfirm, details }) => {
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
            Deposit Details
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-white/70 hover:bg-white/5"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-4 h-px bg-green-700/30" />

        <div className="mt-5 space-y-3">
          <Row k="Deposit Amount" v={money(details.depositAmount)} />
          <Row k="Promo Bonus" v={money(details.promoBonus)} />
          <Row
            k={`+${details.percent}% Channel Bonus`}
            v={money(details.percentBonus)}
          />
          <Row k="Turnover Multiplier" v={`x${details.turnoverMultiplier}`} />
          <Row k="Target Turnover" v={money(details.targetTurnover)} />
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 h-[46px] w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 font-extrabold text-black shadow-lg hover:from-green-400 hover:to-emerald-400"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

const Deposit = () => {
  const { data: methodsRes = {}, isLoading } = useQuery({
    queryKey: ["deposit-methods-public"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
      return res.data;
    },
    staleTime: 30000,
    retry: 1,
  });

  const methods = useMemo(
    () => (methodsRes?.data || []).filter((m) => m?.isActive !== false),
    [methodsRes],
  );

  const quickAmounts = useMemo(
    () => [
      { v: 200, tag: "" },
      { v: 1000, tag: "+3%" },
      { v: 5000, tag: "+3%" },
      { v: 10000, tag: "+3%" },
      { v: 20000, tag: "+3%" },
      { v: 30000, tag: "+3%" },
    ],
    [],
  );

  const [selectedOption, setSelectedOption] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [amount, setAmount] = useState("1000");
  const [promo, setPromo] = useState("none");
  const [promoOpen, setPromoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (methods?.length && !selectedOption) {
      const first = methods[0];
      setSelectedOption(first?.methodId || "");
      const firstChannel =
        (first?.channels || []).filter((c) => c?.isActive !== false)?.[0]?.id ||
        "";
      setSelectedChannel(firstChannel);
    }
  }, [methods, selectedOption]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m.methodId === selectedOption) || null,
    [methods, selectedOption],
  );

  const channels = useMemo(() => {
    const ch = selectedMethod?.channels || [];
    return ch.filter((c) => c?.isActive !== false);
  }, [selectedMethod]);

  const selectedChannelDoc = useMemo(
    () => channels.find((c) => c.id === selectedChannel) || null,
    [channels, selectedChannel],
  );

  const promotions = useMemo(() => {
    const list = Array.isArray(selectedMethod?.promotions)
      ? selectedMethod.promotions
      : [];

    const active = list
      .filter((p) => p?.isActive !== false)
      .sort((a, b) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0));

    return [
      { id: "none", name: "No Bonus Selected" },
      ...active.map((p) => ({
        id: p.id,
        name: p?.name?.en || p?.name?.bn || p.id,
        bonusType: p?.bonusType,
        bonusValue: p?.bonusValue,
        turnoverMultiplier: p?.turnoverMultiplier,
      })),
    ];
  }, [selectedMethod]);

  useEffect(() => {
    if (!selectedMethod) return;
    const exists = channels.some((c) => c.id === selectedChannel);
    if (!exists) setSelectedChannel(channels?.[0]?.id || "");
  }, [selectedMethod, channels, selectedChannel]);

  useEffect(() => {
    const exists = promotions.some((p) => p.id === promo);
    if (!exists) setPromo("none");
  }, [promotions, promo]);

  const channelTagText = selectedChannelDoc?.tagText || "+0%";
  const amountNum = Number(amount || 0) || 0;

  const minDeposit = Number(selectedMethod?.minDepositAmount ?? 0) || 0;
  const maxDeposit = Number(selectedMethod?.maxDepositAmount ?? 0) || 0;

  const inMin = amountNum >= (minDeposit > 0 ? minDeposit : 0);
  const inMax = maxDeposit > 0 ? amountNum <= maxDeposit : true;
  const amountHasValue = amountNum > 0;
  const amountValid = amountHasValue && inMin && inMax;

  const amountErrorText = useMemo(() => {
    if (!selectedMethod || !amountHasValue) return "";
    if (!inMin) return `Minimum deposit must be ${money(minDeposit)}`;
    if (!inMax) return `Maximum deposit is ${money(maxDeposit)}`;
    return "";
  }, [selectedMethod, amountHasValue, inMin, inMax, minDeposit, maxDeposit]);

  const methodPromotionsRaw = Array.isArray(selectedMethod?.promotions)
    ? selectedMethod.promotions
    : [];

  const { promoBonus, percentBonus, percent, promoTurnover } = calcBonus(
    amountNum,
    promo,
    channelTagText,
    methodPromotionsRaw,
  );

  const turnoverMultiplier =
    promo !== "none" && promoTurnover
      ? promoTurnover
      : Number(selectedMethod?.turnoverMultiplier ?? 1);

  const targetTurnover =
    (amountNum + promoBonus + percentBonus) * turnoverMultiplier;

  const modalDetails = {
    depositAmount: amountNum,
    promoBonus,
    percentBonus,
    percent,
    turnoverMultiplier,
    targetTurnover,
  };

  const apiBase = import.meta.env.VITE_APP_URL || "";
  const canDeposit = !!selectedMethod && !!selectedChannel && amountValid;

  const handleOpenDeposit = () => {
    if (!canDeposit) {
      if (amountErrorText) toast.error(amountErrorText);
      return;
    }
    setDetailsOpen(true);
  };

  return (
    <>
      <Tab />
      <div className="w-full text-white">
        <div className="grid grid-cols-1 gap-4 ">
          <div className=" border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-5 sm:p-6 shadow-lg shadow-green-900/20">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30">
                <FaWallet className="text-xl" />
              </div>
              <div className="text-[20px] font-extrabold text-white">
                Manual Deposit
              </div>
            </div>

            {/* Deposit Options */}
            <div className="mt-5">
              <label className="text-[14px] font-semibold text-white">
                Deposit Options <span className="text-red-400">*</span>
              </label>

              {isLoading ? (
                <div className="mt-3 text-[13px] text-white/60">Loading...</div>
              ) : methods.length ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  {methods.map((m) => {
                    const active = selectedOption === m.methodId;

                    return (
                      <button
                        key={m._id || m.methodId}
                        type="button"
                        onClick={() => setSelectedOption(m.methodId)}
                        className={`flex h-[60px] w-[100px] items-center justify-center rounded-xl border-2 bg-black/40 transition ${
                          active
                            ? "border-green-400 shadow-lg shadow-green-500/20"
                            : "border-green-700/40 hover:border-green-500/60"
                        }`}
                      >
                        {m.logoUrl ? (
                          <img
                            src={`${apiBase}${m.logoUrl}`}
                            alt={m.methodId}
                            className="max-h-[32px] max-w-[80px] object-contain"
                          />
                        ) : (
                          <OptionLogo type={m.methodId} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 text-[13px] text-white/60">
                  No deposit methods found.
                </div>
              )}
            </div>

            {/* Channel */}
            <div className="mt-6">
              <label className="text-[14px] font-semibold text-white">
                Deposit Channel <span className="text-red-400">*</span>
              </label>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {channels.map((c) => {
                  const active = selectedChannel === c.id;
                  const name = c?.name?.en || c?.name?.bn || c.id;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedChannel(c.id)}
                      className={`relative cursor-pointer rounded-xl border px-5 py-2 text-[14px] font-extrabold transition ${
                        active
                          ? "border-green-400 bg-black/50 shadow-lg shadow-green-500/20"
                          : "border-green-700/40 bg-black/30 hover:border-green-500/60"
                      }`}
                    >
                      <Tag text={c.tagText || "+0%"} />
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[14px] font-semibold text-white">
                  Deposit Amount <span className="text-red-400">*</span>
                </label>
                <FaQuestionCircle className="text-white/70" />
              </div>

              <div className="mt-3">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full max-w-[520px] rounded-xl border px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-green-400/20 ${
                    amountHasValue && !amountValid
                      ? "border-red-400 bg-black/40"
                      : "border-green-700/40 bg-black/40"
                  }`}
                />
              </div>

              {(minDeposit > 0 || maxDeposit > 0) && (
                <div className="mt-2 text-[12px] text-white/60">
                  {minDeposit > 0 ? `Minimum: ${money(minDeposit)}` : ""}
                  {minDeposit > 0 && maxDeposit > 0 ? " — " : ""}
                  {maxDeposit > 0 ? `Maximum: ${money(maxDeposit)}` : ""}
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
                      className={`relative h-[44px] rounded-xl font-extrabold text-[15px] transition ${
                        active
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black"
                          : "bg-black/30 text-white/60 hover:bg-black/40"
                      }`}
                    >
                      {a.tag ? (
                        <span className="absolute -top-2 right-3 rounded-md bg-green-400 px-2 py-[2px] text-[11px] font-extrabold text-black shadow-lg">
                          {a.tag}
                        </span>
                      ) : null}
                      {a.v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <label className="text-[14px] font-semibold text-white">
                  Promotion <span className="text-red-400">*</span>
                </label>
                <FaExclamationCircle className="text-emerald-300" />
              </div>

              <div className="relative mt-3 max-w-[520px]">
                <button
                  type="button"
                  onClick={() => setPromoOpen((p) => !p)}
                  className="flex w-full items-center justify-between rounded-xl border border-green-700/40 bg-black/40 px-4 py-3 text-[14px] hover:border-green-500/60"
                >
                  <span className="font-semibold text-white/90">
                    {promotions.find((x) => x.id === promo)?.name}
                  </span>

                  <div className="flex items-center gap-3">
                    {promo !== "none" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromo("none");
                        }}
                        className="rounded-md p-1 hover:bg-white/5"
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
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPromo(p.id);
                          setPromoOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-[14px] font-semibold transition hover:bg-green-900/30 ${
                          promo === p.id
                            ? "bg-green-900/20 text-green-300"
                            : "text-white"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
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
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg hover:from-green-400 hover:to-emerald-400"
                    : "cursor-not-allowed bg-green-900/30 text-white/50"
                }`}
              >
                Deposit
              </button>

              <div className="mt-2 text-[12px] text-white/60">
                Turnover: x{turnoverMultiplier}
              </div>
            </div>
          </div>

          {/* <div className="rounded-2xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black p-4 shadow-lg shadow-green-900/20">
            <div className="text-[14px] font-extrabold text-white">
              Important Notice
            </div>
            <div className="mt-3 text-[12px] leading-relaxed text-white/70">
              After submitting, admin will review your deposit request.
            </div>
          </div> */}
        </div>

        <DepositDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onConfirm={() => {
            setDetailsOpen(false);
            setPayOpen(true);
          }}
          details={modalDetails}
        />

        <DepositModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          data={{
            amount: amountNum,
            methodId: selectedOption,
            channelId: selectedChannel,
            customerCode: "6538651",
            promoId: promo,
          }}
          details={modalDetails}
          methodDoc={selectedMethod}
          channelDoc={selectedChannelDoc}
        />
      </div>
    </>
  );
};

export default Deposit;
