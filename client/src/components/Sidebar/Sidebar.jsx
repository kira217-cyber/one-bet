import React from "react";
import {
  Home,
  Trophy,
  Dice5,
  Ticket,
  Gift,
  Users,
  Crown,
  MessageSquare,
} from "lucide-react";
import { PiPhoneCallBold } from "react-icons/pi";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { FaPlayCircle } from "react-icons/fa";


const Sidebar = ({ open, setOpen }) => {
  return (
    <>
      {/* 🔥 Overlay (container bounded) */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/60 z-40 transition-all duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* 🔥 Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full w-[260px] bg-[#09442b] z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* 🔹 Logo */}
        <div className="p-4 text-2xl flex justify-center font-bold text-white border-b border-white/10">
          <img
            src="https://imagedelivery.net/HUCIz1_hKgf2q2UoNlOq1w/7cbc1ab7-a435-460a-2a83-e69643e58000/public"
            className="w-32 h-12"
          />
        </div>

        {/* 🔹 Scrollable Content */}
        <div className="flex-1 overflow-y-auto text-xl [scrollbar-width:none]">
          {menuItem(Home, "Home")}
          {menuItem(Trophy, "Sports")}
          {menuItem(Dice5, "Live Casino")}
          {menuItem(Ticket, "Slots")}
          {menuItem(Dice5, "Table")}
          {menuItem(Trophy, "Fishing")}
          {menuItem(Ticket, "Lottery")}

          <Divider />

          {menuItem(Gift, "Promotions")}
          {menuItem(Users, "Referral Program")}
          {menuItem(Crown, "VIP")}

          <Divider />

          {/* 🔹 Cards */}
          <div className="p-3 space-y-4">
            {/* Affiliate Program */}
            <div className="border border-green-400/30 rounded-lg p-4 flex items-center gap-4 bg-[#0F6A45] hover:bg-[#0d5a3a] cursor-pointer transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B5E3C]">
                <Users className="text-white w-6 h-6" />
              </div>
              <span className="text-yellow-400 text-sm font-medium">
                Affiliate Program
              </span>
            </div>

            {/* Live Chat */}
            <div className="border border-green-400/30 rounded-lg p-4 flex gap-4 bg-[#0F6A45] hover:bg-[#0d5a3a] cursor-pointer transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B5E3C]">
                <MessageSquare className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-yellow-400 text-sm font-medium">
                  24/7 LiveChat
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Provides 24/7 Quality service
                </p>
              </div>
            </div>

            {/* Forum */}
            <div className="border border-green-400/30 rounded-lg p-4 flex items-center gap-4 bg-[#0F6A45] hover:bg-[#0d5a3a] cursor-pointer transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B5E3C]">
                <PiPhoneCallBold className="text-white w-6 h-6" />
              </div>
              <span className="text-yellow-400 text-sm font-medium">Forum</span>
            </div>

            {/* Help */}
            <div className="border border-green-400/30 rounded-lg p-4 flex items-center gap-4 bg-[#0F6A45] hover:bg-[#0d5a3a] cursor-pointer transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B5E3C]">
                <HiOutlineExclamationCircle className="text-white w-6 h-6" />
              </div>
              <span className="text-yellow-400 text-sm font-medium">Help</span>
            </div>

            {/* Tutorials */}
            <div className="border border-green-400/30 rounded-lg p-4 flex items-center gap-4 bg-[#0F6A45] hover:bg-[#0d5a3a] cursor-pointer transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B5E3C]">
                <FaPlayCircle className="text-white w-6 h-6" />
              </div>
              <span className="text-yellow-400 text-sm font-medium">
                Tutorials
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const menuItem = (Icon, label) => (
  <div className="flex items-center gap-3 px-8 py-5 border-b border-white/10 hover:bg-green-700 transition cursor-pointer ">
    <Icon className="w-5 h-5 text-white" />
    <span className="text-yellow-400">{label}</span>
  </div>
);

const Divider = () => <div className="h-3 bg-black/40 my-2" />;

export default Sidebar;
