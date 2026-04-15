import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { api } from "../../api/axios";
import { useLanguage } from "../../context/LanguageProvider";

const fetchMyProfile = async () => {
  const { data } = await api.get("/api/users/me");
  return data?.user || data?.data || null;
};

const SportsPlayGame = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { isBangla } = useLanguage();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

  const [gameUrl, setGameUrl] = useState("");

  const t = (bn, en) => (isBangla ? bn : en);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["my-profile-sports-play-game"],
    queryFn: fetchMyProfile,
    enabled: !!token && !!isAuthenticated,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  const realUser = profile || reduxUser || null;
  const balance = useMemo(() => Number(realUser?.balance || 0), [realUser]);
  const isActiveUser = realUser?.isActive === true;

  const API_BASE =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || "";

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${API_BASE}/api/sports-play-game/playgame`,
        { gameID: gameId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.gameUrl) {
        setGameUrl(data.gameUrl);
      } else {
        toast.error(t("গেম URL পাওয়া যায়নি", "No game URL received"));
        navigate("/");
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          t("স্পোর্টস গেম চালু হয়নি", "Failed to start sports game"),
      );
      navigate("/");
    },
  });

  useEffect(() => {
    if (!gameId) {
      toast.error(t("গেম আইডি পাওয়া যায়নি", "Game id not found"));
      navigate("/");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error(t("খেলতে লগইন করুন", "Please login to play"));
      navigate("/login");
      return;
    }

    if (profileLoading) return;

    if (profileError) {
      toast.error(t("প্রোফাইল লোড হয়নি", "Failed to load profile"));
      return;
    }

    if (!realUser) return;

    if (!isActiveUser) {
      toast.error(
        t("আপনার একাউন্ট অ্যাক্টিভ নয়", "Your account is not active"),
      );
      navigate("/");
      return;
    }

    if (balance <= 0) {
      toast.error(
        t("ব্যালেন্স নেই, ডিপোজিট করুন", "No balance, please deposit"),
      );
      navigate("/deposit");
      return;
    }

    if (!gameUrl && !playMutation.isPending) {
      playMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameId,
    isAuthenticated,
    token,
    profileLoading,
    profileError,
    realUser,
    isActiveUser,
    balance,
    gameUrl,
  ]);

  const closeGame = () => {
    setGameUrl("");
    navigate("/");
  };

  const isLoading = profileLoading || playMutation.isPending || !gameUrl;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Close button */}
      {/* <button
        onClick={closeGame}
        className="fixed top-4 right-4 z-[10000] text-white bg-red-600 hover:bg-red-700 p-3 rounded-full cursor-pointer shadow-lg"
        title={t("বন্ধ করুন", "Close")}
      >
        <FaTimes size={22} />
      </button> */}

      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-5" />

          <p className="text-lg font-semibold">
            {profileLoading
              ? t("ব্যালেন্স যাচাই হচ্ছে...", "Checking balance...")
              : t("স্পোর্টস গেম লোড হচ্ছে...", "Loading sports game...")}
          </p>

          <button
            type="button"
            onClick={() => refetchProfile()}
            disabled={profileLoading}
            className="mt-6 px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/15 hover:bg-white/15 disabled:opacity-60 cursor-pointer"
          >
            {t("রিফ্রেশ", "Refresh")}
          </button>
        </div>
      ) : (
        <iframe
          src={gameUrl}
          title="Sports Game"
          className="w-full h-full border-0"
          allow="fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default SportsPlayGame;
