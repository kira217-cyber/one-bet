import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { useLanguage } from "../../context/LanguageProvider";

const ORACLE_BY_IDS_API = "https://api.oraclegames.live/api/games/by-ids";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;
const GAMES_PER_PAGE = 24;
const ORACLE_CHUNK_SIZE = 100;

const HotGames = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isBangla } = useLanguage();

  const [dbGames, setDbGames] = useState([]);
  const [oracleGameMap, setOracleGameMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadHotGames = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/games?status=active");
        const allGames = res?.data?.data || [];
        const hotGames = allGames.filter((item) => item?.isHot === true);

        setDbGames(hotGames);
        setCurrentPage(1);

        const uniqueIds = [
          ...new Set(
            hotGames
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
        console.error("Failed to load hot games:", error);
        setDbGames([]);
        setOracleGameMap({});
      } finally {
        setLoading(false);
      }
    };

    loadHotGames();
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

  const totalPages = Math.ceil(mergedGames.length / GAMES_PER_PAGE);

  const paginatedGames = mergedGames.slice(
    (currentPage - 1) * GAMES_PER_PAGE,
    currentPage * GAMES_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  if (loading) {
    return (
      <div className="px-2 pb-4">
        <div className="flex items-center mb-3 mt-3">
          <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
          <h2 className="text-yellow-400 font-bold text-[20px]">
            {isBangla ? "হট গেমস" : "Hot Games"}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-[10px]">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-[8px] overflow-hidden animate-pulse"
            >
              <div className="w-full h-[132px] bg-[#0f6b52]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mergedGames.length === 0) {
    return (
      <div className="px-2 pb-4">
        <div className="flex items-center mb-3 mt-3">
          <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
          <h2 className="text-yellow-400 font-bold text-[20px]">
            {isBangla ? "হট গেমস" : "Hot Games"}
          </h2>
        </div>

        <div className="bg-[#006c4a] text-white text-center py-10 rounded-[2px]">
          {isBangla ? "কোনো হট গেম পাওয়া যায়নি।" : "No hot games found."}
        </div>
      </div>
    );
  }

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

      <div className="px-2 pb-4">
        {/* Title - unchanged */}
        <div className="flex items-center mb-3 mt-3">
          <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
          <h2 className="text-yellow-400 font-bold text-[20px]">
            {isBangla ? "হট গেমস" : "Hot Games"}
          </h2>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {paginatedGames.map((game) => (
            <button
              key={game._id}
              type="button"
              onClick={() => handleGameClick(game)}
              className="cursor-pointer border-2 border-[#00563c] rounded-[8px] overflow-hidden bg-[#003c29] transition hover:-translate-y-[1px] hover:shadow-lg"
            >
              <div className="provider-glass-shine relative overflow-hidden  bg-[#0f6b52]">
                {game.displayImage ? (
                  <img
                    src={game.displayImage}
                    alt={game.displayName}
                    className="h-[132px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[132px] sm:h-[155px] w-full items-center justify-center bg-[#0b6e4d] text-white/70 text-xs text-center px-2">
                    {isBangla ? "ইমেজ নেই" : "No Image"}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <style>
              {`
    @keyframes rgbPagination {
      0% {
        background-position: 0% 50%;
      }

      50% {
        background-position: 100% 50%;
      }

      100% {
        background-position: 0% 50%;
      }
    }

    .rgb-pagination-btn {
      background: linear-gradient(
        90deg,
        rgb(255, 0, 80),
        rgb(255, 140, 0),
        rgb(255, 230, 0),
        rgb(0, 255, 180),
        rgb(0, 120, 255),
        rgb(180, 0, 255),
        rgb(255, 0, 80)
      );

      background-size: 250% 250%;

      animation: rgbPagination 10s ease-in-out infinite;

      transition: all 0.3s ease;
    }
  `}
            </style>

            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rgb-pagination-btn cursor-pointer rounded-[6px] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/30 transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {isBangla ? "আগে" : "Previous"}
            </button>

            <span className="text-sm font-semibold text-white">
              {isBangla
                ? `পৃষ্ঠা ${currentPage} / ${totalPages}`
                : `Page ${currentPage} / ${totalPages}`}
            </span>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rgb-pagination-btn cursor-pointer rounded-[6px] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/30 transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {isBangla ? "পরে" : "Next"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default HotGames;
