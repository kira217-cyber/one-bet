import React, { useMemo, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const FAQ = () => {
  const { isBangla } = useLanguage();

  const faqContent = useMemo(() => {
    if (isBangla) {
      return {
        tabs: [
          {
            id: "general",
            label: "General",
            items: [
              {
                question: "আমরা কারা?",
                answer:
                  "beit365.bet ২০২০ সালে প্রতিষ্ঠিত একটি শীর্ষমানের অনলাইন গেমিং ও অ্যাফিলিয়েট প্ল্যাটফর্ম। আমরা ক্রিকেট, ফুটবল, টেনিস, লাইভ ক্যাসিনো, টেবিল গেমস এবং স্লটভিত্তিক প্রচারণা ও পার্টনারশিপ সিস্টেম নিয়ে কাজ করি।",
              },
              {
                question: "beit365.bet অ্যাফিলিয়েট প্রোগ্রাম কী?",
                answer:
                  "এটি এমন একটি প্রোগ্রাম যেখানে তুমি তোমার রেফারেল লিংক ব্যবহার করে নতুন ব্যবহারকারী আনতে পারবে এবং তাদের কার্যক্রমের উপর কমিশন উপার্জন করতে পারবে।",
              },
              {
                question: "আমি কি আপনাদের বিশ্বাস করতে পারি?",
                answer:
                  "আমরা স্বচ্ছ ট্র্যাকিং, নির্ভরযোগ্য কমিশন স্ট্রাকচার, রিপোর্টিং সিস্টেম এবং দ্রুত সাপোর্ট দেওয়ার চেষ্টা করি যাতে পার্টনাররা নিরাপদে কাজ করতে পারেন।",
              },
              {
                question: "অ্যাফিলিয়েট প্রোগ্রামের সুবিধা কী?",
                answer:
                  "উচ্চ কমিশন, রিয়েল-টাইম রিপোর্ট, মার্কেটিং ব্যানার, নিয়মিত ক্যাম্পেইন, এবং ডেডিকেটেড সাপোর্ট—এই সবকিছুই আমাদের প্রোগ্রামের মূল সুবিধা।",
              },
            ],
          },
          {
            id: "account",
            label: "Account",
            items: [
              {
                question: "আমি কীভাবে অ্যাফিলিয়েট হব?",
                answer:
                  "রেজিস্ট্রেশন পেজে গিয়ে তোমার তথ্য দিয়ে সাইন আপ করলেই অ্যাফিলিয়েট অ্যাকাউন্ট খোলা যাবে। অ্যাকাউন্ট ভেরিফিকেশনের পর তুমি তোমার রেফারেল টুলস ব্যবহার করতে পারবে।",
              },
              {
                question: "প্রোগ্রামে যোগ দিতে কি ফ্রি?",
                answer:
                  "হ্যাঁ, আমাদের অ্যাফিলিয়েট প্রোগ্রামে যোগ দেওয়া সম্পূর্ণ ফ্রি। কোনো সাইন আপ ফি নেই।",
              },
              {
                question: "আমার অ্যাকাউন্ট ভেরিফাই করতে কী লাগবে?",
                answer:
                  "সাধারণত তোমার নাম, ইমেইল, ফোন নম্বর এবং কিছু ক্ষেত্রে পরিচয় যাচাইয়ের জন্য ডকুমেন্ট প্রয়োজন হতে পারে।",
              },
              {
                question: "আমি কি একাধিক অ্যাকাউন্ট খুলতে পারি?",
                answer:
                  "না, সাধারণত একজন ব্যবহারকারীর জন্য একটি অ্যাকাউন্ট অনুমোদিত। একাধিক অ্যাকাউন্ট থাকলে তা নীতিমালার বিরোধী হতে পারে।",
              },
            ],
          },
          {
            id: "payment",
            label: "Payment",
            items: [
              {
                question: "পেমেন্ট কীভাবে কাজ করে?",
                answer:
                  "তোমার রেফারকৃত ব্যবহারকারীদের কার্যক্রমের ভিত্তিতে কমিশন গণনা হয় এবং নির্ধারিত পেমেন্ট সাইকেল অনুযায়ী তা তোমার অ্যাকাউন্টে যোগ হয়।",
              },
              {
                question: "কমিশন কবে পাব?",
                answer:
                  "পেমেন্ট সাধারণত সাপ্তাহিক বা মাসিক সাইকেলে প্রসেস করা হয়, তবে সঠিক সময়সীমা তোমার চুক্তি ও অ্যাকাউন্ট সেটিংসের উপর নির্ভর করে।",
              },
              {
                question: "কোন কোন পেমেন্ট মেথড সাপোর্ট করে?",
                answer:
                  "ব্যাংক ট্রান্সফার, ই-ওয়ালেট এবং কিছু ক্ষেত্রে ক্রিপ্টো বা লোকাল পেমেন্ট মেথড সাপোর্ট করা হতে পারে।",
              },
              {
                question: "ন্যূনতম উইথড্র সীমা কত?",
                answer:
                  "ন্যূনতম উত্তোলনের পরিমাণ অ্যাকাউন্ট টাইপ বা পেমেন্ট মেথড অনুযায়ী ভিন্ন হতে পারে। সঠিক তথ্য ড্যাশবোর্ডে দেখা যাবে।",
              },
            ],
          },
          {
            id: "jackpot",
            label: "Jackpot Cost",
            items: [
              {
                question: "জ্যাকপট কস্ট বলতে কী বোঝায়?",
                answer:
                  "জ্যাকপট কস্ট হলো বিশেষ প্রোমোশন বা জ্যাকপটভিত্তিক অফারের জন্য নির্ধারিত খরচ, যা নির্দিষ্ট ক্যাম্পেইনের হিসাবের অংশ হিসেবে গণনা করা হয়।",
              },
              {
                question: "জ্যাকপট কস্ট কি কমিশনে প্রভাব ফেলে?",
                answer:
                  "হ্যাঁ, কিছু ক্ষেত্রে জ্যাকপট কস্ট নেট রেভিনিউ বা কমিশন ক্যালকুলেশনের অংশ হিসেবে বিবেচিত হতে পারে।",
              },
              {
                question: "জ্যাকপট কস্ট কোথায় দেখতে পারব?",
                answer:
                  "তোমার অ্যাফিলিয়েট ড্যাশবোর্ডের রিপোর্ট বা ফিন্যান্স সেকশনে জ্যাকপট-সম্পর্কিত তথ্য দেখতে পারবে।",
              },
              {
                question: "সব ক্যাম্পেইনে কি জ্যাকপট কস্ট থাকে?",
                answer:
                  "না, সব ক্যাম্পেইনে জ্যাকপট কস্ট থাকে না। এটি নির্ভর করে নির্দিষ্ট অফার, গেম এবং প্রোমোশনের ধরন অনুযায়ী।",
              },
            ],
          },
        ],
      };
    }

    return {
      tabs: [
        {
          id: "general",
          label: "General",
          items: [
            {
              question: "Who are we?",
              answer:
                "Founded in 2020, beit365.bet is a top-tier online gaming and affiliate platform in Asia. We focus on betting exchange, live casino, table games, slots, and strong affiliate growth opportunities.",
            },
            {
              question: "What is the beit365.bet Affiliate Program?",
              answer:
                "The beit365.bet Affiliate Program allows partners to earn commission by referring new users through their unique tracking links and promotional materials.",
            },
            {
              question: "Can I trust you?",
              answer:
                "We aim to provide transparent reporting, dependable tracking, fair commission structures, and responsive support so our partners can work with confidence.",
            },
            {
              question:
                "What is the advantage of the beit365.bet Affiliate Program?",
              answer:
                "The program offers competitive commission rates, campaign materials, performance tracking, dedicated support, and frequent promotional opportunities.",
            },
          ],
        },
        {
          id: "account",
          label: "Account",
          items: [
            {
              question: "How do I become an affiliate?",
              answer:
                "You can become an affiliate by signing up through the registration page, submitting the required information, and completing account approval if needed.",
            },
            {
              question: "Is the program free to join?",
              answer:
                "Yes, joining the affiliate program is completely free. There are no registration charges for becoming a partner.",
            },
            {
              question: "What do I need to verify my account?",
              answer:
                "You may need to provide your name, email, phone number, and sometimes identity documents depending on the account review process.",
            },
            {
              question: "Can I create multiple accounts?",
              answer:
                "In most cases, only one account per partner is allowed. Multiple accounts may violate the platform policy.",
            },
          ],
        },
        {
          id: "payment",
          label: "Payment",
          items: [
            {
              question: "How does payment work?",
              answer:
                "Commission is calculated based on the activity of your referred users and added to your account according to the payment cycle defined by the program.",
            },
            {
              question: "When will I receive my commission?",
              answer:
                "Payments are usually processed on a weekly or monthly schedule, depending on the agreement and your account setup.",
            },
            {
              question: "Which payment methods are supported?",
              answer:
                "Supported payment methods may include bank transfer, e-wallets, and in some cases local payment options or other approved channels.",
            },
            {
              question: "What is the minimum withdrawal limit?",
              answer:
                "The minimum withdrawal amount can vary depending on the payment method or account type. You can check the exact amount in your dashboard.",
            },
          ],
        },
        {
          id: "jackpot",
          label: "Jackpot Cost",
          items: [
            {
              question: "What does jackpot cost mean?",
              answer:
                "Jackpot cost refers to the cost associated with special jackpot promotions or prize pools that may be included in campaign or revenue calculations.",
            },
            {
              question: "Does jackpot cost affect commission?",
              answer:
                "Yes, in some cases jackpot cost may be factored into net revenue calculations, which can influence commission results.",
            },
            {
              question: "Where can I see jackpot cost details?",
              answer:
                "You can usually find jackpot-related financial details in the reporting or finance section of your affiliate dashboard.",
            },
            {
              question: "Does every campaign include jackpot cost?",
              answer:
                "No, jackpot cost does not apply to every campaign. It depends on the promotion structure and the type of offer involved.",
            },
          ],
        },
      ],
    };
  }, [isBangla]);

  const [activeTab, setActiveTab] = useState("general");
  const [openItem, setOpenItem] = useState("general-0");

  const activeTabData =
    faqContent.tabs.find((tab) => tab.id === activeTab) || faqContent.tabs[0];

  const handleToggle = (key) => {
    setOpenItem((prev) => (prev === key ? null : key));
  };

  return (
    <section className="w-full bg-[#1b1204] py-8 lg:py-16 text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-10">
        {/* Tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 sm:mb-10 lg:mb-12">
          {faqContent.tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setOpenItem(`${tab.id}-0`);
                }}
                className={`inline-flex h-[40px] items-center justify-center rounded-[8px] border px-4 sm:px-5 text-[13px] sm:text-[15px] font-semibold transition ${
                  isActive
                    ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                    : "border-[#475569] bg-transparent text-[#cbd5e1] hover:border-[#64748b] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-5">
          {activeTabData.items.map((item, index) => {
            const itemKey = `${activeTab}-${index}`;
            const isOpen = openItem === itemKey;

            return (
              <div
                key={itemKey}
                className="overflow-hidden rounded-[14px] border border-[#00d0c7] bg-[#011926]"
              >
                <button
                  onClick={() => handleToggle(itemKey)}
                  className="flex w-full items-start justify-between gap-4 px-4 py-5 text-left sm:px-5 sm:py-5"
                >
                  <span className="pr-2 text-[20px] sm:text-[24px] lg:text-[18px] font-semibold leading-[1.45] text-[#c7d2fe]">
                    {item.question}
                  </span>

                  <span className="mt-0.5 shrink-0 text-[#c7d2fe] transition-transform duration-300">
                    {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5">
                      <p className="max-w-[95%] text-[16px] sm:text-[17px] lg:text-[14px] leading-[1.7] text-[#cbd5e1]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
