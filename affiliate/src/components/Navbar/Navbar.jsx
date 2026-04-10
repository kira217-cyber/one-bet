import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, ArrowLeftCircle } from "lucide-react";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Navbar = () => {
  const { language, changeLanguage, isBangla } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const navItems = isBangla
    ? [
        { label: "হোম", href: "/" },
        { label: "ক্যাম্পেইন", href: "/campaigns" },
        { label: "হেল্প সেন্টার", href: "/help-center" },
        { label: "যোগাযোগ", href: "/contact" },
        { label: "কমিউনিটি", href: "/community" },
      ]
    : [
        { label: "HOME", href: "/" },
        { label: "CAMPAIGNS", href: "/campaigns" },
        { label: "HELP CENTER", href: "/help-center" },
        { label: "CONTACT US", href: "/contact" },
        { label: "COMMUNITY", href: "/community" },
      ];

  const desktopLoginText = isBangla ? "লগইন/রেজিস্টার" : "LOGIN/REGISTER";
  const mobileLoginText = isBangla ? "লগ-ইন" : "LOG-IN";
  const mobileRegisterText = isBangla ? "রেজিস্টার" : "REGISTER";
  const backText = isBangla ? "মূল মেনুতে ফিরে যান" : "Back to Main Menu";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const Logo = ({ mobile = false }) => (
    <NavLink to="/" className="flex items-center select-none shrink-0">
      <img
        src="https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/7cbc1ab7-a435-460a-2a83-e69643e58000/public"
        alt="bet365 logo"
        className={`h-auto object-contain ${
          mobile ? "w-[115px] sm:w-[130px]" : "w-[120px] xl:w-[135px]"
        }`}
      />
    </NavLink>
  );

  const BangladeshFlag = ({ className = "w-6 h-6" }) => (
    <div
      className={`${className} relative overflow-hidden rounded-full border border-white/15 bg-[#006a4e] flex items-center justify-center`}
    >
      <div className="w-3 h-3 rounded-full bg-[#f42a41]" />
    </div>
  );

  const UsaFlag = ({ className = "w-6 h-6" }) => (
    <div
      className={`${className} overflow-hidden rounded-full border border-white/15 relative`}
      style={{
        background:
          "repeating-linear-gradient(to bottom, #b22234 0px, #b22234 2px, #ffffff 2px, #ffffff 4px)",
      }}
    >
      <div className="absolute top-0 left-0 w-[45%] h-[52%] bg-[#3c3b6e]" />
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 z-40 w-full bg-black text-white">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="flex h-[82px] items-center justify-between">
            {/* Left logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-6">
              <nav className="hidden lg:flex items-center gap-10 xl:gap-16 mr-10">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className="text-[13px] xl:text-[14px] font-medium uppercase tracking-[0.04em] text-white transition hover:text-white/80"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <NavLink
                to="/login"
                className="inline-flex h-[36px] min-w-[130px] items-center justify-center rounded-[10px] border border-[#008c55] px-5 text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:bg-[#006b42]"
              >
                {desktopLoginText}
              </NavLink>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setLangDropdownOpen((prev) => !prev)}
                  className="flex h-[38px] min-w-[60px] items-center justify-center gap-2 rounded-full bg-[#007c59] px-3 transition hover:bg-[#0a8a66]"
                >
                  {language === "English" ? (
                    <UsaFlag className="w-7 h-7" />
                  ) : (
                    <BangladeshFlag className="w-7 h-7" />
                  )}

                  <ChevronDown
                    size={15}
                    className={`transition duration-200 ${
                      langDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-[210px] overflow-hidden rounded-[14px] border border-white/10 bg-[#0a0a0a] shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                    <button
                      onClick={() => handleLanguageChange("Bangla")}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/5 ${
                        language === "Bangla" ? "bg-white/[0.04]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BangladeshFlag className="w-6 h-6" />
                        <span className="text-sm font-medium">বাংলা</span>
                      </div>
                      {language === "Bangla" && (
                        <span className="text-xs font-semibold text-[#12b76a]">
                          Active
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleLanguageChange("English")}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bgwhite/5 ${
                        language === "English" ? "bg-white/[0.04]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UsaFlag className="w-6 h-6" />
                        <span className="text-sm font-medium">English</span>
                      </div>
                      {language === "English" && (
                        <span className="text-xs font-semibold text-[#12b76a]">
                          Active
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile right */}
            <div className="flex lg:hidden items-center gap-4">
              <NavLink
                to="/login"
                className="inline-flex h-[34px] items-center justify-center rounded-[9px] border border-[#008c55] px-6 text-[12px] font-semibold uppercase tracking-[0.03em] text-white"
              >
                {desktopLoginText}
              </NavLink>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center text-white"
                aria-label="Open mobile menu"
              >
                <Menu size={34} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navbar fixed হওয়ায় content overlap ঠেকাতে spacer */}
      <div className="h-[82px]" />

      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 h-full w-full max-w-[398px] bg-black transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col px-6 pt-7 pb-8">
            <div className="flex items-start justify-between">
              <Logo mobile />

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 flex h-10 w-10 items-center justify-center text-white"
                aria-label="Close mobile menu"
              >
                <X size={34} strokeWidth={2.1} />
              </button>
            </div>

            <div className="mt-16 flex flex-col gap-10">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[24px] font-normal uppercase leading-none tracking-[-0.01em] text-white"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-10">
              <p className="mb-4 text-[12px] uppercase tracking-[0.18em] text-white/50">
                {isBangla ? "ভাষা নির্বাচন" : "Select Language"}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleLanguageChange("Bangla")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] border px-4 py-3 text-sm font-semibold transition ${
                    language === "Bangla"
                      ? "border-[#00a651] bg-[#003d22] text-white"
                      : "border-white/10 bg-[#111] text-white"
                  }`}
                >
                  <BangladeshFlag className="w-5 h-5" />
                  বাংলা
                </button>

                <button
                  onClick={() => handleLanguageChange("English")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] border px-4 py-3 text-sm font-semibold transition ${
                    language === "English"
                      ? "border-[#00a651] bg-[#003d22] text-white"
                      : "border-white/10 bg-[#111] text-white"
                  }`}
                >
                  <UsaFlag className="w-5 h-5" />
                  English
                </button>
              </div>
            </div>

            <div className="mt-auto">
              <div className="grid grid-cols-2 gap-4">
                <NavLink
                  to="/login"
                  className="inline-flex h-[56px] items-center justify-center rounded-[9px] border border-[#00a651] bg-[#005323] text-[14px] font-bold uppercase tracking-[0.14em] text-white"
                >
                  {mobileLoginText}
                </NavLink>

                <NavLink
                  to="/register"
                  className="inline-flex h-[56px] items-center justify-center rounded-[9px] bg-[#ffd21f] text-[14px] font-bold uppercase tracking-[0.14em] text-black"
                >
                  {mobileRegisterText}
                </NavLink>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mt-8 flex items-center gap-3 text-white"
              >
                <ArrowLeftCircle size={22} strokeWidth={1.8} />
                <span className="text-[16px] font-medium">{backText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
