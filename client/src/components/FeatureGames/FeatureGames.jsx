import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";


const FeatureGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingId, setCheckingId] = useState("");
  const { isBangla } = useLanguage();

  const navigate = useNavigate();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

  const loadFeaturedGames = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/featured-games");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load featured games");
      }

      setGames(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load featured games",
      );
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedGames();
  }, []);

  const handleClick = async (item) => {
    if (!item?.gameId) {
      toast.error("Game ID not found");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      setCheckingId(String(item._id || item.gameId));

      let currentUser = reduxUser || null;

      try {
        const { data } = await api.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        currentUser = data?.user || data?.data || currentUser;
      } catch {
        currentUser = reduxUser || null;
      }

      const isActive = currentUser?.isActive === true;

      if (!currentUser) {
        toast.error("User profile not found");
        navigate("/login");
        return;
      }

      if (!isActive) {
        toast.error("Your account is not active");
        navigate("/");
        return;
      }

      navigate(`/featured-games/${item.gameId}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to continue",
      );
    } finally {
      setCheckingId("");
    }
  };

  return (
    <div className="px-3 py-4 bg-[#005C40]">
      <div className="flex items-center mb-3">
        <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
        <h2 className="text-yellow-400 font-semibold text-lg">
          {isBangla ? "ফিচারড গেমস" : "Featured Games"}
        </h2>
      </div>

      {loading ? (
        <div className="rounded-sm overflow-hidden bg-[#0b6b4b] animate-pulse h-[180px]" />
      ) : games.length ? (
        <Swiper
          spaceBetween={12}
          slidesPerView={1.1}
          breakpoints={{
            640: {
              slidesPerView: 1.2,
            },
          }}
        >
          {games.map((item) => {
            const imageUrl = item?.bannerImage
              ? `${import.meta.env.VITE_APP_URL}${item.bannerImage}`
              : "";

            const isChecking = checkingId === String(item._id || item.gameId);

            return (
              <SwiperSlide key={item._id}>
                <button
                  type="button"
                  onClick={() => handleClick(item)}
                  disabled={!!checkingId}
                  className="w-full rounded-sm overflow-hidden shadow-lg cursor-pointer disabled:opacity-70"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="featured-game"
                      className="w-full h-[180px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[180px] bg-[#0b6b4b] flex items-center justify-center text-white/70">
                      No Image
                    </div>
                  )}

                  {isChecking && (
                    <div className="py-2 text-center text-xs bg-black/80 text-white">
                      Checking...
                    </div>
                  )}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        <div className="rounded-sm overflow-hidden bg-[#0b6b4b] h-[180px] flex items-center justify-center text-white/70">
          No featured games found
        </div>
      )}
    </div>
  );
};

export default FeatureGames;
