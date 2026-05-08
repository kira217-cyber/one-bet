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

const defaultContent = {
  isActive: true,
  title: {
    bn: "ELITE CLUB",
    en: "ELITE CLUB",
  },
  subtitle: {
    bn: "আমাদের এলিটদের জন্য বিশেষ প্রিমিয়াম সুবিধা।",
    en: "Premium privileges specially for our elites.",
  },
  backgroundImage:
    "https://beit365.bet/assets/affiliate/assets/bdt/EliteBG.webp",
  crestImage: "https://beit365.bet/assets/affiliate/assets/bdt/Rectangle.png",
};

const EliteClub = () => {
  const { isBangla } = useLanguage();

  const [siteIdentity, setSiteIdentity] = useState(null);
  const [eliteContent, setEliteContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [identityRes, eliteRes] = await Promise.allSettled([
          api.get("/api/aff-site-identity"),
          api.get("/api/aff-elite-club-content"),
        ]);

        if (!mounted) return;

        if (identityRes.status === "fulfilled") {
          setSiteIdentity(identityRes.value?.data?.data || null);
        } else {
          setSiteIdentity(null);
        }

        if (eliteRes.status === "fulfilled" && eliteRes.value?.data?.data) {
          const doc = eliteRes.value.data.data;

          setEliteContent({
            ...defaultContent,
            ...doc,
            title: {
              ...defaultContent.title,
              ...(doc.title || {}),
            },
            subtitle: {
              ...defaultContent.subtitle,
              ...(doc.subtitle || {}),
            },
            backgroundImage:
              doc.backgroundImage || defaultContent.backgroundImage,
            crestImage: doc.crestImage || defaultContent.crestImage,
            isActive: doc.isActive !== false,
          });
        } else {
          setEliteContent(defaultContent);
        }
      } catch (error) {
        console.error("Failed to fetch elite club data:", error);
        setSiteIdentity(null);
        setEliteContent(defaultContent);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      mounted = false;
    };
  }, []);

  const logoSrc = useMemo(() => {
    return siteIdentity?.logo ? fileUrl(siteIdentity.logo) : "";
  }, [siteIdentity]);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    return {
      title: getText(eliteContent.title, lang, defaultContent.title[lang]),
      subtitle: getText(
        eliteContent.subtitle,
        lang,
        defaultContent.subtitle[lang],
      ),
      backgroundImage:
        fileUrl(eliteContent.backgroundImage) || defaultContent.backgroundImage,
      crestImage: fileUrl(eliteContent.crestImage) || defaultContent.crestImage,
    };
  }, [eliteContent, isBangla]);

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-black text-white">
        <div className="mx-auto flex min-h-[620px] w-full max-w-[1600px] items-center px-4 sm:px-6 lg:min-h-[690px] lg:px-10">
          <div className="w-full animate-pulse space-y-5">
            <div className="h-20 w-56 rounded-xl bg-white/10" />
            <div className="h-24 w-[520px] max-w-full rounded-xl bg-white/10" />
            <div className="h-8 w-[460px] max-w-full rounded-xl bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (eliteContent?.isActive === false) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${content.backgroundImage}')`,
        }}
      />

      <div className="absolute inset-0 bg-black/5" />

      <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-[1600px] items-center px-4 sm:px-6 lg:min-h-[690px] lg:px-10">
        <div className="hidden w-full lg:block">
          <div className="max-w-[900px] pl-[140px] xl:pl-[140px]">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={siteIdentity?.siteTitle || "Affiliate logo"}
                className="h-auto w-[110px] object-contain xl:w-[135px]"
              />
            ) : (
              <div className="text-xl font-extrabold uppercase text-white">
                {siteIdentity?.siteTitle || "Affiliate"}
              </div>
            )}

            <h1
              className="mt-3 whitespace-nowrap text-[86px] font-normal uppercase leading-[0.92] text-[#d4aa12] xl:text-[102px]"
              style={{
                fontFamily: 'Georgia, "Times New Roman", Times, serif',
              }}
            >
              {content.title}
            </h1>

            <p className="mt-4 max-w-[520px] text-[20px] font-semibold leading-[1.35] text-white/80 xl:text-[24px]">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center py-10 text-center lg:hidden">
          {content.crestImage ? (
            <img
              src={content.crestImage}
              alt="Elite Club crest"
              className="h-auto w-[210px] object-contain sm:w-[250px] md:w-[290px]"
            />
          ) : null}

          {logoSrc ? (
            <img
              src={logoSrc}
              alt={siteIdentity?.siteTitle || "Affiliate logo"}
              className="mt-5 h-auto w-[130px] object-contain sm:w-[155px]"
            />
          ) : (
            <div className="mt-5 text-lg font-extrabold uppercase text-white">
              {siteIdentity?.siteTitle || "Affiliate"}
            </div>
          )}

          <h1
            className="mt-4 text-[58px] font-normal uppercase leading-[0.95] tracking-[-0.04em] text-[#d4aa12] sm:text-[72px] md:text-[86px]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", Times, serif',
            }}
          >
            {content.title}
          </h1>

          <p className="mt-5 max-w-[320px] text-[16px] font-semibold leading-[1.45] text-white/75 sm:max-w-[420px] sm:text-[22px] md:text-[26px]">
            {content.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default EliteClub;
