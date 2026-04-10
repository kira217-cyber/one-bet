import React from "react";
import { UserRound } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const CommissionStructure = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "কমিশন স্ট্রাকচার",
        headers: {
          recruit: "অ্যাফিলিয়েট রিক্রুট",
          winLoss: "জয়/ক্ষতি",
          deduction: "কর্তন",
          bonus: "বোনাস",
          paymentFee: "পেমেন্ট ফি",
          commission: "কমিশন",
          total: "মোট",
        },
        players: [
          {
            id: 1,
            name: "প্লেয়ার A",
            winLoss: "1,000,000",
            deduction: "180,000",
            bonus: "20,000",
            paymentFee: "40,000",
            commission: "-",
            negative: false,
          },
          {
            id: 2,
            name: "প্লেয়ার B",
            winLoss: "-300,000",
            deduction: "0",
            bonus: "25,000",
            paymentFee: "12,000",
            commission: "-",
            negative: true,
          },
          {
            id: 3,
            name: "প্লেয়ার C",
            winLoss: "-500,000",
            deduction: "0",
            bonus: "10,000",
            paymentFee: "20,000",
            commission: "-",
            negative: true,
          },
          {
            id: 4,
            name: "প্লেয়ার D",
            winLoss: "1,500,000",
            deduction: "270,000",
            bonus: "40,000",
            paymentFee: "60,000",
            commission: "-",
            negative: false,
          },
          {
            id: 5,
            name: "প্লেয়ার E",
            winLoss: "2,700,000",
            deduction: "486,000",
            bonus: "10,000",
            paymentFee: "108,000",
            commission: "-",
            negative: false,
          },
        ],
        totals: {
          label: "মোট",
          winLoss: "4,400,000",
          deduction: "936,000",
          bonus: "105,000",
          paymentFee: "240,000",
          commission: "1,247,600",
        },
      }
    : {
        title: "COMMISSION STRUCTURE",
        headers: {
          recruit: "AFFILIATE RECRUIT",
          winLoss: "WIN/LOSS",
          deduction: "DEDUCTION",
          bonus: "BONUS",
          paymentFee: "PAYMENT FEE",
          commission: "COMMISSION",
          total: "TOTAL",
        },
        players: [
          {
            id: 1,
            name: "Player A",
            winLoss: "1,000,000",
            deduction: "180,000",
            bonus: "20,000",
            paymentFee: "40,000",
            commission: "-",
            negative: false,
          },
          {
            id: 2,
            name: "Player B",
            winLoss: "-300,000",
            deduction: "0",
            bonus: "25,000",
            paymentFee: "12,000",
            commission: "-",
            negative: true,
          },
          {
            id: 3,
            name: "Player C",
            winLoss: "-500,000",
            deduction: "0",
            bonus: "10,000",
            paymentFee: "20,000",
            commission: "-",
            negative: true,
          },
          {
            id: 4,
            name: "Player D",
            winLoss: "1,500,000",
            deduction: "270,000",
            bonus: "40,000",
            paymentFee: "60,000",
            commission: "-",
            negative: false,
          },
          {
            id: 5,
            name: "Player E",
            winLoss: "2,700,000",
            deduction: "486,000",
            bonus: "10,000",
            paymentFee: "108,000",
            commission: "-",
            negative: false,
          },
        ],
        totals: {
          label: "TOTAL",
          winLoss: "4,400,000",
          deduction: "936,000",
          bonus: "105,000",
          paymentFee: "240,000",
          commission: "1,247,600",
        },
      };

  return (
    <section className="w-full bg-[#1b1204] py-8 sm:py-10 lg:py-14 text-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* Title */}
        <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
          <h2 className="text-[24px] sm:text-[34px] lg:text-[30px] font-extrabold uppercase tracking-[-0.03em] text-white">
            {content.title}
          </h2>
        </div>

        {/* Table wrapper */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[980px]">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1.15fr_1.1fr] items-center bg-[#082231] px-6 py-4 text-center">
              <div className="text-left text-[11px]  lg:text-[12px] font-medium uppercase text-white/90">
                {content.headers.recruit}
              </div>
              <div className="text-[11px] lg:text-[12px] font-medium uppercase text-white/90">
                {content.headers.winLoss}
              </div>
              <div className="text-[11px] lg:text-[12px] font-medium uppercase text-white/90">
                {content.headers.deduction}
              </div>
              <div className="text-[11px]  lg:text-[12px] font-medium uppercase text-white/90">
                {content.headers.bonus}
              </div>
              <div className="text-[11px]  lg:text-[12px] font-medium uppercase text-white/90">
                {content.headers.paymentFee}
              </div>
              <div className="text-[11px]  lg:text-[12px] font-medium uppercase text-[#2eed82]">
                {content.headers.commission}
              </div>
            </div>

            {/* Rows */}
            <div className="mt-4 space-y-3 sm:space-y-4">
              {content.players.map((player) => (
                <div
                  key={player.id}
                  className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1.15fr_1.1fr] items-center bg-[#171920] px-4 py-2"
                >
                  {/* Player */}
                  <div className="flex items-center gap-5 text-left">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-[#e0c264]">
                      <UserRound
                        size={28}
                        fill="currentColor"
                        strokeWidth={1.5}
                      />
                    </span>
                    <span className="text-[16px] sm:text-[17px] lg:text-[14px] font-semibold text-white">
                      {player.name}
                    </span>
                  </div>

                  {/* Win/Loss */}
                  <div
                    className={`text-center text-[16px] sm:text-[17px] lg:text-[14px] font-semibold ${
                      player.negative ? "text-[#ff1f1f]" : "text-white"
                    }`}
                  >
                    {player.winLoss}
                  </div>

                  {/* Deduction */}
                  <div className="text-center text-[16px] sm:text-[17px] lg:text-[14px] font-semibold text-white">
                    {player.deduction}
                  </div>

                  {/* Bonus */}
                  <div className="text-center text-[16px] sm:text-[17px] lg:text-[14px] font-semibold text-white">
                    {player.bonus}
                  </div>

                  {/* Payment fee */}
                  <div className="text-center text-[16px] sm:text-[17px] lg:text-[14px] font-semibold text-white">
                    {player.paymentFee}
                  </div>

                  {/* Commission */}
                  <div className="text-center text-[20px] lg:text-[16px] font-semibold text-white">
                    {player.commission}
                  </div>
                </div>
              ))}
            </div>

            {/* Total row */}
            <div className="grid grid-cols-[2fr_1.1fr_1.1fr_1fr_1.15fr_1.1fr] items-center px-6 py-6 sm:py-7">
              <div className="text-left text-[20px] sm:text-[22px] lg:text-[18px] font-medium uppercase text-white/85">
                {content.totals.label}
              </div>

              <div className="text-center text-[20px] sm:text-[22px] lg:text-[16px] font-medium text-white/85">
                {content.totals.winLoss}
              </div>

              <div className="text-center text-[20px] sm:text-[22px] lg:text-[16px] font-medium text-white/85">
                {content.totals.deduction}
              </div>

              <div className="text-center text-[20px] sm:text-[22px] lg:text-[16px] font-medium text-white/85">
                {content.totals.bonus}
              </div>

              <div className="text-center text-[20px] sm:text-[22px] lg:text-[16px] font-medium text-white/85">
                {content.totals.paymentFee}
              </div>

              <div className="text-center text-[20px] sm:text-[22px] lg:text-[16px] font-bold text-[#2eed82]">
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
