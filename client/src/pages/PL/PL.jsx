import React from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router";

const PL = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#004d3b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex h-[66px] items-center justify-center bg-[#f2ef00] px-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 items-center justify-center text-white cursor-pointer"
        >
          <ArrowLeft size={28} strokeWidth={2.2} />
        </button>

        <h1 className="text-[22px] font-normal text-[#165a3e] sm:text-[24px]">
          PL
        </h1>
      </div>

      {/* Empty State */}
      <div className="flex min-h-[calc(100vh-66px)] items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Icon area */}
          <div className="relative mb-4 flex flex-col items-center">
            {/* shadow */}
            <div className="absolute bottom-[-8px] h-7 w-24 rounded-full bg-black/25 blur-[1px]" />

            {/* floating small dashes */}
            <span className="absolute -left-5 top-5 h-[3px] w-3 rounded-full bg-white/25" />
            <span className="absolute -right-5 top-8 h-[4px] w-[7px] rounded-full bg-white/25" />
            <span className="absolute left-1/2 top-[-10px] h-[4px] w-[6px] -translate-x-1/2 rounded-full bg-white/20" />

            {/* main icon box */}
            <div className="relative flex h-16 w-12 items-center justify-center rounded-md bg-gradient-to-b from-[#8c8c8c] via-[#d5d5d5] to-[#8d8d8d] shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),0_4px_10px_rgba(0,0,0,0.25)]">
              {/* clip top */}
              <div className="absolute -top-[2px] h-3 w-6 rounded-b-md rounded-t-sm bg-[#6a6a6a] shadow-sm" />
              <div className="absolute top-[1px] h-[6px] w-[6px] rounded-full bg-[#5b5b5b]" />

              {/* folded corner */}
              <div className="absolute bottom-[8px] right-[7px] h-4 w-4 rotate-45 bg-gradient-to-br from-[#cfcfcf] to-[#9f9f9f] shadow-inner" />
              <div className="absolute inset-[4px] rounded-[3px] border border-white/20" />

              <ClipboardList
                size={26}
                strokeWidth={1.8}
                className="text-white/15"
              />
            </div>
          </div>

          <p className="text-[18px] font-normal tracking-[0.01em] text-white/70">
            No Data
          </p>
        </div>
      </div>
    </div>
  );
};

export default PL;
