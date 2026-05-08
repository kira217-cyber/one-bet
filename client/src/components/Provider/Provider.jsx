import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { FaImage } from "react-icons/fa";
import { api } from "../../api/axios";
import { useLanguage } from "../../context/LanguageProvider";

const ORACLE_PROVIDER_API = "https://api.oraclegames.live/api/providers";
const ORACLE_PROVIDER_KEY = import.meta.env.VITE_ORACLE_TOKEN;

const Provider = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [providers, setProviders] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHomeProviders = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          "/api/game-providers?isHome=true&status=active",
        );

        setProviders(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to load home providers:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeProviders();
  }, []);

  useEffect(() => {
    const loadOracleProviders = async () => {
      try {
        const res = await axios.get(ORACLE_PROVIDER_API, {
          headers: {
            "x-api-key": ORACLE_PROVIDER_KEY,
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

  const handleProviderClick = (provider) => {
    const categoryId = provider?.categoryId?._id || provider?.categoryId;

    if (!categoryId || !provider?._id) return;

    navigate(`/category/${categoryId}/games?provider=${provider._id}`);
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
        `}
      </style>

      <div className="px-3 py-4">
        <div className="flex items-center mb-4">
          <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
          <h2 className="text-yellow-400 font-semibold text-lg">
            {isBangla ? "হট প্রোভাইডার" : "Hot Providers"}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[105px] rounded-[8px] bg-[#006c4a] animate-pulse"
              />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-[#006c4a] text-center px-4 py-8 text-white rounded-[4px]">
            {isBangla
              ? "কোনো হট প্রোভাইডার পাওয়া যায়নি।"
              : "No hot providers found."}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
            {providers.map((provider) => {
              const providerName = getProviderName(provider?.providerId);
              const providerImage = provider?.providerImageUrl;

              return (
                <button
                  key={provider._id}
                  type="button"
                  onClick={() => handleProviderClick(provider)}
                  className="cursor-pointer overflow-hidden rounded-[8px] bg-[#006c4a] transition hover:-translate-y-[1px] hover:bg-[#007a53] hover:shadow-lg active:scale-[0.98]"
                >
                  <div className="provider-glass-shine relative h-[132px] overflow-hidden bg-[#0b8d63]">
                    {providerImage ? (
                      <img
                        src={providerImage}
                        alt={providerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#0b8d63]">
                        <FaImage className="text-3xl text-white/60" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Provider;
