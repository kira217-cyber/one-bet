import React, { useEffect, useMemo, useState } from "react";
import { Clock3, X } from "lucide-react";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const CATEGORY_TABS = [
  { key: "ALL", label: "ALL", labelBn: "সব" },
  { key: "Favorites", label: "FAVORITES", labelBn: "ফেভারিটস" },
  { key: "Casino", label: "CASINO", labelBn: "ক্যাসিনো" },
  { key: "Slots", label: "SLOT", labelBn: "স্লট" },
  { key: "Sports", label: "SPORTS", labelBn: "স্পোর্টস" },
  { key: "Live", label: "LIVE", labelBn: "লাইভ" },
  { key: "Table", label: "TABLE", labelBn: "টেবিল" },
  { key: "Fishing", label: "FISHING", labelBn: "ফিশিং" },
  { key: "Lottery", label: "LOTTERY", labelBn: "লটারি" },
];

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getImageUrl = (image) => {
  if (!image) return "";
  return image.startsWith("http")
    ? image
    : `${import.meta.env.VITE_APP_URL}${image}`;
};

const Promotions = () => {
  const { isBangla } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/promotions");
        setPromotions(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    if (selectedPromotion) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPromotion]);

  const filteredPromotions = useMemo(() => {
    const sorted = [...promotions].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0),
    );

    if (activeCategory === "ALL") return sorted;

    return sorted.filter(
      (item) =>
        String(item?.category || "").toLowerCase() ===
        String(activeCategory).toLowerCase(),
    );
  }, [promotions, activeCategory]);

  const content = {
    title: isBangla ? "প্রোমোশনসমূহ" : "Promotions",
    details: isBangla ? "বিস্তারিত" : "Details",
    noData: isBangla ? "কোনো প্রোমোশন পাওয়া যায়নি" : "No promotions found",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    promotionPeriod: isBangla ? "প্রোমোশনের সময়কাল" : "Promotion Period",
  };

  return (
    <>
      <div className="bg-[#01372A] text-white">
        <div className="mx-auto w-full max-w-[480px] px-0 pb-6">
          {/* Category Tabs */}
          <div className="sticky z-20 bg-[#0a4a39] px-2 py-3 shadow-md">
            <div className="relative min-w-0 flex-1">
              <div
                className="no-scrollbar flex cursor-grab items-center gap-[4px] overflow-x-auto scroll-smooth active:cursor-grabbing"
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
                {CATEGORY_TABS.map((tab) => {
                  const active = activeCategory === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveCategory(tab.key)}
                      className={`cursor-pointer h-[40px] min-w-[74px] shrink-0 whitespace-nowrap rounded-[4px] px-4 text-[12px] font-bold uppercase transition-all duration-200 sm:text-[14px] ${
                        active
                          ? "bg-[#d8e900] text-[#003c29]"
                          : "bg-[#003c29] text-white hover:bg-[#014b34]"
                      }`}
                    >
                      {isBangla ? tab.labelBn : tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 h-[6px] w-full rounded-full bg-white/15">
              <div className="h-full w-[30%] rounded-full bg-[#7d9b93]" />
            </div>
          </div>

          {/* Title */}
          <div className="px-3 pt-3">
            <h1 className="text-xl font-bold text-white">{content.title}</h1>
          </div>

          {/* Promotion List */}
          <div className="space-y-4 px-3 pt-3">
            {loading ? (
              <div className="rounded-md bg-white px-4 py-8 text-center text-[#01372A]">
                {content.loading}
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="rounded-md bg-white px-4 py-8 text-center text-[#01372A]">
                {content.noData}
              </div>
            ) : (
              filteredPromotions.map((item) => {
                const imageUrl = getImageUrl(item?.image);
                const title = isBangla ? item?.title?.bn : item?.title?.en;
                const fallbackTitle = item?.title?.en || item?.title?.bn || "-";
                const createdDate = formatDate(item?.createdAt);

                return (
                  <div
                    key={item._id}
                    className="overflow-hidden rounded-sm bg-white shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                  >
                    <div className="w-full bg-black">
                      <img
                        src={imageUrl}
                        alt={fallbackTitle}
                        className="h-[145px] w-full object-cover"
                      />
                    </div>

                    <div className="bg-[#efefef] px-4 pb-4 pt-3 text-[#111]">
                      <h3 className="line-clamp-2 text-[17px] font-bold leading-[1.25]">
                        {title || fallbackTitle}
                      </h3>

                      <div className="mt-3 flex items-center gap-2 text-[15px] text-[#1e1e1e]">
                        <Clock3 className="h-4 w-4 text-[#1c8f74]" />
                        <span>{createdDate}</span>
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedPromotion(item)}
                          className="cursor-pointer flex h-[42px] w-full items-center justify-center rounded-[3px] bg-gradient-to-b from-[#2fa86c] to-[#238d5b] text-[16px] font-medium text-white transition hover:opacity-95"
                        >
                          {content.details}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedPromotion && (
        <div className="fixed inset-0 z-[9999] bg-black/70 ">
          <div className="mx-auto flex h-[700px] mt-20 w-full max-w-[420px] items-start justify-center">
            <div className="relative flex h-[700px] w-full flex-col overflow-hidden bg-[#e9e9e9] shadow-2xl">
              {/* Top image section */}
              <div className="relative shrink-0 bg-black">
                <img
                  src={getImageUrl(selectedPromotion?.image)}
                  alt={selectedPromotion?.title?.en || "promotion"}
                  className="h-[160px] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={() => setSelectedPromotion(null)}
                  className="cursor-pointer absolute right-0 top-0 z-20 flex h-[62px] w-[62px] items-center justify-center bg-[#177f60] text-white transition hover:bg-[#12694f]"
                >
                  <X className="h-7 w-7" strokeWidth={1.5} />
                </button>
              </div>

              {/* Green title bar */}
              <div className="shrink-0 bg-[#178663] px-4 py-6 text-white">
                <h2 className="pr-14 text-[18px] font-bold leading-snug">
                  {(isBangla
                    ? selectedPromotion?.title?.bn
                    : selectedPromotion?.title?.en) ||
                    selectedPromotion?.title?.en ||
                    selectedPromotion?.title?.bn ||
                    "-"}
                </h2>
              </div>

              {/* Scrollable content */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#efefef] px-4 pb-8 pt-7 text-[#111]">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[16px] font-normal text-black">
                      {content.promotionPeriod}
                    </h3>

                    <div className="mt-10 text-[16px] font-semibold text-[#0e6ecf]">
                      {formatDate(selectedPromotion?.createdAt)}
                    </div>
                  </div>

                  <div
                    className="promotion-description text-[15px] leading-7 text-[#111]"
                    dangerouslySetInnerHTML={{
                      __html:
                        (isBangla
                          ? selectedPromotion?.description?.bn
                          : selectedPromotion?.description?.en) ||
                        selectedPromotion?.description?.en ||
                        selectedPromotion?.description?.bn ||
                        "",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }

            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }

            .promotion-description table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              margin-bottom: 12px;
              display: block;
              overflow-x: auto;
            }

            .promotion-description th,
            .promotion-description td {
              border: 1px solid #cfcfcf;
              padding: 8px 10px;
              text-align: left;
              white-space: nowrap;
            }

            .promotion-description ul,
            .promotion-description ol {
              padding-left: 20px;
              margin-top: 10px;
              margin-bottom: 10px;
            }

            .promotion-description a {
              color: #0f8c67;
              text-decoration: underline;
            }

            .promotion-description p {
              margin-top: 10px;
              margin-bottom: 10px;
            }

            .promotion-description strong,
            .promotion-description b {
              font-weight: 700;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default Promotions;
