import React, { useEffect, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const Footer = () => {
  const { isBangla } = useLanguage();
  const [siteIdentity, setSiteIdentity] = useState(null);
  const [footerContent, setFooterContent] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [siteRes, footerRes] = await Promise.all([
          api.get("/api/site-identity"),
          api.get("/api/footer-content"),
        ]);

        setSiteIdentity(siteRes?.data?.data || null);
        setFooterContent(footerRes?.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
        setSiteIdentity(null);
        setFooterContent(null);
      }
    };

    fetchAll();
  }, []);

  const getText = (obj) => (isBangla ? obj?.bn || "" : obj?.en || "");

  const logoSrc = siteIdentity?.logo
    ? siteIdentity.logo.startsWith("http")
      ? siteIdentity.logo
      : `${import.meta.env.VITE_APP_URL}${siteIdentity.logo}`
    : null;

  const fileUrl = (path) =>
    path ? `${import.meta.env.VITE_APP_URL}${path}` : "";

  return (
    <div className="bg-[#063D2E] text-white px-4 py-6 text-sm">
      <div>
        <h2 className="text-yellow-400 font-semibold text-xl mb-3">
          {getText(footerContent?.paymentTitle)}
        </h2>

        <div className="grid grid-cols-4 gap-4 items-center opacity-80">
          {(footerContent?.paymentImages || []).map((img) => (
            <img
              key={img}
              src={fileUrl(img)}
              className="h-6 object-contain"
              alt=""
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 mt-6 gap-6">
        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {getText(footerContent?.responsibleTitle)}
          </h2>
          <div className="flex gap-4 opacity-80 flex-wrap">
            {(footerContent?.responsibleImages || []).map((img) => (
              <img
                key={img}
                src={fileUrl(img)}
                className="h-8 object-contain"
                alt=""
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {getText(footerContent?.communityTitle)}
          </h2>
          <div className="flex gap-4 opacity-80 flex-wrap">
            {(footerContent?.communityImages || []).map((img) => (
              <img
                key={img}
                src={fileUrl(img)}
                className="h-8 object-contain"
                alt=""
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 my-6"></div>

      <div className="grid grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {getText(footerContent?.licenseTitle)}
          </h2>
          {footerContent?.licenseImage ? (
            <img
              src={fileUrl(footerContent.licenseImage)}
              className="h-10 opacity-80 object-contain"
              alt=""
            />
          ) : null}
        </div>

        <div>
          <h2 className="text-yellow-400 font-semibold text-xl mb-3">
            {getText(footerContent?.appDownloadTitle)}
          </h2>

          {footerContent?.appDownloadImage ? (
            footerContent?.appDownloadLink ? (
              <a
                href={footerContent.appDownloadLink}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={fileUrl(footerContent.appDownloadImage)}
                  className="h-10 object-contain cursor-pointer"
                  alt=""
                />
              </a>
            ) : (
              <img
                src={fileUrl(footerContent.appDownloadImage)}
                className="h-10 object-contain"
                alt=""
              />
            )
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/20 my-6"></div>

      <div className="text-gray-300 leading-relaxed text-sm">
        <h3 className="font-semibold text-gray-200 mb-2">
          {getText(footerContent?.descriptionHeading)}
        </h3>

        <p>{getText(footerContent?.descriptionText1)}</p>
        <p className="mt-2">{getText(footerContent?.descriptionText2)}</p>
        <p className="mt-2">{getText(footerContent?.descriptionText3)}</p>
      </div>

      <div className="border-t border-white/20 my-6"></div>

      <div className="flex justify-start gap-4 items-center">
        <div>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="site-logo"
              className="max-w-[120px] h-auto object-contain"
            />
          ) : null}
        </div>
        <div>
          <h3 className="text-xl font-bold text-yellow-400">
            {getText(footerContent?.bottomHeading)}
          </h3>
          <p className="text-sm text-gray-300">
            {getText(footerContent?.bottomCopyright)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
