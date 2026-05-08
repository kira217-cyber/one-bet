import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router";
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
  title: { bn: "HOW TO JOIN", en: "HOW TO JOIN" },
  heroText: {
    bn: "এখনই তোমার অ্যাফিলিয়েট যাত্রা শুরু করো!",
    en: "Start your affiliate journey now!",
  },
  buttonText: { bn: "Register now", en: "Register now" },
  image:
    "https://beit365.bet/assets/affiliate/assets/hero-banner/clzhvb72472ur07zopjckzhdv.webp",
  steps: [
    {
      id: 1,
      number: "01",
      title: { bn: "Register", en: "Register" },
      description: {
        bn: "প্লেয়ার ইউনিক অ্যাফিলিয়েট লিংক ব্যবহার করে beit365.bet অ্যাকাউন্ট রেজিস্টার করে",
        en: "Player registers beit365.bet account with unique affiliate link",
      },
      order: 1,
      isHighlighted: false,
      isActive: true,
    },
    {
      id: 2,
      number: "02",
      title: { bn: "Generate", en: "Generate" },
      description: {
        bn: "প্লেয়ার নেট প্রফিট জেনারেট করে",
        en: "Player generates net profit",
      },
      order: 2,
      isHighlighted: false,
      isActive: true,
    },
    {
      id: 3,
      number: "03",
      title: { bn: "Earn", en: "Earn" },
      description: {
        bn: "তুমি নেট প্রফিটের 40% কমিশন হিসেবে আয় করো",
        en: "You earn 40% of net profit as commission",
      },
      order: 3,
      isHighlighted: true,
      isActive: true,
    },
  ],
};

const HowToJoin = () => {
  const { isBangla } = useLanguage();

  const [joinData, setJoinData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchContent = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/aff-how-to-join-content");

        if (!mounted) return;

        if (data?.success && data?.data) {
          const doc = data.data;

          setJoinData({
            ...defaultData,
            ...doc,
            title: {
              ...defaultData.title,
              ...(doc.title || {}),
            },
            heroText: {
              ...defaultData.heroText,
              ...(doc.heroText || {}),
            },
            buttonText: {
              ...defaultData.buttonText,
              ...(doc.buttonText || {}),
            },
            image: doc.image || defaultData.image,
            steps: Array.isArray(doc.steps) ? doc.steps : defaultData.steps,
            isActive: doc.isActive !== false,
          });
        } else {
          setJoinData(defaultData);
        }
      } catch (error) {
        console.error("Failed to fetch how to join content:", error);
        setJoinData(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchContent();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    const steps = (joinData.steps || [])
      .filter((step) => step?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((step, index) => ({
        id: step?._id || step?.id || index,
        number: step?.number || `0${index + 1}`,
        title: getText(step?.title, lang, ""),
        desc: getText(step?.description, lang, ""),
        isHighlighted: step?.isHighlighted === true,
      }));

    const normalSteps = steps.filter((step) => !step.isHighlighted);
    const highlightedStep =
      steps.find((step) => step.isHighlighted) || steps[2];

    return {
      title: getText(joinData.title, lang, defaultData.title[lang]),
      heroText: getText(joinData.heroText, lang, defaultData.heroText[lang]),
      button: getText(joinData.buttonText, lang, defaultData.buttonText[lang]),
      image: fileUrl(joinData.image) || defaultData.image,
      steps,
      normalSteps,
      highlightedStep,
    };
  }, [joinData, isBangla]);

  if (loading) {
    return (
      <section className="w-full bg-[#1b1204] py-8 text-white sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-10 h-10 w-64 animate-pulse rounded-lg bg-white/10" />

          <div className="grid grid-cols-1 gap-10 lg:flex lg:justify-between">
            <div className="h-[340px] flex-1 animate-pulse rounded-[18px] bg-white/10" />
            <div className="h-[340px] w-full animate-pulse rounded-[18px] bg-white/10 lg:w-[430px]" />
          </div>
        </div>
      </section>
    );
  }

  if (joinData?.isActive === false) {
    return null;
  }

  return (
    <section className="w-full bg-[#1b1204] py-8 text-white sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="text-[28px] font-medium uppercase tracking-[-0.03em] text-white sm:text-[34px] lg:text-[30px]">
            {content.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:flex lg:justify-between">
          <div className="order-1">
            <div
              className="relative min-h-[155px] overflow-hidden rounded-[10px] bg-cover bg-center bg-no-repeat sm:min-h-[340px] sm:rounded-[18px] lg:min-h-[338px]"
              style={{
                backgroundImage: `url('${content.image}')`,
              }}
            />

            <div className="mt-8 hidden grid-cols-1 gap-8 sm:grid sm:grid-cols-2 sm:gap-10 lg:mt-10 lg:gap-12">
              {content.normalSteps.slice(0, 2).map((step) => (
                <div key={step.id}>
                  <h3 className="text-[52px] font-extrabold leading-none text-[#d8b067] sm:text-[58px] lg:text-[46px]">
                    {step.number}
                  </h3>

                  <h4 className="mt-2 text-[22px] font-extrabold text-white sm:text-[24px] lg:text-[18px]">
                    {step.title}
                  </h4>

                  <p className="mt-3 max-w-[320px] text-[18px] font-semibold leading-[1.65] text-white sm:text-[19px] lg:text-[14px]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-2 flex flex-col items-center text-center lg:items-start lg:pt-[110px] lg:text-left">
            <div className="w-full max-w-[380px]">
              <h3 className="mx-auto max-w-[260px] text-[28px] leading-[1.15] text-white/80 sm:max-w-none sm:text-[42px] lg:mx-0 lg:text-[28px]">
                {content.heroText}
              </h3>

              <NavLink
                to="/register"
                className="mt-6 inline-flex h-[42px] w-full min-w-[190px] items-center justify-center rounded-[4px] border border-white/30 px-7 text-[13px] font-bold text-white transition hover:bg-white hover:text-black sm:h-[52px] sm:w-auto sm:text-[15px] lg:text-[13px]"
              >
                {content.button}
              </NavLink>
            </div>

            {content.highlightedStep && (
              <div className="mt-10 hidden rounded-[20px] bg-[#7b6330] px-6 py-6 sm:block sm:px-7 sm:py-7 lg:mt-24 lg:max-w-[430px]">
                <h3 className="text-[54px] font-extrabold leading-none text-[#d8b067] sm:text-[60px] lg:text-[46px]">
                  {content.highlightedStep.number}
                </h3>

                <h4 className="mt-2 text-[22px] font-extrabold text-white sm:text-[24px] lg:text-[18px]">
                  {content.highlightedStep.title}
                </h4>

                <p className="mt-3 text-[18px] font-semibold leading-[1.65] text-white sm:text-[19px] lg:text-[14px]">
                  {content.highlightedStep.desc}
                </p>
              </div>
            )}
          </div>

          <div className="order-3 flex flex-col items-center gap-10 text-center sm:hidden">
            {content.steps.map((step) => (
              <div
                key={step.id}
                className={
                  step.isHighlighted
                    ? "w-full rounded-[18px] bg-[#7b6330] px-6 py-6"
                    : "max-w-[290px]"
                }
              >
                <h3 className="text-[44px] font-extrabold leading-none text-[#d8b067]">
                  {step.number}
                </h3>

                <h4 className="mt-3 text-[18px] font-extrabold text-white">
                  {step.title}
                </h4>

                <p className="mt-3 text-[15px] font-semibold leading-[1.8] text-white">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToJoin;
