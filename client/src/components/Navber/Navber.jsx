import React, { useEffect, useState } from "react";
import { Download, MessageCircle } from "lucide-react";
import { BiMenuAltLeft } from "react-icons/bi";
import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageProvider";
import { api } from "../../api/axios";

const Navber = ({ setOpen }) => {
  const { isBangla } = useLanguage();
  const [siteIdentity, setSiteIdentity] = useState(null);

  useEffect(() => {
    const fetchSiteIdentity = async () => {
      try {
        const res = await api.get("/api/site-identity");
        setSiteIdentity(res?.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch site identity:", error);
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

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] text-white px-3 py-2 flex items-center justify-between bg-[#005C40]">
        {/* Left */}
        <div className="flex items-center gap-3">
          <BiMenuAltLeft
            onClick={() => setOpen(true)}
            className="w-8 h-8 text-yellow-400 cursor-pointer"
          />

          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="site-logo"
              className="w-28 h-12 object-contain"
            />

            <img
              src="https://beit365.bet/assets/images/sponser-icons/deccan-gladiators%20(1).png"
              alt="sponsor"
              className="w-12 h-10 object-contain"
            />
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex flex-col items-center font-bold text-yellow-400">
            <Download className="w-8 h-8" />
            <span>{isBangla ? "অ্যাপ" : "App"}</span>
          </div>

          <div className="flex flex-col items-center font-bold text-yellow-400">
            <MessageCircle className="w-8 h-8" />
            <span>{isBangla ? "ফোরাম" : "Forum"}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navber;
