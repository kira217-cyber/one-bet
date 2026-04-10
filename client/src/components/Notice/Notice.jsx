import React from "react";

import { Volume2 } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const Notice = () => {
  const { isBangla } = useLanguage();

  const noticeText = isBangla
    ? "ঈদের ডেলিভারি, শুক্রবার বন্ধ থাকবে। সাময়িক অসুবিধার জন্য আমরা দুঃখিত।"
    : "Eid delivery will be closed on Friday. We apologize for the temporary inconvenience.";

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Icon */}
        <Volume2 className="text-yellow-300 w-5 h-5 shrink-0" />

        {/* Marquee Container */}
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
