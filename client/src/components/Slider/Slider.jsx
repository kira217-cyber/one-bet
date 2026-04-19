import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { api } from "../../api/axios";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const Slider = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await api.get("/api/sliders");
        const sliderData = Array.isArray(res?.data?.data) ? res.data.data : [];

        const formattedImages = sliderData
          .filter((item) => item?.image)
          .map((item) =>
            item.image.startsWith("http")
              ? item.image
              : `${import.meta.env.VITE_APP_URL}${item.image}`,
          );

        setImages(formattedImages);
      } catch (error) {
        console.error("Failed to fetch sliders:", error);
        setImages([]);
      }
    };

    fetchSliders();
  }, []);

  if (!images.length) return null;

  return (
    <div className="">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={12}
        slidesPerView={1.5}
        centeredSlides={true}
        loop={images.length > 1}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
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
