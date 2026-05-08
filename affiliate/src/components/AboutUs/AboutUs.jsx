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
    bn: "ABOUT US",
    en: "ABOUT US",
  },
  subtitle: {
    bn: "beit365.bet এশিয়ার অন্যতম নির্ভরযোগ্য অনলাইন গেমিং ব্র্যান্ড। আমরা নিরাপদ, ন্যায্য এবং মানসম্মত গেমিং অভিজ্ঞতা দিতে গুরুত্ব দিই।",
    en: "beit365.bet is the most reliable online gambling brand in Asia. We emphasize on providing a fair and safe gaming experience.",
  },
  items: [
    {
      id: 1,
      title: { bn: "লাইভ ক্যাসিনো", en: "Live Casino" },
      image:
        "https://beit365.bet/assets/affiliate/assets/aboutus/inr/live-casino.webp",
      order: 1,
      isActive: true,
    },
    {
      id: 2,
      title: { bn: "স্পোর্টস এক্সচেঞ্জ", en: "Sports Exchange" },
      image:
        "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sports-exchange.webp",
      order: 2,
      isActive: true,
    },
    {
      id: 3,
      title: { bn: "স্লটস", en: "Slots" },
      image:
        "https://beit365.bet/assets/affiliate/assets/aboutus/inr/slots.webp",
      order: 3,
      isActive: true,
    },
    {
      id: 4,
      title: { bn: "স্পোর্টসবুক", en: "Sportsbook" },
      image:
        "https://beit365.bet/assets/affiliate/assets/aboutus/inr/sportsbook.webp",
      order: 4,
      isActive: true,
    },
    {
      id: 5,
      title: { bn: "ক্র্যাশ", en: "Crash" },
      image:
        "https://beit365.bet/assets/affiliate/assets/aboutus/inr/crash.webp",
      order: 5,
      isActive: true,
    },
    {
      id: 6,
      title: { bn: "এবং আরো", en: "and any more" },
      image: "https://beit365.bet/assets/affiliate/assets/aboutus/inr/etc.webp",
      order: 6,
      isActive: true,
    },
  ],
};

const AboutUs = () => {
  const { isBangla } = useLanguage();

  const [aboutData, setAboutData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAboutContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-about-us-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          const doc = data.data;

          setAboutData({
            ...defaultData,
            ...doc,
            title: {
              ...defaultData.title,
              ...(doc.title || {}),
            },
            subtitle: {
              ...defaultData.subtitle,
              ...(doc.subtitle || {}),
            },
            items: Array.isArray(doc.items) ? doc.items : defaultData.items,
            isActive: doc.isActive !== false,
          });
        } else {
          setAboutData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch About Us content:", error);
        setAboutData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAboutContent();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const items = (aboutData.items || [])
      .filter((item) => item?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item, index) => ({
        id: item?._id || item?.id || index,
        title: getText(item?.title, lang, ""),
        image: fileUrl(item?.image),
      }));

    return {
      title: getText(aboutData.title, lang, defaultData.title[lang]),
      subtitle: getText(aboutData.subtitle, lang, defaultData.subtitle[lang]),
      items,
    };
  }, [aboutData, isBangla]);

  if (loading) {
    return (
      <section className="w-full bg-[#0D0D0D] py-8 text-white sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1500px] px-6 lg:px-10">
          <div className="mx-auto mb-10 max-w-[980px] text-center">
            <div className="mx-auto h-10 w-60 animate-pulse rounded-lg bg-white/10" />
            <div className="mx-auto mt-4 h-20 max-w-[880px] animate-pulse rounded-lg bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="min-h-[250px] animate-pulse rounded-[12px] bg-white/10 lg:min-h-[225px] lg:rounded-[18px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (aboutData?.isActive === false) {
    return null;
  }

  return (
    <section className="w-full bg-[#0D0D0D] py-8 text-white sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1500px] px-6 lg:px-10">
        <div className="mx-auto mb-8 max-w-[980px] text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[28px] font-medium uppercase text-white sm:text-[34px] lg:text-[30px]">
            {content.title}
          </h2>

          <p className="mx-auto mt-4 max-w-[880px] text-[16px] font-medium leading-[1.6] text-white/55 sm:text-[21px] lg:text-[18px]">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-5">
          {content.items.map((item) => (
            <div
              key={item.id}
              className="group relative min-h-[250px] cursor-pointer overflow-hidden rounded-[12px] lg:min-h-[225px] lg:rounded-[18px]"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white/10 text-white/60">
                  {isBangla ? "কোনো ছবি নেই" : "No Image"}
                </div>
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.18)_30%,rgba(0,0,0,0.58)_100%)]" />

              <div className="relative z-10 flex h-full items-end p-3 sm:p-5 lg:p-7">
                <h3 className="text-[16px] font-bold leading-[1.15] text-white sm:text-[28px] lg:text-[24px]">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}

          {!content.items.length && (
            <div className="col-span-2 rounded-[18px] bg-white/10 p-8 text-center text-white/70">
              {isBangla ? "কোনো আইটেম পাওয়া যায়নি" : "No items found"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
