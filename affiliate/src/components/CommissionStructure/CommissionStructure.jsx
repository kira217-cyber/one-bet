import React, { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const defaultData = {
  isActive: true,
  title: {
    bn: "কমিশন স্ট্রাকচার",
    en: "COMMISSION STRUCTURE",
  },
  headers: {
    recruit: {
      bn: "অ্যাফিলিয়েট রিক্রুট",
      en: "AFFILIATE RECRUIT",
    },
    winLoss: {
      bn: "জয়/ক্ষতি",
      en: "WIN/LOSS",
    },
    deduction: {
      bn: "কর্তন",
      en: "DEDUCTION",
    },
    bonus: {
      bn: "বোনাস",
      en: "BONUS",
    },
    paymentFee: {
      bn: "পেমেন্ট ফি",
      en: "PAYMENT FEE",
    },
    commission: {
      bn: "কমিশন",
      en: "COMMISSION",
    },
  },
  players: [
    {
      id: 1,
      name: { bn: "প্লেয়ার A", en: "Player A" },
      winLoss: "1,000,000",
      deduction: "180,000",
      bonus: "20,000",
      paymentFee: "40,000",
      commission: "-",
      negative: false,
      order: 1,
      isActive: true,
    },
    {
      id: 2,
      name: { bn: "প্লেয়ার B", en: "Player B" },
      winLoss: "-300,000",
      deduction: "0",
      bonus: "25,000",
      paymentFee: "12,000",
      commission: "-",
      negative: true,
      order: 2,
      isActive: true,
    },
    {
      id: 3,
      name: { bn: "প্লেয়ার C", en: "Player C" },
      winLoss: "-500,000",
      deduction: "0",
      bonus: "10,000",
      paymentFee: "20,000",
      commission: "-",
      negative: true,
      order: 3,
      isActive: true,
    },
    {
      id: 4,
      name: { bn: "প্লেয়ার D", en: "Player D" },
      winLoss: "1,500,000",
      deduction: "270,000",
      bonus: "40,000",
      paymentFee: "60,000",
      commission: "-",
      negative: false,
      order: 4,
      isActive: true,
    },
    {
      id: 5,
      name: { bn: "প্লেয়ার E", en: "Player E" },
      winLoss: "2,700,000",
      deduction: "486,000",
      bonus: "10,000",
      paymentFee: "108,000",
      commission: "-",
      negative: false,
      order: 5,
      isActive: true,
    },
  ],
  totals: {
    label: {
      bn: "মোট",
      en: "TOTAL",
    },
    winLoss: "4,400,000",
    deduction: "936,000",
    bonus: "105,000",
    paymentFee: "240,000",
    commission: "1,247,600",
  },
};

const getText = (obj, lang, fallback = "") => {
  if (!obj) return fallback;
  return obj?.[lang] || obj?.en || obj?.bn || fallback;
};

const CommissionStructure = () => {
  const { isBangla } = useLanguage();

  const [structureData, setStructureData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStructureContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(
          "/api/aff-commission-structure-content",
        );

        if (!mounted) return;

        if (data?.success && data?.data) {
          const doc = data.data;

          setStructureData({
            ...defaultData,
            ...doc,
            title: {
              ...defaultData.title,
              ...(doc.title || {}),
            },
            headers: {
              recruit: {
                ...defaultData.headers.recruit,
                ...(doc.headers?.recruit || {}),
              },
              winLoss: {
                ...defaultData.headers.winLoss,
                ...(doc.headers?.winLoss || {}),
              },
              deduction: {
                ...defaultData.headers.deduction,
                ...(doc.headers?.deduction || {}),
              },
              bonus: {
                ...defaultData.headers.bonus,
                ...(doc.headers?.bonus || {}),
              },
              paymentFee: {
                ...defaultData.headers.paymentFee,
                ...(doc.headers?.paymentFee || {}),
              },
              commission: {
                ...defaultData.headers.commission,
                ...(doc.headers?.commission || {}),
              },
            },
            totals: {
              ...defaultData.totals,
              ...(doc.totals || {}),
              label: {
                ...defaultData.totals.label,
                ...(doc.totals?.label || {}),
              },
            },
            players: Array.isArray(doc.players) ? doc.players : [],
            isActive: doc.isActive !== false,
          });
        } else {
          setStructureData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch commission structure:", error);
        setStructureData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStructureContent();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const players = (structureData.players || [])
      .filter((player) => player?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((player, index) => ({
        id: player?._id || player?.id || index,
        name: getText(player?.name, lang, `Player ${index + 1}`),
        winLoss: player?.winLoss || "",
        deduction: player?.deduction || "",
        bonus: player?.bonus || "",
        paymentFee: player?.paymentFee || "",
        commission: player?.commission || "-",
        negative: player?.negative === true,
      }));

    return {
      title: getText(structureData.title, lang, defaultData.title[lang]),
      headers: {
        recruit: getText(
          structureData.headers?.recruit,
          lang,
          defaultData.headers.recruit[lang],
        ),
        winLoss: getText(
          structureData.headers?.winLoss,
          lang,
          defaultData.headers.winLoss[lang],
        ),
        deduction: getText(
          structureData.headers?.deduction,
          lang,
          defaultData.headers.deduction[lang],
        ),
        bonus: getText(
          structureData.headers?.bonus,
          lang,
          defaultData.headers.bonus[lang],
        ),
        paymentFee: getText(
          structureData.headers?.paymentFee,
          lang,
          defaultData.headers.paymentFee[lang],
        ),
        commission: getText(
          structureData.headers?.commission,
          lang,
          defaultData.headers.commission[lang],
        ),
      },
      players,
      totals: {
        label: getText(
          structureData.totals?.label,
          lang,
          defaultData.totals.label[lang],
        ),
        winLoss: structureData.totals?.winLoss || "",
        deduction: structureData.totals?.deduction || "",
        bonus: structureData.totals?.bonus || "",
        paymentFee: structureData.totals?.paymentFee || "",
        commission: structureData.totals?.commission || "",
      },
    };
  }, [structureData, isBangla]);

  if (loading) {
    return (
      <section className="w-full bg-[#1b1204] py-8 text-white sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-10 h-10 w-72 animate-pulse rounded-lg bg-white/10" />

          <div className="w-full overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="h-14 animate-pulse bg-white/10" />

              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse bg-white/10"
                  />
                ))}
              </div>

              <div className="mt-4 h-16 animate-pulse bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (structureData?.isActive === false) {
    return null;
  }

  return (
    <section className="w-full bg-[#1b1204] py-8 text-white sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[24px] font-extrabold uppercase tracking-[-0.03em] text-white sm:text-[34px] lg:text-[30px]">
            {content.title}
          </h2>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1.15fr_1.1fr] items-center bg-[#082231] px-6 py-4 text-center">
              <div className="text-left text-[11px] font-medium uppercase text-white/90 lg:text-[12px]">
                {content.headers.recruit}
              </div>

              <div className="text-[11px] font-medium uppercase text-white/90 lg:text-[12px]">
                {content.headers.winLoss}
              </div>

              <div className="text-[11px] font-medium uppercase text-white/90 lg:text-[12px]">
                {content.headers.deduction}
              </div>

              <div className="text-[11px] font-medium uppercase text-white/90 lg:text-[12px]">
                {content.headers.bonus}
              </div>

              <div className="text-[11px] font-medium uppercase text-white/90 lg:text-[12px]">
                {content.headers.paymentFee}
              </div>

              <div className="text-[11px] font-medium uppercase text-[#2eed82] lg:text-[12px]">
                {content.headers.commission}
              </div>
            </div>

            <div className="mt-4 space-y-3 sm:space-y-4">
              {content.players.map((player) => (
                <div
                  key={player.id}
                  className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1.15fr_1.1fr] items-center bg-[#171920] px-4 py-2"
                >
                  <div className="flex items-center gap-5 text-left">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-[#e0c264]">
                      <UserRound
                        size={28}
                        fill="currentColor"
                        strokeWidth={1.5}
                      />
                    </span>

                    <span className="text-[16px] font-semibold text-white sm:text-[17px] lg:text-[14px]">
                      {player.name}
                    </span>
                  </div>

                  <div
                    className={`text-center text-[16px] font-semibold sm:text-[17px] lg:text-[14px] ${
                      player.negative ? "text-[#ff1f1f]" : "text-white"
                    }`}
                  >
                    {player.winLoss}
                  </div>

                  <div className="text-center text-[16px] font-semibold text-white sm:text-[17px] lg:text-[14px]">
                    {player.deduction}
                  </div>

                  <div className="text-center text-[16px] font-semibold text-white sm:text-[17px] lg:text-[14px]">
                    {player.bonus}
                  </div>

                  <div className="text-center text-[16px] font-semibold text-white sm:text-[17px] lg:text-[14px]">
                    {player.paymentFee}
                  </div>

                  <div className="text-center text-[20px] font-semibold text-white lg:text-[16px]">
                    {player.commission}
                  </div>
                </div>
              ))}

              {!content.players.length && (
                <div className="bg-[#171920] px-4 py-8 text-center text-white/70">
                  {isBangla ? "কোনো ডাটা পাওয়া যায়নি" : "No data found"}
                </div>
              )}
            </div>

            <div className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1.15fr_1.1fr] items-center px-6 py-6 sm:py-7">
              <div className="text-left text-[20px] font-medium uppercase text-white/85 sm:text-[22px] lg:text-[18px]">
                {content.totals.label}
              </div>

              <div className="text-center text-[20px] font-medium text-white/85 sm:text-[22px] lg:text-[16px]">
                {content.totals.winLoss}
              </div>

              <div className="text-center text-[20px] font-medium text-white/85 sm:text-[22px] lg:text-[16px]">
                {content.totals.deduction}
              </div>

              <div className="text-center text-[20px] font-medium text-white/85 sm:text-[22px] lg:text-[16px]">
                {content.totals.bonus}
              </div>

              <div className="text-center text-[20px] font-medium text-white/85 sm:text-[22px] lg:text-[16px]">
                {content.totals.paymentFee}
              </div>

              <div className="text-center text-[20px] font-bold text-[#2eed82] sm:text-[22px] lg:text-[16px]">
                {content.totals.commission}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommissionStructure;