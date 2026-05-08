import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const API_URL =
  import.meta.env.VITE_APP_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_REACT_APP_BACKEND_API2 ||
  "";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const getText = (obj, lang, fallback = "") => {
  if (!obj) return fallback;
  return obj?.[lang] || obj?.en || obj?.bn || fallback;
};

const defaultData = {
  isActive: true,
  title: {
    bn: "WHY US",
    en: "WHY US",
  },
  cardBackgroundImage:
    "https://beit365.bet/assets/affiliate/assets/bdt/icons/bg-icon.png",
  items: [
    {
      id: 1,
      title: { bn: "ফ্রি রেজিস্ট্রেশন", en: "Free to Register" },
      description: {
        bn: "আমাদের 24/7 কাস্টমার সাপোর্ট টিম সবসময় বিভিন্ন ভাষায় তোমার যেকোনো প্রশ্নে সহায়তা করতে প্রস্তুত। যেকোনো সময়, যেকোনো স্থান থেকে সহজে যোগাযোগ করো।",
        en: "Our 24/7 customer support team is always here to assist you with any inquiries in different languages. Reach us anytime, anywhere, with a great and smooth live chat experience.",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/images/freef709.png",
      order: 1,
      isActive: true,
    },
    {
      id: 2,
      title: { bn: "বিশ্বস্ত ও নিরাপদ", en: "Trusted & Secure" },
      description: {
        bn: "আমাদের সাথে তুমি নিশ্চিন্তে কাজ করতে পারো। তোমার গোপনীয়তা সবসময় আমাদের অগ্রাধিকার। উন্নত সিকিউরিটি সিস্টেম ও 128-bit encryption তোমার ডেটা ও লেনদেনকে সুরক্ষিত রাখে।",
        en: "With us, you can always play with no worries as your privacy is always our top priority. beit365.bet uses a top-notch security system together with a 128-bit encryption to ensure all your transactions as well as the privacy of your data are safe and secure.",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/images/trustedccf4.png",
      order: 2,
      isActive: true,
    },
    {
      id: 3,
      title: { bn: "স্থিতিশীল ও ন্যায্য", en: "Stability & Fair" },
      description: {
        bn: "আমরা সময়ে সময়ে আকর্ষণীয় বোনাস ও রিওয়ার্ডসহ প্রোমোশন চালু করি। নিয়মিত বোনাস ও বড় জয়ের সুযোগ beit365.bet-এর অন্যতম সুবিধা।",
        en: "We will launch promotions that come with exciting rewards & bonuses from time to time! Always getting extra bonuses and winning big is one of the biggest perks on beit365.bet!",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/images/stabilityde5c.png",
      order: 3,
      isActive: true,
    },
    {
      id: 4,
      title: { bn: "বিভিন্ন ধরনের পণ্য", en: "Variety of Products" },
      description: {
        bn: "আমরা হাজারো আকর্ষণীয় প্রোডাক্ট ও গেমিং অপশন অফার করি, যাতে ব্যবহারকারীরা সবসময় নতুন অভিজ্ঞতা পায়।",
        en: "We provide thousands of exciting products and gaming options so users can always enjoy fresh and engaging experiences.",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/images/variety31bf.png",
      order: 4,
      isActive: true,
    },
    {
      id: 5,
      title: { bn: "লোকাল সার্ভিস", en: "Local Service" },
      description: {
        bn: "আমাদের বর্তমান বাজার বাংলাদেশ, ভারত, পাকিস্তান এবং আরও কয়েকটি অঞ্চলে বিস্তৃত। লোকালাইজড সার্ভিস আমাদের শক্তিশালী দিক।",
        en: "Our current available markets are Bangladesh, India, Pakistan, and more. Localized service is one of our strongest advantages.",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/images/localservice55ad.png",
      order: 5,
      isActive: true,
    },
    {
      id: 6,
      title: { bn: "সাপ্তাহিক পেআউট", en: "Payout: Every Week" },
      description: {
        bn: "আমাদের beit365.bet অ্যাফিলিয়েট প্রোগ্রামের মাধ্যমে তুমি প্রতি সপ্তাহে দ্রুত পেআউট পাবে, যা তোমার আয়কে আরও সহজ ও নির্ভরযোগ্য করে তোলে।",
        en: "Get paid faster with our beit365.bet Affiliate Program! Enjoy weekly payouts that make your earnings more reliable and convenient.",
      },
      icon: "https://beit365.bet/assets/affiliate/assets/images/clw09myg840gb07ztbdlpvss583bb.png",
      order: 6,
      isActive: true,
    },
  ],
};

const WhyUs = () => {
  const { isBangla } = useLanguage();

  const [whyData, setWhyData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchWhyUsContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-why-us-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          const doc = data.data;

          setWhyData({
            ...defaultData,
            ...doc,
            title: {
              ...defaultData.title,
              ...(doc.title || {}),
            },
            cardBackgroundImage:
              doc.cardBackgroundImage || defaultData.cardBackgroundImage,
            items: Array.isArray(doc.items) ? doc.items : defaultData.items,
            isActive: doc.isActive !== false,
          });
        } else {
          setWhyData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch Why Us content:", error);
        setWhyData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWhyUsContent();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const items = (whyData.items || [])
      .filter((item) => item?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item, index) => ({
        id: item?._id || item?.id || index,
        title: getText(item?.title, lang, ""),
        description: getText(item?.description, lang, ""),
        icon: fileUrl(item?.icon),
      }));

    return {
      title: getText(whyData.title, lang, defaultData.title[lang]),
      cardBackgroundImage:
        fileUrl(whyData.cardBackgroundImage) || defaultData.cardBackgroundImage,
      items,
    };
  }, [whyData, isBangla]);

  if (loading) {
    return (
      <section className="w-full bg-[#161616] py-8 text-white sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-10 h-10 w-48 animate-pulse rounded-lg bg-white/10" />

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-9">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="min-h-[260px] animate-pulse rounded-[16px] bg-white/10 sm:min-h-[320px] sm:rounded-[18px] lg:min-h-[440px] lg:rounded-[20px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (whyData?.isActive === false) {
    return null;
  }

  return (
    <section className="w-full bg-[#161616] py-8 text-white sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[28px] font-medium uppercase text-white sm:text-[34px] lg:text-[32px]">
            {content.title}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-9">
          {content.items.map((item) => (
            <div
              key={item.id}
              className="relative min-h-[260px] overflow-hidden rounded-[16px] px-3 py-5 sm:min-h-[320px] sm:rounded-[18px] sm:px-5 sm:py-7 lg:min-h-[440px] lg:rounded-[20px] lg:px-8 lg:py-10"
              style={{
                backgroundImage: `url('${content.cardBackgroundImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex h-full flex-col items-center text-center">
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/10 text-[10px] text-white/50 sm:h-[54px] sm:w-[54px] lg:h-[68px] lg:w-[68px]">
                    No Icon
                  </div>
                )}

                <h3 className="mt-5 text-[16px] font-bold leading-[1.2] text-white sm:text-[22px] lg:text-[18px]">
                  {item.title}
                </h3>

                <p className="mt-4 max-w-[290px] text-[12px] font-medium leading-[1.7] text-white/60 sm:text-[15px] lg:text-[14px]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {!content.items.length && (
            <div className="col-span-2 rounded-[18px] bg-white/10 p-8 text-center text-white/70 lg:col-span-3">
              {isBangla ? "কোনো আইটেম পাওয়া যায়নি" : "No items found"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
