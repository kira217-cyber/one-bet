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
    bn: "জ্যাকপট কস্ট স্ট্রাকচার",
    en: "JACKPOT COST STRUCTURE",
  },
  infoTitle: {
    bn: "জ্যাকপট কস্ট কী?",
    en: "What is Jackpot Cost?",
  },
  infoText: {
    bn: "জ্যাকপট কস্ট একটি বিশেষ সিস্টেম যেখানে অ্যাফিলিয়েটরা জ্যাকপট পুলের একটি ছোট অংশে অবদান রাখে, আর কোম্পানি পটের অধিকাংশ অংশ কভার করে।",
    en: "The Jackpot Cost is a unique system where affiliates contribute a small portion of the jackpot pool, while the company covers the majority of the pot.",
  },
  benefitsTitle: {
    bn: "অ্যাফিলিয়েটদের জন্য জ্যাকপট ফিচারের সুবিধা কী?",
    en: "What are the benefits of the Jackpot feature for affiliates?",
  },
  mainImage:
    "https://beit365.bet/assets/affiliate/assets/images/jackpotcostmain1927.jpg",
  cards: [],
};

const Jackpot = () => {
  const { isBangla } = useLanguage();

  const [jackpotData, setJackpotData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchJackpotContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-jackpot-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          const doc = data.data;

          setJackpotData({
            ...defaultData,
            ...doc,
            title: {
              ...defaultData.title,
              ...(doc.title || {}),
            },
            infoTitle: {
              ...defaultData.infoTitle,
              ...(doc.infoTitle || {}),
            },
            infoText: {
              ...defaultData.infoText,
              ...(doc.infoText || {}),
            },
            benefitsTitle: {
              ...defaultData.benefitsTitle,
              ...(doc.benefitsTitle || {}),
            },
            mainImage: doc.mainImage || defaultData.mainImage,
            cards: Array.isArray(doc.cards) ? doc.cards : [],
            isActive: doc.isActive !== false,
          });
        } else {
          setJackpotData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch jackpot content:", error);
        setJackpotData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJackpotContent();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const cards = (jackpotData.cards || [])
      .filter((card) => card?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((card, index) => ({
        id: card?._id || index,
        title: getText(card?.title, lang, ""),
        description: getText(card?.description, lang, ""),
        image: fileUrl(card?.image),
      }));

    return {
      title: getText(jackpotData.title, lang, defaultData.title[lang]),
      infoTitle: getText(
        jackpotData.infoTitle,
        lang,
        defaultData.infoTitle[lang],
      ),
      infoText: getText(jackpotData.infoText, lang, defaultData.infoText[lang]),
      benefitsTitle: getText(
        jackpotData.benefitsTitle,
        lang,
        defaultData.benefitsTitle[lang],
      ),
      mainImage: fileUrl(jackpotData.mainImage) || defaultData.mainImage,
      cards,
    };
  }, [jackpotData, isBangla]);

  if (loading) {
    return (
      <section className="w-full bg-[#1b1204] py-8 text-white sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-10 h-10 w-80 animate-pulse rounded-lg bg-white/10" />

          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_1.12fr] lg:gap-8">
            <div className="h-[260px] animate-pulse rounded-lg bg-white/10 sm:h-[360px]" />
            <div className="h-[260px] animate-pulse rounded-[18px] bg-white/10 sm:h-[360px]" />
          </div>

          <div className="mx-auto my-10 h-8 w-96 max-w-full animate-pulse rounded-lg bg-white/10" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[150px] animate-pulse rounded-[18px] bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (jackpotData?.isActive === false) {
    return null;
  }

  return (
    <section className="w-full bg-[#1b1204] py-8 text-white sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[24px] font-extrabold uppercase tracking-[-0.03em] text-white sm:text-[34px] lg:text-[30px]">
            {content.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_1.12fr] lg:gap-8">
          <div className="overflow-hidden rounded-[0px] sm:rounded-[12px] lg:rounded-[8px]">
            {content.mainImage ? (
              <img
                src={content.mainImage}
                alt="Jackpot main"
                className="h-[260px] w-full object-cover sm:h-[360px] lg:h-full"
              />
            ) : (
              <div className="flex h-[260px] w-full items-center justify-center bg-[#2a2115] text-white/60 sm:h-[360px] lg:h-full">
                {isBangla ? "কোনো ছবি নেই" : "No Image"}
              </div>
            )}
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

        <div className="py-8 text-center sm:py-10 lg:py-12">
          <h3 className="mx-auto max-w-[340px] text-[17px] font-extrabold leading-[1.45] text-white sm:max-w-none sm:text-[28px] lg:text-[18px]">
            {content.benefitsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {content.cards.map((card) => (
            <div
              key={card.id}
              className="group cursor-pointer rounded-[18px] bg-[#2a2115] p-3 transition-all duration-300 lg:hover:bg-[#6b6b6b] lg:hover:shadow-[0_0_18px_rgba(255,255,255,0.45),0_0_34px_rgba(255,255,255,0.18)]"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 overflow-hidden rounded-[8px] bg-black/20">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-[120px] w-[128px] object-cover sm:h-[96px] sm:w-[128px] lg:h-[96px] lg:w-[152px]"
                    />
                  ) : (
                    <div className="flex h-[120px] w-[128px] items-center justify-center text-xs text-white/60 sm:h-[96px] sm:w-[128px] lg:h-[96px] lg:w-[152px]">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex min-h-[120px] flex-1 flex-col justify-start">
                  <h4 className="text-[14px] font-bold leading-[1.3] text-white sm:text-[18px] lg:text-[14px]">
                    {card.title}
                  </h4>

                  <p className="mt-3 text-[11px] font-semibold leading-[1.7] text-white/95 sm:hidden">
                    {card.description}
                  </p>

                  <p className="mt-3 hidden text-[14px] font-semibold leading-[1.55] text-white/95 lg:block lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:max-h-[220px] lg:group-hover:opacity-100">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {!content.cards.length && (
            <div className="col-span-full rounded-[18px] bg-[#2a2115] p-6 text-center text-white/70">
              {isBangla ? "কোনো কার্ড পাওয়া যায়নি" : "No cards found"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Jackpot;
