import React from "react";
import { NavLink } from "react-router";
import { Play } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const Commission = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "৪০% নির্দিষ্ট কমিশন",
        subtitle:
          "আমরা অ্যাফিলিয়েটদের প্রতি সপ্তাহে ৪০% নির্দিষ্ট কমিশন রেট দিচ্ছি।",
        structure: "কমিশন স্ট্রাকচার",
        winLoss: "জয়/ক্ষতি",
        bonus: "বোনাস",
        deduction: "কর্তন",
        paymentFee: "পেমেন্ট ফি",
        register: "এখনই রেজিস্টার",
        watch: "ভিডিও দেখুন",
        country: "বাংলাদেশ",
        countryText:
          "আমাদের অ্যাফিলিয়েটরা চলমান ক্যাম্পেইন থেকে আরও অতিরিক্ত কমিশন উপার্জন করতে পারবে।",
        paymentTitle: "পেমেন্ট ফি:",
        paymentText: "(ডিপোজিট এমাউন্ট × ৪.০%) + (উইথড্রয়াল এমাউন্ট × ২.০%)",
        bonusTitle: "বোনাস:",
        bonusText: "প্রোমোশন বোনাস + ভিআইপি ক্যাশ বোনাস",
        netProfitTitle: "নেট প্রফিট:",
        netProfitText:
          "(প্লেয়ার জয়/ক্ষতি - জ্যাকপট কস্ট) - ১৮% কর্তন - বোনাস - পেমেন্ট ফি",
      }
    : {
        title: "40% FIXED COMMISSION",
        subtitle:
          "We are giving 40% fixed commission rate to affiliates every week.",
        structure: "COMMISSION STRUCTURE",
        winLoss: "Win/Loss",
        bonus: "Bonus",
        deduction: "Deduction",
        paymentFee: "Payment Fee",
        register: "REGISTER NOW",
        watch: "WATCH VIDEO",
        country: "BANGLADESH",
        countryText:
          "Our affiliates will be able to earn another extra commission from our running campaigns.",
        paymentTitle: "PAYMENT FEE:",
        paymentText: "(DEPOSIT AMOUNT X 4.0%) + (WITHDRAWAL AMOUNT X 2.0%)",
        bonusTitle: "BONUS:",
        bonusText: "PROMOTION BONUS + VIP CASH BONUS",
        netProfitTitle: "NET PROFIT:",
        netProfitText:
          "(PLAYER WIN/LOSS - JACKPOT COST) - 18% DEDUCTION - BONUS - PAYMENT FEE",
      };

  return (
    <section className="w-full bg-[#1b1204] py-4 sm:py-8 lg:py-10 text-white">
      <div className="mx-auto w-full max-w-[1500px] px-2 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_0.98fr] lg:gap-8">
          {/* Left Section */}
          <div
            className="relative overflow-hidden rounded-[18px] bg-[#02131a] min-h-[580px] sm:min-h-[560px] lg:min-h-[533px]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.5)), url('https://beit365.bet/assets/affiliate/assets/hero-banner/bdt-hero.webp')",
              backgroundSize: "cover",
            //   backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="relative z-10 flex h-full flex-col px-4 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-7 lg:px-8 lg:pt-7 lg:pb-6">
              {/* Title */}
              <div className="max-w-[280px] sm:max-w-[520px]">
                <h2 className="text-[30px] sm:text-[42px] lg:text-[31px] xl:text-[38px] font-extrabold uppercase leading-[1.15] tracking-[-0.03em] text-white">
                  {content.title}
                </h2>

                <p className="mt-5 max-w-[300px] sm:max-w-[470px] text-[16px] sm:text-[20px] lg:text-[14px] xl:text-[16px] leading-[1.8] text-white/80">
                  {content.subtitle}
                </p>
              </div>

              {/* Commission structure card */}
              <div className="mt-5 sm:mt-8 lg:mt-7 w-full rounded-[18px] sm:rounded-[22px] bg-[rgba(7,11,18,0.82)] px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:px-6 sm:py-6 lg:max-w-[680px] lg:px-5 lg:py-5">
                <h3 className="text-[18px] sm:text-[24px] lg:text-[18px] font-bold uppercase tracking-[0.01em] text-white">
                  {content.structure}
                </h3>

                <div className="mt-6 flex flex-col gap-6">
                  <div className="flex items-center gap-6 sm:gap-7 lg:flex-row lg:items-center lg:justify-between">
                    {/* Growth image */}
                    <div className="flex justify-center lg:justify-start">
                      <img
                        src="https://beit365.bet/assets/affiliate/assets/images/growth2e0f.png"
                        alt="Commission growth chart"
                        className="w-[150px] sm:w-[240px] lg:w-[250px] h-auto object-contain"
                      />
                    </div>

                    {/* Info pills */}
                    <div className="grid w-full max-w-[155px] sm:max-w-[210px] lg:w-[250px] lg:max-w-none grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                      <div className="flex h-[32px] sm:h-[44px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] sm:text-[17px] lg:text-[14px] font-semibold text-[#f1df9a]">
                        {content.winLoss}
                      </div>
                      <div className="flex h-[32px] sm:h-[44px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] sm:text-[17px] lg:text-[14px] font-semibold text-white">
                        {content.bonus}
                      </div>
                      <div className="flex h-[32px] sm:h-[44px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] sm:text-[17px] lg:text-[14px] font-semibold text-[#39b96a]">
                        {content.deduction}
                      </div>
                      <div className="flex h-[32px] sm:h-[44px] items-center justify-center rounded-[6px] bg-white/10 text-[14px] sm:text-[17px] lg:text-[14px] font-semibold text-white/45">
                        {content.paymentFee}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom actions */}
              {/* Bottom actions */}
              <div className="mt-5 sm:mt-auto flex flex-col gap-4 pt-4 sm:pt-8 lg:flex-row lg:items-center lg:gap-6">
                <NavLink
                  to="/register"
                  className="group relative inline-flex h-[46px] sm:h-[54px] w-full lg:w-[190px] items-center justify-center overflow-hidden rounded-[4px] sm:rounded-[6px] border border-white/25 bg-transparent px-6 text-[14px] sm:text-[18px] lg:text-[14px] font-bold uppercase text-white transition-all duration-300"
                >
                  <span className="absolute inset-0 rounded-[4px] sm:rounded-[6px] bg-[#35c58d] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 rounded-[4px] sm:rounded-[6px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_18px_rgba(255,255,255,0.55),0_0_30px_rgba(83,255,194,0.45)]" />
                  <span className="relative z-10">{content.register}</span>
                </NavLink>

                <button
                  type="button"
                  className="group relative inline-flex h-[46px] sm:h-[54px] w-full lg:w-[250px] items-center justify-center rounded-[4px] sm:rounded-[6px] border border-white/15 bg-transparent px-6 text-white transition-all duration-300 hover:bg-[#041b25]"
                >
                  <span className="absolute inset-0 rounded-[4px] sm:rounded-[6px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_18px_rgba(255,255,255,0.45),0_0_28px_rgba(146,241,255,0.25)]" />
                  <span className="relative z-10 flex items-center gap-4">
                    <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#ff1f1f] text-white">
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
                    <span className="text-[16px] sm:text-[21px] lg:text-[16px] font-medium uppercase">
                      {content.watch}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {/* Top info card */}
            <div className="rounded-[18px] bg-[#2a2115] px-4 py-4 sm:px-6 sm:py-6 lg:px-5 lg:py-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[18px] sm:text-[26px] lg:text-[17px] font-extrabold uppercase text-white">
                  {content.country}
                </h3>

                <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                  <span className="text-[#c89b17] text-[12px] sm:text-[16px] lg:text-[14px]">
                    ★★★★★
                  </span>
                  <span className="text-[12px] sm:text-[15px] lg:text-[14px] font-semibold text-white">
                    (396)
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-4 sm:mt-5 sm:flex-row sm:items-center lg:gap-6">
                <img
                  src="https://beit365.bet/assets/affiliate/assets/img/flag/bn.jpg"
                  alt="Bangladesh flag"
                  className="h-[72px] w-[130px] sm:h-[78px] sm:w-[132px] rounded-[10px] object-cover shrink-0"
                />

                <p className="max-w-[430px] text-[15px] sm:text-[20px] lg:text-[16px] leading-[1.55] sm:leading-[1.6] text-white">
                  {content.countryText}
                </p>
              </div>
            </div>

            {/* Middle cards */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              <div className="rounded-[18px] bg-[#2a2115] px-4 py-9 sm:px-6 sm:py-7 lg:px-5 lg:py-7 text-center">
                <h4 className="text-[16px] sm:text-[28px] lg:text-[18px] font-extrabold uppercase text-[#f3d56e]">
                  {content.paymentTitle}
                </h4>
                <p className="mt-6 text-[12px] sm:text-[24px] lg:text-[15px] font-bold uppercase leading-[1.7] text-white">
                  {content.paymentText}
                </p>
              </div>

              <div className="rounded-[18px] bg-[#2a2115] px-4 py-9 sm:px-6 sm:py-7 lg:px-5 lg:py-7 text-center">
                <h4 className="text-[16px] sm:text-[28px] lg:text-[18px] font-extrabold uppercase text-[#f3d56e]">
                  {content.bonusTitle}
                </h4>
                <p className="mt-6 text-[12px] sm:text-[24px] lg:text-[15px] font-bold uppercase leading-[1.7] text-white">
                  {content.bonusText}
                </p>
              </div>
            </div>

            {/* Bottom card */}
            <div className="rounded-[18px] bg-[#2a2115] px-4 py-8 sm:px-6 sm:py-7 lg:px-5 lg:py-6">
              <h4 className="text-[16px] sm:text-[28px] lg:text-[18px] font-extrabold uppercase text-[#f3d56e]">
                {content.netProfitTitle}
              </h4>

              <p className="mt-6 sm:mt-8 text-[12px] sm:text-[22px] lg:text-[15px] font-bold uppercase leading-[1.9] text-white">
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
