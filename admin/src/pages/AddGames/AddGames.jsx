import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaGamepad,
  FaImage,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSearch,
} from "react-icons/fa";

const ORACLE_BASE = "https://api.oraclegames.live/api";
const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_KEY = import.meta.env.VITE_ORACLE_TOKEN;
const GAMES_PER_PAGE = 50;

const AddGames = () => {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProviderDbId, setSelectedProviderDbId] = useState("");

  const [providerGames, setProviderGames] = useState([]);
  const [savedGames, setSavedGames] = useState([]);

  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchText, setSearchText] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState({
    image: null,
    status: "active",
    isHot: false,
    isFavourite: false,
  });
  const [editPreview, setEditPreview] = useState("");
  const [removeOldImage, setRemoveOldImage] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    title: "",
  });

  const selectedProvider = useMemo(
    () => providers.find((p) => p._id === selectedProviderDbId),
    [providers, selectedProviderDbId],
  );

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

  const selectedProviderName = useMemo(() => {
    if (!selectedProvider?.providerId) return "";
    return (
      providerNameMap.get(String(selectedProvider.providerId)) ||
      selectedProvider.providerId
    );
  }, [selectedProvider, providerNameMap]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/api/game-categories/admin/all");
        setCategories(res?.data?.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load categories",
        );
      }
    };

    const loadOracleProviders = async () => {
      try {
        const res = await axios.get(ORACLE_PROVIDER_API, {
          headers: { "x-api-key": ORACLE_KEY },
        });
        setOracleProviders(res?.data?.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
    loadOracleProviders();
  }, []);

  useEffect(() => {
    const loadProviders = async () => {
      if (!selectedCategoryId) {
        setProviders([]);
        setSelectedProviderDbId("");
        return;
      }

      try {
        const res = await api.get(
          `/api/game-providers?categoryId=${selectedCategoryId}`,
        );
        setProviders(res?.data?.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load providers",
        );
      }
    };

    loadProviders();
  }, [selectedCategoryId]);

  useEffect(() => {
    const loadSavedGames = async () => {
      if (!selectedProviderDbId) {
        setSavedGames([]);
        return;
      }

      try {
        setLoadingSaved(true);
        const res = await api.get(
          `/api/games?providerDbId=${selectedProviderDbId}`,
        );
        setSavedGames(res?.data?.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load saved games",
        );
      } finally {
        setLoadingSaved(false);
      }
    };

    loadSavedGames();
  }, [selectedProviderDbId]);

  useEffect(() => {
    if (!selectedProvider?.providerId) {
      setProviderGames([]);
      setCurrentPage(1);
      return;
    }

    const fetchOracleGames = async () => {
      try {
        setLoadingGames(true);
        const res = await axios.get(
          `${ORACLE_BASE}/providers/${selectedProvider.providerId}`,
          {
            headers: { "x-api-key": ORACLE_KEY },
          },
        );

        setProviderGames(res?.data?.games || []);
        setCurrentPage(1);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load games from provider");
        setProviderGames([]);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchOracleGames();
  }, [selectedProvider]);

  useEffect(() => {
    if (!editForm.image) return;

    const url = URL.createObjectURL(editForm.image);
    setEditPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [editForm.image]);

  const getGameDisplayName = (game) => {
    return game?.gameName || game?.name || game?.game_code || "Unnamed Game";
  };

  const getOracleImage = (game) => {
    return game?.image || "";
  };

  const filteredGames = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return providerGames;

    return providerGames.filter((game) => {
      const name = getGameDisplayName(game).toLowerCase();
      const gameCode = String(game?.game_code || "").toLowerCase();
      const gameId = String(game?._id || "").toLowerCase();

      return (
        name.includes(keyword) ||
        gameCode.includes(keyword) ||
        gameId.includes(keyword)
      );
    });
  }, [providerGames, searchText]);

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const paginatedGames = filteredGames.slice(
    startIndex,
    startIndex + GAMES_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isGameSelected = (oracleGameId) =>
    savedGames.some((item) => item.gameId === oracleGameId);

  const getSelectedGame = (oracleGameId) =>
    savedGames.find((item) => item.gameId === oracleGameId);

  const selectedCountThisPage = useMemo(() => {
    return paginatedGames.reduce(
      (acc, game) => (isGameSelected(game._id) ? acc + 1 : acc),
      0,
    );
  }, [paginatedGames, savedGames]);

  const allSelectedThisPage =
    paginatedGames.length > 0 &&
    selectedCountThisPage === paginatedGames.length;

  const handleSelectGame = async (game) => {
    const oracleGameId = game?._id;
    const alreadySelected = isGameSelected(oracleGameId);

    try {
      if (alreadySelected) {
        const existingDoc = getSelectedGame(oracleGameId);
        if (!existingDoc?._id) return;

        await api.delete(`/api/games/${existingDoc._id}`);
        setSavedGames((prev) =>
          prev.filter((item) => item._id !== existingDoc._id),
        );
        toast.success("Game removed successfully");
        return;
      }

      const payload = {
        categoryId: selectedCategoryId,
        providerDbId: selectedProviderDbId,
        gameId: oracleGameId,
        status: "active",
      };

      const res = await api.post("/api/games", payload);

      setSavedGames((prev) => [res?.data?.data, ...prev]);
      toast.success("Game added successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleSelectAllThisPage = async () => {
    if (bulkLoading || !paginatedGames.length) return;

    setBulkLoading(true);
    let added = 0;
    let skipped = 0;
    let failed = 0;

    try {
      for (const game of paginatedGames) {
        if (isGameSelected(game._id)) {
          skipped++;
          continue;
        }

        const payload = {
          categoryId: selectedCategoryId,
          providerDbId: selectedProviderDbId,
          gameId: game._id,
          status: "active",
        };

        try {
          const res = await api.post("/api/games", payload);
          setSavedGames((prev) => [res?.data?.data, ...prev]);
          added++;
        } catch (err) {
          failed++;
        }
      }

      if (added) toast.success(`${added} game selected successfully`);
      if (skipped) toast.info(`${skipped} game already selected`);
      if (failed) toast.error(`${failed} game failed`);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRemoveSelectedAllThisPage = async () => {
    if (bulkLoading || !paginatedGames.length) return;

    setBulkLoading(true);
    let removed = 0;
    let skipped = 0;
    let failed = 0;

    try {
      for (const game of paginatedGames) {
        const existingDoc = getSelectedGame(game._id);

        if (!existingDoc?._id) {
          skipped++;
          continue;
        }

        try {
          await api.delete(`/api/games/${existingDoc._id}`);
          setSavedGames((prev) =>
            prev.filter((item) => item._id !== existingDoc._id),
          );
          removed++;
        } catch (err) {
          failed++;
        }
      }

      if (removed) toast.success(`${removed} game removed successfully`);
      if (skipped) toast.info(`${skipped} game not selected`);
      if (failed) toast.error(`${failed} game remove failed`);
    } finally {
      setBulkLoading(false);
    }
  };

  const openEditModal = (gameDoc) => {
    setEditingGame(gameDoc);
    setEditForm({
      image: null,
      status: gameDoc?.status || "active",
      isHot: !!gameDoc?.isHot,
      isFavourite: !!gameDoc?.isFavourite,
    });
    setRemoveOldImage(false);

    if (gameDoc?.imageUrl) {
      setEditPreview(gameDoc.imageUrl);
    } else {
      setEditPreview("");
    }

    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingGame(null);
    setEditModalOpen(false);
    setEditForm({
      image: null,
      status: "active",
      isHot: false,
      isFavourite: false,
    });
    setEditPreview("");
    setRemoveOldImage(false);
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    if (!editingGame?._id) return;

    try {
      const fd = new FormData();
      fd.append("status", editForm.status);
      fd.append("isHot", String(!!editForm.isHot));
      fd.append("isFavourite", String(!!editForm.isFavourite));
      fd.append("removeOldImage", removeOldImage ? "true" : "false");

      if (editForm.image instanceof File) {
        fd.append("image", editForm.image);
      }

      const res = await api.put(`/api/games/${editingGame._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSavedGames((prev) =>
        prev.map((item) =>
          item._id === editingGame._id ? res?.data?.data : item,
        ),
      );

      toast.success(res?.data?.message || "Game updated successfully");
      closeEditModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update game");
    }
  };

  const openDeleteModal = (gameDoc, game) => {
    setDeleteModal({
      open: true,
      id: gameDoc._id,
      title: getGameDisplayName(game),
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
      title: "",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/api/games/${deleteModal.id}`);
      toast.success(res?.data?.message || "Game deleted successfully");
      setSavedGames((prev) =>
        prev.filter((item) => item._id !== deleteModal.id),
      );

      if (editingGame?._id === deleteModal.id) {
        closeEditModal();
      }

      closeDeleteModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete game");
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl overflow-hidden">
          <div className="border-b border-green-700/40 bg-gradient-to-r from-green-700/20 via-emerald-600/10 to-green-700/20 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                <FaGamepad className="text-2xl text-black" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Add Games
                </h1>
                <p className="text-sm text-green-200/80 mt-1">
                  Category → Provider select করে Oracle games থেকে add / manage
                  করো।
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8 border-b border-green-700/40 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-green-200">
                  Select Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedProviderDbId("");
                    setProviderGames([]);
                    setSavedGames([]);
                    setCurrentPage(1);
                    setSearchText("");
                  }}
                  className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                >
                  <option value="">Choose category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat?.categoryName?.en} • {cat?.categoryName?.bn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-green-200">
                  Select Provider
                </label>
                <select
                  value={selectedProviderDbId}
                  onChange={(e) => {
                    setSelectedProviderDbId(e.target.value);
                    setProviderGames([]);
                    setSavedGames([]);
                    setCurrentPage(1);
                    setSearchText("");
                  }}
                  disabled={!selectedCategoryId}
                  className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose provider...</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {providerNameMap.get(String(provider.providerId)) ||
                        provider.providerId}{" "}
                      ({provider.providerId})
                    </option>
                  ))}
                </select>

                {selectedProvider && (
                  <p className="mt-2 text-xs text-green-300/80">
                    Selected Provider:{" "}
                    <span className="font-semibold text-yellow-400">
                      {selectedProviderName}
                    </span>{" "}
                    • Code:{" "}
                    <span className="font-mono text-white">
                      {selectedProvider.providerId}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {selectedProviderDbId && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-1">
                    <label className="block mb-2 text-sm font-semibold text-green-200">
                      Search Game
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-300" />
                      <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by game name, code, or id..."
                        className="w-full rounded-2xl border border-green-700/40 bg-black/60 pl-12 pr-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-wrap items-end gap-3">
                    <button
                      type="button"
                      onClick={handleSelectAllThisPage}
                      disabled={
                        bulkLoading ||
                        allSelectedThisPage ||
                        !paginatedGames.length
                      }
                      className="cursor-pointer px-5 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkLoading ? "Working..." : "Select All Game"}
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveSelectedAllThisPage}
                      disabled={bulkLoading || selectedCountThisPage === 0}
                      className="cursor-pointer px-5 py-3 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 font-bold hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkLoading ? "Working..." : "Remove Selected All"}
                    </button>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-3 pt-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="cursor-pointer px-5 py-2.5 bg-black/70 border border-green-700/50 rounded-lg text-green-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-900/40 transition"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2 text-green-200 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer px-5 py-2.5 bg-black/70 border border-green-700/50 rounded-lg text-green-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-900/40 transition"
                    >
                      Next
                    </button>
                    <div className="text-sm text-green-200/80">
                      Selected This Page:{" "}
                      <span className="font-bold text-yellow-400">
                        {selectedCountThisPage}/{paginatedGames.length}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            {!selectedProviderDbId ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                Select category and provider first
              </div>
            ) : loadingGames ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                Loading games from provider...
              </div>
            ) : loadingSaved ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                Loading saved games...
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="rounded-3xl border border-green-700/30 bg-black/30 py-12 text-center text-green-200">
                {searchText
                  ? "No matching games found"
                  : "No games found for this provider"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {paginatedGames.map((game) => {
                  const selected = isGameSelected(game._id);
                  const selectedDoc = getSelectedGame(game._id);
                  const displayName = getGameDisplayName(game);

                  const imageToShow =
                    selected && selectedDoc?.imageUrl
                      ? selectedDoc.imageUrl
                      : getOracleImage(game);

                  return (
                    <div
                      key={game._id}
                      className={`rounded-3xl border bg-gradient-to-br from-black via-green-950/10 to-black overflow-hidden shadow-xl transition-all ${
                        selected
                          ? "border-yellow-400 ring-2 ring-yellow-400/30"
                          : "border-green-700/30"
                      }`}
                    >
                      <div className="relative">
                        {imageToShow ? (
                          <img
                            src={imageToShow}
                            alt={displayName}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-[#003F2C] flex items-center justify-center">
                            <FaImage className="text-5xl text-green-300/70" />
                          </div>
                        )}

                        {selected && (
                          <div className="absolute top-3 right-3 rounded-full bg-yellow-400 text-black text-xs font-bold px-3 py-1">
                            SELECTED
                          </div>
                        )}

                        {selectedDoc?.isHot && (
                          <div className="absolute top-3 left-3 rounded-full bg-red-500 text-white text-xs font-bold px-3 py-1">
                            HOT
                          </div>
                        )}

                        {selectedDoc?.isFavourite && (
                          <div className="absolute top-3 left-[72px] rounded-full bg-pink-500 text-white text-xs font-bold px-3 py-1">
                            FAVOURITE
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-lg text-yellow-400 line-clamp-2">
                          {displayName}
                        </h3>

                        <div className="mt-2 text-xs text-green-200/80 space-y-1">
                          <div className="break-all">gameId: {game._id}</div>
                          {game?.game_code && (
                            <div className="break-all">
                              game_code: {game.game_code}
                            </div>
                          )}
                          {selected && (
                            <>
                              <div>Status: {selectedDoc?.status}</div>
                              <div>
                                Hot: {selectedDoc?.isHot ? "Yes" : "No"}
                              </div>
                              <div>
                                Favourite:{" "}
                                {selectedDoc?.isFavourite ? "Yes" : "No"}
                              </div>
                            </>
                          )}
                        </div>

                        <label className="mt-4 flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleSelectGame(game)}
                            className="w-5 h-5 accent-yellow-500"
                          />
                          <span className="text-yellow-200 font-medium">
                            {selected ? "Selected" : "Add to Platform"}
                          </span>
                        </label>

                        {selected && (
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(selectedDoc)}
                              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-bold text-black hover:from-green-400 hover:to-emerald-400 transition-all"
                            >
                              <FaEdit />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(selectedDoc, game)}
                              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-bold text-red-300 hover:bg-red-500/20 transition-all"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-3 pt-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer px-5 py-2.5 bg-black/70 border border-green-700/50 rounded-lg text-green-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-900/40 transition"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-green-200 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="cursor-pointer px-5 py-2.5 bg-black/70 border border-green-700/50 rounded-lg text-green-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-900/40 transition"
          >
            Next
          </button>
          <div className="text-sm text-green-200/80">
            Selected This Page:{" "}
            <span className="font-bold text-yellow-400">
              {selectedCountThisPage}/{paginatedGames.length}
            </span>
          </div>
        </div>
      )}

      {editModalOpen && editingGame && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/10 to-black p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-5">Edit Game</h3>

            <form onSubmit={handleUpdateGame} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-green-200">
                  Replace Image
                </label>

                <label className="cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-green-700/50 bg-black/40 p-6 text-center hover:border-green-400 hover:bg-green-950/20 transition-all">
                  <FaImage className="text-4xl text-green-300 mb-3" />
                  <span className="text-base font-semibold text-white">
                    Click to upload new image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        image: e.target.files?.[0] || null,
                      }))
                    }
                    className="hidden"
                  />
                </label>

                {editPreview && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-green-700/30">
                    <img
                      src={editPreview}
                      alt="Edit Preview"
                      className="w-full h-56 object-cover"
                    />
                  </div>
                )}

                {(editPreview || editingGame?.imageUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm((prev) => ({ ...prev, image: null }));
                      setEditPreview("");
                      setRemoveOldImage(true);
                    }}
                    className="cursor-pointer mt-3 inline-flex items-center gap-2 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-2.5 font-semibold text-yellow-300 hover:bg-yellow-500/20 transition-all"
                  >
                    Remove Old Image
                  </button>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-green-200">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-green-700/40 bg-black/60 px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-green-700/40 bg-black/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={!!editForm.isHot}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isHot: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-yellow-500"
                />
                <span className="text-yellow-200 font-medium">Mark as Hot</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-green-700/40 bg-black/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={!!editForm.isFavourite}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isFavourite: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-pink-500"
                />
                <span className="text-pink-200 font-medium">
                  Mark as Favourite
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-bold text-black shadow-lg shadow-green-600/40 hover:from-green-400 hover:to-emerald-400 transition-all"
                >
                  <FaSave />
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-3 font-semibold text-red-300 hover:bg-red-500/20 transition-all"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-gradient-to-br from-black via-red-950/10 to-black p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white">Confirm Delete</h3>
            <p className="mt-3 text-red-200/90">
              তুমি কি নিশ্চিত{" "}
              <span className="font-semibold text-white">
                {deleteModal.title}
              </span>{" "}
              game delete করতে চাও?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={confirmDelete}
                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-500 transition-all"
              >
                <FaTrash />
                Yes, Delete
              </button>

              <button
                onClick={closeDeleteModal}
                className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-green-700/40 bg-black/50 px-5 py-3 font-semibold text-white hover:bg-green-950/20 transition-all"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGames;
