import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaUsers,
  FaWallet,
  FaChartLine,
  FaBullhorn,
  FaSignOutAlt,
  FaUserCircle,
  FaTimes,
} from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../../features/auth/authSlice";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const nowDesktop = window.innerWidth >= 768;
      setIsDesktop(nowDesktop);
      if (nowDesktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    });
    navigate("/");
  };

  const menuItems = useMemo(
    () => [
      {
        to: "/dashboard",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        to: "/dashboard/my-users",
        icon: <FaUsers />,
        text: "My Users",
      },
      {
        to: "/dashboard/all-affiliate-user",
        icon: <FaUsers />,
        text: "All Affiliate Users",
      },
      {
        to: "/dashboard/deposit",
        icon: <FaWallet />,
        text: "Deposit",
      },
      {
        to: "/dashboard/withdraw",
        icon: <FaChartLine />,
        text: "Withdraw",
      },
      {
        to: "/dashboard/notices",
        icon: <FaBullhorn />,
        text: "Notices",
      },
    ],
    [],
  );

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-black via-green-950/20 to-black text-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-700 via-emerald-600 to-green-500 px-4 py-3 flex items-center justify-between shadow-lg shadow-green-900/30">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-green-800/60 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <div className="flex items-center gap-5">
          <Link to="/dashboard/profile" className="cursor-pointer">
            <FaUserCircle className="text-2xl text-white hover:text-green-100 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-black via-green-950/30 to-black border-r border-green-700/40 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="p-6 border-b border-green-700/40 bg-gradient-to-r from-black/70 to-green-950/20 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <span className="text-black font-black text-3xl tracking-wider">
                    A
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    AFFILIATE
                  </h2>
                  <p className="text-sm text-green-200/90 font-medium">
                    Aff Panel
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Close */}
            {open && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-green-800/50 text-white hover:text-green-200 md:hidden transition-colors cursor-pointer"
              >
                <FaTimes size={24} />
              </button>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-black shadow-lg shadow-green-600/50"
                        : "text-white hover:bg-green-900/40 hover:text-green-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`text-2xl transition-transform duration-200 ${
                          isActive
                            ? "scale-110 text-black"
                            : "opacity-90 group-hover:scale-110 text-white"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.text}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-5 border-t border-green-700/40 mt-auto shrink-0">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-black font-medium transition-all duration-300 shadow-lg shadow-green-600/50 border border-green-400/40"
              >
                <FaSignOutAlt className="text-black" />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Topbar */}
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-6 border-b border-green-700/40 bg-gradient-to-r from-black/90 via-green-950/40 to-black/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-green-300/80 mt-1">
                Welcome to your admin control panel
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/dashboard/profile"
                className="p-1 hover:bg-green-800/40 rounded-full transition-colors cursor-pointer"
              >
                <FaUserCircle className="text-3xl text-green-300 hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto [scrollbar-width:none]">
            <div className="h-full">
              <div className="mt-16 md:mt-0 p-4 lg:p-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
