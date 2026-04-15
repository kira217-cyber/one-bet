import React, { useEffect, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const EliteClub = () => {
  const { isBangla } = useLanguage();
  const [siteIdentity, setSiteIdentity] = useState(null);

  useEffect(() => {
    const fetchSiteIdentity = async () => {
      try {
        const res = await api.get("/api/aff-site-identity");
        setSiteIdentity(res?.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch affiliate site identity:", error);
        setSiteIdentity(null);
      }
    };

    fetchSiteIdentity();
  }, []);

  const logoSrc = siteIdentity?.logo
    ? siteIdentity.logo.startsWith("http")
      ? siteIdentity.logo
      : `${import.meta.env.VITE_APP_URL}${siteIdentity.logo}`
    : null;

  const content = isBangla
    ? {
        title: "ELITE CLUB",
        subtitle: "আমাদের এলিটদের জন্য বিশেষ প্রিমিয়াম সুবিধা।",
      }
    : {
        title: "ELITE CLUB",
        subtitle: "Premium privileges specially for our elites.",
      };

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://beit365.bet/assets/affiliate/assets/bdt/EliteBG.webp')",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-[1600px] items-center px-4 sm:px-6 lg:min-h-[690px] lg:px-10">
        {/* Desktop / Laptop Layout */}
        <div className="hidden w-full lg:block">
          <div className="max-w-[900px] pl-[140px] xl:pl-[140px]">
            <img
              src={logoSrc}
              alt="bet365 logo"
              className="h-auto w-[110px] object-contain xl:w-[135px]"
            />

            <h1
              className="mt-3 whitespace-nowrap font-normal uppercase leading-[0.92] text-[#d4aa12] text-[86px] xl:text-[102px]"
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

        {/* Mobile / Tablet Layout */}
        <div className="flex w-full flex-col items-center justify-center py-10 text-center lg:hidden">
          {/* Top crest image */}
          <img
            src="https://beit365.bet/assets/affiliate/assets/bdt/Rectangle.png"
            alt="Elite Club crest"
            className="h-auto w-[210px] object-contain sm:w-[250px] md:w-[290px]"
          />

          {/* Logo */}
          <img
            src={logoSrc}
            alt="bet365 logo"
            className="mt-5 h-auto w-[130px] object-contain sm:w-[155px]"
          />

          {/* Title */}
          <h1
            className="mt-4 font-normal uppercase leading-[0.95] tracking-[-0.04em] text-[#d4aa12] text-[58px] sm:text-[72px] md:text-[86px]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", Times, serif',
            }}
          >
            {content.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-[320px] text-[16px] font-semibold leading-[1.45] text-white/75 sm:max-w-[420px] sm:text-[22px] md:text-[26px]">
            {content.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default EliteClub;
