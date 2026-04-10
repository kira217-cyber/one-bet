import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const WhyUs = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "WHY US",
        items: [
          {
            id: 1,
            title: "ফ্রি রেজিস্ট্রেশন",
            description:
              "আমাদের 24/7 কাস্টমার সাপোর্ট টিম সবসময় বিভিন্ন ভাষায় তোমার যেকোনো প্রশ্নে সহায়তা করতে প্রস্তুত। যেকোনো সময়, যেকোনো স্থান থেকে সহজে যোগাযোগ করো।",
            icon: "https://beit365.bet/assets/affiliate/assets/images/freef709.png",
          },
          {
            id: 2,
            title: "বিশ্বস্ত ও নিরাপদ",
            description:
              "আমাদের সাথে তুমি নিশ্চিন্তে কাজ করতে পারো। তোমার গোপনীয়তা সবসময় আমাদের অগ্রাধিকার। উন্নত সিকিউরিটি সিস্টেম ও 128-bit encryption তোমার ডেটা ও লেনদেনকে সুরক্ষিত রাখে।",
            icon: "https://beit365.bet/assets/affiliate/assets/images/trustedccf4.png",
          },
          {
            id: 3,
            title: "স্থিতিশীল ও ন্যায্য",
            description:
              "আমরা সময়ে সময়ে আকর্ষণীয় বোনাস ও রিওয়ার্ডসহ প্রোমোশন চালু করি। নিয়মিত বোনাস ও বড় জয়ের সুযোগ beit365.bet-এর অন্যতম সুবিধা।",
            icon: "https://beit365.bet/assets/affiliate/assets/images/stabilityde5c.png",
          },
          {
            id: 4,
            title: "বিভিন্ন ধরনের পণ্য",
            description:
              "আমরা হাজারো আকর্ষণীয় প্রোডাক্ট ও গেমিং অপশন অফার করি, যাতে ব্যবহারকারীরা সবসময় নতুন অভিজ্ঞতা পায়।",
            icon: "https://beit365.bet/assets/affiliate/assets/images/variety31bf.png",
          },
          {
            id: 5,
            title: "লোকাল সার্ভিস",
            description:
              "আমাদের বর্তমান বাজার বাংলাদেশ, ভারত, পাকিস্তান এবং আরও কয়েকটি অঞ্চলে বিস্তৃত। লোকালাইজড সার্ভিস আমাদের শক্তিশালী দিক।",
            icon: "https://beit365.bet/assets/affiliate/assets/images/localservice55ad.png",
          },
          {
            id: 6,
            title: "সাপ্তাহিক পেআউট",
            description:
              "আমাদের beit365.bet অ্যাফিলিয়েট প্রোগ্রামের মাধ্যমে তুমি প্রতি সপ্তাহে দ্রুত পেআউট পাবে, যা তোমার আয়কে আরও সহজ ও নির্ভরযোগ্য করে তোলে।",
            icon: "https://beit365.bet/assets/affiliate/assets/images/clw09myg840gb07ztbdlpvss583bb.png",
          },
        ],
      }
    : {
        title: "WHY US",
        items: [
          {
            id: 1,
            title: "Free to Register",
            description:
              "Our 24/7 customer support team is always here to assist you with any inquiries in different languages. Reach us anytime, anywhere, with a great and smooth live chat experience.",
            icon: "https://beit365.bet/assets/affiliate/assets/images/freef709.png",
          },
          {
            id: 2,
            title: "Trusted & Secure",
            description:
              "With us, you can always play with no worries as your privacy is always our top priority. beit365.bet uses a top-notch security system together with a 128-bit encryption to ensure all your transactions as well as the privacy of your data are safe and secure.",
            icon: "https://beit365.bet/assets/affiliate/assets/images/trustedccf4.png",
          },
          {
            id: 3,
            title: "Stability & Fair",
            description:
              "We will launch promotions that come with exciting rewards & bonuses from time to time! Always getting extra bonuses and winning big is one of the biggest perks on beit365.bet!",
            icon: "https://beit365.bet/assets/affiliate/assets/images/stabilityde5c.png",
          },
          {
            id: 4,
            title: "Variety of Products",
            description:
              "We provide thousands of exciting products and gaming options so users can always enjoy fresh and engaging experiences.",
            icon: "https://beit365.bet/assets/affiliate/assets/images/variety31bf.png",
          },
          {
            id: 5,
            title: "Local Service",
            description:
              "Our current available markets are Bangladesh, India, Pakistan, and more. Localized service is one of our strongest advantages.",
            icon: "https://beit365.bet/assets/affiliate/assets/images/localservice55ad.png",
          },
          {
            id: 6,
            title: "Payout: Every Week",
            description:
              "Get paid faster with our beit365.bet Affiliate Program! Enjoy weekly payouts that make your earnings more reliable and convenient.",
            icon: "https://beit365.bet/assets/affiliate/assets/images/clw09myg840gb07ztbdlpvss583bb.png",
          },
        ],
      };

  return (
    <section className="w-full bg-[#161616] py-8 sm:py-10 lg:py-14 text-white">
      <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-10">
        {/* Title */}
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[28px] sm:text-[34px] lg:text-[32px] font-medium uppercase text-white">
            {content.title}
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-9">
          {content.items.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-[16px] sm:rounded-[18px] lg:rounded-[20px] min-h-[260px] sm:min-h-[320px] lg:min-h-[440px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-10"
              style={{
                backgroundImage:
                  "url('https://beit365.bet/assets/affiliate/assets/bdt/icons/bg-icon.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex h-full flex-col items-center text-center">
                {/* Icon */}
                <img
                  src={item.icon}
                  alt={item.title}
                  className="h-[42px] w-[42px] sm:h-[54px] sm:w-[54px] lg:h-[68px] lg:w-[68px] object-contain"
                />

                {/* Title */}
                <h3 className="mt-5 text-[16px] sm:text-[22px] lg:text-[18px] font-bold leading-[1.2] text-white">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-4 text-[12px] sm:text-[15px] lg:text-[14px] font-medium leading-[1.7] text-white/60 max-w-[290px]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
