import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Eye,
  EyeOff,
  Wallet,
  AlertCircle,
  TrendingUp,
  Gift,
  BarChart3,
  ClipboardList,
  ReceiptText,
  FileText,
  User,
  Lock,
  Inbox,
  MessageCircle,
  Mail,
  LogOut,
  X,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { logout } from "../../features/auth/authSlice";
import {
  selectUser,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const Account = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authUser = useSelector(selectUser);
  const isAuthed = useSelector(selectIsAuthenticated);

  const [profile, setProfile] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const text = {
    accountName: isBangla ? "অ্যাকাউন্ট" : "Account",
    vipPoints: isBangla ? "ভিআইপি পয়েন্টস (VP)" : "VIP Points (VP)",
    myVip: isBangla ? "আমার VIP" : "My VIP",
    mainWallet: isBangla ? "মূল ওয়ালেট" : "Main Wallet",
    funds: isBangla ? "ফান্ডস" : "Funds",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    dispute: isBangla ? "ডিসপিউট" : "Dispute",
    myWallet: isBangla ? "আমার ওয়ালেট" : "My Wallet",
    withdrawal: isBangla ? "উইথড্র" : "Withdrawal",
    myPL: isBangla ? "আমার P&L" : "My P&L",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    myRewards: isBangla ? "আমার রিওয়ার্ডস" : "My Rewards",
    pl: isBangla ? "পি&এল" : "P&L",
    history: isBangla ? "হিস্টোরি" : "History",
    bettingRecords: isBangla ? "বেটিং রেকর্ডস" : "Betting Records",
    parlayRecords: isBangla ? "উইথড্র রেকর্ডস" : "Withdrawal Records",
    transactionRecords: isBangla ? "ডিপোজিট রেকর্ডস" : "Deposit Records",
    profile: isBangla ? "প্রোফাইল" : "Profile",
    personalInfo: isBangla ? "ব্যক্তিগত তথ্য" : "Personal Info",
    resetPassword: isBangla ? "পাসওয়ার্ড রিসেট" : "Reset password",
    inbox: isBangla ? "ইনবক্স" : "Inbox",
    contactUs: isBangla ? "যোগাযোগ করুন" : "Contact Us",
    whatsapp: isBangla ? "হোয়াটসঅ্যাপ" : "WhatsApp",
    email: isBangla ? "ইমেইল" : "Email",
    logout: isBangla ? "লগ আউট" : "Log out",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    guest: isBangla ? "গেস্ট" : "Guest",
    fullName: isBangla ? "পূর্ণ নাম" : "Full Name",
  };

  const formatMoney = (value) => {
    const num = Number(value || 0);
    return `৳${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const hiddenBalance = "৳••••••";

  const loadProfile = async () => {
    if (!isAuthed) {
      setProfile(null);
      return;
    }

    try {
      setLoadingBalance(true);

      const { data } = await api.get("/api/users/me");
      const userData = data?.user || data?.data || null;

      if (userData) {
        setProfile(userData);
      }
    } catch (error) {
      console.error("Failed to fetch profile/balance:", error);
      toast.error(
        error?.response?.data?.message ||
          (isBangla ? "ব্যালেন্স লোড করা যায়নি" : "Failed to load balance"),
      );
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [isAuthed]);

  const realUser = profile || authUser || null;
  const realUserId = realUser?.userId || text.guest;
  const realFullName =
    `${realUser?.firstName || ""} ${realUser?.lastName || ""}`.trim() ||
    realUserId;
  const realBalance = formatMoney(realUser?.balance || 0);

  const fundsItems = useMemo(
    () => [
      { title: text.deposit, icon: Wallet, to: "/auto-deposit" },
      { title: text.dispute, icon: AlertCircle, to: "/dispute" },
      { title: text.myWallet, icon: Wallet, to: "/wallet" },
      { title: text.withdrawal, icon: Wallet, to: "/withdraw" },
    ],
    [text],
  );

  const plItems = useMemo(
    () => [
      {
        title: text.turnover,
        icon: TrendingUp,
        to: "/history/turnover-history",
      },
      { title: text.myRewards, icon: Gift, to: "/rewards" },
      { title: text.pl, icon: BarChart3, to: "/pl" },
    ],
    [text],
  );

  const historyItems = useMemo(
    () => [
      {
        title: text.bettingRecords,
        icon: ClipboardList,
        to: "/history/bet-history",
      },
      {
        title: text.parlayRecords,
        icon: ReceiptText,
        to: "/history/withdraw-history",
      },
      {
        title: text.transactionRecords,
        icon: FileText,
        to: "/history/deposit-history",
      },
    ],
    [text],
  );

  const profileItems = useMemo(
    () => [
      { title: text.personalInfo, icon: User, to: "/personal-info" },
      { title: text.resetPassword, icon: Lock, to: "/reset-password" },
      { title: text.inbox, icon: Inbox, to: "/inbox" },
    ],
    [text],
  );

  const contactItems = useMemo(
    () => [
      {
        title: text.whatsapp,
        icon: MessageCircle,
        to: "http://whatsapp.com/",
        external: true,
      },
      {
        title: text.email,
        icon: Mail,
        to: "https://mail.google.com/",
        external: true,
      },
    ],
    [text],
  );

  const SectionTitle = ({ title }) => (
    <div className="flex items-center gap-2 border-b border-white/10 px-2 py-3">
      <span className="h-5 w-[5px] rounded-sm bg-yellow-300" />
      <h3 className="text-xl font-bold leading-none text-yellow-300 sm:text-[22px]">
        {title}
      </h3>
    </div>
  );

  const MenuGrid = ({ items, columns = 3 }) => (
    <div
      className={`grid gap-x-2 gap-y-2 px-2 py-2 ${
        columns === 4
          ? "grid-cols-4"
          : columns === 2
            ? "grid-cols-2"
            : "grid-cols-3"
      }`}
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        if (item.external) {
          return (
            <a
              key={index}
              href={item.to}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-start text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00563d] shadow-inner transition-all duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
                <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
              </div>
              <span className="mt-3 flex min-h-[34px] items-start justify-center text-[13px] font-bold leading-[1.15] text-white sm:text-[15px]">
                {item.title}
              </span>
            </a>
          );
        }

        return (
          <NavLink
            key={index}
            to={item.to}
            className="group flex flex-col items-center justify-start text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00563d] shadow-inner transition-all duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
              <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
            </div>
            <span className="mt-3 flex min-h-[34px] items-start justify-center text-[13px] font-bold leading-[1.15] text-white sm:text-[15px]">
              {item.title}
            </span>
          </NavLink>
        );
      })}
    </div>
  );

  const handleLogout = () => {
    dispatch(logout());
    toast.success(isBangla ? "সফলভাবে লগআউট হয়েছে" : "Logged out successfully");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="text-white">
      {/* Top Header */}
      <div className="relative flex justify-center overflow-hidden bg-gradient-to-br from-black via-green-950/20 to-black px-4 pb-7 pt-5 shadow-lg shadow-green-900/20">
        {/* Close button */}
        <button
          onClick={handleHome}
          className="absolute right-4 top-4 z-[999] cursor-pointer text-white"
        >
          <X className="h-8 w-8" strokeWidth={2.2} />
        </button>

        <div className="relative z-10 flex flex-col items-center gap-3 pt-8">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#f6f6f6] via-[#f0f0f0] to-[#ff9800]">
              <span className="text-[44px] font-normal leading-none text-red-600">
                {String(realUserId || "D")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1 justify-center text-center">
            <h2 className="truncate rounded-2xl bg-yellow-400 p-1 text-[18px] font-bold text-black sm:text-[22px]">
              userId: {realUserId}
            </h2>
            <h2 className="truncate text-[18px] font-bold text-white sm:text-[22px]">
              {text.fullName}: {realFullName}
            </h2>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="mt-2 space-y-2 px-2 pb-2">
        <div className="overflow-hidden rounded-[4px] bg-red-800 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              <span>{text.mainWallet}</span>

              <button
                type="button"
                onClick={loadProfile}
                disabled={loadingBalance}
                className={loadingBalance ? "opacity-70" : ""}
              >
                <RefreshCw
                  className={`h-5 w-5 ${loadingBalance ? "animate-spin" : ""}`}
                />
              </button>

              <button
                type="button"
                onClick={() => setShowBalance((prev) => !prev)}
              >
                {showBalance ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="text-[28px] font-bold leading-none text-white sm:text-[32px]">
              {loadingBalance
                ? text.loading
                : showBalance
                  ? realBalance
                  : hiddenBalance}
            </div>
          </div>
        </div>

        {/* Funds */}
        <div className="overflow-hidden rounded-[4px] bg-[#006b49] shadow-sm">
          <SectionTitle title={text.funds} />
          <MenuGrid items={fundsItems} columns={4} />
        </div>

        {/* My P&L */}
        <div className="overflow-hidden rounded-[4px] bg-[#006b49] shadow-sm">
          <SectionTitle title={text.myPL} />
          <MenuGrid items={plItems} columns={3} />
        </div>

        {/* History */}
        <div className="overflow-hidden rounded-[4px] bg-[#006b49] shadow-sm">
          <SectionTitle title={text.history} />
          <MenuGrid items={historyItems} columns={3} />
        </div>

        {/* Profile */}
        <div className="overflow-hidden rounded-[4px] bg-[#006b49] shadow-sm">
          <SectionTitle title={text.profile} />
          <MenuGrid items={profileItems} columns={3} />
        </div>

        {/* Contact Us */}
        <div className="overflow-hidden rounded-[4px] bg-[#006b49] shadow-sm">
          <SectionTitle title={text.contactUs} />
          <MenuGrid items={contactItems} columns={2} />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-red-600 px-4 py-4 text-xl font-semibold text-white transition-all duration-200 hover:bg-red-700"
        >
          <LogOut className="h-5 w-5" />
          <span>{text.logout}</span>
        </button>
      </div>
    </div>
  );
};

export default Account;
