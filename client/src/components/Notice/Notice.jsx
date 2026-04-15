import React, { useEffect, useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const Notice = () => {
  const { isBangla } = useLanguage();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get("/api/notices");
        setNotices(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Failed to fetch notices:", error);
        setNotices([]);
      }
    };

    fetchNotices();
  }, []);

  const noticeText = useMemo(() => {
    if (!notices.length) {
      return isBangla
        ? "ঈদের ডেলিভারি, শুক্রবার বন্ধ থাকবে। সাময়িক অসুবিধার জন্য আমরা দুঃখিত।"
        : "Eid delivery will be closed on Friday. We apologize for the temporary inconvenience.";
    }

    return notices
      .map((item) => (isBangla ? item?.text?.bn : item?.text?.en))
      .filter(Boolean)
      .join("   •   ");
  }, [notices, isBangla]);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2">
        <Volume2 className="text-yellow-300 w-5 h-5 shrink-0" />

        <div className="relative w-full overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="text-white font-medium text-sm mr-10">
              {noticeText}
            </span>
            <span className="text-white font-medium text-sm mr-10">
              {noticeText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notice;
