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

  const userData = data?.user || data?.data || null;

  if (!userData) {
    return null;
  }

  return {
    ...userData,

    balance: data?.balance ?? userData?.balance ?? 0,

    exposureBalance:
      data?.exposureBalance ??
      data?.nineWicket?.exposureBalance ??
      userData?.exposureBalance ??
      userData?.nineWicket?.exposureBalance ??
      0,

    totalBalance: data?.totalBalance ?? userData?.totalBalance ?? 0,

    nineWicket: data?.nineWicket ?? userData?.nineWicket ?? null,
  };
};

const fetchSiteIdentity = async () => {
  const { data } = await api.get("/api/site-identity");

  return data?.data || null;
};

const PlayGame = () => {
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
  const [isNewTabGame, setIsNewTabGame] = useState(false);
  const [isDirectRedirecting, setIsDirectRedirecting] = useState(false);

  const t = (bn, en) => (isBangla ? bn : en);

  /* =====================================================
     USER PROFILE AND BALANCE
  ===================================================== */

  const {
    data: profile,
    isLoading: profileLoading,
    isFetching: profileFetching,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["my-profile-play-game", token],
    queryFn: fetchMyProfile,
    enabled: Boolean(token && isAuthenticated),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });

  /* =====================================================
     SITE IDENTITY
  ===================================================== */

  useQuery({
    queryKey: ["site-identity-play-game"],
    queryFn: fetchSiteIdentity,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });

  const realUser = profile || reduxUser || null;

  const balance = useMemo(() => {
    const value = Number(realUser?.balance || 0);

    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [realUser?.balance]);

  const isActiveUser = realUser?.isActive === true;

  /* =====================================================
     PLAY GAME REQUEST
  ===================================================== */

  const playMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        "/api/play-game/playgame",
        {
          gameID: gameId,
          game_uid: gameId,
          gameId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    },

    onSuccess: (data) => {
      const launchUrl =
        data?.directOpenUrl ||
        data?.gameUrl ||
        data?.launch_url ||
        data?.launchUrl ||
        data?.game_url ||
        data?.url ||
        data?.data?.directOpenUrl ||
        data?.data?.gameUrl ||
        data?.data?.launch_url ||
        data?.data?.launchUrl ||
        data?.data?.game_url ||
        data?.data?.url ||
        "";

      const provider = String(data?.provider || "")
        .trim()
        .toLowerCase();

      const openType = String(data?.openType || "")
        .trim()
        .toLowerCase();

      if (!launchUrl) {
        setGameUrl("");
        setIsNewTabGame(false);
        setIsDirectRedirecting(false);

        toast.error(t("গেম URL পাওয়া যায়নি", "No game URL received"));

        navigate("/");
        return;
      }

      /* =================================================
         NINE WICKET

         iframe-এ open হবে না।
         new tab-এ open হবে না।
         current tab সরাসরি provider URL-এ যাবে।
      ================================================= */

      if (provider === "ninewicket") {
        setGameUrl("");
        setIsNewTabGame(false);
        setIsDirectRedirecting(true);

        window.location.assign(launchUrl);

        return;
      }

      /* =================================================
         OTHER NEW TAB GAMES
      ================================================= */

      if (openType === "new_tab") {
        setGameUrl("");
        setIsNewTabGame(true);
        setIsDirectRedirecting(false);

        const openedWindow = window.open(
          launchUrl,
          "_blank",
          "noopener,noreferrer",
        );

        if (!openedWindow) {
          toast.error(
            t(
              "ব্রাউজার নতুন ট্যাব ব্লক করেছে",
              "The browser blocked the new tab",
            ),
          );

          setIsNewTabGame(false);
          navigate("/");
          return;
        }

        toast.success(
          t("গেম নতুন ট্যাবে ওপেন হয়েছে", "Game opened in a new tab"),
        );

        navigate("/");
        return;
      }

      /* =================================================
         NORMAL ORACLE IFRAME GAME
      ================================================= */

      setIsNewTabGame(false);
      setIsDirectRedirecting(false);
      setGameUrl(launchUrl);
    },

    onError: (error) => {
      setGameUrl("");
      setIsNewTabGame(false);
      setIsDirectRedirecting(false);

      toast.error(
        error?.response?.data?.message ||
          t("গেম চালু হয়নি", "Failed to start game"),
      );

      navigate("/");
    },
  });

  /* =====================================================
     VALIDATE AND START GAME
  ===================================================== */

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

    if (profileLoading || profileFetching) {
      return;
    }

    if (profileError) {
      toast.error(t("প্রোফাইল লোড হয়নি", "Failed to load profile"));

      return;
    }

    if (!realUser) {
      return;
    }

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

    if (
      !gameUrl &&
      !alreadyRequested &&
      !playMutation.isPending &&
      !isNewTabGame &&
      !isDirectRedirecting
    ) {
      setAlreadyRequested(true);

      playMutation.mutate();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameId,
    isAuthenticated,
    token,
    profileLoading,
    profileFetching,
    profileError,
    realUser,
    isActiveUser,
    balance,
    gameUrl,
    alreadyRequested,
    isNewTabGame,
    isDirectRedirecting,
  ]);

  /* =====================================================
     LOADING STATE
  ===================================================== */

  const isLoading =
    profileLoading ||
    profileFetching ||
    playMutation.isPending ||
    isDirectRedirecting ||
    (!gameUrl && !isNewTabGame);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <Loading
        open={isLoading}
        text={
          isDirectRedirecting
            ? t("নাইন উইকেট ওপেন হচ্ছে...", "Opening NineWicket...")
            : profileLoading || profileFetching
              ? t("ব্যালেন্স যাচাই হচ্ছে...", "Checking balance...")
              : t("অনুগ্রহ করে অপেক্ষা করুন", "Please wait")
        }
      />

      {!isLoading && gameUrl && !isNewTabGame && !isDirectRedirecting && (
        <iframe
          src={gameUrl}
          title="Game"
          className="h-full w-full border-0"
          allow="fullscreen"
          allowFullScreen
        />
      )}

      {isLoading && profileError && !isDirectRedirecting && (
        <button
          type="button"
          onClick={() => refetchProfile()}
          disabled={profileLoading || profileFetching || playMutation.isPending}
          className="fixed bottom-8 left-1/2 z-[1000000] -translate-x-1/2 cursor-pointer rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-60"
        >
          {t("রিফ্রেশ", "Refresh")}
        </button>
      )}
    </div>
  );
};

export default PlayGame;
