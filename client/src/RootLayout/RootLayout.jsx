import React, { useState } from "react";
import Navber from "../components/Navber/Navber";
import { Outlet, useLocation } from "react-router";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";

const RootLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/register"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="h-screen flex justify-center bg-black overflow-hidden">
      {/* Background */}
      <div
        className="hidden lg:block fixed inset-0 bg-cover z-0"
        style={{
          backgroundImage:
            "url('https://beit365.bet/assets/images/baaji365-desktop-bg.webp')",
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[480px] h-screen bg-[#01372A] shadow-2xl overflow-hidden">
        {/* Navbar */}
        {!hideNavbar && <Navber setOpen={setOpen} />}

        {/* Sidebar */}
        <Sidebar open={open} setOpen={setOpen} />

        {/* Outlet Scroll Area */}
        <div
          className={`h-full overflow-y-auto [scrollbar-width:none] ${
            !hideNavbar ? "pt-[68px]" : ""
          } pb-20`}
        >
          <Outlet />
        </div>
        <BottomNavbar />
      </div>
    </div>
  );
};

export default RootLayout;
