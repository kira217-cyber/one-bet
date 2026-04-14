import React from "react";
import { NavLink } from "react-router";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Gamepad2,
  RotateCcw,
} from "lucide-react";
import { BiMoneyWithdraw } from "react-icons/bi";
import { MdHdrAuto } from "react-icons/md";

const navItems = [
  {
    name: "Deposit History",
    path: "/history/deposit-history",
    icon: Wallet,
  },
  {
    name: "Withdraw History",
    path: "/history/withdraw-history",
    icon: BiMoneyWithdraw ,
  },
  {
    name: "Auto Deposit History",
    path: "/history/auto-deposit-history",
    icon: MdHdrAuto ,
  },
  {
    name: "Bet History",
    path: "/history/bet-history",
    icon: Gamepad2,
  },
  {
    name: "Turnover History",
    path: "/history/turnover-history",
    icon: RotateCcw,
  },
];

const HistoryNavbar = () => {
  return (
    <div className="w-full">
      <div className="mt-2">
        <div className="bg-[#00563c] p-[4px] rounded-[4px]">
          <div className="relative flex-1 min-w-0">
            <div
              className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
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
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `cursor-pointer h-[40px] px-4 min-w-max rounded-[4px] text-[12px] sm:text-[14px] font-bold whitespace-nowrap transition-all duration-200 shrink-0 flex items-center gap-2 ${
                        isActive
                          ? "bg-[#d8e900] text-[#003c29]"
                          : "bg-[#003c29] text-white hover:bg-[#014b34]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={16}
                          className={isActive ? "text-[#003c29]" : "text-white"}
                        />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryNavbar;
