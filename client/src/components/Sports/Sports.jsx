import React from "react";
import {
  FaFutbol,
  FaBasketballBall,
  FaTableTennis,
  FaVolleyballBall,
  FaBaseballBall,
} from "react-icons/fa";
import { GiCricketBat, GiBoxingGlove } from "react-icons/gi";

const Sports = () => {
  const sportsList = [
    { name: "Football", icon: <FaFutbol /> },
    { name: "Cricket", icon: <GiCricketBat /> },
    { name: "Basketball", icon: <FaBasketballBall /> },
    { name: "Tennis", icon: <FaTableTennis /> },
    // { name: "Volleyball", icon: <FaVolleyballBall /> },
    // { name: "Baseball", icon: <FaBaseballBall /> },
    // { name: "Boxing", icon: <GiBoxingGlove /> },
  ];

  return (
    <div className=" px-3 py-4">
      {/* Title */}
      <div className="flex items-center mb-4">
        <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
        <h2 className="text-yellow-400 font-semibold text-lg">Sports</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-1">
        {sportsList.map((sport, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center bg-[#005C40] rounded-sm py-4 cursor-pointer transition"
          >
            {/* Icon */}
            <div className="text-4xl text-yellow-400 mb-2">{sport.icon}</div>

            {/* Name */}
            <p className="text-white text-md text-center">{sport.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sports;
