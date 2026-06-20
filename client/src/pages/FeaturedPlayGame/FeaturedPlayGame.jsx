import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { api } from "../../api/axios";
import { useLanguage } from "../../context/LanguageProvider";
import Loading from "../../components/Loading/Loading";

const fetchMyProfile = async () => {
  const { data } = await api.get("/api/users/me");
  return data?.user || data?.data || null;
};

const fetchSiteIdentity = async () => {
  const { data } = await api.get("/api/site-identity");
  return data?.data || null;
};

const FeaturedPlayGame = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { isBangla } = useLanguage();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("user_token") ||
    "";

  const [gameUrl, setGameUrl] = useState("");
  const [alreadyRequested, setAlreadyRequested] = useState(false);

  const t = (bn, en) => (isBangla ? bn : en);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["my-profile-featured-play-game"],
    queryFn: fetchMyProfile,
    enabled: !!token && !!isAuthenticated,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  useQuery({
    queryKey: ["site-identity-featured-play-game"],
    queryFn: fetchSiteIdentity,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });

  const realUser = profile || reduxUser || null;

  const balance = useMemo(() => {
    const value = Number(realUser?.balance || 0);
    return Number.isFinite(value) ? value : 0;
  }, [realUser]);

  const isActiveUser = realUser?.isActive === true;

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(
        "/api/play-game/playgame",
        {
          gameID: gameId,
          game_uid: gameId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return res.data;
    },

    onSuccess: (data) => {
      const url =
        data?.gameUrl ||
        data?.launch_url ||
        data?.launchUrl ||
        data?.url ||
        data?.data?.gameUrl ||
        data?.data?.launch_url ||
        "";

      if (url) {
        setGameUrl(url);
        return;
      }

      toast.error(t("গেম URL পাওয়া যায়নি", "No game URL received"));
      navigate("/");
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          t("ফিচার গেম চালু হয়নি", "Failed to start featured game"),
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
      navigate("/");
      return;
    }

    if (!gameUrl && !alreadyRequested && !playMutation.isPending) {
      setAlreadyRequested(true);
      playMutation.mutate();
    }
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
    alreadyRequested,
    playMutation,
    navigate,
    t,
  ]);

  const isLoading = profileLoading || playMutation.isPending || !gameUrl;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <Loading
        open={isLoading}
        text={t("ফিচার গেম প্রস্তুত হচ্ছে...", "Preparing featured game...")}
      />

      {!isLoading && gameUrl && (
        <iframe
          src={gameUrl}
          title="Featured Game"
          className="h-full w-full border-0"
          allow="fullscreen"
          allowFullScreen
        />
      )}

      {isLoading && profileError && (
        <button
          type="button"
          onClick={() => refetchProfile()}
          disabled={profileLoading}
          className="fixed bottom-8 left-1/2 z-[1000000] -translate-x-1/2 cursor-pointer rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-60"
        >
          {t("রিফ্রেশ", "Refresh")}
        </button>
      )}
    </div>
  );
};

export default FeaturedPlayGame;
