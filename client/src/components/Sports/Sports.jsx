import React, { useEffect, useState } from "react";
import { FaFutbol } from "react-icons/fa";
import { GiCricketBat } from "react-icons/gi";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";

const Sports = () => {
  const [sportsList, setSportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingSportId, setCheckingSportId] = useState("");

const { isBangla } = useLanguage();

  const navigate = useNavigate();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reduxUser = useSelector(selectUser);

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

  const loadSports = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/sports");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load sports");
      }

      setSportsList(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load sports",
      );
      setSportsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSports();
  }, []);

  const handleClick = async (sport) => {
    if (!sport?.gameId) {
      toast.error("Game ID not found");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      setCheckingSportId(String(sport._id || sport.gameId));

      let currentUser = reduxUser || null;

      try {
        const { data } = await api.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        currentUser = data?.user || data?.data || currentUser;
      } catch {
        currentUser = reduxUser || null;
      }

      const isActive = currentUser?.isActive === true;

      if (!currentUser) {
        toast.error("User profile not found");
        navigate("/login");
        return;
      }

      if (!isActive) {
        toast.error("Your account is not active");
        navigate("/");
        return;
      }

      // ✅ balance check remove — 0 holeo game open hobe

      navigate(`/sports/${sport.gameId}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to continue",
      );
    } finally {
      setCheckingSportId("");
    }
  };

  return (
    <div className="px-3 py-4">
      <div className="flex items-center mb-4">
        <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
        <h2 className="text-yellow-400 font-semibold text-lg">
          {isBangla ? "স্পোর্টস" : "Sports"}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#005C40] rounded-sm py-4 px-2 animate-pulse h-[116px]"
            />
          ))}
        </div>
      ) : sportsList.length ? (
        <div className="grid grid-cols-4 gap-1">
          {sportsList.map((sport) => {
            const iconUrl = sport?.iconImage
              ? `${import.meta.env.VITE_APP_URL}${sport.iconImage}`
              : "";

            const isChecking =
              checkingSportId === String(sport._id || sport.gameId);

            return (
              <button
                key={sport._id}
                type="button"
                onClick={() => handleClick(sport)}
                disabled={!!checkingSportId}
                className="flex flex-col items-center justify-center bg-[#005C40] rounded-sm py-2 sm:py-4 cursor-pointer transition hover:bg-[#0a6b4b] disabled:opacity-70"
              >
                <div className="mb-2 flex items-center justify-center h-10 w-10">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={sport?.name?.en || "sport"}
                      className="h-full w-full object-contain"
                    />
                  ) : sport?.name?.en?.toLowerCase() === "cricket" ? (
                    <GiCricketBat className="text-4xl text-yellow-400" />
                  ) : (
                    <FaFutbol className="text-4xl text-yellow-400" />
                  )}
                </div>

                <p className="text-white text-md text-center leading-tight px-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                  {isChecking ? "Checking..." : sport?.name?.en || "Sport"}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-white/70 py-6 bg-[#005C40] rounded-sm">
          No sports found
        </div>
      )}
    </div>
  );
};

export default Sports;
