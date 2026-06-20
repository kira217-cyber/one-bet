import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { FaSearch } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { api } from "../../api/axios";
import { useLanguage } from "../../context/LanguageProvider";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const GAMES_PER_PAGE = 21;

const Games = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isBangla } = useLanguage();

  const providerFromQuery = searchParams.get("provider") || "";

  const [providers, setProviders] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  const [selectedProviderDbId, setSelectedProviderDbId] =
    useState(providerFromQuery);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSelectedProviderDbId(providerFromQuery);
  }, [providerFromQuery]);

  useEffect(() => {
    const loadProviders = async () => {
      if (!categoryId) {
        setProviders([]);
        return;
      }

      try {
        setProviderLoading(true);

        const res = await api.get("/api/client-games/providers", {
          params: { categoryId },
        });

        setProviders(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to load providers:", error);
        setProviders([]);
      } finally {
        setProviderLoading(false);
      }
    };

    loadProviders();
  }, [categoryId]);

  useEffect(() => {
    const loadGames = async () => {
      if (!categoryId) {
        setGames([]);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get("/api/client-games/games", {
          params: {
            categoryId,
            providerDbId: selectedProviderDbId || "",
            page: 1,
            limit: 10000,
          },
        });

        const payload = res?.data?.data;

        const gameList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.games)
            ? payload.games
            : [];

        setGames(gameList);
      } catch (error) {
        console.error("Failed to load games:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [categoryId, selectedProviderDbId]);

  const getProviderName = (provider) => {
    return (
      provider?.providerName ||
      provider?.providerTitle ||
      provider?.displayName ||
      provider?.providerId ||
      ""
    );
  };

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

    if (game?.imageUrl) return game.imageUrl;
    if (game?.gameImage) return game.gameImage;
    if (game?.displayImage) return game.displayImage;

    const oracleGame = game?.oracleGame || game?.oracle || {};
    const imageType = game?.oracleImageType || "thumbnail";

    if (imageType === "original") {
      return (
        oracleGame?.original ||
        oracleGame?.images?.original ||
        oracleGame?.image ||
        oracleGame?.img ||
        ""
      );
    }

    if (imageType === "height") {
      return (
        oracleGame?.height ||
        oracleGame?.images?.height ||
        oracleGame?.image ||
        oracleGame?.img ||
        ""
      );
    }

    return (
      oracleGame?.thumbnail ||
      oracleGame?.images?.thumbnail ||
      oracleGame?.image ||
      oracleGame?.img ||
      oracleGame?.original ||
      oracleGame?.images?.original ||
      ""
    );
  };

  const filteredGames = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return games;

    return games.filter((item) => {
      const name = String(getGameName(item)).toLowerCase();
      const code = String(
        item?.displayGameCode || item?.oracleGame?.game_code || "",
      ).toLowerCase();
      const gameId = String(item?.gameId || "").toLowerCase();

      return (
        name.includes(keyword) ||
        code.includes(keyword) ||
        gameId.includes(keyword)
      );
    });
  }, [games, searchText]);

  const finalFilteredGames = useMemo(() => {
    return [...filteredGames].sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [filteredGames]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProviderDbId, searchText, categoryId]);

  const totalPages = Math.ceil(finalFilteredGames.length / GAMES_PER_PAGE) || 1;

  const paginatedGames = finalFilteredGames.slice(
    (currentPage - 1) * GAMES_PER_PAGE,
    currentPage * GAMES_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const tabProviders = useMemo(() => {
    return providers.map((provider) => ({
      _id: provider._id,
      providerId: provider.providerId,
      label: getProviderName(provider),
    }));
  }, [providers]);

  const handleProviderTabClick = (providerDbId) => {
    setSelectedProviderDbId(providerDbId);

    if (providerDbId) {
      setSearchParams({ provider: providerDbId });
    } else {
      setSearchParams({});
    }
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

  if (!categoryId) return null;

  if (loading || providerLoading) {
    return (
      <div className="px-3 pb-4">
        <div className="flex gap-[3px] overflow-x-auto no-scrollbar bg-[#00563c] p-[3px]">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[40px] min-w-[82px] bg-[#006c4a] animate-pulse rounded-[2px]"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-[6px] mt-[6px]">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-[#00563c] p-[3px] animate-pulse">
              <div className="h-[145px] bg-[#1e7f5d]" />
              <div className="h-[18px] bg-[#1e7f5d] mt-[4px]" />
            </div>
          ))}
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

      <div className="px-3 pb-4">
        <div className="mt-2">
          <div className="flex items-stretch gap-[4px] bg-[#00563c] p-[4px] rounded-[4px]">
            <div className="relative flex-1 min-w-0">
              <div
                className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  const slider = e.currentTarget;
                  slider.dataset.mouseDown = "true";
                  slider.dataset.startX = e.pageX;
                  slider.dataset.scrollLeft = slider.scrollLeft;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.mouseDown = "false";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.dataset.mouseDown = "false";
                }}
                onMouseMove={(e) => {
                  const slider = e.currentTarget;
                  if (slider.dataset.mouseDown !== "true") return;
                  e.preventDefault();
                  const startX = Number(slider.dataset.startX || 0);
                  const scrollLeft = Number(slider.dataset.scrollLeft || 0);
                  const walk = (e.pageX - startX) * 1.2;
                  slider.scrollLeft = scrollLeft - walk;
                }}
              >
                <button
                  type="button"
                  onClick={() => handleProviderTabClick("")}
                  className={`cursor-pointer h-[40px] px-4 min-w-[74px] rounded-[4px] text-[12px] sm:text-[14px] font-bold uppercase whitespace-nowrap transition-all duration-200 shrink-0 ${
                    !selectedProviderDbId
                      ? "bg-[#d8e900] text-[#003c29]"
                      : "bg-[#003c29] text-white hover:bg-[#014b34]"
                  }`}
                >
                  {isBangla ? "সব" : "ALL"}
                </button>

                {tabProviders.map((provider) => {
                  const active =
                    String(selectedProviderDbId) === String(provider._id);

                  return (
                    <button
                      key={provider._id}
                      type="button"
                      onClick={() => handleProviderTabClick(provider._id)}
                      className={`cursor-pointer h-[40px] px-4 min-w-[88px] rounded-[4px] text-[12px] sm:text-[14px] font-bold uppercase whitespace-nowrap transition-all duration-200 shrink-0 ${
                        active
                          ? "bg-[#d8e900] text-[#003c29]"
                          : "bg-[#003c29] text-white hover:bg-[#014b34]"
                      }`}
                    >
                      {provider.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className={`cursor-pointer h-[40px] w-[44px] shrink-0 rounded-[4px] flex items-center justify-center transition-all duration-200 ${
                searchOpen
                  ? "bg-[#d8e900] text-[#003c29]"
                  : "bg-[#003c29] text-white hover:bg-[#014b34]"
              }`}
            >
              <FaSearch className="text-[18px]" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="bg-[#00563c] px-[4px] pb-[4px] pt-[4px] rounded-b-[4px]">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-[14px]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={isBangla ? "গেম খুঁজুন..." : "Search games..."}
                className="w-full h-[42px] rounded-[4px] border border-[#1d8a61] bg-[#003c29] pl-11 pr-4 text-white outline-none placeholder:text-white/60 focus:border-[#39b67f]"
              />
            </div>
          </div>
        )}

        {finalFilteredGames.length === 0 ? (
          <div className="bg-[#006c4a] text-white text-center py-8 mt-[6px]">
            {isBangla ? "কোনো গেম পাওয়া যায়নি।" : "No games found."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-[6px] mt-[6px]">
              {paginatedGames.map((game) => {
                const displayName = getGameName(game);
                const displayImage = getGameImage(game);

                return (
                  <button
                    key={game._id || game.gameId}
                    type="button"
                    onClick={() => handleGameClick(game)}
                    className="cursor-pointer text-left bg-[#00563c] p-[3px] hover:brightness-110 transition-all"
                  >
                    <div className="provider-glass-shine relative bg-[#003c29] overflow-hidden">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={displayName}
                          className="w-full h-[100px] sm:h-[145px] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-[100px] sm:h-[145px] bg-[#0b6e4d] flex items-center justify-center text-white/70 text-sm">
                          {isBangla ? "ইমেজ নেই" : "No Image"}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#003c29] px-[6px] py-[5px] flex items-center justify-between gap-2">
                      <p className="text-white font-bold text-[12px] sm:text-[14px] leading-tight truncate">
                        {displayName}
                      </p>

                      <FaRegStar className="text-[#c9982f] text-[20px] shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <style>
                  {`
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

export default Games;
