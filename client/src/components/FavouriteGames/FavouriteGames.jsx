import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";

import { api } from "../../api/axios";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { useLanguage } from "../../context/LanguageProvider";

const FavouriteGames = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isBangla } = useLanguage();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFavouriteGames = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/client-games/favourite-games");

        setGames(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to load favourite games:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavouriteGames();
  }, []);

  const getGameName = (game) => {
    return (
      game?.displayName ||
      game?.gameName ||
      game?.name ||
      game?.oracleGame?.gameName ||
      game?.oracleGame?.name ||
      game?.oracleGame?.game_code ||
      game?.gameId ||
      "Unnamed Game"
    );
  };

  const getGameImage = (game) => {
    if (!game) return "";

    return (
      game?.imageUrl ||
      game?.gameImage ||
      game?.displayImage ||
      game?.oracle?.image ||
      game?.oracleGame?.thumbnail ||
      game?.oracleGame?.images?.thumbnail ||
      game?.oracleGame?.image ||
      game?.oracleGame?.img ||
      ""
    );
  };

  const mergedGames = useMemo(() => {
    return games.map((game) => ({
      ...game,
      displayName: getGameName(game),
      displayImage: getGameImage(game),
    }));
  }, [games]);

  const handleGameClick = (game) => {
    if (!isAuthenticated) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to continue");
      navigate("/login");
      return;
    }

    const targetId = game?.gameId || game?._id;

    if (!targetId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game id not found");
      return;
    }

    navigate(`/play-game/${targetId}`);
  };

  return (
    <>
      <style>
        {`
        @keyframes providerGlassShine {
          0% { transform: translateX(-260%) skewX(-22deg); opacity: 0; }
          12% { opacity: 1; }
          50% { opacity: 1; }
          82% { transform: translateX(360%) skewX(-22deg); opacity: 1; }
          100% { transform: translateX(360%) skewX(-22deg); opacity: 0; }
        }

        .provider-glass-shine::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -85%;
          width: 55%;
          height: 170%;
          pointer-events: none;
          z-index: 2;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.08) 18%,
            rgba(255,255,255,0.55) 38%,
            rgba(255,255,255,0.95) 50%,
            rgba(255,255,255,0.55) 62%,
            rgba(255,255,255,0.08) 82%,
            transparent 100%
          );
          filter: blur(0.4px);
          mix-blend-mode: screen;
          animation: providerGlassShine 3s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
        }

        .provider-glass-shine img {
          position: relative;
          z-index: 1;
        }
      `}
      </style>

      <div className="bg-[#005C40] px-3 py-4">
        <div className="mb-3 flex items-center">
          <div className="mr-2 h-5 w-1 bg-yellow-400"></div>

          <h2 className="text-lg font-semibold text-yellow-400">
            {isBangla ? "ফেভারিট গেমস" : "Favourite Games"}
          </h2>
        </div>

        {loading ? (
          <Swiper
            modules={[Autoplay]}
            spaceBetween={12}
            slidesPerView={2.3}
            loop={true}
            speed={900}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2.6,
              },
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <SwiperSlide key={index}>
                <div className="overflow-hidden rounded-[8px] bg-[#0B3B2E] shadow-md animate-pulse">
                  <div className="h-[150px] w-full bg-[#145843]" />

                  <div className="bg-[#111111] px-4 py-1">
                    <div className="h-4 w-3/4 rounded bg-[#2a2a2a]" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : mergedGames.length === 0 ? (
          <div className="overflow-hidden rounded-[12px] bg-[#0B3B2E] shadow-md">
            <div className="bg-[#111111] px-4 py-8 text-center text-sm text-white">
              {isBangla
                ? "কোনো ফেভারিট গেম পাওয়া যায়নি।"
                : "No favourite games found."}
            </div>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay]}
            spaceBetween={12}
            slidesPerView={2.3}
            loop={mergedGames.length > 3}
            speed={900}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2.6,
              },
            }}
          >
            {mergedGames.map((game, index) => (
              <SwiperSlide key={game?._id || game?.gameId || index}>
                <button
                  type="button"
                  onClick={() => handleGameClick(game)}
                  className="w-full cursor-pointer text-left"
                >
                  <div className="overflow-hidden rounded-[4px] bg-[#0B3B2E] shadow-md transition hover:-translate-y-[1px] hover:shadow-lg">
                    <div className="provider-glass-shine relative overflow-hidden bg-[#145843]">
                      {game.displayImage ? (
                        <img
                          src={game.displayImage}
                          alt={game.displayName}
                          className="h-[150px] w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-[150px] w-full items-center justify-center bg-[#145843] px-2 text-center text-xs text-white/70">
                          {isBangla ? "ইমেজ নেই" : "No Image"}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#111111] px-4 py-1">
                      <p className="truncate text-sm font-medium text-white">
                        {game.displayName}
                      </p>
                    </div>
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </>
  );
};

export default FavouriteGames;
