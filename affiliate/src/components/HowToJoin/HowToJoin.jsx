import React from "react";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const HowToJoin = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "HOW TO JOIN",
        heroText: "এখনই তোমার অ্যাফিলিয়েট যাত্রা শুরু করো!",
        button: "Register now",
        step1: {
          number: "01",
          title: "Register",
          desc: "প্লেয়ার ইউনিক অ্যাফিলিয়েট লিংক ব্যবহার করে beit365.bet অ্যাকাউন্ট রেজিস্টার করে",
        },
        step2: {
          number: "02",
          title: "Generate",
          desc: "প্লেয়ার নেট প্রফিট জেনারেট করে",
        },
        step3: {
          number: "03",
          title: "Earn",
          desc: "তুমি নেট প্রফিটের 40% কমিশন হিসেবে আয় করো",
        },
      }
    : {
        title: "HOW TO JOIN",
        heroText: "Start your affiliate journey now!",
        button: "Register now",
        step1: {
          number: "01",
          title: "Register",
          desc: "Player registers beit365.bet account with unique affiliate link",
        },
        step2: {
          number: "02",
          title: "Generate",
          desc: "Player generates net profit",
        },
        step3: {
          number: "03",
          title: "Earn",
          desc: "You earn 40% of net profit as commission",
        },
      };

  return (
    <section className="w-full bg-[#1b1204] py-8 sm:py-10 lg:py-14 text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {/* Title */}
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[28px] sm:text-[34px] lg:text-[30px] font-medium uppercase tracking-[-0.03em] text-white">
            {content.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:flex lg:justify-between">
          {/* Left Side */}
          <div className="order-1">
            {/* Image Card */}
            <div
              className="relative overflow-hidden rounded-[10px] sm:rounded-[18px] min-h-[155px] sm:min-h-[340px] lg:min-h-[338px]"
              style={{
                backgroundImage:
                  "url('https://beit365.bet/assets/affiliate/assets/hero-banner/clzhvb72472ur07zopjckzhdv.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>

            {/* Desktop / Tablet steps 01 & 02 */}
            <div className="mt-8 hidden sm:grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:mt-10 lg:gap-12">
              <div>
                <h3 className="text-[52px] sm:text-[58px] lg:text-[46px] font-extrabold leading-none text-[#d8b067]">
                  {content.step1.number}
                </h3>
                <h4 className="mt-2 text-[22px] sm:text-[24px] lg:text-[18px] font-extrabold text-white">
                  {content.step1.title}
                </h4>
                <p className="mt-3 max-w-[320px] text-[18px] sm:text-[19px] lg:text-[14px] font-semibold leading-[1.65] text-white">
                  {content.step1.desc}
                </p>
              </div>

              <div>
                <h3 className="text-[52px] sm:text-[58px] lg:text-[46px] font-extrabold leading-none text-[#d8b067]">
                  {content.step2.number}
                </h3>
                <h4 className="mt-2 text-[22px] sm:text-[24px] lg:text-[18px] font-extrabold text-white">
                  {content.step2.title}
                </h4>
                <p className="mt-3 max-w-[320px] text-[18px] sm:text-[19px] lg:text-[14px] font-semibold leading-[1.65] text-white">
                  {content.step2.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="order-2 flex flex-col items-center text-center lg:items-start lg:text-left lg:pt-[110px]">
            <div className="w-full max-w-[380px]">
              <h3 className="mx-auto max-w-[260px] text-[28px] sm:max-w-none sm:text-[42px] lg:mx-0 lg:text-[28px] leading-[1.15] text-white/80">
                {content.heroText}
              </h3>

              <NavLink
                to="/register"
                className="mt-6 inline-flex h-[42px] w-full sm:w-auto sm:h-[52px] min-w-[190px] items-center justify-center rounded-[4px] border border-white/30 px-7 text-[13px] sm:text-[15px] lg:text-[13px] font-bold text-white transition hover:bg-white hover:text-black"
              >
                {content.button}
              </NavLink>
            </div>

            {/* Desktop / Tablet Step 03 Card */}
            <div className="mt-10 hidden sm:block rounded-[20px] bg-[#7b6330] px-6 py-6 sm:px-7 sm:py-7 lg:mt-24 lg:max-w-[430px]">
              <h3 className="text-[54px] sm:text-[60px] lg:text-[46px] font-extrabold leading-none text-[#d8b067]">
                {content.step3.number}
              </h3>

              <h4 className="mt-2 text-[22px] sm:text-[24px] lg:text-[18px] font-extrabold text-white">
                {content.step3.title}
              </h4>

              <p className="mt-3 text-[18px] sm:text-[19px] lg:text-[14px] font-semibold leading-[1.65] text-white">
                {content.step3.desc}
              </p>
            </div>
          </div>

          {/* Mobile only steps */}
          <div className="order-3 flex flex-col items-center text-center gap-10 sm:hidden">
            <div className="max-w-[290px]">
              <h3 className="text-[44px] font-extrabold leading-none text-[#d8b067]">
                {content.step1.number}
              </h3>
              <h4 className="mt-3 text-[18px] font-extrabold text-white">
                {content.step1.title}
              </h4>
              <p className="mt-3 text-[15px] font-semibold leading-[1.8] text-white">
                {content.step1.desc}
              </p>
            </div>

            <div className="max-w-[290px]">
              <h3 className="text-[44px] font-extrabold leading-none text-[#d8b067]">
                {content.step2.number}
              </h3>
              <h4 className="mt-3 text-[18px] font-extrabold text-white">
                {content.step2.title}
              </h4>
              <p className="mt-3 text-[15px] font-semibold leading-[1.8] text-white">
                {content.step2.desc}
              </p>
            </div>

            <div className="w-full rounded-[18px] bg-[#7b6330] px-6 py-6">
              <h3 className="text-[44px] font-extrabold leading-none text-[#d8b067]">
                {content.step3.number}
              </h3>
              <h4 className="mt-3 text-[18px] font-extrabold text-white">
                {content.step3.title}
              </h4>
              <p className="mt-3 text-[15px] font-semibold leading-[1.8] text-white">
                {content.step3.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToJoin;
