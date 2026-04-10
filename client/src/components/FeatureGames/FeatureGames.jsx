import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const FeatureGames = () => {
  const games = [
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/f48baeb0-ccea-4647-df6c-2849efeba800/public",
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/ecd04a18-73b5-488b-1473-663f28d94600/public",
  ];

  return (
    <div className="px-3 py-4 bg-[#005C40]">
      {/* Title */}
      <div className="flex items-center mb-3">
        <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
        <h2 className="text-yellow-400 font-semibold text-lg">
          Featured Games
        </h2>
      </div>

      {/* Slider */}
      <Swiper
        spaceBetween={12}
        slidesPerView={1.1}
        breakpoints={{
          640: {
            slidesPerView: 1.2,
          },
        }}
      >
        {games.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="rounded-sm overflow-hidden shadow-lg ">
              <img
                src={img}
                alt="game"
                className="w-full h-[180px] object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeatureGames;
