import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { FaSearch } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { api } from "../../api/axios";
import { useLanguage } from "../../context/LanguageProvider";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ORACLE_BY_IDS_API = "https://api.oraclegames.live/api/games/by-ids";
const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;
const GAMES_PER_PAGE = 20;
const ORACLE_CHUNK_SIZE = 100;

const Games = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isBangla, isEnglish } = useLanguage();

  const providerFromQuery = searchParams.get("provider") || "";

  const [providers, setProviders] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [dbGames, setDbGames] = useState([]);
  const [oracleGameMap, setOracleGameMap] = useState({});
  const [loading, setLoading] = useState(false);

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
        const res = await api.get(
          `/api/game-providers?categoryId=${categoryId}&status=active`,
        );
        setProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to load providers:", error);
        setProviders([]);
      }
    };

    loadProviders();
  }, [categoryId]);

  useEffect(() => {
    const loadOracleProviders = async () => {
      try {
        const res = await axios.get(ORACLE_PROVIDER_API, {
          headers: {
            "x-api-key": ORACLE_KEY,
          },
        });

        setOracleProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to load oracle providers:", error);
        setOracleProviders([]);
      }
    };

    loadOracleProviders();
  }, []);

  const providerNameMap = useMemo(() => {
    const map = new Map();

    for (const item of oracleProviders) {
      if (item?.providerCode) {
        map.set(
          String(item.providerCode),
          item?.providerName || item?.providerCode,
        );
      }
    }

    return map;
  }, [oracleProviders]);

  const getProviderName = (providerId) => {
    return providerNameMap.get(String(providerId)) || providerId || "";
  };

  useEffect(() => {
    const loadDbGames = async () => {
      if (!categoryId) {
        setDbGames([]);
        setOracleGameMap({});
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(
          `/api/games?categoryId=${categoryId}&status=active`,
        );
        const gamesFromDb = res?.data?.data || [];
        setDbGames(gamesFromDb);

        const uniqueIds = [
          ...new Set(
            gamesFromDb
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
              {
                ids: chunk,
              },
              {
                headers: {
                  "x-api-key": ORACLE_KEY,
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
        console.error("Failed to load games:", error);
        setDbGames([]);
        setOracleGameMap({});
      } finally {
        setLoading(false);
      }
    };

    loadDbGames();
  }, [categoryId]);

  const mergedGames = useMemo(() => {
    return dbGames.map((dbGame) => {
      const oracleGame = oracleGameMap[String(dbGame.gameId)] || null;

      const finalImage = dbGame?.imageUrl
        ? dbGame.imageUrl
        : oracleGame?.image || "";

      return {
        ...dbGame,
        oracleGame,
        displayName:
          oracleGame?.gameName ||
          oracleGame?.name ||
          oracleGame?.game_code ||
          "Unnamed Game",
        displayImage: finalImage,
        displayGameCode: oracleGame?.game_code || "",
      };
    });
  }, [dbGames, oracleGameMap]);

  const filteredByProvider = useMemo(() => {
    if (!selectedProviderDbId) return mergedGames;

    return mergedGames.filter(
      (item) =>
        String(item?.providerDbId?._id || item?.providerDbId) ===
        String(selectedProviderDbId),
    );
  }, [mergedGames, selectedProviderDbId]);

  const finalFilteredGames = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    let filtered = filteredByProvider;

    if (keyword) {
      filtered = filteredByProvider.filter((item) => {
        const name = String(item.displayName || "").toLowerCase();
        const code = String(item.displayGameCode || "").toLowerCase();
        const gameId = String(item.gameId || "").toLowerCase();

        return (
          name.includes(keyword) ||
          code.includes(keyword) ||
          gameId.includes(keyword)
        );
      });
    }

    return filtered.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [filteredByProvider, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProviderDbId, searchText, categoryId]);

  const totalPages = Math.ceil(finalFilteredGames.length / GAMES_PER_PAGE);
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
      label: getProviderName(provider.providerId),
    }));
  }, [providers, providerNameMap]);

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

    const targetId = game?._id || game?.gameId;

    if (!targetId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game id not found");
      return;
    }

    navigate(`/play-game/${targetId}`);
  };

  if (!categoryId) return null;

  if (loading) {
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
    <div className="px-3 pb-4">
      {/* Top Provider Tabs */}
      {/* Top Provider Tabs */}
      <div className="mt-2">
        <div className="flex items-stretch gap-[4px] bg-[#00563c] p-[4px] rounded-[4px]">
          {/* Left Scrollable Tabs */}
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

          {/* Right Fixed Search Button */}
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

      {/* Search Box */}
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

      {/* Games */}
      {finalFilteredGames.length === 0 ? (
        <div className="bg-[#006c4a] text-white text-center py-8 mt-[6px]">
          {isBangla ? "কোনো গেম পাওয়া যায়নি।" : "No games found."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-[6px] mt-[6px]">
            {paginatedGames.map((game) => (
              <button
                key={game._id}
                type="button"
                onClick={() => handleGameClick(game)}
                className="cursor-pointer text-left bg-[#00563c] p-[3px] hover:brightness-110 transition-all"
              >
                <div className="relative bg-[#003c29] overflow-hidden">
                  {game.displayImage ? (
                    <img
                      src={game.displayImage}
                      alt={game.displayName}
                      className="w-full h-[100px] sm:h-[145px] object-container"
                    />
                  ) : (
                    <div className="w-full h-[100px] sm:h-[145px] bg-[#0b6e4d] flex items-center justify-center text-white/70 text-sm">
                      {isBangla ? "ইমেজ নেই" : "No Image"}
                    </div>
                  )}
                </div>

                <div className="bg-[#003c29] px-[6px] py-[5px] flex items-center justify-between gap-2">
                  <p className="text-white font-bold text-[12px] sm:text-[14px] leading-tight truncate">
                    {game.displayName}
                  </p>

                  <FaRegStar className="text-[#c9982f] text-[20px] shrink-0" />
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer px-4 py-2 bg-[#003c29] text-white disabled:opacity-40"
              >
                {isBangla ? "আগে" : "Previous"}
              </button>

              <span className="text-white text-sm font-semibold">
                {isBangla
                  ? `পৃষ্ঠা ${currentPage} / ${totalPages}`
                  : `Page ${currentPage} / ${totalPages}`}
              </span>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="cursor-pointer px-4 py-2 bg-[#003c29] text-white disabled:opacity-40"
              >
                {isBangla ? "পরে" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Games;
