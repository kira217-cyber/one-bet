import React from "react";
import { Download, MessageCircle } from "lucide-react";
import { BiMenuAltLeft } from "react-icons/bi";
import { Link } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Navber = ({ setOpen }) => {
  const { isBangla } = useLanguage();

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] text-white px-3 py-2 flex items-center justify-between bg-[#01372A]">
        {/* Left */}
        <div className="flex items-center gap-3">
          <BiMenuAltLeft
            onClick={() => setOpen(true)}
            className="w-8 h-8 text-yellow-400 cursor-pointer"
          />

          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/7cbc1ab7-a435-460a-2a83-e69643e58000/public"
              className="w-28 h-12"
            />

            <img
              src="https://beit365.bet/assets/images/sponser-icons/deccan-gladiators%20(1).png"
              className="w-12 h-10"
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
