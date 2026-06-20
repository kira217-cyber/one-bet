import React, { useEffect, useMemo, useRef, useState } from "react";
import Sports from "../Sports/Sports";
import HotGames from "../HotGames/HotGames";
import Providers from "../Providers/Providers";
import { api } from "../../api/axios";
import { useLanguage } from "../../context/LanguageProvider";
import hot from "../../assets/hot.gif";
import sports from "../../assets/sports.png";

const Categories = () => {
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const { language } = useLanguage();

  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/client-games/categories");

        setDynamicCategories(
          Array.isArray(res?.data?.data) ? res.data.data : [],
        );
      } catch (error) {
        console.error("Failed to fetch game categories:", error);
        setDynamicCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fixedCategories = useMemo(
    () => [
      {
        type: "fixed",
        name: { bn: "স্পোর্টস", en: "Sports" },
        title: { bn: "স্পোর্টস", en: "Sports" },
        icon: sports,
        key: "sports",
      },
      {
        type: "fixed",
        name: { bn: "হট গেমস", en: "Hot Games" },
        title: { bn: "হট গেমস", en: "Hot Games" },
        icon: hot,
        key: "hot-games",
      },
    ],
    [],
  );

  const categories = useMemo(() => {
    const mappedDynamic = dynamicCategories.map((item) => ({
      type: "dynamic",
      _id: item._id,
      name: item.categoryName,
      title: item.categoryTitle,
      icon: item.iconImageUrl || item.iconUrl || item.iconImage || "",
      status: item.status,
      order: item.order,
      key: item._id,
    }));

    return [...fixedCategories, ...mappedDynamic];
  }, [dynamicCategories, fixedCategories]);

  const getText = (textObj) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;

    return language === "English"
      ? textObj.en || textObj.bn || ""
      : textObj.bn || textObj.en || "";
  };

  const activeCategory = categories[activeIndex];

  useEffect(() => {
    if (activeIndex > categories.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, categories.length]);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;

    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !scrollRef.current) return;

    e.preventDefault();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;

    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto border-b border-[#0f6b52] cursor-grab no-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {categories.map((cat, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={cat.key}
              onClick={() => setActiveIndex(index)}
              className={`flex flex-col items-center justify-center min-w-[85px] py-4 px-2 cursor-pointer relative transition-all duration-200 ${
                isActive ? "bg-[#006c4a]" : ""
              }`}
            >
              <div className="w-14 h-14 mb-1 bg-[#003F2C] rounded-full p-2 overflow-hidden flex items-center justify-center">
                {cat.icon ? (
                  <img
                    src={cat.icon}
                    alt={getText(cat.name)}
                    className={`w-full h-full object-contain ${
                      isActive ? "opacity-100" : "opacity-60"
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`w-full h-full rounded-full bg-[#006c4a] ${
                      isActive ? "opacity-100" : "opacity-60"
                    }`}
                  />
                )}
              </div>

              <span className="text-md font-bold text-yellow-400 text-center leading-tight whitespace-nowrap">
                {getText(cat.name)}
              </span>

              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-yellow-400"></div>
              )}

              {isActive && (
                <div className="absolute bottom-[6px] w-0 h-0 border-r-[6px] border-l-[6px] border-b-[6px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
              )}
            </div>
          );
        })}

        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`category-loading-${index}`}
              className="flex flex-col items-center justify-center min-w-[85px] py-4 px-2"
            >
              <div className="w-14 h-14 mb-1 bg-[#003F2C] rounded-full animate-pulse" />
              <div className="h-4 w-14 bg-[#003F2C] rounded animate-pulse" />
            </div>
          ))}
      </div>

      <div>
        {activeCategory?.key === "sports" && <Sports />}
        {activeCategory?.key === "hot-games" && <HotGames />}

        {activeCategory?.type === "dynamic" && (
          <Providers
            categoryId={activeCategory?._id}
            categoryTitle={getText(activeCategory?.title)}
          />
        )}
      </div>
    </div>
  );
};

export default Categories;
