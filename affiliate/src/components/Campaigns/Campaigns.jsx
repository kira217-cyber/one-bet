import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

import "swiper/css";

const API_URL = import.meta.env.VITE_APP_URL || "";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const defaultData = {
  heading: {
    bn: "চলমান ক্যাম্পেইন",
    en: "ONGOING CAMPAIGNS",
  },
  moreDetailsText: {
    bn: "আরও বিস্তারিত",
    en: "MORE DETAILS",
  },
  signUpText: {
    bn: "সাইন আপ করুন",
    en: "SIGN UP NOW",
  },
  isActive: true,
  campaigns: [],
};

const Campaigns = () => {
  const { isBangla } = useLanguage();

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [campaignData, setCampaignData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCampaignContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-campaign-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          setCampaignData({
            heading: {
              bn: data.data?.heading?.bn || defaultData.heading.bn,
              en: data.data?.heading?.en || defaultData.heading.en,
            },
            moreDetailsText: {
              bn:
                data.data?.moreDetailsText?.bn ||
                defaultData.moreDetailsText.bn,
              en:
                data.data?.moreDetailsText?.en ||
                defaultData.moreDetailsText.en,
            },
            signUpText: {
              bn: data.data?.signUpText?.bn || defaultData.signUpText.bn,
              en: data.data?.signUpText?.en || defaultData.signUpText.en,
            },
            isActive: data.data?.isActive !== false,
            campaigns: Array.isArray(data.data?.campaigns)
              ? data.data.campaigns
              : [],
          });
        } else {
          setCampaignData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch campaign content:", error);
        setCampaignData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCampaignContent();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const campaigns = (campaignData.campaigns || [])
      .filter((item) => item?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item, index) => ({
        id: item._id || index,
        title: item?.title?.[lang] || item?.title?.en || item?.title?.bn || "",
        image: fileUrl(item?.image),
        date: item?.date?.[lang] || item?.date?.en || item?.date?.bn || "",
      }));

    return {
      heading: campaignData?.heading?.[lang] || defaultData.heading[lang],

      moreDetails:
        campaignData?.moreDetailsText?.[lang] ||
        defaultData.moreDetailsText[lang],

      signUp: campaignData?.signUpText?.[lang] || defaultData.signUpText[lang],

      count: isBangla
        ? String(campaigns.length).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])
        : String(campaigns.length),

      campaigns,
    };
  }, [campaignData, isBangla]);

  if (loading) {
    return (
      <section className="w-full overflow-hidden bg-[#1C1400] py-8 text-white sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1540px] px-4 sm:px-6 lg:px-10">
          <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-white/10" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-h-[460px] animate-pulse rounded-[14px] bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (campaignData?.isActive === false || !content.campaigns.length) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden bg-[#1C1400] py-8 text-white sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1540px] px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex items-center justify-between sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-[16px] font-extrabold uppercase leading-none tracking-[-0.03em] text-white sm:text-[22px] lg:text-[26px]">
              {content.heading}
            </h2>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef3b2d] text-[16px] font-bold text-white">
              {content.count}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              ref={prevRef}
              className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[8px] border border-white/70 bg-transparent text-white transition hover:bg-white/5 sm:h-[38px] sm:w-[38px]"
              aria-label="Previous slide"
              type="button"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>

            <button
              ref={nextRef}
              className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[8px] border border-white/70 bg-transparent text-white transition hover:bg-white/5 sm:h-[38px] sm:w-[38px]"
              aria-label="Next slide"
              type="button"
            >
              <ChevronRight size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <Swiper
            modules={[Navigation]}
            speed={700}
            loop={content.campaigns.length > 1}
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
                  <div className="flex h-full min-h-[460px] flex-col overflow-hidden rounded-[14px] bg-[#6d6153] p-[9px] shadow-[0_8px_25px_rgba(0,0,0,0.18)] sm:min-h-[460px] sm:p-[10px]">
                    <div className="overflow-hidden rounded-[10px] bg-black/20">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-[210px] w-full object-cover sm:h-[220px] lg:h-[205px]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-[210px] w-full items-center justify-center text-sm font-bold text-white/60 sm:h-[220px] lg:h-[205px]">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col px-2 pb-2 pt-4 text-center">
                      <h3 className="min-h-[78px] text-[22px] font-extrabold uppercase leading-[1.3] tracking-[-0.02em] text-white sm:min-h-[78px] sm:text-[22px] lg:min-h-[72px] lg:text-[18px]">
                        {item.title}
                      </h3>

                      <p className="mt-5 min-h-[78px] text-[14px] font-semibold leading-[1.45] text-white sm:min-h-[80px] sm:text-[16px] lg:min-h-[76px] lg:text-[14px]">
                        {item.date}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-3 pt-8">
                        <button
                          type="button"
                          className="inline-flex min-h-[46px] cursor-pointer items-center justify-center text-left text-[14px] font-extrabold uppercase text-white transition hover:text-white/80 sm:text-[15px] lg:text-[14px]"
                        >
                          {content.moreDetails}
                        </button>

                        <NavLink
                          to="/register"
                          className="inline-flex h-[48px] min-w-[156px] items-center justify-center rounded-[12px] bg-[#168ceb] px-5 text-[14px] font-extrabold uppercase text-white transition hover:bg-[#0f7ed8] sm:min-w-[165px] sm:text-[15px] lg:min-w-[154px] lg:text-[14px]"
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
