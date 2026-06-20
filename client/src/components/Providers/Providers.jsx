import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../api/axios";
import { useLanguage } from "../../context/LanguageProvider";

const Providers = ({ categoryId, categoryTitle }) => {
  const navigate = useNavigate();
  const { isBangla, isEnglish } = useLanguage();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      if (!categoryId) {
        setProviders([]);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get("/api/client-games/providers", {
          params: { categoryId },
        });

        setProviders(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to load providers:", error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [categoryId]);

  const getProviderName = (provider) => {
    return (
      provider?.providerName ||
      provider?.providerTitle ||
      provider?.displayName ||
      provider?.providerId ||
      ""
    );
  };

  const titleText = useMemo(() => {
    if (isEnglish) {
      return `${categoryTitle || "Category"} Providers`;
    }

    return `${categoryTitle || "ক্যাটাগরি"} প্রোভাইডারস`;
  }, [categoryTitle, isEnglish]);

  const handleProviderClick = (provider) => {
    if (!categoryId || !provider?._id) return;

    navigate(`/category/${categoryId}/games?provider=${provider._id}`);
  };

  if (!categoryId) return null;

  if (loading) {
    return (
      <div className="px-3 pb-4">
        <div className="flex items-center mb-2 mt-2">
          <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
          <h2 className="text-yellow-400 font-semibold text-lg">{titleText}</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-[3px]">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[#006c4a] min-h-[98px] sm:min-h-[120px] flex flex-col items-center justify-center px-2 py-3 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-[#0b8d63]" />
              <div className="mt-3 h-3 w-16 bg-[#0b8d63] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="px-3 pb-4">
        <div className="flex items-center mb-2 mt-2">
          <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
          <h2 className="text-yellow-400 font-semibold text-lg">{titleText}</h2>
        </div>

        <div className="bg-[#006c4a] text-center px-4 py-8 text-white">
          {isBangla
            ? "এই ক্যাটাগরির জন্য কোনো প্রোভাইডার পাওয়া যায়নি।"
            : "No providers found for this category."}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-4">
      <div className="flex items-center mb-2 mt-2">
        <div className="w-1 h-5 bg-yellow-400 mr-2"></div>
        <h2 className="text-yellow-400 font-semibold text-lg">{titleText}</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-[3px]">
        {providers.map((provider) => {
          const providerName = getProviderName(provider);

          const providerIcon =
            provider?.providerIconUrl ||
            provider?.providerIcon ||
            provider?.providerImageUrl ||
            provider?.providerImage ||
            "";

          return (
            <button
              key={provider._id}
              type="button"
              onClick={() => handleProviderClick(provider)}
              className="cursor-pointer bg-[#006c4a] hover:bg-[#007a53] active:scale-[0.98] transition-all duration-150 min-h-[98px] flex flex-col items-center justify-center px-2 py-3"
            >
              <div className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] flex items-center justify-center">
                {providerIcon ? (
                  <img
                    src={providerIcon}
                    alt={providerName}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#0b8d63]" />
                )}
              </div>

              <p className="mt-3 text-[11px] sm:text-[12px] font-bold text-white text-center leading-tight uppercase break-words">
                {providerName}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Providers;
