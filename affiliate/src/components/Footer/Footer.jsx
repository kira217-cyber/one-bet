import React, { useEffect, useMemo, useState } from "react";
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookF,
  FaYoutube,
  FaLink,
} from "react-icons/fa";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const API_URL = import.meta.env.VITE_APP_URL;

const getImageUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const fallbackContent = {
  title: {
    bn: "আমাদের সাথে যুক্ত থাকুন",
    en: "Connect with us.",
  },
  desc: {
    bn: "ক্যাম্পেইন, ঘোষণা এবং অ্যাফিলিয়েট মার্কেটিং সম্পর্কিত আপডেট শেয়ার করার জন্য একটি কেন্দ্রীভূত প্ল্যাটফর্ম।",
    en: "Organized as a centralized platform for sharing campaigns, announcement, and updates related to affiliate marketing efforts",
  },
  termsText: {
    bn: "শর্তাবলী",
    en: "Terms & Conditions",
  },
  termsLink: "#",
  copyright: {
    bn: "© ২০২০ সাল থেকে কপিরাইট, beit365.bet Affiliates Program। সর্বস্বত্ব সংরক্ষিত।",
    en: "© Copyrighted since 2020, beit365.bet Affiliates Program. All rights reserved.",
  },
  backgroundImage:
    "https://beit365.bet/assets/affiliate/assets/bg/Community-Page.png",
  isActive: true,
  socialLinks: [
    {
      _id: "whatsapp",
      platform: "WhatsApp",
      label: "WhatsApp",
      iconType: "whatsapp",
      icon: "",
      href: "#",
      order: 1,
      isActive: true,
    },
    {
      _id: "telegram",
      platform: "Telegram",
      label: "Telegram",
      iconType: "telegram",
      icon: "",
      href: "#",
      order: 2,
      isActive: true,
    },
    {
      _id: "facebook",
      platform: "Facebook",
      label: "Facebook",
      iconType: "facebook",
      icon: "",
      href: "#",
      order: 3,
      isActive: true,
    },
    {
      _id: "youtube",
      platform: "YouTube",
      label: "YouTube",
      iconType: "youtube",
      icon: "",
      href: "#",
      order: 4,
      isActive: true,
    },
  ],
};

const getText = (obj, lang, fallback = "") => {
  if (!obj) return fallback;
  return obj?.[lang] || obj?.en || obj?.bn || fallback;
};

const renderSocialIcon = (item) => {
  const customIcon = getImageUrl(item.icon);

  if (customIcon) {
    return (
      <img
        src={customIcon}
        alt={item.label || item.platform || "Social"}
        className="h-[34px] w-[34px] object-contain sm:h-[42px] sm:w-[42px]"
      />
    );
  }

  if (item.iconType === "whatsapp") return <FaWhatsapp />;
  if (item.iconType === "telegram") return <FaTelegramPlane />;
  if (item.iconType === "facebook") return <FaFacebookF />;
  if (item.iconType === "youtube") return <FaYoutube />;

  return <FaLink />;
};

const isExternalLink = (link = "") => {
  return (
    /^https?:\/\//i.test(link) ||
    link.startsWith("mailto:") ||
    link.startsWith("tel:")
  );
};

const Footer = () => {
  const { isBangla } = useLanguage();
  const lang = isBangla ? "bn" : "en";

  const [data, setData] = useState(fallbackContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchFooterContent = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/aff-footer-content`);
        const json = await res.json();

        if (!ignore && json?.success && json?.data) {
          setData({
            ...fallbackContent,
            ...json.data,
            title: {
              ...fallbackContent.title,
              ...(json.data.title || {}),
            },
            desc: {
              ...fallbackContent.desc,
              ...(json.data.desc || {}),
            },
            termsText: {
              ...fallbackContent.termsText,
              ...(json.data.termsText || {}),
            },
            copyright: {
              ...fallbackContent.copyright,
              ...(json.data.copyright || {}),
            },
            socialLinks: Array.isArray(json.data.socialLinks)
              ? json.data.socialLinks
              : fallbackContent.socialLinks,
          });
        }
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
        if (!ignore) setData(fallbackContent);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchFooterContent();

    return () => {
      ignore = true;
    };
  }, []);

  const socialLinks = useMemo(() => {
    return [...(data.socialLinks || [])]
      .filter((item) => item?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }, [data.socialLinks]);

  if (data?.isActive === false) return null;

  const title = getText(data.title, lang, fallbackContent.title[lang]);
  const desc = getText(data.desc, lang, fallbackContent.desc[lang]);
  const terms = getText(data.termsText, lang, fallbackContent.termsText[lang]);
  const copyright = getText(
    data.copyright,
    lang,
    fallbackContent.copyright[lang],
  );

  const backgroundImage = getImageUrl(data.backgroundImage);
  const termsLink = data.termsLink || "#";

  return (
    <footer className="w-full bg-black text-white">
      <div
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: backgroundImage ? `url('${backgroundImage}')` : "",
        }}
      >
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.28)]" />

        <div className="relative z-10 mx-auto flex min-h-[365px] w-full max-w-[1600px] flex-col items-center justify-center px-4 py-10 text-center sm:px-6 lg:px-10">
          {loading ? (
            <>
              <div className="h-16 w-full max-w-[620px] animate-pulse rounded-2xl bg-white/10" />
              <div className="mt-6 h-20 w-full max-w-[760px] animate-pulse rounded-2xl bg-white/10" />
              <div className="mt-10 flex items-center justify-center gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[72px] w-[72px] animate-pulse rounded-full bg-white/10 sm:h-[92px] sm:w-[92px]"
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-[70px] lg:text-[62px]">
                {title}
              </h2>

              <p className="mt-6 max-w-[760px] text-[15px] font-semibold leading-[1.6] text-white sm:text-[22px] lg:text-[16px]">
                {desc}
              </p>

              <div className="mt-10 flex items-center justify-center gap-4 sm:gap-6">
                {socialLinks.map((item) => {
                  const href = item.href || "#";

                  return (
                    <a
                      key={item._id || item.platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label || item.platform || "Social link"}
                      className="flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-full bg-white/10 text-[30px] text-white transition duration-300 hover:bg-white hover:text-black sm:h-[92px] sm:w-[92px] sm:text-[40px] lg:h-[90px] lg:w-[90px] lg:text-[38px]"
                    >
                      {renderSocialIcon(item)}
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-black px-4 py-9 text-center sm:px-6 lg:px-10">
        {isExternalLink(termsLink) ? (
          <a
            href={termsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block cursor-pointer text-[18px] font-medium text-white transition hover:text-white/75 sm:text-[24px] lg:text-[16px]"
          >
            {terms}
          </a>
        ) : (
          <NavLink
            to={termsLink}
            className="inline-block cursor-pointer text-[18px] font-medium text-white transition hover:text-white/75 sm:text-[24px] lg:text-[16px]"
          >
            {terms}
          </NavLink>
        )}

        <p className="mt-3 text-[12px] font-medium leading-[1.5] text-white/35 sm:text-[16px] lg:text-[12px]">
          {copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
