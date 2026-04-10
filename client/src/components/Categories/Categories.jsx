import React, { useRef, useState } from "react";
import Sports from "../Sports/Sports";

const Categories = () => {
  const categories = [
    {
      name: "Sports",
      icon: "https://beit365.bet/assets/images/home-page-menu/Sports.svg",
    },
    {
      name: "Hot Games",
      icon: "https://beit365.bet/assets/images/home-type/exclusive.svg",
    },
    {
      name: "Casino",
      icon: "https://beit365.bet/assets/images/home-page-menu/Casino.svg",
    },
    {
      name: "Slots",
      icon: "https://beit365.bet/assets/images/home-page-menu/Slot.svg",
    },
    {
      name: "Type",
      icon: "https://beit365.bet/assets/images/home-page-menu/Table.svg",
    },
    {
      name: "Fishing",
      icon: "https://beit365.bet/assets/images/home-page-menu/Fishing.svg",
    },
    {
      name: "Lottery",
      icon: "https://beit365.bet/assets/images/home-page-menu/Lottery.svg",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
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
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div>
      {/* Categories Scroll */}
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
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`flex flex-col items-center justify-center min-w-[85px] py-4 cursor-pointer relative transition-all duration-200
                ${isActive ? "bg-[#006c4a]" : ""}
              `}
            >
              <img
                src={cat.icon}
                alt={cat.name}
                className={`w-14 h-14 mb-1 bg-[#003F2C] rounded-full p-2 ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}
              />

              <span className={`text-md font-bold text-yellow-400`}>
                {cat.name}
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
      </div>

      {/* Active Text */}
      <div className="px-3 py-2">
        {categories[activeIndex].name !== "Sports" && (
          <p className="text-yellow-400 font-semibold text-sm">
            {categories[activeIndex].name}
          </p>
        )}
      </div>

      {/* 🔥 Dynamic Component Render */}
      <div>{categories[activeIndex].name === "Sports" && <Sports />}</div>
    </div>
  );
};

export default Categories;
