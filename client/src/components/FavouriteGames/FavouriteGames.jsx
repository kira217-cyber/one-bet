import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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

const ORACLE_BY_IDS_API = "https://api.oraclegames.live/api/games/by-ids";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;
const ORACLE_CHUNK_SIZE = 100;

const FavouriteGames = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isBangla } = useLanguage();

  const [dbGames, setDbGames] = useState([]);
  const [oracleGameMap, setOracleGameMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFavouriteGames = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/games?status=active");
        const allGames = res?.data?.data || [];
        const favouriteGames = allGames.filter(
          (item) => item?.isFavourite === true,
        );

        setDbGames(favouriteGames);

        const uniqueIds = [
          ...new Set(
            favouriteGames
              .map((item) => item?.gameId)
              .filter(Boolean)
              .map((id) => String(id)),
          ),
        ];

        if (!uniqueIds.length) {
          setOracleGameMap({});
          return;
        }

        const chunks = [];
        for (let i = 0; i < uniqueIds.length; i += ORACLE_CHUNK_SIZE) {
          chunks.push(uniqueIds.slice(i, i + ORACLE_CHUNK_SIZE));
        }

        const results = await Promise.all(
          chunks.map((chunk) =>
            axios.post(
              ORACLE_BY_IDS_API,
              { ids: chunk },
              {
                headers: {
                  "x-api-key": ORACLE_KEY,
                  "Content-Type": "application/json",
                },
              },
            ),
          ),
        );

        const fullMap = {};

        for (const response of results) {
          const list = response?.data?.data || [];

          for (const game of list) {
            fullMap[String(game._id)] = game;
          }
        }

        setOracleGameMap(fullMap);
      } catch (error) {
        console.error("Failed to load favourite games:", error);
        setDbGames([]);
        setOracleGameMap({});
      } finally {
        setLoading(false);
      }
    };

    loadFavouriteGames();
  }, []);

  const mergedGames = useMemo(() => {
    return dbGames.map((dbGame) => {
      const oracleGame = oracleGameMap[String(dbGame.gameId)] || null;

      const finalImage =
        dbGame?.imageUrl ||
        dbGame?.image ||
        oracleGame?.image ||
        oracleGame?.img ||
        "";

      return {
        ...dbGame,
        oracleGame,
        displayName:
          dbGame?.gameName ||
          dbGame?.name ||
          oracleGame?.gameName ||
          oracleGame?.name ||
          oracleGame?.game_code ||
          "Unnamed Game",
        displayImage: finalImage,
      };
    });
  }, [dbGames, oracleGameMap]);

  const handleGameClick = (game) => {
    if (!isAuthenticated) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to continue");
      navigate("/login");
      return;
    }

    const targetId = game?._id || game?.gameId;

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
        {/* Title */}
        <div className="mb-3 flex items-center">
          <div className="mr-2 h-5 w-1 bg-yellow-400"></div>

          <h2 className="text-lg font-semibold text-yellow-400">
            {isBangla ? "ফেভারিট গেমস" : "Favourite Games"}
          </h2>
        </div>

        {/* Loading */}
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
            slidesPerView={3.3}
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

                    {/* Game Name */}
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
