import React, { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserFriends,
  FaMoneyBillWave,
  FaGamepad,
  FaWallet,
  FaHourglassHalf,
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaChartPie,
  FaChartBar,
  FaCalendarAlt,
  FaClock,
  FaSyncAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    cards: {
      allUsers: 0,
      activeUsers: 0,
      allAffiliateUsers: 0,
      allDepositBalances: 0,
      allGames: 0,
      allWithdrawBalances: 0,
      pendingDepositRequest: 0,
      pendingWithdrawRequest: 0,
    },
    chart: {
      users: {
        active: 0,
        inactive: 0,
      },
      requests: {
        pendingDeposit: 0,
        pendingWithdraw: 0,
        approvedDepositAmount: 0,
        approvedWithdrawAmount: 0,
      },
    },
    latest: {
      users: [],
      deposits: [],
      withdraws: [],
    },
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/summary");
      setSummary(res?.data?.data || {});
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = useMemo(() => {
    const c = summary?.cards || {};

    return [
      {
        title: "All Users",
        value: c.allUsers || 0,
        icon: <FaUsers />,
        to: "/all-user",
        accent: "from-green-500 to-emerald-500",
      },
      {
        title: "Active User",
        value: c.activeUsers || 0,
        icon: <FaUserCheck />,
        to: "/all-user",
        accent: "from-lime-400 to-green-500",
      },
      {
        title: "All Affiliate Users",
        value: c.allAffiliateUsers || 0,
        icon: <FaUserFriends />,
        to: "/all-affiliate-user",
        accent: "from-emerald-400 to-teal-500",
      },
      {
        title: "All Deposit Balances",
        value: `৳ ${Number(c.allDepositBalances || 0).toLocaleString("en-US")}`,
        icon: <FaArrowCircleDown />,
        to: "/deposit-request",
        accent: "from-green-400 to-emerald-600",
      },
      {
        title: "All Games",
        value: c.allGames || 0,
        icon: <FaGamepad />,
        to: "/add-games",
        accent: "from-green-500 to-lime-400",
      },
      {
        title: "All Withdraw Balances",
        value: `৳ ${Number(c.allWithdrawBalances || 0).toLocaleString("en-US")}`,
        icon: <FaArrowCircleUp />,
        to: "/withdraw-request",
        accent: "from-emerald-500 to-green-700",
      },
      {
        title: "Pending Deposit Request",
        value: c.pendingDepositRequest || 0,
        icon: <FaHourglassHalf />,
        to: "/deposit-request",
        accent: "from-yellow-400 to-amber-500",
      },
      {
        title: "Pending Withdraw Request",
        value: c.pendingWithdrawRequest || 0,
        icon: <FaWallet />,
        to: "/withdraw-request",
        accent: "from-orange-400 to-red-500",
      },
    ];
  }, [summary]);

  const activeUsers = Number(summary?.chart?.users?.active || 0);
  const inactiveUsers = Number(summary?.chart?.users?.inactive || 0);
  const totalUsersForPie = activeUsers + inactiveUsers;

  const activePercent = totalUsersForPie
    ? Math.round((activeUsers / totalUsersForPie) * 100)
    : 0;

  const inactivePercent = totalUsersForPie ? 100 - activePercent : 0;

  const requestBars = useMemo(() => {
    const req = summary?.chart?.requests || {};

    const data = [
      {
        label: "Pending Deposit",
        value: Number(req.pendingDeposit || 0),
      },
      {
        label: "Pending Withdraw",
        value: Number(req.pendingWithdraw || 0),
      },
      {
        label: "Deposit Amount",
        value: Number(req.approvedDepositAmount || 0),
      },
      {
        label: "Withdraw Amount",
        value: Number(req.approvedWithdrawAmount || 0),
      },
    ];

    const max = Math.max(...data.map((item) => item.value), 1);

    return data.map((item) => ({
      ...item,
      height: `${Math.max((item.value / max) * 100, item.value > 0 ? 12 : 4)}%`,
    }));
  }, [summary]);

  const calendarData = useMemo(() => {
    const current = new Date(now);
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startWeekDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    for (let i = 0; i < startWeekDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }

    return {
      monthLabel: current.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      today: current.getDate(),
      days,
    };
  }, [now]);

  const formatDateTime = (date) => {
    return {
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  };

  const { time, date } = formatDateTime(now);

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto">
        <div className="rounded-3xl border border-green-700/40 bg-gradient-to-br from-black via-green-950/20 to-black shadow-2xl overflow-hidden">
          {/* header */}
          <div className="border-b border-green-700/40 bg-gradient-to-r from-green-700/20 via-emerald-600/10 to-green-700/20 px-4 sm:px-6 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                  <FaChartBar className="text-2xl text-black" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Dashboard Overview
                  </h1>
                  <p className="text-sm text-green-200/80 mt-1">
                    Admin panel summary, charts, calendar, time and recent data
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDashboard}
                disabled={loading}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 font-bold text-black hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-60"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8 space-y-8">
            {/* cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
              {cards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => navigate(card.to)}
                  className="cursor-pointer text-left rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 shadow-xl hover:border-green-400/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-green-200/80 font-medium">
                        {card.title}
                      </p>
                      <h3 className="mt-3 text-2xl md:text-3xl font-extrabold text-white break-words">
                        {card.value}
                      </h3>
                    </div>

                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-black text-2xl shadow-lg`}
                    >
                      {card.icon}
                    </div>
                  </div>

                  <div className="mt-5 text-xs text-green-300/80">
                    Click to open
                  </div>
                </button>
              ))}
            </div>

            {/* charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* round chart */}
              <div className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <FaChartPie className="text-xl text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      User Status Chart
                    </h2>
                    <p className="text-sm text-green-200/70">
                      Active vs inactive users
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex justify-center items-center">
                    <div
                      className="relative w-52 h-52 rounded-full border border-green-700/40 shadow-inner"
                      style={{
                        background: `conic-gradient(#22c55e 0% ${activePercent}%, #ef4444 ${activePercent}% 100%)`,
                      }}
                    >
                      <div className="absolute inset-[22px] rounded-full bg-black/90 border border-green-700/30 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">
                          {totalUsersForPie}
                        </span>
                        <span className="text-sm text-green-200/80">
                          Total Users
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="rounded-2xl border border-green-700/30 bg-black/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-300 font-medium">
                          Active Users
                        </span>
                        <span className="text-white font-bold">
                          {activeUsers}
                        </span>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                          style={{ width: `${activePercent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-green-200/70">
                        {activePercent}% of total
                      </div>
                    </div>

                    <div className="rounded-2xl border border-green-700/30 bg-black/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-red-300 font-medium">
                          Inactive Users
                        </span>
                        <span className="text-white font-bold">
                          {inactiveUsers}
                        </span>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500"
                          style={{ width: `${inactivePercent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-green-200/70">
                        {inactivePercent}% of total
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* pillar chart */}
              <div className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <FaChartBar className="text-xl text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Requests & Amount Chart
                    </h2>
                    <p className="text-sm text-green-200/70">
                      Deposit / withdraw activity overview
                    </p>
                  </div>
                </div>

                <div className="h-[320px] rounded-3xl border border-green-700/20 bg-black/30 p-4">
                  <div className="h-full flex items-end justify-between gap-3">
                    {requestBars.map((bar) => (
                      <div
                        key={bar.label}
                        className="flex-1 h-full flex flex-col items-center justify-end gap-3"
                      >
                        <div className="text-[11px] md:text-xs text-green-100 font-semibold text-center break-words">
                          {bar.value.toLocaleString("en-US")}
                        </div>

                        <div className="w-full flex items-end justify-center h-[220px]">
                          <div
                            className="w-full max-w-[70px] rounded-t-2xl bg-gradient-to-t from-green-700 via-emerald-500 to-green-300 shadow-lg shadow-green-700/30 transition-all duration-500"
                            style={{ height: bar.height }}
                          />
                        </div>

                        <div className="text-[10px] md:text-xs text-green-200/80 text-center leading-tight min-h-[30px]">
                          {bar.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* calendar + time */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* calendar */}
              <div className="xl:col-span-2 rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <FaCalendarAlt className="text-xl text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Real Time Calendar
                    </h2>
                    <p className="text-sm text-green-200/70">
                      {calendarData.monthLabel}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs md:text-sm font-semibold text-green-300 py-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarData.days.map((day, index) => {
                    const isToday = day === calendarData.today;

                    return (
                      <div
                        key={index}
                        className={`h-14 sm:h-16 rounded-2xl border flex items-center justify-center text-sm md:text-base font-semibold ${
                          day
                            ? isToday
                              ? "border-green-300 bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-lg shadow-green-500/30"
                              : "border-green-700/30 bg-black/40 text-white"
                            : "border-transparent bg-transparent"
                        }`}
                      >
                        {day || ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* time/date/summary */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <FaClock className="text-xl text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Current Time
                      </h2>
                      <p className="text-sm text-green-200/70">
                        Live date & time
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-green-700/30 bg-black/40 p-5 text-center">
                    <div className="text-3xl md:text-4xl font-black tracking-wide text-white">
                      {time}
                    </div>
                    <div className="mt-3 text-sm md:text-base text-green-200/80 leading-relaxed">
                      {date}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-white mb-5">
                    Dashboard Summary
                  </h2>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-green-700/30 bg-black/40 px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-green-200">Total Users</span>
                      <span className="font-bold text-white">
                        {summary?.cards?.allUsers || 0}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-green-700/30 bg-black/40 px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-green-200">Affiliate Users</span>
                      <span className="font-bold text-white">
                        {summary?.cards?.allAffiliateUsers || 0}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-green-700/30 bg-black/40 px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-green-200">Total Games</span>
                      <span className="font-bold text-white">
                        {summary?.cards?.allGames || 0}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-green-700/30 bg-black/40 px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-green-200">Pending Deposits</span>
                      <span className="font-bold text-white">
                        {summary?.cards?.pendingDepositRequest || 0}
                      </span>
                    </div>

                    <div className="rounded-2xl border border-green-700/30 bg-black/40 px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-green-200">Pending Withdraws</span>
                      <span className="font-bold text-white">
                        {summary?.cards?.pendingWithdrawRequest || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* latest activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-5">
                  Latest Users
                </h2>

                <div className="space-y-3">
                  {(summary?.latest?.users || []).length === 0 ? (
                    <div className="rounded-2xl border border-green-700/20 bg-black/40 p-4 text-green-200/70 text-sm">
                      No data found
                    </div>
                  ) : (
                    summary.latest.users.map((user) => (
                      <div
                        key={user._id}
                        className="rounded-2xl border border-green-700/20 bg-black/40 p-4"
                      >
                        <div className="font-semibold text-white">
                          {user?.userId || "N/A"}
                        </div>
                        <div className="text-sm text-green-200/80 mt-1 break-all">
                          {user?.phone || "No phone"} • {user?.role || "N/A"}
                        </div>
                        <div className="text-xs text-green-300/70 mt-1">
                          {user?.isActive ? "Active" : "Inactive"} • ৳{" "}
                          {Number(user?.balance || 0).toLocaleString("en-US")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-5">
                  Latest Deposit Requests
                </h2>

                <div className="space-y-3">
                  {(summary?.latest?.deposits || []).length === 0 ? (
                    <div className="rounded-2xl border border-green-700/20 bg-black/40 p-4 text-green-200/70 text-sm">
                      No data found
                    </div>
                  ) : (
                    summary.latest.deposits.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-green-700/20 bg-black/40 p-4"
                      >
                        <div className="font-semibold text-white">
                          {item?.user?.userId || "Unknown User"}
                        </div>
                        <div className="text-sm text-green-200/80 mt-1">
                          Amount: ৳{" "}
                          {Number(item?.amount || 0).toLocaleString("en-US")}
                        </div>
                        <div className="text-xs text-green-300/70 mt-1 uppercase">
                          Status: {item?.status || "N/A"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-green-700/30 bg-gradient-to-br from-black via-green-950/10 to-black p-5 md:p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-5">
                  Latest Withdraw Requests
                </h2>

                <div className="space-y-3">
                  {(summary?.latest?.withdraws || []).length === 0 ? (
                    <div className="rounded-2xl border border-green-700/20 bg-black/40 p-4 text-green-200/70 text-sm">
                      No data found
                    </div>
                  ) : (
                    summary.latest.withdraws.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-green-700/20 bg-black/40 p-4"
                      >
                        <div className="font-semibold text-white">
                          {item?.user?.userId || "Unknown User"}
                        </div>
                        <div className="text-sm text-green-200/80 mt-1">
                          Amount: ৳{" "}
                          {Number(item?.amount || 0).toLocaleString("en-US")}
                        </div>
                        <div className="text-xs text-green-300/70 mt-1 uppercase">
                          Status: {item?.status || "N/A"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
