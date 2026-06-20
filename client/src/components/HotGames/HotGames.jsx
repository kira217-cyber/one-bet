import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { useLanguage } from "../../context/LanguageProvider";

const GAMES_PER_PAGE = 24;

const HotGames = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isBangla } = useLanguage();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadHotGames = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/client-games/hot-games");

        setGames(Array.isArray(res?.data?.data) ? res.data.data : []);
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to load hot games:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadHotGames();
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

  const totalPages = Math.ceil(mergedGames.length / GAMES_PER_PAGE) || 1;

  const paginatedGames = mergedGames.slice(
    (currentPage - 1) * GAMES_PER_PAGE,
    currentPage * GAMES_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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

          @keyframes rgbPagination {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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

      <div className="px-2 pb-4">
        <div className="flex items-center mb-3 mt-3">
          <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
          <h2 className="text-yellow-400 font-bold text-[20px]">
            {isBangla ? "হট গেমস" : "Hot Games"}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[132px] rounded-[8px] bg-[#0f6b52] animate-pulse"
              />
            ))}
          </div>
        ) : mergedGames.length === 0 ? (
          <div className="bg-[#006c4a] text-white text-center py-10 rounded-[2px]">
            {isBangla ? "কোনো হট গেম পাওয়া যায়নি।" : "No hot games found."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {paginatedGames.map((game) => (
                <button
                  key={game._id || game.gameId}
                  type="button"
                  onClick={() => handleGameClick(game)}
                  className="cursor-pointer overflow-hidden border-2 border-[#00563c] rounded-[8px] bg-[#006c4a] transition hover:-translate-y-[1px] hover:bg-[#007a53] hover:shadow-lg active:scale-[0.98]"
                >
                  <div className="provider-glass-shine relative h-[132px] overflow-hidden bg-[#0b8d63]">
                    {game.displayImage ? (
                      <img
                        src={game.displayImage}
                        alt={game.displayName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#0b8d63] text-white/70 text-xs text-center px-2">
                        {isBangla ? "ইমেজ নেই" : "No Image"}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-3">
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
          </>
        )}
      </div>
    </>
  );
};

export default HotGames;
