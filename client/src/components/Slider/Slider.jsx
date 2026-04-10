import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const Slider = () => {
  const images = [
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/4588cdaf-7d5d-4281-38a9-612ec9c66f00/public",
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/1c683c87-8034-4bdd-d1ab-176742ec0400/public",
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/86a2bd48-e943-4b63-d5fb-c68d83eeab00/public",
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/300bb928-b649-488d-6ef5-f4bad52e5100/public",
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/d3f2577c-984c-4fa7-4a92-df1b08de6100/public",
    "https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/300bb928-b649-488d-6ef5-f4bad52e5100/public",
  ];

  return (
    <div className=" mt-3">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={12}
        slidesPerView={1.5}
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 2000, // 🔥 2 sec autoplay
          disableOnInteraction: false,
        }}
        // pagination={{
        //   clickable: true,
        // }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="rounded-xl overflow-hidden">
              <img
                src={img}
                alt="slider"
                className="w-full h-40 object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
