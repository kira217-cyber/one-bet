import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
import { CircleUserRound, BadgeCheck } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const colorClass = (type = "white") => {
  if (type === "red") return "text-[#ff1f1f]";
  if (type === "green") return "text-[#57e11d]";
  return "text-white";
};

const getText = (obj, lang, fallback = "") => {
  if (!obj) return fallback;
  return obj?.[lang] || obj?.en || obj?.bn || fallback;
};

const defaultData = {
  isActive: true,
  footerTitle: {
    bn: "জ্যাকপট কস্ট",
    en: "JACKPOT COST",
  },
  footerText: {
    bn: "আরও জানতে বা অতিরিক্ত তথ্যের প্রয়োজন হলে, পাশের বাটনে ক্লিক করো!",
    en: "If you're interested in learning more or need further information, click the button beside!",
  },
  buttonText: {
    bn: "আরও জানুন",
    en: "FIND OUT MORE",
  },
  scenarios: [],
};

const JackpotStructure = () => {
  const { isBangla } = useLanguage();

  const [structureData, setStructureData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchJackpotStructure = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-jackpot-structure-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          const doc = data.data;

          setStructureData({
            ...defaultData,
            ...doc,
            footerTitle: {
              ...defaultData.footerTitle,
              ...(doc.footerTitle || {}),
            },
            footerText: {
              ...defaultData.footerText,
              ...(doc.footerText || {}),
            },
            buttonText: {
              ...defaultData.buttonText,
              ...(doc.buttonText || {}),
            },
            scenarios: Array.isArray(doc.scenarios) ? doc.scenarios : [],
            isActive: doc.isActive !== false,
          });
        } else {
          setStructureData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch jackpot structure content:", error);
        setStructureData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJackpotStructure();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const scenarios = (structureData.scenarios || [])
      .filter((scenario) => scenario?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((scenario, index) => {
        const smallRows = (scenario.smallRows || [])
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((row, rowIndex) => ({
            id: row?._id || rowIndex,
            label: getText(row?.label, lang, ""),
            value: row?.value || "",
            color: colorClass(row?.colorType),
          }));

        const calcRows = (scenario.calcRows || [])
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((row, rowIndex) => ({
            id: row?._id || rowIndex,
            label: getText(row?.label, lang, ""),
            value: row?.value || "",
            color: colorClass(row?.colorType),
          }));

        return {
          id: scenario?._id || scenario?.scenarioKey || index,
          title: getText(
            scenario?.title,
            lang,
            scenario?.scenarioKey ? `SCENARIO ${scenario.scenarioKey}` : "",
          ),
          subtitle: getText(scenario?.subtitle, lang, ""),
          smallTitle: getText(scenario?.smallTitle, lang, ""),
          smallRows,
          jackpotCostLabel: getText(scenario?.jackpotCostLabel, lang, ""),
          jackpotCost: scenario?.jackpotCost || "",
          jackpotCostColor: colorClass(scenario?.jackpotCostColorType),
          calcTitle: getText(scenario?.calcTitle, lang, ""),
          calcRows,
          netProfitLabel: getText(scenario?.netProfitLabel, lang, ""),
          netProfit: scenario?.netProfit || "",
          affiliateTitle: getText(scenario?.affiliateTitle, lang, ""),
          affiliateValue: scenario?.affiliateValue || "",
          descriptionTitle: getText(scenario?.descriptionTitle, lang, ""),
          description: getText(scenario?.description, lang, ""),
        };
      });

    return {
      footerTitle: getText(
        structureData.footerTitle,
        lang,
        defaultData.footerTitle[lang],
      ),
      footerText: getText(
        structureData.footerText,
        lang,
        defaultData.footerText[lang],
      ),
      button: getText(
        structureData.buttonText,
        lang,
        defaultData.buttonText[lang],
      ),
      scenarios,
    };
  }, [structureData, isBangla]);

  if (loading) {
    return (
      <section className="w-full bg-[#1b1204] py-8 text-white md:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1500px] px-4 md:px-6 lg:px-10">
          <div className="space-y-10 lg:space-y-32">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="grid grid-cols-1 gap-5 md:gap-22 xl:grid-cols-[390px_425px_1fr] xl:items-center"
              >
                <div className="h-[260px] animate-pulse rounded-[14px] bg-white/10" />
                <div className="h-[420px] animate-pulse rounded-[14px] bg-white/10" />
                <div className="h-[160px] animate-pulse rounded-[14px] bg-white/10" />
              </div>
            ))}

            <div className="h-[80px] animate-pulse rounded-[14px] bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (structureData?.isActive === false) {
    return null;
  }

  return (
    <section className="w-full bg-[#1b1204] py-8 text-white md:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-6 lg:px-10">
        <div className="space-y-10 lg:space-y-32">
          {content.scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="grid grid-cols-1 gap-5 md:gap-22 xl:grid-cols-[390px_425px_1fr] xl:items-center"
            >
              <div className="overflow-hidden rounded-[14px] bg-[linear-gradient(90deg,#1f2728_0%,#263121_100%)] shadow-[0_10px_18px_rgba(0,0,0,0.14)]">
                <div className="flex items-center gap-3 bg-[rgba(69,74,76,0.72)] px-5 py-5 md:px-6 md:py-5">
                  <CircleUserRound
                    size={28}
                    className="shrink-0 text-[#d3b45a]"
                    fill="currentColor"
                    strokeWidth={1.8}
                  />

                  <div>
                    <p className="text-[24px] font-extrabold uppercase leading-none text-white md:text-[22px] xl:text-[18px]">
                      {scenario.title}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-6 md:px-6 md:pb-6 md:pt-5">
                  <p className="text-[18px] font-extrabold uppercase text-white md:text-[16px] xl:text-[14px]">
                    {scenario.smallTitle}
                  </p>

                  <div className="mt-6 space-y-3">
                    {scenario.smallRows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <span
                          className={`text-[16px] font-extrabold uppercase md:text-[14px] xl:text-[13px] ${row.color}`}
                        >
                          {row.label}
                        </span>

                        <span
                          className={`text-[16px] font-extrabold uppercase md:text-[14px] xl:text-[13px] ${row.color}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-white/25 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[18px] font-extrabold uppercase text-[#ff1f1f] md:text-[16px] xl:text-[14px]">
                        {scenario.jackpotCostLabel}
                      </span>

                      <span
                        className={`text-[18px] font-extrabold uppercase md:text-[16px] xl:text-[14px] ${scenario.jackpotCostColor}`}
                      >
                        {scenario.jackpotCost}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[14px] bg-[linear-gradient(90deg,#1e2630_0%,#2c3321_100%)] shadow-[0_12px_22px_rgba(0,0,0,0.16)]">
                <div className="flex items-start justify-between gap-4 bg-[rgba(69,74,76,0.72)] px-5 py-5 md:px-6 md:py-5">
                  <div className="flex items-start gap-3">
                    <CircleUserRound
                      size={28}
                      className="mt-0.5 shrink-0 text-[#d3b45a]"
                      fill="currentColor"
                      strokeWidth={1.8}
                    />

                    <div>
                      <p className="text-[24px] font-extrabold uppercase leading-none text-white md:text-[22px] xl:text-[18px]">
                        {scenario.title}
                      </p>

                      <p className="mt-1 text-[12px] font-bold text-white md:text-[11px] xl:text-[10px]">
                        {scenario.subtitle}
                      </p>
                    </div>
                  </div>

                  <BadgeCheck
                    size={24}
                    className="mt-1 shrink-0 text-[#67e51b]"
                    fill="currentColor"
                  />
                </div>

                <div className="px-5 pb-6 pt-6 md:px-6 md:pb-7 md:pt-6">
                  <p className="text-[20px] font-extrabold uppercase text-white md:text-[18px] xl:text-[14px]">
                    {scenario.calcTitle}
                  </p>

                  <div className="mt-6 space-y-2.5">
                    {scenario.calcRows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-5"
                      >
                        <span
                          className={`text-[16px] font-extrabold uppercase md:text-[14px] xl:text-[13px] ${row.color}`}
                        >
                          {row.label}
                        </span>

                        <span
                          className={`text-[16px] font-extrabold uppercase md:text-[14px] xl:text-[13px] ${row.color}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="ml-auto mt-5 max-w-[135px] border-t border-white/25 pt-4 text-right">
                    <p className="text-[11px] font-extrabold uppercase text-white/70">
                      {scenario.netProfitLabel}
                    </p>

                    <p className="mt-1 text-[16px] font-extrabold uppercase text-white md:text-[14px] xl:text-[13px]">
                      {scenario.netProfit}
                    </p>
                  </div>

                  <div className="mt-14 flex items-center justify-between gap-4">
                    <span className="text-[16px] font-extrabold uppercase text-white md:text-[14px] xl:text-[13px]">
                      {scenario.affiliateTitle}
                    </span>

                    <span className="text-[16px] font-extrabold uppercase text-white md:text-[14px] xl:text-[13px]">
                      {scenario.affiliateValue}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-1 xl:px-0">
                <h4 className="text-[20px] font-extrabold uppercase text-white md:text-[18px] xl:text-[16px]">
                  {scenario.descriptionTitle}
                </h4>

                <p className="mt-4 text-[16px] font-semibold leading-[1.72] text-white md:text-[15px] xl:text-[14px]">
                  {scenario.description}
                </p>
              </div>
            </div>
          ))}

          {!content.scenarios.length && (
            <div className="rounded-[14px] bg-[#2a2115] p-6 text-center text-white/75">
              {isBangla ? "কোনো সিনারিও পাওয়া যায়নি" : "No scenario found"}
            </div>
          )}

          <div className="mx-auto grid w-full max-w-[1300px] grid-cols-1 gap-6 pt-3 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
              <div className="min-w-fit">
                <h3 className="text-[20px] font-extrabold uppercase leading-none text-white sm:text-[22px] md:text-[22px] lg:text-[18px]">
                  {content.footerTitle}
                </h3>

                <p className="mt-2 text-[14px] leading-[1.45] text-white/90 sm:text-[15px] md:text-[15px] lg:text-[14px]">
                  {content.footerText}
                </p>
              </div>

              <div className="hidden h-[2px] flex-1 bg-white/55 lg:block" />
            </div>

            <NavLink
              to="/register"
              className="group relative inline-flex h-[48px] min-w-[190px] items-center justify-center overflow-hidden rounded-[6px] border border-white/20 px-7 text-[12px] font-extrabold uppercase text-white transition-all duration-300 sm:h-[52px] sm:text-[13px]"
            >
              <span className="absolute inset-0 rounded-[6px] bg-[#39c48f] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 rounded-[6px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_22px_rgba(255,255,255,0.6),0_0_38px_rgba(99,255,204,0.45)]" />
              <span className="relative z-10">{content.button}</span>
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JackpotStructure;
