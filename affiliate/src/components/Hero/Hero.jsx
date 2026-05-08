import React, { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { Link } from "react-router";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_APP_URL || "";

const getFileUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const defaultContent = {
  unlockText: {
    bn: "সাফল্য আনলক করুন",
    en: "UNLOCK SUCCESS",
  },
  title: {
    bn: "৭০% পর্যন্ত বড় কমিশন আয় করুন",
    en: "EARN BIG UP TO 70% COMMISSION",
  },
  subtitle: {
    bn: "এবং পরিশ্রমের সাথে চমককে গ্রহণ করুন!",
    en: "AND EMBRACE SURPRISES WITH EFFORT!",
  },
  termsText: {
    bn: "*শর্তাবলী প্রযোজ্য",
    en: "*TERMS AND CONDITION APPLY",
  },
  buttonText: {
    bn: "শুরু করুন",
    en: "GET STARTED",
  },
  backgroundImage: "",
  isActive: true,
};

const DEFAULT_BG =
  "https://beit365.bet/assets/affiliate/assets/bg/India-Heo.webp";

const Hero = () => {
  const { isBangla } = useLanguage();

  const [siteIdentity, setSiteIdentity] = useState(null);
  const [heroContent, setHeroContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [identityRes, heroRes] = await Promise.allSettled([
          api.get("/api/aff-site-identity"),
          api.get("/api/aff-hero-content"),
        ]);

        if (!mounted) return;

        if (identityRes.status === "fulfilled") {
          setSiteIdentity(identityRes.value?.data?.data || null);
        } else {
          console.error(
            "Failed to fetch affiliate site identity:",
            identityRes.reason,
          );
          setSiteIdentity(null);
        }

        if (heroRes.status === "fulfilled") {
          const doc = heroRes.value?.data?.data;

          if (doc) {
            setHeroContent({
              unlockText: {
                bn: doc?.unlockText?.bn || defaultContent.unlockText.bn,
                en: doc?.unlockText?.en || defaultContent.unlockText.en,
              },
              title: {
                bn: doc?.title?.bn || defaultContent.title.bn,
                en: doc?.title?.en || defaultContent.title.en,
              },
              subtitle: {
                bn: doc?.subtitle?.bn || defaultContent.subtitle.bn,
                en: doc?.subtitle?.en || defaultContent.subtitle.en,
              },
              termsText: {
                bn: doc?.termsText?.bn || defaultContent.termsText.bn,
                en: doc?.termsText?.en || defaultContent.termsText.en,
              },
              buttonText: {
                bn: doc?.buttonText?.bn || defaultContent.buttonText.bn,
                en: doc?.buttonText?.en || defaultContent.buttonText.en,
              },
              backgroundImage:
                doc?.backgroundImage || defaultContent.backgroundImage,
              isActive: doc?.isActive !== false,
            });
          }
        } else {
          console.error("Failed to fetch hero content:", heroRes.reason);
          setHeroContent(defaultContent);
        }
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
        setHeroContent(defaultContent);
        setSiteIdentity(null);
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
    return siteIdentity?.logo ? getFileUrl(siteIdentity.logo) : "";
  }, [siteIdentity]);

  const content = useMemo(() => {
    const lang = isBangla ? "bn" : "en";

    return {
      unlock:
        heroContent?.unlockText?.[lang] || defaultContent.unlockText[lang],

      title: heroContent?.title?.[lang] || defaultContent.title[lang],

      subtitle: heroContent?.subtitle?.[lang] || defaultContent.subtitle[lang],

      terms: heroContent?.termsText?.[lang] || defaultContent.termsText[lang],

      button:
        heroContent?.buttonText?.[lang] || defaultContent.buttonText[lang],
    };
  }, [heroContent, isBangla]);

  const backgroundSrc = getFileUrl(heroContent?.backgroundImage) || DEFAULT_BG;

  if (loading) {
    return (
      <section className="relative flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-black text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </section>
    );
  }

  if (heroContent?.isActive === false) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundSrc}')`,
        }}
      />

      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex flex-col items-center px-5 pt-4 sm:px-8 sm:pt-5 md:px-10 lg:px-16">
        <Link
          to="/"
          className="inline-flex select-none items-center justify-center"
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={siteIdentity?.siteTitle || "Affiliate logo"}
              className="h-auto w-[180px] object-contain sm:w-[220px] lg:w-[250px] xl:w-[260px]"
            />
          ) : (
            <span className="text-xl font-extrabold uppercase tracking-wide text-white">
              {siteIdentity?.siteTitle || "Affiliate"}
            </span>
          )}
        </Link>

        <div className="mx-auto mt-4 flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center pb-10 text-center md:mt-10">
          <div className="mt-3 w-full max-w-[320px] sm:mt-4 sm:max-w-[420px] md:max-w-[500px] lg:mt-2 lg:max-w-[470px] xl:max-w-[470px]">
            <div className="flex h-[24px] items-center justify-center rounded-full bg-gradient-to-r from-[#008f6b] via-[#7e1b14] to-[#b50000] px-4 shadow-[0_0_20px_rgba(0,0,0,0.25)] sm:h-[26px]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90 sm:text-[12px]">
                <Lock size={11} strokeWidth={2.2} />
                <span>{content.unlock}</span>
              </div>
            </div>
          </div>

          <h1 className="mt-7 max-w-[980px] text-center text-[34px] font-extrabold uppercase leading-[0.95] tracking-[-0.04em] sm:mt-9 sm:text-[48px] md:text-[62px] lg:mt-14 lg:text-[64px] xl:text-[66px]">
            {isBangla ? (
              <span className="leading-[1.08]">{content.title}</span>
            ) : (
              content.title
            )}
          </h1>

          <p className="mt-7 max-w-[980px] text-center text-[18px] font-medium uppercase leading-[1.35] tracking-[0.01em] sm:mt-8 sm:text-[24px] md:text-[30px] lg:mt-8 lg:text-[34px] xl:text-[36px]">
            {content.subtitle}
          </p>

          <p className="mt-8 text-center text-[13px] font-semibold uppercase tracking-[0.03em] sm:mt-10 sm:text-[15px] lg:mt-8 lg:text-[17px]">
            {content.terms}
          </p>

          <div className="mt-12 sm:mt-14 lg:mt-12">
            <Link
              to="/register"
              className="inline-flex h-[58px] min-w-[320px] items-center justify-center rounded-[6px] border border-white bg-transparent px-8 text-[18px] font-bold uppercase tracking-[0.01em] text-white transition duration-300 hover:bg-white hover:text-black sm:h-[60px] sm:min-w-[280px] sm:text-[22px] lg:h-[52px] lg:min-w-[206px] lg:text-[15px]"
            >
              {content.button}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
