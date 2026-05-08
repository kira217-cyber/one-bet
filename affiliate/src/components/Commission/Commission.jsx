import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
import { Play } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const API_URL =
  import.meta.env.VITE_APP_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_REACT_APP_BACKEND_API2 ||
  "";

const getFileUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const defaultData = {
  title: {
    bn: "৪০% নির্দিষ্ট কমিশন",
    en: "40% FIXED COMMISSION",
  },
  subtitle: {
    bn: "আমরা অ্যাফিলিয়েটদের প্রতি সপ্তাহে ৪০% নির্দিষ্ট কমিশন রেট দিচ্ছি।",
    en: "We are giving 40% fixed commission rate to affiliates every week.",
  },
  structureTitle: {
    bn: "কমিশন স্ট্রাকচার",
    en: "COMMISSION STRUCTURE",
  },
  winLossText: {
    bn: "জয়/ক্ষতি",
    en: "Win/Loss",
  },
  bonusText: {
    bn: "বোনাস",
    en: "Bonus",
  },
  deductionText: {
    bn: "কর্তন",
    en: "Deduction",
  },
  paymentFeeText: {
    bn: "পেমেন্ট ফি",
    en: "Payment Fee",
  },
  registerButtonText: {
    bn: "এখনই রেজিস্টার",
    en: "REGISTER NOW",
  },
  watchButtonText: {
    bn: "ভিডিও দেখুন",
    en: "WATCH VIDEO",
  },
  countryTitle: {
    bn: "বাংলাদেশ",
    en: "BANGLADESH",
  },
  countryDescription: {
    bn: "আমাদের অ্যাফিলিয়েটরা চলমান ক্যাম্পেইন থেকে আরও অতিরিক্ত কমিশন উপার্জন করতে পারবে।",
    en: "Our affiliates will be able to earn another extra commission from our running campaigns.",
  },
  paymentTitle: {
    bn: "পেমেন্ট ফি:",
    en: "PAYMENT FEE:",
  },
  paymentDescription: {
    bn: "(ডিপোজিট এমাউন্ট × ৪.০%) + (উইথড্রয়াল এমাউন্ট × ২.০%)",
    en: "(DEPOSIT AMOUNT X 4.0%) + (WITHDRAWAL AMOUNT X 2.0%)",
  },
  bonusTitle: {
    bn: "বোনাস:",
    en: "BONUS:",
  },
  bonusDescription: {
    bn: "প্রোমোশন বোনাস + ভিআইপি ক্যাশ বোনাস",
    en: "PROMOTION BONUS + VIP CASH BONUS",
  },
  netProfitTitle: {
    bn: "নেট প্রফিট:",
    en: "NET PROFIT:",
  },
  netProfitDescription: {
    bn: "(প্লেয়ার জয়/ক্ষতি - জ্যাকপট কস্ট) - ১৮% কর্তন - বোনাস - পেমেন্ট ফি",
    en: "(PLAYER WIN/LOSS - JACKPOT COST) - 18% DEDUCTION - BONUS - PAYMENT FEE",
  },
  ratingText: "(396)",
  leftBackgroundImage:
    "https://beit365.bet/assets/affiliate/assets/hero-banner/bdt-hero.webp",
  growthImage:
    "https://beit365.bet/assets/affiliate/assets/images/growth2e0f.png",
  countryFlagImage:
    "https://beit365.bet/assets/affiliate/assets/img/flag/bn.jpg",
  videoUrl: "",
  isActive: true,
};

const Commission = () => {
  const { isBangla } = useLanguage();

  const [commissionData, setCommissionData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCommissionContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-commission-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          setCommissionData({
            ...defaultData,
            ...data.data,
            title: { ...defaultData.title, ...(data.data.title || {}) },
            subtitle: {
              ...defaultData.subtitle,
              ...(data.data.subtitle || {}),
            },
            structureTitle: {
              ...defaultData.structureTitle,
              ...(data.data.structureTitle || {}),
            },
            winLossText: {
              ...defaultData.winLossText,
              ...(data.data.winLossText || {}),
            },
            bonusText: {
              ...defaultData.bonusText,
              ...(data.data.bonusText || {}),
            },
            deductionText: {
              ...defaultData.deductionText,
              ...(data.data.deductionText || {}),
            },
            paymentFeeText: {
              ...defaultData.paymentFeeText,
              ...(data.data.paymentFeeText || {}),
            },
            registerButtonText: {
              ...defaultData.registerButtonText,
              ...(data.data.registerButtonText || {}),
            },
            watchButtonText: {
              ...defaultData.watchButtonText,
              ...(data.data.watchButtonText || {}),
            },
            countryTitle: {
              ...defaultData.countryTitle,
              ...(data.data.countryTitle || {}),
            },
            countryDescription: {
              ...defaultData.countryDescription,
              ...(data.data.countryDescription || {}),
            },
            paymentTitle: {
              ...defaultData.paymentTitle,
              ...(data.data.paymentTitle || {}),
            },
            paymentDescription: {
              ...defaultData.paymentDescription,
              ...(data.data.paymentDescription || {}),
            },
            bonusTitle: {
              ...defaultData.bonusTitle,
              ...(data.data.bonusTitle || {}),
            },
            bonusDescription: {
              ...defaultData.bonusDescription,
              ...(data.data.bonusDescription || {}),
            },
            netProfitTitle: {
              ...defaultData.netProfitTitle,
              ...(data.data.netProfitTitle || {}),
            },
            netProfitDescription: {
              ...defaultData.netProfitDescription,
              ...(data.data.netProfitDescription || {}),
            },
            isActive: data.data.isActive !== false,
          });
        } else {
          setCommissionData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch commission content:", error);
        setCommissionData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCommissionContent();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const text = (field, fallbackField = field) =>
      commissionData?.[field]?.[lang] ||
      commissionData?.[field]?.en ||
      commissionData?.[field]?.bn ||
      defaultData?.[fallbackField]?.[lang] ||
      "";

    return {
      title: text("title"),
      subtitle: text("subtitle"),
      structure: text("structureTitle"),
      winLoss: text("winLossText"),
      bonus: text("bonusText"),
      deduction: text("deductionText"),
      paymentFee: text("paymentFeeText"),
      register: text("registerButtonText"),
      watch: text("watchButtonText"),
      country: text("countryTitle"),
      countryText: text("countryDescription"),
      paymentTitle: text("paymentTitle"),
      paymentText: text("paymentDescription"),
      bonusTitle: text("bonusTitle"),
      bonusText: text("bonusDescription"),
      netProfitTitle: text("netProfitTitle"),
      netProfitText: text("netProfitDescription"),
    };
  }, [commissionData, isBangla]);

  const leftBackgroundImage =
    getFileUrl(commissionData.leftBackgroundImage) ||
    defaultData.leftBackgroundImage;

  const growthImage =
    getFileUrl(commissionData.growthImage) || defaultData.growthImage;

  const countryFlagImage =
    getFileUrl(commissionData.countryFlagImage) || defaultData.countryFlagImage;

  const handleWatchVideo = () => {
    if (!commissionData.videoUrl) return;

    window.open(commissionData.videoUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <section className="w-full bg-[#1b1204] py-4 text-white sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1500px] px-2 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_0.98fr] lg:gap-8">
            <div className="min-h-[580px] animate-pulse rounded-[18px] bg-white/10 sm:min-h-[560px] lg:min-h-[533px]" />

            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              <div className="h-[160px] animate-pulse rounded-[18px] bg-white/10" />
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                <div className="h-[210px] animate-pulse rounded-[18px] bg-white/10" />
                <div className="h-[210px] animate-pulse rounded-[18px] bg-white/10" />
              </div>
              <div className="h-[190px] animate-pulse rounded-[18px] bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (commissionData?.isActive === false) {
    return null;
  }

  return (
    <section className="w-full bg-[#1b1204] py-4 text-white sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1500px] px-2 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_0.98fr] lg:gap-8">
          <div
            className="relative min-h-[580px] overflow-hidden rounded-[18px] bg-[#02131a] sm:min-h-[560px] lg:min-h-[533px]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.5)), url('${leftBackgroundImage}')`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="relative z-10 flex h-full flex-col px-4 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-8 lg:px-8 lg:pb-6 lg:pt-7">
              <div className="max-w-[280px] sm:max-w-[520px]">
                <h2 className="text-[30px] font-extrabold uppercase leading-[1.15] tracking-[-0.03em] text-white sm:text-[42px] lg:text-[31px] xl:text-[38px]">
                  {content.title}
                </h2>

                <p className="mt-5 max-w-[300px] text-[16px] leading-[1.8] text-white/80 sm:max-w-[470px] sm:text-[20px] lg:text-[14px] xl:text-[16px]">
                  {content.subtitle}
                </p>
              </div>

              <div className="mt-5 w-full rounded-[18px] bg-[rgba(7,11,18,0.82)] px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:mt-8 sm:rounded-[22px] sm:px-6 sm:py-6 lg:mt-7 lg:max-w-[680px] lg:px-5 lg:py-5">
                <h3 className="text-[18px] font-bold uppercase tracking-[0.01em] text-white sm:text-[24px] lg:text-[18px]">
                  {content.structure}
                </h3>

                <div className="mt-6 flex flex-col gap-6">
                  <div className="flex items-center gap-6 sm:gap-7 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex justify-center lg:justify-start">
                      {growthImage ? (
                        <img
                          src={growthImage}
                          alt="Commission growth chart"
                          className="h-auto w-[150px] object-contain sm:w-[240px] lg:w-[250px]"
                        />
                      ) : null}
                    </div>

                    <div className="grid w-full max-w-[155px] grid-cols-1 gap-2.5 sm:max-w-[210px] sm:grid-cols-2 sm:gap-3 lg:w-[250px] lg:max-w-none">
                      <div className="flex h-[32px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] font-semibold text-[#f1df9a] sm:h-[44px] sm:text-[17px] lg:text-[14px]">
                        {content.winLoss}
                      </div>

                      <div className="flex h-[32px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] font-semibold text-white sm:h-[44px] sm:text-[17px] lg:text-[14px]">
                        {content.bonus}
                      </div>

                      <div className="flex h-[32px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] font-semibold text-[#39b96a] sm:h-[44px] sm:text-[17px] lg:text-[14px]">
                        {content.deduction}
                      </div>

                      <div className="flex h-[32px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] font-semibold text-white/45 sm:h-[44px] sm:text-[17px] lg:text-[14px]">
                        {content.paymentFee}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4 pt-4 sm:mt-auto sm:pt-8 lg:flex-row lg:items-center lg:gap-6">
                <NavLink
                  to="/register"
                  className="group relative inline-flex h-[46px] w-full items-center justify-center overflow-hidden rounded-[4px] border border-white/25 bg-transparent px-6 text-[14px] font-bold uppercase text-white transition-all duration-300 sm:h-[54px] sm:rounded-[6px] sm:text-[18px] lg:w-[190px] lg:text-[14px]"
                >
                  <span className="absolute inset-0 rounded-[4px] bg-[#35c58d] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-[6px]" />
                  <span className="absolute inset-0 rounded-[4px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_18px_rgba(255,255,255,0.55),0_0_30px_rgba(83,255,194,0.45)] sm:rounded-[6px]" />
                  <span className="relative z-10">{content.register}</span>
                </NavLink>

                <button
                  type="button"
                  onClick={handleWatchVideo}
                  disabled={!commissionData.videoUrl}
                  className="group relative inline-flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-white/15 bg-transparent px-6 text-white transition-all duration-300 hover:bg-[#041b25] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[54px] sm:rounded-[6px] lg:w-[250px]"
                >
                  <span className="absolute inset-0 rounded-[4px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_18px_rgba(255,255,255,0.45),0_0_28px_rgba(146,241,255,0.25)] sm:rounded-[6px]" />

                  <span className="relative z-10 flex items-center gap-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff1f1f] text-white sm:h-8 sm:w-8">
                      <Play
                        size={12}
                        className="sm:hidden"
                        fill="currentColor"
                      />
                      <Play
                        size={15}
                        className="hidden sm:block"
                        fill="currentColor"
                      />
                    </span>

                    <span className="text-[16px] font-medium uppercase sm:text-[21px] lg:text-[16px]">
                      {content.watch}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div className="rounded-[18px] bg-[#2a2115] px-4 py-4 sm:px-6 sm:py-6 lg:px-5 lg:py-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[18px] font-extrabold uppercase text-white sm:text-[26px] lg:text-[17px]">
                  {content.country}
                </h3>

                <div className="flex items-center gap-1.5 pt-1 sm:gap-2">
                  <span className="text-[12px] text-[#c89b17] sm:text-[16px] lg:text-[14px]">
                    ★★★★★
                  </span>

                  <span className="text-[12px] font-semibold text-white sm:text-[15px] lg:text-[14px]">
                    {commissionData.ratingText || "(396)"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-4 sm:mt-5 sm:flex-row sm:items-center lg:gap-6">
                {countryFlagImage ? (
                  <img
                    src={countryFlagImage}
                    alt={content.country}
                    className="h-[72px] w-[130px] shrink-0 rounded-[10px] object-cover sm:h-[78px] sm:w-[132px]"
                  />
                ) : null}

                <p className="max-w-[430px] text-[15px] leading-[1.55] text-white sm:text-[20px] sm:leading-[1.6] lg:text-[16px]">
                  {content.countryText}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              <div className="rounded-[18px] bg-[#2a2115] px-4 py-9 text-center sm:px-6 sm:py-7 lg:px-5 lg:py-7">
                <h4 className="text-[16px] font-extrabold uppercase text-[#f3d56e] sm:text-[28px] lg:text-[18px]">
                  {content.paymentTitle}
                </h4>

                <p className="mt-6 text-[12px] font-bold uppercase leading-[1.7] text-white sm:text-[24px] lg:text-[15px]">
                  {content.paymentText}
                </p>
              </div>

              <div className="rounded-[18px] bg-[#2a2115] px-4 py-9 text-center sm:px-6 sm:py-7 lg:px-5 lg:py-7">
                <h4 className="text-[16px] font-extrabold uppercase text-[#f3d56e] sm:text-[28px] lg:text-[18px]">
                  {content.bonusTitle}
                </h4>

                <p className="mt-6 text-[12px] font-bold uppercase leading-[1.7] text-white sm:text-[24px] lg:text-[15px]">
                  {content.bonusText}
                </p>
              </div>
            </div>

            <div className="rounded-[18px] bg-[#2a2115] px-4 py-8 sm:px-6 sm:py-7 lg:px-5 lg:py-6">
              <h4 className="text-[16px] font-extrabold uppercase text-[#f3d56e] sm:text-[28px] lg:text-[18px]">
                {content.netProfitTitle}
              </h4>

              <p className="mt-6 text-[12px] font-bold uppercase leading-[1.9] text-white sm:mt-8 sm:text-[22px] lg:text-[15px]">
                {content.netProfitText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Commission;
