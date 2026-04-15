import React, { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { Link } from "react-router";
import { api } from "../../api/axios";

const Hero = () => {
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
        unlock: "সাফল্য আনলক করুন",
        title: "৭০% পর্যন্ত বড় কমিশন আয় করুন",
        subtitle: "এবং পরিশ্রমের সাথে চমককে গ্রহণ করুন!",
        terms: "*শর্তাবলী প্রযোজ্য",
        button: "শুরু করুন",
      }
    : {
        unlock: "UNLOCK SUCCESS",
        title: "EARN BIG UP TO 70% COMMISSION",
        subtitle: "AND EMBRACE SURPRISES WITH EFFORT!",
        terms: "*TERMS AND CONDITION APPLY",
        button: "GET STARTED",
      };

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover md:bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://beit365.bet/assets/affiliate/assets/bg/India-Heo.webp')",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-5 pt-4 sm:px-8 sm:pt-5 md:px-10 lg:px-16">
        {/* Logo */}
        <Link
          to="/"
          className="inline-flex items-center justify-center select-none"
        >
          <img
            src={logoSrc}
            alt="bet365 logo"
            className="h-auto w-[180px] sm:w-[220px] lg:w-[250px] xl:w-[260px] object-contain"
          />
        </Link>

        {/* Center block */}
        <div className="mx-auto flex w-full max-w-[1100px] mt-4 md:mt-10 flex-1 flex-col items-center justify-center pb-10 text-center">
          {/* Unlock bar */}
          <div className="mt-3 sm:mt-4 lg:mt-2 w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[470px] xl:max-w-[470px]">
            <div className="flex h-[24px] sm:h-[26px] items-center justify-center rounded-full bg-gradient-to-r from-[#008f6b] via-[#7e1b14] to-[#b50000] px-4 shadow-[0_0_20px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-[0.08em] text-white/90 uppercase">
                <Lock size={11} strokeWidth={2.2} />
                <span>{content.unlock}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-7 sm:mt-9 lg:mt-14 max-w-[980px] text-center font-extrabold uppercase leading-[0.95] tracking-[-0.04em] text-[34px] sm:text-[48px] md:text-[62px] lg:text-[64px] xl:text-[66px]">
            {isBangla ? (
              <span className="leading-[1.08]">{content.title}</span>
            ) : (
              content.title
            )}
          </h1>

          {/* Subtitle */}
          <p className="mt-7 sm:mt-8 lg:mt-8 max-w-[980px] text-center font-medium uppercase leading-[1.35] tracking-[0.01em] text-[18px] sm:text-[24px] md:text-[30px] lg:text-[34px] xl:text-[36px]">
            {content.subtitle}
          </p>

          {/* Terms */}
          <p className="mt-8 sm:mt-10 lg:mt-8 text-center font-semibold uppercase tracking-[0.03em] text-[13px] sm:text-[15px] lg:text-[17px]">
            {content.terms}
          </p>

          {/* Button */}
          <div className="mt-12 sm:mt-14 lg:mt-12">
            <Link
              to="/register"
              className="inline-flex h-[58px] sm:h-[60px] lg:h-[52px] min-w-[320px] sm:min-w-[280px] lg:min-w-[206px] items-center justify-center rounded-[6px] border border-white bg-transparent px-18 md:px-8 text-[18px] sm:text-[22px] lg:text-[15px] font-bold uppercase tracking-[0.01em] text-white transition duration-300 hover:bg-white hover:text-black"
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
