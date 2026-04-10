import React, { useState, useEffect, useMemo } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHome,
  FaBell,
  FaWallet,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaPaintBrush,
  FaCog,
  FaImage,
  FaDownload,
  FaVideo,
  FaLink,
  FaGlobe,
  FaStickyNote,
  FaBullhorn,
  FaGamepad,
  FaLayerGroup,
  FaServer,
  FaStream,
  FaHistory,
} from "react-icons/fa";
import { FaDiagramProject, FaCodePullRequest } from "react-icons/fa6";
import {
  PiBridgeBold,
  PiHandWithdrawBold,
  PiHandDepositBold,
} from "react-icons/pi";
import { HiMiniCubeTransparent } from "react-icons/hi2";
import { GiCardJackClubs } from "react-icons/gi";
import { IoAppsSharp } from "react-icons/io5";
import { GrAnnounce, GrUserAdmin } from "react-icons/gr";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { logout } from "../../features/auth/authSlice";
import { selectAuth } from "../../features/auth/authSelectors";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [affColorOpen, setAffColorOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const admin = auth?.admin;
  const role = admin?.role; // mother | sub
  const permissions = admin?.permissions || [];
  const isMother = role === "mother";

  const canAccess = (key) => isMother || permissions.includes(key);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        to: "/",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        key: "__mother__",
        to: "/create-admin",
        icon: <GrUserAdmin />,
        text: "Create Admin",
      },
      {
        key: "add-promotion",
        to: "/add-promotion",
        icon: <FaDiagramProject />,
        text: "Add Promotion",
      },
    ],
    [],
  );

  const gamesItems = useMemo(
    () => [
      {
        key: "add-game-category",
        to: "/add-game-category",
        icon: <FaLayerGroup className="text-green-400" />,
        text: "Add Game Category",
      },
      {
        key: "add-provider",
        to: "/add-provider",
        icon: <FaServer className="text-emerald-400" />,
        text: "Add Provider",
      },
      {
        key: "add-game",
        to: "/add-game",
        icon: <FaGamepad className="text-lime-400" />,
        text: "Add Game",
      },
      {
        key: "live-controller",
        to: "/live-controller",
        icon: <FaStream className="text-green-300" />,
        text: "Live Controller",
      },
      {
        key: "all-bet-logs",
        to: "/all-bet-logs",
        icon: <HiMiniCubeTransparent className="text-emerald-300" />,
        text: "All Bet Logs",
      },
    ],
    [],
  );

  const usersItems = useMemo(
    () => [
      {
        key: "all-user",
        to: "/all-user",
        icon: <FaUsers className="text-green-400" />,
        text: "All Users",
      },
      {
        key: "all-affiliate-user",
        to: "/all-affiliate-user",
        icon: <FaUsers className="text-emerald-400" />,
        text: "All Affiliator",
      },
      {
        key: "affiliate-user-brige",
        to: "/affiliate-user-brige",
        icon: <PiBridgeBold className="text-lime-400" />,
        text: "Affiliate User Bridge",
      },
    ],
    [],
  );

  const colorItems = useMemo(
    () => [
      {
        key: "color-controller-client",
        to: "/color-controller-client",
        icon: <FaPaintBrush />,
        text: "Color Client",
      },
    ],
    [],
  );

  const affColorItems = useMemo(
    () => [
      {
        key: "aff-color-controller-client",
        to: "/aff-color-controller-client",
        icon: <FaPaintBrush />,
        text: "Color Client",
      },
    ],
    [],
  );

  const depositItems = useMemo(
    () => [
      {
        key: "add-deposit",
        to: "/add-deposit",
        icon: <PiHandDepositBold />,
        text: "Add Deposit",
      },
      {
        key: "add-redeem",
        to: "/add-redeem",
        icon: <PiHandDepositBold />,
        text: "Add Redeem",
      },
      {
        key: "deposit-request",
        to: "/deposit-request",
        icon: <FaCodePullRequest />,
        text: "Deposit Request",
      },
      {
        key: "add-auto-deposit",
        to: "/add-auto-deposit",
        icon: <FaCog />,
        text: "Auto Deposit Setting",
      },
      {
        key: "auto-deposit-history",
        to: "/auto-deposit-history",
        icon: <FaHistory className="text-green-300" />,
        text: "Auto Deposit History",
      },
    ],
    [],
  );

  const withdrawItems = useMemo(
    () => [
      {
        key: "add-withdraw",
        to: "/add-withdraw",
        icon: <PiHandWithdrawBold />,
        text: "Add Withdraw",
      },
      {
        key: "withdraw-request",
        to: "/withdraw-request",
        icon: <FaCodePullRequest />,
        text: "Withdraw Request",
      },
      {
        key: "add-aff-withdraw",
        to: "/add-aff-withdraw",
        icon: <PiHandWithdrawBold />,
        text: "Add Aff Withdraw",
      },
      {
        key: "affiliate-withdraw-request",
        to: "/affiliate-withdraw-request",
        icon: <FaCodePullRequest />,
        text: "Aff Withdraw Request",
      },
    ],
    [],
  );

  const clientItems = useMemo(
    () => [
      {
        key: "fav-icon-and-logo-controller",
        to: "/fav-icon-and-logo-controller",
        icon: <FaCog />,
        text: "Favicon & Logo Controller",
      },
      {
        key: "jackpot-controller",
        to: "/jackpot-controller",
        icon: <GiCardJackClubs />,
        text: "Jackpot Controller",
      },
      {
        key: "download-header-controller",
        to: "/download-header-controller",
        icon: <FaDownload />,
        text: "Download Header Controller",
      },
      {
        key: "slider-controller",
        to: "/slider-controller",
        icon: <FaImage />,
        text: "Slider Controller",
      },
      {
        key: "notice-controller",
        to: "/notice-controller",
        icon: <FaBullhorn />,
        text: "Notice Controller",
      },
      {
        key: "two-banner-controller",
        to: "/two-banner-controller",
        icon: <FaImage />,
        text: "Two Banner Controller",
      },
      {
        key: "single-banner-controller",
        to: "/single-banner-controller",
        icon: <FaImage />,
        text: "Single Banner Controller",
      },
      {
        key: "download-banner-controller",
        to: "/download-banner-controller",
        icon: <FaDownload />,
        text: "Download Banner Controller",
      },
      {
        key: "banner-video-controller",
        to: "/banner-video-controller",
        icon: <FaVideo />,
        text: "Banner Video Controller",
      },
      {
        key: "floating-social-controller",
        to: "/floating-social-controller",
        icon: <FaLink />,
        text: "Social Link Controller",
      },
      {
        key: "footer-controller",
        to: "/footer-controller",
        icon: <FaGlobe />,
        text: "Footer Controller",
      },
    ],
    [],
  );

  const affiliateItems = useMemo(
    () => [
      {
        key: "aff-footer-controller",
        to: "/aff-footer-controller",
        icon: <FaGlobe />,
        text: "Aff Footer Controller",
      },
      {
        key: "aff-slider-controller",
        to: "/aff-slider-controller",
        icon: <FaImage />,
        text: "Aff Slider Controller",
      },
      {
        key: "aff-whyus-controller",
        to: "/aff-whyus-controller",
        icon: <FaStickyNote />,
        text: "Aff WhyUs Controller",
      },
      {
        key: "aff-agent-controller",
        to: "/aff-agent-controller",
        icon: <FaUsers />,
        text: "Aff Agent Controller",
      },
      {
        key: "aff-notice-controller",
        to: "/aff-notice-controller",
        icon: <FaBullhorn />,
        text: "Aff Notice Controller",
      },
      {
        key: "aff-fav-and-title-controller",
        to: "/aff-fav-and-title-controller",
        icon: <FaCog />,
        text: "Aff Fav & Title Controller",
      },
      {
        key: "aff-floating-social-controller",
        to: "/aff-floating-social-controller",
        icon: <FaLink />,
        text: "Aff Floating Social Controller",
      },
      {
        key: "aff-commission-controller",
        to: "/aff-commission-controller",
        icon: <FaWallet />,
        text: "Aff Commission Controller",
      },
    ],
    [],
  );

  const visibleMenuItems = useMemo(
    () =>
      menuItems.filter((item) => {
        if (item.key === "__mother__") return isMother;
        return canAccess(item.key);
      }),
    [menuItems, isMother, permissions],
  );

  const visibleGamesItems = useMemo(
    () => gamesItems.filter((item) => canAccess(item.key)),
    [gamesItems, permissions, isMother],
  );

  const visibleUsersItems = useMemo(
    () => usersItems.filter((item) => canAccess(item.key)),
    [usersItems, permissions, isMother],
  );

  const visibleColorItems = useMemo(
    () => colorItems.filter((item) => canAccess(item.key)),
    [colorItems, permissions, isMother],
  );

  const visibleAffColorItems = useMemo(
    () => affColorItems.filter((item) => canAccess(item.key)),
    [affColorItems, permissions, isMother],
  );

  const visibleDepositItems = useMemo(
    () => depositItems.filter((item) => canAccess(item.key)),
    [depositItems, permissions, isMother],
  );

  const visibleWithdrawItems = useMemo(
    () => withdrawItems.filter((item) => canAccess(item.key)),
    [withdrawItems, permissions, isMother],
  );

  const visibleClientItems = useMemo(
    () => clientItems.filter((item) => canAccess(item.key)),
    [clientItems, permissions, isMother],
  );

  const visibleAffiliateItems = useMemo(
    () => affiliateItems.filter((item) => canAccess(item.key)),
    [affiliateItems, permissions, isMother],
  );

  const showGames = visibleGamesItems.length > 0;
  const showUsers = visibleUsersItems.length > 0;
  const showColor = visibleColorItems.length > 0;
  const showAffColor = visibleAffColorItems.length > 0;
  const showDeposit = visibleDepositItems.length > 0;
  const showWithdraw = visibleWithdrawItems.length > 0;
  const showClient = visibleClientItems.length > 0;
  const showAffiliate = visibleAffiliateItems.length > 0;

  useEffect(() => {
    if (!showGames) setGamesOpen(false);
    if (!showUsers) setUsersOpen(false);
    if (!showColor) setColorOpen(false);
    if (!showAffColor) setAffColorOpen(false);
    if (!showDeposit) setDepositOpen(false);
    if (!showWithdraw) setWithdrawOpen(false);
    if (!showClient) setClientOpen(false);
    if (!showAffiliate) setAffiliateOpen(false);
  }, [
    showGames,
    showUsers,
    showColor,
    showAffColor,
    showDeposit,
    showWithdraw,
    showClient,
    showAffiliate,
  ]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const panelTitle = isMother ? "Mother Admin Panel" : "Sub Admin Panel";

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-black via-green-950/20 to-black text-white">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-700 via-emerald-600 to-green-500 px-4 py-3 flex items-center justify-between shadow-lg shadow-green-900/30">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-green-800/60 transition-colors"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <div className="flex items-center gap-5">
          <button className="relative p-1.5">
            <FaBell className="text-xl text-white hover:text-green-100 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-400/70"></span>
          </button>
          <Link to="/profile">
            <FaUserCircle className="text-2xl text-white hover:text-green-100 transition-colors cursor-pointer" />
          </Link>
        </div>
      </div>

      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-black via-green-950/30 to-black border-r border-green-700/40 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-green-700/40 bg-gradient-to-r from-black/70 to-green-950/20 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <span className="text-black font-black text-3xl tracking-wider">
                    A
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    ADMIN
                  </h2>
                  <p className="text-sm text-green-200/90 font-medium">
                    {panelTitle}
                  </p>
                </div>
              </div>
            </div>

            {!isDesktop && (
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-green-800/50 text-white hover:text-green-200 md:hidden transition-colors"
              >
                <FaTimes size={24} />
              </button>
            )}

            <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
              {visibleMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-black shadow-lg shadow-green-600/50"
                        : "text-white hover:bg-green-900/40 hover:text-green-100"
                    }`
                  }
                >
                  <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200 text-white">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </NavLink>
              ))}

              {showGames && (
                <DropdownSection
                  title="Games"
                  icon={<FaGamepad />}
                  iconClass="text-green-400"
                  open={gamesOpen}
                  setOpen={setGamesOpen}
                  items={visibleGamesItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {showUsers && (
                <DropdownSection
                  title="Users"
                  icon={<FaUsers />}
                  iconClass="text-emerald-400"
                  open={usersOpen}
                  setOpen={setUsersOpen}
                  items={visibleUsersItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {/* {showColor && (
                <DropdownSection
                  title="Color Controller"
                  icon={<FaPaintBrush />}
                  iconClass="text-white"
                  open={colorOpen}
                  setOpen={setColorOpen}
                  items={visibleColorItems}
                  onClose={() => setOpen(false)}
                />
              )} */}

              {/* {showAffColor && (
                <DropdownSection
                  title="Aff Color Controller"
                  icon={<FaPaintBrush />}
                  iconClass="text-white"
                  open={affColorOpen}
                  setOpen={setAffColorOpen}
                  items={visibleAffColorItems}
                  onClose={() => setOpen(false)}
                />
              )} */}

              {showDeposit && (
                <DropdownSection
                  title="Deposit"
                  icon={<PiHandDepositBold />}
                  iconClass="text-white"
                  open={depositOpen}
                  setOpen={setDepositOpen}
                  items={visibleDepositItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {showWithdraw && (
                <DropdownSection
                  title="Withdraw"
                  icon={<PiHandWithdrawBold />}
                  iconClass="text-white"
                  open={withdrawOpen}
                  setOpen={setWithdrawOpen}
                  items={visibleWithdrawItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {/* {showClient && (
                <DropdownSection
                  title="Client Site Controller"
                  icon={<GrAnnounce />}
                  iconClass="text-white"
                  open={clientOpen}
                  setOpen={setClientOpen}
                  items={visibleClientItems}
                  onClose={() => setOpen(false)}
                />
              )} */}

              {/* {showAffiliate && (
                <DropdownSection
                  title="Aff Site Controller"
                  icon={<IoAppsSharp />}
                  iconClass="text-white"
                  open={affiliateOpen}
                  setOpen={setAffiliateOpen}
                  items={visibleAffiliateItems}
                  onClose={() => setOpen(false)}
                />
              )} */}
            </nav>

            <div className="p-5 border-t border-green-700/40 mt-auto shrink-0">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-black font-medium transition-all duration-300 shadow-lg shadow-green-600/50 border border-green-400/40"
              >
                <FaSignOutAlt className="text-black" />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-6 border-b border-green-700/40 bg-gradient-to-r from-black/90 via-green-950/40 to-black/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search games, users, stats..."
                  className="w-full pl-12 pr-5 py-3 bg-black/70 border border-green-700/50 rounded-xl text-white placeholder-green-400/70 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/40 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-green-800/40 rounded-xl transition-colors">
                <FaBell className="text-xl text-green-300 hover:text-white transition-colors" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-400/60"></span>
              </button>

              <Link
                to="/profile"
                className="p-1 hover:bg-green-800/40 rounded-full transition-colors"
              >
                <FaUserCircle className="text-3xl text-green-300 hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

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

const DropdownSection = ({
  title,
  icon,
  iconClass,
  open,
  setOpen,
  items,
  onClose,
}) => {
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white hover:bg-green-900/40 hover:text-green-100 transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <span className={`text-2xl ${iconClass}`}>{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        {open ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-2 pl-14 space-y-1">
          {items.map((sub) => (
            <NavLink
              key={sub.to}
              to={sub.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-green-600/80 text-black font-medium shadow-sm shadow-green-500/40"
                    : "text-green-100 hover:text-white hover:bg-green-800/50"
                }`
              }
            >
              <span className="text-xl opacity-90 text-white">{sub.icon}</span>
              <span>{sub.text}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
