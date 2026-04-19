import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
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
    localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

  const [gameUrl, setGameUrl] = useState("");

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

  const { data: siteIdentity } = useQuery({
    queryKey: ["site-identity-featured-play-game"],
    queryFn: fetchSiteIdentity,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });

  const realUser = profile || reduxUser || null;
  const balance = useMemo(() => Number(realUser?.balance || 0), [realUser]);
  const isActiveUser = realUser?.isActive === true;

  const API_BASE =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL || "";

  const logoSrc = siteIdentity?.logo
    ? siteIdentity.logo.startsWith("http")
      ? siteIdentity.logo
      : `${import.meta.env.VITE_APP_URL}${siteIdentity.logo}`
    : null;

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${API_BASE}/api/featured-play-game/playgame`,
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

  const isLoading = profileLoading || playMutation.isPending || !gameUrl;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
          <div className="relative mb-6 flex-col items-center justify-center">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="site-logo"
                className="w-40 h-20 object-contain opacity-95"
              />
            ) : (
              <div className="w-40 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 text-sm">
                {t("লোড হচ্ছে...", "Loading...")}
              </div>
            )}

            <div className="inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-[3px] border-yellow-400/25 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          </div>

          <p className="mt-2 text-sm text-white/65">
            {t(
              "অনুগ্রহ করে অপেক্ষা করুন",
              "Please wait while your featured game is being prepared",
            )}
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
          title="Featured Game"
          className="w-full h-full border-0"
          allow="fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default FeaturedPlayGame;