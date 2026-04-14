import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Tab = () => {
  const { language } = useLanguage();

  const tabs = [
    {
      name: {
        en: "Auto DP",
        bn: "অটো ডিপোজিট",
      },
      path: "/auto-deposit",
    },
    {
      name: {
        en: "Manual DP",
        bn: "ম্যানুয়াল ডিপোজিট",
      },
      path: "/deposit",
    },
    {
      name: {
        en: "Withdraw",
        bn: "উত্তোলন",
      },
      path: "/withdraw",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 bg-[#09442b] p-2 shadow-md">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-yellow-500 text-white shadow"
                  : "bg-transparent text-white/95 hover:bg-yellow-500/80 hover:text-white"
              }`
            }
          >
            {language === "Bangla" ? tab.name.bn : tab.name.en}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Tab;
