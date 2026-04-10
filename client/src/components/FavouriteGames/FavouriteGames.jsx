import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const FavouriteGames = () => {
  const games = [
    {
      name: "Mega Wheel",
      img: "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/8899fb1a-ed8e-4ee2-682e-6a3b1371f900/public",
    },
    {
      name: "Boxing King",
      img: "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/1099d66e-118e-40e6-73b0-30a364a87300/public",
    },
    {
      name: "Fortune Gems",
      img: "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/140ad6c5-5867-4e40-1460-ccf21b10fd00/public",
    },
  ];

  return (
    <div className="px-3 py-4 bg-[#005C40]">
      {/* Title */}
      <div className="flex items-center mb-3">
        <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
        <h2 className="text-yellow-400 font-semibold text-lg">
          Favourite Games
        </h2>
      </div>

      {/* Slider */}
      <Swiper
        spaceBetween={12}
        slidesPerView={2.3}
        breakpoints={{
          640: {
            slidesPerView: 2.6,
          },
        }}
      >
        {games.map((game, index) => (
          <SwiperSlide key={index}>
            <div className="bg-[#0B3B2E] rounded-sm overflow-hidden shadow-md">
              <img
                src={game.img}
                alt={game.name}
                className="w-full h-[150px]"
              />

              {/* Game Name */}
              <div className="px-4 py-1 bg-[#111111]">
                <p className="text-white text-sm font-medium truncate">
                  {game.name}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FavouriteGames;
