import React, { useEffect, useMemo, useState } from "react";
import {
  Home,
  Trophy,
  Gift,
  Users,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { PiPhoneCallBold } from "react-icons/pi";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { FaPlayCircle } from "react-icons/fa";
import { useNavigate } from "react-router";
import axios from "axios";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_PROVIDER_KEY = import.meta.env.VITE_ORACLE_TOKEN;

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const { language, isBangla, changeLanguage } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [sportsList, setSportsList] = useState([]);

  const [providerPanelOpen, setProviderPanelOpen] = useState(false);
  const [sportsPanelOpen, setSportsPanelOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeKey, setActiveKey] = useState("");

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingSports, setLoadingSports] = useState(false);

  const getText = (textObj) => {
    if (!textObj) return "";
    return language === "English"
      ? textObj.en || textObj.bn || ""
      : textObj.bn || textObj.en || "";
  };

  const getCategoryIconUrl = (category) => {
    if (!category) return "";

    if (category.iconImageUrl) return category.iconImageUrl;

    if (category.iconImage) {
      const normalized = String(category.iconImage).replace(/\\/g, "/");
      if (/^https?:\/\//i.test(normalized)) return normalized;
      const base =
        import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || "";
      return `${base.replace(/\/$/, "")}/${normalized.replace(/^\/+/, "")}`;
    }

    return "";
  };

  const getSportsIconUrl = (sport) => {
    if (!sport) return "";

    if (sport.iconImageUrl) return sport.iconImageUrl;

    if (sport.iconImage) {
      const normalized = String(sport.iconImage).replace(/\\/g, "/");
      if (/^https?:\/\//i.test(normalized)) return normalized;
      const base =
        import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || "";
      return `${base.replace(/\/$/, "")}/${normalized.replace(/^\/+/, "")}`;
    }

    return "";
  };

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get("/api/game-categories");
        setCategories(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchOracleProviders = async () => {
      try {
        const res = await axios.get(ORACLE_PROVIDER_API, {
          headers: {
            "x-api-key": ORACLE_PROVIDER_KEY,
          },
        });
        setOracleProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch oracle providers:", error);
        setOracleProviders([]);
      }
    };

    fetchCategories();
    fetchOracleProviders();
  }, [open]);

  const providerNameMap = useMemo(() => {
    const map = new Map();
    for (const item of oracleProviders) {
      if (item?.providerCode) {
        map.set(
          String(item.providerCode),
          item?.providerName || item?.providerCode,
        );
      }
    }
    return map;
  }, [oracleProviders]);

  const getProviderName = (providerId) => {
    return providerNameMap.get(String(providerId)) || providerId || "";
  };

  const loadSports = async () => {
    try {
      setLoadingSports(true);
      const res = await api.get("/api/sports");
      setSportsList(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch sports:", error);
      setSportsList([]);
    } finally {
      setLoadingSports(false);
    }
  };

  const fixedMenus = useMemo(
    () => [
      {
        key: "home",
        label: { bn: "হোম", en: "Home" },
        icon: Home,
        onClick: () => {
          setActiveKey("home");
          setOpen(false);
          setProviderPanelOpen(false);
          setSportsPanelOpen(false);
          navigate("/");
        },
      },
      {
        key: "sports",
        label: { bn: "স্পোর্টস", en: "Sports" },
        icon: Trophy,
        onClick: async () => {
          setActiveKey("sports");
          setProviderPanelOpen(false);
          setSportsPanelOpen(true);
          await loadSports();
        },
      },
    ],
    [navigate, setOpen],
  );

  const extraMenus = useMemo(
    () => [
      {
        key: "promotions",
        label: { bn: "প্রোমোশন", en: "Promotions" },
        icon: Gift,
        onClick: () => {
          setActiveKey("promotions");
          setOpen(false);
          setProviderPanelOpen(false);
          setSportsPanelOpen(false);
          navigate("/promotions");
        },
      },
      {
        key: "referral",
        label: { bn: "রেফারেল প্রোগ্রাম", en: "Referral Program" },
        icon: Users,
        onClick: () => {
          setActiveKey("referral");
          setOpen(false);
          setProviderPanelOpen(false);
          setSportsPanelOpen(false);
          navigate("/referral-program");
        },
      },
    ],
    [navigate, setOpen],
  );

  const handleDynamicCategoryClick = async (category) => {
    try {
      setActiveKey(category._id);
      setSelectedCategory(category);
      setSportsPanelOpen(false);
      setProviderPanelOpen(true);
      setLoadingProviders(true);

      const res = await api.get(
        `/api/game-providers?categoryId=${category._id}&status=active`,
      );
      setProviders(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleProviderClick = (provider) => {
    if (!selectedCategory?._id || !provider?._id) return;
    setOpen(false);
    setProviderPanelOpen(false);
    setSportsPanelOpen(false);
    navigate(
      `/category/${selectedCategory._id}/games?provider=${provider._id}`,
    );
  };

  const handleSportsItemClick = (sport) => {
    if (!sport?.gameId) return;
    setOpen(false);
    setProviderPanelOpen(false);
    setSportsPanelOpen(false);
    navigate(`/sports/${sport.gameId}`);
  };

  const closeAll = () => {
    setOpen(false);
    setProviderPanelOpen(false);
    setSportsPanelOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeAll}
        className={`absolute inset-0 bg-black/60 z-40 transition-all duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Main Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full w-[260px] bg-[#09442b] z-60 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 text-2xl flex justify-center font-bold text-white border-b border-white/10 shrink-0">
          <img
            src="https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/7cbc1ab7-a435-460a-2a83-e69643e58000/public"
            className="w-32 h-12"
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto text-xl [scrollbar-width:none]">
          {fixedMenus.map((item) => (
            <MenuItem
              key={item.key}
              Icon={item.icon}
              label={getText(item.label)}
              onClick={item.onClick}
              isActive={activeKey === item.key}
            />
          ))}

          {loadingCategories ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-14 rounded bg-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <MenuItem
                key={category._id}
                label={getText(category.categoryName)}
                onClick={() => handleDynamicCategoryClick(category)}
                hasArrow
                isActive={activeKey === category._id}
                imageIcon={getCategoryIconUrl(category)}
              />
            ))
          )}

          <Divider />

          {extraMenus.map((item) => (
            <MenuItem
              key={item.key}
              Icon={item.icon}
              label={getText(item.label)}
              onClick={item.onClick}
              isActive={activeKey === item.key}
            />
          ))}

          <Divider />

          {/* Cards */}
          <div className="p-3 space-y-4">
            <InfoCard
              icon={<Users className="text-white w-6 h-6" />}
              title={isBangla ? "এফিলিয়েট প্রোগ্রাম" : "Affiliate Program"}
            />

            <InfoCard
              icon={<MessageSquare className="text-white w-6 h-6" />}
              title="24/7 LiveChat"
              subtitle={
                isBangla
                  ? "২৪/৭ মানসম্মত সেবা"
                  : "Provides 24/7 Quality service"
              }
            />

            <InfoCard
              icon={<PiPhoneCallBold className="text-white w-6 h-6" />}
              title={isBangla ? "ফোরাম" : "Forum"}
            />

            <InfoCard
              icon={
                <HiOutlineExclamationCircle className="text-white w-6 h-6" />
              }
              title={isBangla ? "হেল্প" : "Help"}
            />

            <InfoCard
              icon={<FaPlayCircle className="text-white w-6 h-6" />}
              title={isBangla ? "টিউটোরিয়াল" : "Tutorials"}
            />
          </div>
        </div>

        {/* Language Switch */}
        <div className="shrink-0 p-3 border-t border-white/10 bg-[#083824]">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => changeLanguage("Bangla")}
              className={`h-10 rounded-md text-sm font-bold cursor-pointer transition ${
                isBangla
                  ? "bg-yellow-400 text-[#063c2b]"
                  : "bg-[#0F6A45] text-white"
              }`}
            >
              বাংলা
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("English")}
              className={`h-10 rounded-md text-sm font-bold cursor-pointer transition ${
                !isBangla
                  ? "bg-yellow-400 text-[#063c2b]"
                  : "bg-[#0F6A45] text-white"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Provider Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-[150px] bg-[#063c2b] z-[60] transform transition-transform duration-300 ease-in-out ${
          open && providerPanelOpen
            ? "translate-x-[260px]"
            : "translate-x-0 -ml-[220px]"
        } flex flex-col border-l border-white/10`}
      >
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] px-4 py-4">
          {loadingProviders ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="border-b border-white/10 pb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/10 animate-pulse" />
                  <div className="w-12 h-4 mx-auto mt-4 rounded bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="space-y-6">
              {providers.map((provider) => (
                <button
                  key={provider._id}
                  type="button"
                  onClick={() => handleProviderClick(provider)}
                  className="w-full cursor-pointer border-b border-white/10 pb-6 flex flex-col items-center text-center hover:opacity-85 transition"
                >
                  <div className="w-[72px] h-[72px] flex items-center justify-center">
                    <img
                      src={provider?.providerIconUrl}
                      alt={getProviderName(provider?.providerId)}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <p className="mt-3 text-yellow-400 text-[14px] font-medium uppercase break-words">
                    {getProviderName(provider?.providerId)}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-white/70 text-sm px-3">
              {isBangla
                ? "এই ক্যাটাগরির জন্য কোনো প্রোভাইডার পাওয়া যায়নি"
                : "No providers found for this category"}
            </div>
          )}
        </div>
      </div>

      {/* Sports Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-[150px] bg-[#063c2b] z-[60] transform transition-transform duration-300 ease-in-out ${
          open && sportsPanelOpen
            ? "translate-x-[260px]"
            : "translate-x-0 -ml-[220px]"
        } flex flex-col border-l border-white/10`}
      >
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] px-4 py-4">
          {loadingSports ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="border-b border-white/10 pb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/10 animate-pulse" />
                  <div className="w-12 h-4 mx-auto mt-4 rounded bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : sportsList.length > 0 ? (
            <div className="space-y-6">
              {sportsList.map((sport) => (
                <button
                  key={sport._id}
                  type="button"
                  onClick={() => handleSportsItemClick(sport)}
                  className="w-full cursor-pointer border-b border-white/10 pb-6 flex flex-col items-center text-center hover:opacity-85 transition"
                >
                  <div className="w-[72px] h-[72px] flex items-center justify-center">
                    {getSportsIconUrl(sport) ? (
                      <img
                        src={getSportsIconUrl(sport)}
                        alt={getText(sport?.name)}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Trophy className="w-12 h-12 text-yellow-400" />
                    )}
                  </div>

                  <p className="mt-3 text-yellow-400 text-[14px] font-medium break-words">
                    {getText(sport?.name) || "Sport"}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-white/70 text-sm px-3">
              {isBangla ? "কোনো স্পোর্টস পাওয়া যায়নি" : "No sports found"}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const MenuItem = ({
  Icon,
  label,
  onClick,
  hasArrow = false,
  isActive = false,
  imageIcon = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative w-full flex items-center justify-between px-6 py-5 border-b border-white/10 transition cursor-pointer text-left ${
      isActive ? "bg-[#3a3a3a]" : "hover:bg-green-700/40"
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-0 h-full w-[6px] bg-[#00a86b]" />
    )}

    <div className="flex items-center gap-3">
      {imageIcon ? (
        <div
          className={`w-12 h-12 p-2 rounded-full flex items-center justify-center ${
            isActive ? "bg-[#0F6A45]" : ""
          }`}
        >
          <img
            src={imageIcon}
            alt={label}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <Icon className="w-10 h-10 text-white p-1 rounded-full" />
      )}

      <span className="text-yellow-400 text-[15px]">{label}</span>
    </div>

    {hasArrow && <ChevronRight className="w-4 h-4 text-white/70 shrink-0" />}
  </button>
);

const Divider = () => <div className="h-3 bg-black/40 my-2" />;

const InfoCard = ({ icon, title, subtitle }) => (
  <div className="border border-green-400/30 rounded-lg p-4 flex gap-4 bg-[#0F6A45] hover:bg-[#0d5a3a] cursor-pointer transition">
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B5E3C] shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-yellow-400 text-sm font-medium">{title}</p>
      {subtitle ? (
        <p className="text-xs text-gray-300 mt-1">{subtitle}</p>
      ) : null}
    </div>
  </div>
);

export default Sidebar;
