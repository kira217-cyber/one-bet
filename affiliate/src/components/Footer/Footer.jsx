import React from "react";
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";

const Footer = () => {
  const { isBangla } = useLanguage();

  const content = isBangla
    ? {
        title: "আমাদের সাথে যুক্ত থাকুন",
        desc: "ক্যাম্পেইন, ঘোষণা এবং অ্যাফিলিয়েট মার্কেটিং সম্পর্কিত আপডেট শেয়ার করার জন্য একটি কেন্দ্রীভূত প্ল্যাটফর্ম।",
        terms: "শর্তাবলী",
        copyright:
          "© ২০২০ সাল থেকে কপিরাইট, beit365.bet Affiliates Program। সর্বস্বত্ব সংরক্ষিত।",
      }
    : {
        title: "Connect with us.",
        desc: "Organized as a centralized platform for sharing campaigns, announcement, and updates related to affiliate marketing efforts",
        terms: "Terms & Conditions",
        copyright:
          "© Copyrighted since 2020, beit365.bet Affiliates Program. All rights reserved.",
      };

  const socialLinks = [
    {
      id: 1,
      icon: <FaWhatsapp />,
      href: "#",
      label: "WhatsApp",
    },
    {
      id: 2,
      icon: <FaTelegramPlane />,
      href: "#",
      label: "Telegram",
    },
    {
      id: 3,
      icon: <FaFacebookF />,
      href: "#",
      label: "Facebook",
    },
    {
      id: 4,
      icon: <FaYoutube />,
      href: "#",
      label: "YouTube",
    },
  ];

  return (
    <footer className="w-full bg-black text-white">
      {/* Top community section */}
      <div
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://beit365.bet/assets/affiliate/assets/bg/Community-Page.png')",
        }}
      >
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.28)]" />

        <div className="relative z-10 mx-auto flex min-h-[365px] w-full max-w-[1600px] flex-col items-center justify-center px-4 py-10 text-center sm:px-6 lg:px-10">
          {/* Title */}
          <h2 className="text-[44px] sm:text-[70px] lg:text-[62px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white">
            {content.title}
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-[760px] text-[15px] sm:text-[22px] lg:text-[16px] font-semibold leading-[1.6] text-white">
            {content.desc}
          </p>

          {/* Social icons */}
          <div className="mt-10 flex items-center justify-center gap-4 sm:gap-6">
            {socialLinks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                aria-label={item.label}
                className="flex h-[72px] w-[72px] sm:h-[92px] sm:w-[92px] lg:h-[90px] lg:w-[90px] items-center justify-center rounded-full bg-white/10 text-[30px] sm:text-[40px] lg:text-[38px] text-white transition duration-300 hover:bg-white hover:text-black"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black px-4 py-9 text-center sm:px-6 lg:px-10">
        <h3 className="text-[18px] sm:text-[24px] lg:text-[16px] font-medium text-white">
          {content.terms}
        </h3>

        <p className="mt-3 text-[12px] sm:text-[16px] lg:text-[12px] font-medium leading-[1.5] text-white/35">
          {content.copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
