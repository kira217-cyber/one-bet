import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const AboutUs = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "ABOUT US",
        subtitle:
          "beit365.bet এশিয়ার অন্যতম নির্ভরযোগ্য অনলাইন গেমিং ব্র্যান্ড। আমরা নিরাপদ, ন্যায্য এবং মানসম্মত গেমিং অভিজ্ঞতা দিতে গুরুত্ব দিই।",
        items: [
          {
            id: 1,
            title: "লাইভ ক্যাসিনো",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/live-casino.webp",
          },
          {
            id: 2,
            title: "স্পোর্টস এক্সচেঞ্জ",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sports-exchange.webp",
          },
          {
            id: 3,
            title: "স্লটস",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/slots.webp",
          },
          {
            id: 4,
            title: "স্পোর্টসবুক",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sportsbook.webp",
          },
          {
            id: 5,
            title: "ক্র্যাশ",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/crash.webp",
          },
          {
            id: 6,
            title: "এবং আরো",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/etc.webp",
          },
        ],
      }
    : {
        title: "ABOUT US",
        subtitle:
          "beit365.bet is the most reliable online gambling brand in Asia. We emphasize on providing a fair and safe gaming experience.",
        items: [
          {
            id: 1,
            title: "Live Casino",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/live-casino.webp",
          },
          {
            id: 2,
            title: "Sports Exchange",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sports-exchange.webp",
          },
          {
            id: 3,
            title: "Slots",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/slots.webp",
          },
          {
            id: 4,
            title: "Sportsbook",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sportsbook.webp",
          },
          {
            id: 5,
            title: "Crash",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/crash.webp",
          },
          {
            id: 6,
            title: "and any more",
            image:
              "https://beit365.bet/assets/affiliate/assets/aboutus/inr/etc.webp",
          },
        ],
      };

  return (
    <section className="w-full bg-[#0D0D0D] py-8 sm:py-10 lg:py-14 text-white">
      <div className="mx-auto w-full max-w-[1500px] px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-[980px] text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[28px] sm:text-[34px] lg:text-[30px] font-medium uppercase text-white">
            {content.title}
          </h2>

          <p className="mx-auto mt-4 max-w-[880px] text-[16px] sm:text-[21px] lg:text-[18px] font-medium leading-[1.6] text-white/55">
            {content.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-5">
          {content.items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-[12px] lg:rounded-[18px] min-h-[250px] lg:min-h-[225px] cursor-pointer"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.18)_30%,rgba(0,0,0,0.58)_100%)]" />

              {/* Content */}
              <div className="relative z-10 flex h-full items-end p-3 sm:p-5 lg:p-7">
                <h3 className="text-[16px] sm:text-[28px] lg:text-[24px] font-bold text-white leading-[1.15]">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
