import React, { useRef } from "react";
import { NavLink } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useLanguage } from "../../Context/LanguageProvider";

import "swiper/css";

const Campaigns = () => {
  const { isBangla } = useLanguage();

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const content = isBangla
    ? {
        heading: "চলমান ক্যাম্পেইন",
        moreDetails: "আরও বিস্তারিত",
        signUp: "সাইন আপ করুন",
        count: "৫",
        campaigns: [
          {
            id: 1,
            title: "অ্যাস্ট্রোনটস অফ প্রফিট: ৭০% কমিশন ক্র্যাশ",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/avaitoer.jpg",
            date: "শুরু ২৫শে আগস্ট ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে",
          },
          {
            id: 2,
            title: "বোর্নমাউথ সকার ব্লিটজ",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/soocer-bix.jpg",
            date: "শুরু ১১ই আগস্ট ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে ২৫শে মে ২০২৫, রাত ২১:২৯ (GMT+5:30) পর্যন্ত",
          },
          {
            id: 3,
            title: "এ.এফ.সি. বোর্নমাউথ গোল্ড রাশ",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/650x400-USD.webp",
            date: "শুরু ৩১শে জুলাই ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে ৩১শে মে ২০২৫, রাত ২১:২৯ (GMT+5:30) পর্যন্ত",
          },
          {
            id: 4,
            title: "অ্যাফিলিয়েট রেফারেল প্রোগ্রাম",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/referal.png",
            date: "শুরু ১লা জুন ২০২৪, রাত ২১:৩০ (GMT+5:30) থেকে",
          },
          {
            id: 5,
            title: "অল নিউ বাজি ক্যাম্পেইন",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/All-NewBaji.jpg",
            date: "চলমান বিশেষ ক্যাম্পেইন এখন উপলব্ধ",
          },
        ],
      }
    : {
        heading: "ONGOING CAMPAIGNS",
        moreDetails: "MORE DETAILS",
        signUp: "SIGN UP NOW",
        count: "5",
        campaigns: [
          {
            id: 1,
            title: "ASTRONAUTS OF PROFIT: 70% COMMISSION CRASH",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/avaitoer.jpg",
            date: "Starts from 21:30 (GMT+5:30) on 25th August 2024.",
          },
          {
            id: 2,
            title: "BOURNEMOUTH SOCCER BLITZ",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/soocer-bix.jpg",
            date: "Starts from 21:30 (GMT+5:30) on 11th August 2024 until 21:29 (GMT+5:30) on 25th May 2025",
          },
          {
            id: 3,
            title: "A.F.C. BOURNEMOUTH GOLD RUSH",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/650x400-USD.webp",
            date: "Starts from 21:30 (GMT+5:30) on 31st July 2024 until 21:29 (GMT+5:30) on 31st May 2025",
          },
          {
            id: 4,
            title: "AFFILIATE REFERRAL PROGRAM",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/referal.png",
            date: "Starts from 21:30 (GMT+5:30) on 1st June 2024",
          },
          {
            id: 5,
            title: "ALL NEW BAJI CAMPAIGN",
            image:
              "https://beit365.bet/assets/affiliate/assets/hero-banner/All-NewBaji.jpg",
            date: "Special ongoing campaign available now",
          },
        ],
      };

  return (
    <section className="w-full overflow-hidden bg-[#1C1400] py-8 sm:py-10 lg:py-14 text-white">
      <div className="mx-auto w-full max-w-[1540px] px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-[16px] sm:text-[22px] lg:text-[26px] font-extrabold uppercase leading-none tracking-[-0.03em] text-white">
              {content.heading}
            </h2>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef3b2d] text-[16px] font-bold text-white">
              {content.count}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              ref={prevRef}
              className="flex h-[36px] w-[36px] sm:h-[38px] sm:w-[38px] items-center justify-center rounded-[8px] border border-white/70 bg-transparent text-white transition hover:bg-white/5"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>

            <button
              ref={nextRef}
              className="flex h-[36px] w-[36px] sm:h-[38px] sm:w-[38px] items-center justify-center rounded-[8px] border border-white/70 bg-transparent text-white transition hover:bg-white/5"
              aria-label="Next slide"
            >
              <ChevronRight size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Slider wrapper যাতে header width এর ভেতরেই থাকে */}
        <div className="w-full overflow-hidden">
          <Swiper
            modules={[Navigation]}
            speed={700}
            loop={true}
            grabCursor={true}
            watchOverflow={true}
            slidesPerGroup={1}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 0,
              },
              640: {
                slidesPerView: 1,
                spaceBetween: 0,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 18,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="campaigns-swiper w-full"
          >
            {content.campaigns.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <div className="h-full w-full">
                  <div className="flex h-full min-h-[460px] sm:min-h-[460px] flex-col overflow-hidden rounded-[14px] bg-[#6d6153] p-[9px] sm:p-[10px] shadow-[0_8px_25px_rgba(0,0,0,0.18)]">
                    {/* Image */}
                    <div className="overflow-hidden rounded-[10px]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-[210px] sm:h-[220px] lg:h-[205px] w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col px-2 pb-2 pt-4 text-center">
                      <h3 className="min-h-[78px] sm:min-h-[78px] lg:min-h-[72px] text-[22px] sm:text-[22px] lg:text-[18px] font-extrabold uppercase leading-[1.3] tracking-[-0.02em] text-white">
                        {item.title}
                      </h3>

                      <p className="mt-5 min-h-[78px] sm:min-h-[80px] lg:min-h-[76px] text-[14px] sm:text-[16px] lg:text-[14px] font-semibold leading-[1.45] text-white">
                        {item.date}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-3 pt-8">
                        <button
                          type="button"
                          className="inline-flex min-h-[46px] items-center justify-center text-left text-[14px] sm:text-[15px] lg:text-[14px] font-extrabold uppercase text-white transition hover:text-white/80"
                        >
                          {content.moreDetails}
                        </button>

                        <NavLink
                          to="/register"
                          className="inline-flex h-[48px] min-w-[156px] sm:min-w-[165px] lg:min-w-[154px] items-center justify-center rounded-[12px] bg-[#168ceb] px-5 text-[14px] sm:text-[15px] lg:text-[14px] font-extrabold uppercase text-white transition hover:bg-[#0f7ed8]"
                        >
                          {content.signUp}
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Campaigns;
