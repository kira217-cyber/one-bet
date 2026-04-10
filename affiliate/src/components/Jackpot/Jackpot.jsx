import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const Jackpot = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "জ্যাকপট কস্ট স্ট্রাকচার",
        infoTitle: "জ্যাকপট কস্ট কী?",
        infoText:
          "জ্যাকপট কস্ট একটি বিশেষ সিস্টেম যেখানে অ্যাফিলিয়েটরা জ্যাকপট পুলের একটি ছোট অংশে অবদান রাখে, আর কোম্পানি পটের অধিকাংশ অংশ কভার করে। এই যৌথ প্রচেষ্টা এমন একটি জয়-জয় পরিস্থিতি তৈরি করে যেখানে একজন প্লেয়ার জ্যাকপট জিতলে শুধু তার জয়ই হয় না, এটি তোমারও সুবিধা। উদাহরণস্বরূপ, ধরো তোমার প্লেয়ার ৳১০,০০,০০০ জ্যাকপট জিতেছে। এতে শুধু খেলোয়াড়ই বিজয়ী হয় না, বরং তাদের প্ল্যাটফর্মের প্রতি আনুগত্যও বাড়ে, যার ফলে টেকসই সম্পৃক্ততা এবং তোমার জন্য ধারাবাহিক লাভ তৈরি হয়। পাশাপাশি, তুমি একটি শক্তিশালী এবং বিশ্বস্ত প্লেয়ার বেস ধরে রাখতে পারবে।",
        benefitsTitle: "অ্যাফিলিয়েটদের জন্য জ্যাকপট ফিচারের সুবিধা কী?",
        cards: [
          {
            id: 1,
            title: "প্লেয়ার ধরে রাখা বৃদ্ধি ও অ্যাফিলিয়েট আয় বৃদ্ধি",
            description:
              "যদি কোনো প্লেয়ার জ্যাকপট জিতে, তাহলে সে খেলা চালিয়ে যাওয়ার সম্ভাবনা বেশি থাকে, ফলে তুমি তাদের বাজির মাধ্যমে আরও কমিশন আয়ের সুযোগ পাবে।",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard157b6.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard1.webp&w=384&q=75",
          },
          {
            id: 2,
            title: "বড় জ্যাকপট, বড় পেআউট",
            description:
              "বড় জ্যাকপট আরও বেশি প্লেয়ারকে আকর্ষণ করে, ফলে তোমার লিংকের মাধ্যমে সাইন-আপের সম্ভাবনা বাড়ে এবং কমিশনও বাড়ে।",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard27c88.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard2.webp&w=384&q=75",
          },
          {
            id: 3,
            title: "রেক্রুটমেন্ট আরও শক্তিশালী",
            description:
              "আকর্ষণীয় জ্যাকপট ফিচার নতুন প্লেয়ার রিক্রুট করতে সাহায্য করে এবং তোমার অ্যাফিলিয়েট প্রচারকে আরও কার্যকর করে তোলে।",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard33fc7.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard3.webp&w=384&q=75",
          },
          {
            id: 4,
            title: "টেকসই আয়ের বৃদ্ধি",
            description:
              "যখন প্লেয়াররা নিয়মিত সক্রিয় থাকে, তখন দীর্ঘমেয়াদে তোমার আয় স্থিতিশীলভাবে বাড়তে থাকে।",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard4f1c0.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard4.webp&w=384&q=75",
          },
          {
            id: 5,
            title: "সুষ্ঠু খেলা, সমান পুরস্কার",
            description:
              "এই সিস্টেম প্লেয়ারদের জন্য আরও ন্যায্য এবং আকর্ষণীয় অভিজ্ঞতা তৈরি করে, যা তাদের দীর্ঘমেয়াদি সম্পৃক্ততা বাড়ায়।",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard5811c.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard5.webp&w=384&q=75",
          },
          {
            id: 6,
            title: "সবার থেকে আলাদা হয়ে উঠুন",
            description:
              "জ্যাকপট সুবিধা তোমার অফারকে প্রতিযোগীদের থেকে আলাদা করে তোলে এবং প্লেয়ারদের কাছে আরও শক্তিশালী ইমপ্রেশন তৈরি করে।",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard68b25.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard6.webp&w=384&q=75",
          },
        ],
      }
    : {
        title: "JACKPOT COST STRUCTURE",
        infoTitle: "What is Jackpot Cost?",
        infoText:
          "The Jackpot Cost is a unique system where affiliates contribute a small portion of the jackpot pool, while the company covers the majority of the pot. This collaborative effort creates a win-win situation: when a player hits the jackpot, it’s not just their victory—it’s yours too! For instance, imagine if your player won a ৳10,00,000 jackpot. Not only does that payout make them a winner, but it also increases their loyalty to our platform, leading to sustained engagement and continuous profit for you. Plus, you get to maintain a strong and loyal player base.",
        benefitsTitle:
          "What are the benefits of the Jackpot feature for affiliates?",
        cards: [
          {
            id: 1,
            title: "Increased Player Retention & Affiliate Earnings",
            description:
              "If a player wins a jackpot, they're more likely to continue playing, providing you with further opportunities to earn commissions as they wager their winnings.",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard157b6.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard1.webp&w=384&q=75",
          },
          {
            id: 2,
            title: "Bigger Jackpots, Bigger Payouts",
            description:
              "Larger jackpots will attract more players, increasing the chances of sign-ups through your links, and ultimately, boosting your commissions.",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard27c88.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard2.webp&w=384&q=75",
          },
          {
            id: 3,
            title: "Enhanced Recruitment",
            description:
              "A stronger jackpot feature makes your promotional offer more appealing and helps bring in more new players through affiliate recruitment.",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard33fc7.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard3.webp&w=384&q=75",
          },
          {
            id: 4,
            title: "Sustainable Earnings Growth",
            description:
              "As players stay active for longer, your earning opportunities become more consistent and can grow steadily over time.",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard4f1c0.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard4.webp&w=384&q=75",
          },
          {
            id: 5,
            title: "Fair Play, Equal Rewards",
            description:
              "A balanced jackpot model helps create a fairer experience for players, supporting trust and stronger long-term engagement.",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard5811c.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard5.webp&w=384&q=75",
          },
          {
            id: 6,
            title: "Stand Out from the Crowd",
            description:
              "A jackpot feature helps differentiate your offer from competitors and makes your affiliate promotions more memorable.",
            image:
              "https://beit365.bet/assets/affiliate/assets/images/jackpotcostcard68b25.jpg?url=%2Fassets%2Fjackpotcost%2Fjackpotcostcard6.webp&w=384&q=75",
          },
        ],
      };

  return (
    <section className="w-full bg-[#1b1204] py-8 sm:py-10 lg:py-14 text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {/* Title */}
        <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
          <h2 className="text-[24px] sm:text-[34px] lg:text-[30px] font-extrabold uppercase tracking-[-0.03em] text-white">
            {content.title}
          </h2>
        </div>

        {/* Top section */}
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_1.12fr] lg:gap-8">
          <div className="overflow-hidden rounded-[0px] sm:rounded-[12px] lg:rounded-[8px]">
            <img
              src="https://beit365.bet/assets/affiliate/assets/images/jackpotcostmain1927.jpg"
              alt="Jackpot main"
              className="h-[260px] w-full object-cover sm:h-[360px] lg:h-full"
            />
          </div>

          <div className="rounded-[0px] bg-[#2a2115] px-5 py-6 sm:rounded-[18px] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
            <h3 className="text-[24px] font-extrabold text-white sm:text-[28px] lg:text-[18px]">
              {content.infoTitle}
            </h3>

            <p className="mt-5 text-[16px] font-semibold leading-[1.65] text-white sm:text-[18px] lg:text-[14px]">
              {content.infoText}
            </p>
          </div>
        </div>

        {/* Benefits title */}
        <div className="py-8 text-center sm:py-10 lg:py-12">
          <h3 className="mx-auto max-w-[340px] text-[17px] font-extrabold leading-[1.45] text-white sm:max-w-none sm:text-[28px] lg:text-[18px]">
            {content.benefitsTitle}
          </h3>
        </div>

        {/* Benefit cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {content.cards.map((card) => (
            <div
              key={card.id}
              className="group cursor-pointer rounded-[18px] bg-[#2a2115] p-3 transition-all duration-300 lg:hover:bg-[#6b6b6b] lg:hover:shadow-[0_0_18px_rgba(255,255,255,0.45),0_0_34px_rgba(255,255,255,0.18)]"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 overflow-hidden rounded-[8px]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-[120px] w-[128px] object-cover sm:h-[96px] sm:w-[128px] lg:h-[96px] lg:w-[152px]"
                  />
                </div>

                <div className="flex min-h-[120px] flex-1 flex-col justify-start">
                  <h4 className="text-[14px] font-bold leading-[1.3] text-white sm:text-[18px] lg:text-[14px]">
                    {card.title}
                  </h4>

                  {/* Mobile/Tablet description visible */}
                  <p className="mt-3 text-[11px] font-semibold leading-[1.7] text-white/95 sm:hidden">
                    {card.description}
                  </p>

                  {/* Desktop description on hover */}
                  <p className="mt-3 hidden text-[14px] font-semibold leading-[1.55] text-white/95 lg:block lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:max-h-[220px] lg:group-hover:opacity-100">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Jackpot;
