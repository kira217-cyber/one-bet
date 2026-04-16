import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
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
    <div className="px-3 py-4 bg-[#005C40]">
      {/* Title */}
      <div className="flex items-center mb-3">
        <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
        <h2 className="text-yellow-400 font-semibold text-lg">
          {isBangla ? "ফেভারিট গেমস" : "Favourite Games"}
        </h2>
      </div>

      {/* Loading */}
      {loading ? (
        <Swiper
          spaceBetween={12}
          slidesPerView={2.3}
          breakpoints={{
            640: {
              slidesPerView: 2.6,
            },
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <SwiperSlide key={index}>
              <div className="bg-[#0B3B2E] rounded-sm overflow-hidden shadow-md animate-pulse">
                <div className="w-full h-[150px] bg-[#145843]" />
                <div className="px-4 py-1 bg-[#111111]">
                  <div className="h-4 w-3/4 bg-[#2a2a2a] rounded" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : mergedGames.length === 0 ? (
        <div className="bg-[#0B3B2E] rounded-sm overflow-hidden shadow-md">
          <div className="px-4 py-8 bg-[#111111] text-center text-white text-sm">
            {isBangla
              ? "কোনো ফেভারিট গেম পাওয়া যায়নি।"
              : "No favourite games found."}
          </div>
        </div>
      ) : (
        <Swiper
          spaceBetween={12}
          slidesPerView={2.3}
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
                <div className="bg-[#0B3B2E] rounded-sm overflow-hidden shadow-md">
                  {game.displayImage ? (
                    <img
                      src={game.displayImage}
                      alt={game.displayName}
                      className="w-full h-[150px]"
                    />
                  ) : (
                    <div className="w-full h-[150px] flex items-center justify-center bg-[#145843] text-white/70 text-xs text-center px-2">
                      {isBangla ? "ইমেজ নেই" : "No Image"}
                    </div>
                  )}

                  {/* Game Name */}
                  <div className="px-4 py-1 bg-[#111111]">
                    <p className="text-white text-sm font-medium truncate">
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
  );
};

export default FavouriteGames;
