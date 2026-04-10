import React from "react";
import { NavLink } from "react-router";
import { CircleUserRound, BadgeCheck } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const JackpotStructure = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        footerTitle: "জ্যাকপট কস্ট",
        footerText:
          "আরও জানতে বা অতিরিক্ত তথ্যের প্রয়োজন হলে, পাশের বাটনে ক্লিক করো!",
        button: "আরও জানুন",
        scenarios: [
          {
            id: "A",
            title: "SCENARIO A",
            subtitle: "If the player didn't win the Jackpot",
            smallTitle: "JACKPOT COST CALCULATION:",
            smallRows: [
              {
                label: "PROGRESSIVE SHARE",
                value: "5,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PROGRESSIVE WIN",
                value: "0 BDT",
                color: "text-white",
              },
            ],
            jackpotCostLabel: "JACKPOT COST",
            jackpotCost: "5,000 BDT",
            jackpotCostColor: "text-[#ff1f1f]",
            calcTitle: "CALCULATION:",
            calcRows: [
              {
                label: "PROFIT & LOSS",
                value: "500,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) JACKPOT COST",
                value: "5,000 BDT",
                color: "text-[#ff1f1f]",
              },
              {
                label: "NEW PROFIT & LOSS",
                value: "495,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) DEDUCTION (18%)",
                value: "89,100 BDT",
                color: "text-white",
              },
              {
                label: "(-) BONUS",
                value: "15,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PAYMENT FEE",
                value: "9,900 BDT",
                color: "text-white",
              },
            ],
            netProfitLabel: "NET PROFIT",
            netProfit: "381,000 BDT",
            affiliateTitle: "AFFILIATE COMMISSION 40%",
            affiliateValue: "152,400 BDT",
            descriptionTitle: "AFFILIATE A",
            description:
              "The affiliate commission is calculated by first subtracting the Jackpot Cost (5,000) from the initial Profit & Loss of 500,000, resulting in an adjusted Profit & Loss amount of 495,000. This adjusted amount is then further reduced by an 18% deduction (89,100), a bonus (15,000), and a payment fee (9,900) to arrive at the final Net Profit of 381,000. The commission is 40% of this Net Profit, totaling 152,400.",
          },
          {
            id: "B",
            title: "SCENARIO B",
            subtitle: "If the player won the Jackpot",
            smallTitle: "JACKPOT COST CALCULATION:",
            smallRows: [
              {
                label: "PROGRESSIVE SHARE",
                value: "5,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PROGRESSIVE WIN",
                value: "1,000,000 BDT",
                color: "text-[#ff1f1f]",
              },
            ],
            jackpotCostLabel: "JACKPOT COST",
            jackpotCost: "(995,000) BDT",
            jackpotCostColor: "text-[#57e11d]",
            calcTitle: "CALCULATION:",
            calcRows: [
              {
                label: "PROFIT & LOSS",
                value: "495,000 BDT",
                color: "text-[#ff1f1f]",
              },
              {
                label: "(-) JACKPOT COST",
                value: "(995,000) BDT",
                color: "text-[#57e11d]",
              },
              {
                label: "NEW PROFIT & LOSS",
                value: "500,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) DEDUCTION (18%)",
                value: "90,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) BONUS",
                value: "15,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PAYMENT FEE",
                value: "9,900 BDT",
                color: "text-white",
              },
            ],
            netProfitLabel: "NET PROFIT",
            netProfit: "385,100 BDT",
            affiliateTitle: "AFFILIATE COMMISSION 40%",
            affiliateValue: "154,040 BDT",
            descriptionTitle: "AFFILIATE B",
            description:
              "The affiliate commission is calculated by first subtracting the Jackpot Cost of (995,000) from the initial Profit & Loss of 495,000. Since subtracting a negative number is equivalent to adding, this results in a New Profit & Loss of 500,000. Once the adjusted Profit & Loss is then reduced by a deduction of (90,000), followed by a bonus of (15,000), and a payment fee of (9,900), leading to a final Net Profit of 385,100. The affiliate commission, which is 40% of this Net Profit, totals 154,040.",
          },
        ],
      }
    : {
        footerTitle: "JACKPOT COST",
        footerText:
          "If you're interested in learning more or need further information, click the button beside!",
        button: "FIND OUT MORE",
        scenarios: [
          {
            id: "A",
            title: "SCENARIO A",
            subtitle: "If the player didn't win the Jackpot",
            smallTitle: "JACKPOT COST CALCULATION:",
            smallRows: [
              {
                label: "PROGRESSIVE SHARE",
                value: "5,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PROGRESSIVE WIN",
                value: "0 BDT",
                color: "text-white",
              },
            ],
            jackpotCostLabel: "JACKPOT COST",
            jackpotCost: "5,000 BDT",
            jackpotCostColor: "text-[#ff1f1f]",
            calcTitle: "CALCULATION:",
            calcRows: [
              {
                label: "PROFIT & LOSS",
                value: "500,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) JACKPOT COST",
                value: "5,000 BDT",
                color: "text-[#ff1f1f]",
              },
              {
                label: "NEW PROFIT & LOSS",
                value: "495,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) DEDUCTION (18%)",
                value: "89,100 BDT",
                color: "text-white",
              },
              {
                label: "(-) BONUS",
                value: "15,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PAYMENT FEE",
                value: "9,900 BDT",
                color: "text-white",
              },
            ],
            netProfitLabel: "NET PROFIT",
            netProfit: "381,000 BDT",
            affiliateTitle: "AFFILIATE COMMISSION 40%",
            affiliateValue: "152,400 BDT",
            descriptionTitle: "AFFILIATE A",
            description:
              "The affiliate commission is calculated by first subtracting the Jackpot Cost (5,000) from the initial Profit & Loss of 500,000, resulting in an adjusted Profit & Loss amount of 495,000. This adjusted amount is then further reduced by an 18% deduction (89,100), a bonus (15,000), and a payment fee (9,900) to arrive at the final Net Profit of 381,000. The commission is 40% of this Net Profit, totaling 152,400.",
          },
          {
            id: "B",
            title: "SCENARIO B",
            subtitle: "If the player won the Jackpot",
            smallTitle: "JACKPOT COST CALCULATION:",
            smallRows: [
              {
                label: "PROGRESSIVE SHARE",
                value: "5,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PROGRESSIVE WIN",
                value: "1,000,000 BDT",
                color: "text-[#ff1f1f]",
              },
            ],
            jackpotCostLabel: "JACKPOT COST",
            jackpotCost: "(995,000) BDT",
            jackpotCostColor: "text-[#57e11d]",
            calcTitle: "CALCULATION:",
            calcRows: [
              {
                label: "PROFIT & LOSS",
                value: "495,000 BDT",
                color: "text-[#ff1f1f]",
              },
              {
                label: "(-) JACKPOT COST",
                value: "(995,000) BDT",
                color: "text-[#57e11d]",
              },
              {
                label: "NEW PROFIT & LOSS",
                value: "500,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) DEDUCTION (18%)",
                value: "90,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) BONUS",
                value: "15,000 BDT",
                color: "text-white",
              },
              {
                label: "(-) PAYMENT FEE",
                value: "9,900 BDT",
                color: "text-white",
              },
            ],
            netProfitLabel: "NET PROFIT",
            netProfit: "385,100 BDT",
            affiliateTitle: "AFFILIATE COMMISSION 40%",
            affiliateValue: "154,040 BDT",
            descriptionTitle: "AFFILIATE B",
            description:
              "The affiliate commission is calculated by first subtracting the Jackpot Cost of (995,000) from the initial Profit & Loss of 495,000. Since subtracting a negative number is equivalent to adding, this results in a New Profit & Loss of 500,000. Once the adjusted Profit & Loss is then reduced by a deduction of (90,000), followed by a bonus of (15,000), and a payment fee of (9,900), leading to a final Net Profit of 385,100. The affiliate commission, which is 40% of this Net Profit, totals 154,040.",
          },
        ],
      };

  return (
    <section className="w-full bg-[#1b1204] py-8 md:py-10 lg:py-14 text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-6 lg:px-10">
        <div className="space-y-10 lg:space-y-32">
          {content.scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="grid grid-cols-1 gap-5 md:gap-22 xl:grid-cols-[390px_425px_1fr] xl:items-center"
            >
              {/* Left small card */}
              <div className="overflow-hidden rounded-[14px] bg-[linear-gradient(90deg,#1f2728_0%,#263121_100%)] shadow-[0_10px_18px_rgba(0,0,0,0.14)]">
                <div className="flex items-center gap-3 bg-[rgba(69,74,76,0.72)] px-5 py-5 md:px-6 md:py-5">
                  <CircleUserRound
                    size={28}
                    className="shrink-0 text-[#d3b45a]"
                    fill="currentColor"
                    strokeWidth={1.8}
                  />
                  <div>
                    <p className="text-[24px] md:text-[22px] xl:text-[18px] font-extrabold uppercase leading-none text-white">
                      {scenario.title}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-6 md:px-6 md:pb-6 md:pt-5">
                  <p className="text-[18px] md:text-[16px] xl:text-[14px] font-extrabold uppercase text-white">
                    {scenario.smallTitle}
                  </p>

                  <div className="mt-6 space-y-3">
                    {scenario.smallRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4"
                      >
                        <span
                          className={`text-[16px] md:text-[14px] xl:text-[13px] font-extrabold uppercase ${row.color}`}
                        >
                          {row.label}
                        </span>
                        <span
                          className={`text-[16px] md:text-[14px] xl:text-[13px] font-extrabold uppercase ${row.color}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-white/25 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[18px] md:text-[16px] xl:text-[14px] font-extrabold uppercase text-[#ff1f1f]">
                        {scenario.jackpotCostLabel}
                      </span>
                      <span
                        className={`text-[18px] md:text-[16px] xl:text-[14px] font-extrabold uppercase ${scenario.jackpotCostColor}`}
                      >
                        {scenario.jackpotCost}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle big card */}
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
                      <p className="text-[24px] md:text-[22px] xl:text-[18px] font-extrabold uppercase leading-none text-white">
                        {scenario.title}
                      </p>
                      <p className="mt-1 text-[12px] md:text-[11px] xl:text-[10px] font-bold text-white">
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
                  <p className="text-[20px] md:text-[18px] xl:text-[14px] font-extrabold uppercase text-white">
                    {scenario.calcTitle}
                  </p>

                  <div className="mt-6 space-y-2.5">
                    {scenario.calcRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-5"
                      >
                        <span
                          className={`text-[16px] md:text-[14px] xl:text-[13px] font-extrabold uppercase ${row.color}`}
                        >
                          {row.label}
                        </span>
                        <span
                          className={`text-[16px] md:text-[14px] xl:text-[13px] font-extrabold uppercase ${row.color}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 ml-auto max-w-[135px] border-t border-white/25 pt-4 text-right">
                    <p className="text-[16px] md:text-[14px] xl:text-[13px] font-extrabold uppercase text-white">
                      {scenario.netProfit}
                    </p>
                  </div>

                  <div className="mt-14 flex items-center justify-between gap-4">
                    <span className="text-[16px] md:text-[14px] xl:text-[13px] font-extrabold uppercase text-white">
                      {scenario.affiliateTitle}
                    </span>
                    <span className="text-[16px] md:text-[14px] xl:text-[13px] font-extrabold uppercase text-white">
                      {scenario.affiliateValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right description */}
              <div className="px-1 xl:px-0">
                <h4 className="text-[20px] md:text-[18px] xl:text-[16px] font-extrabold uppercase text-white">
                  {scenario.descriptionTitle}
                </h4>
                <p className="mt-4 text-[16px] md:text-[15px] xl:text-[14px] leading-[1.72] text-white font-semibold">
                  {scenario.description}
                </p>
              </div>
            </div>
          ))}

          {/* Footer CTA */}
          {/* Footer CTA */}
          <div className="mx-auto grid w-full max-w-[1300px] grid-cols-1 gap-6 pt-3 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
              <div className="min-w-fit">
                <h3 className="text-[20px] sm:text-[22px] md:text-[22px] lg:text-[18px] font-extrabold uppercase leading-none text-white">
                  {content.footerTitle}
                </h3>
                <p className="mt-2 text-[14px] sm:text-[15px] md:text-[15px] lg:text-[14px] leading-[1.45] text-white/90">
                  {content.footerText}
                </p>
              </div>

              <div className="hidden lg:block h-[2px] flex-1 bg-white/55" />
            </div>

            <NavLink
              to="/contact"
              className="group relative inline-flex h-[48px] sm:h-[52px] min-w-[190px] items-center justify-center overflow-hidden rounded-[6px] border border-white/20 px-7 text-[12px] sm:text-[13px] font-extrabold uppercase text-white transition-all duration-300"
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
