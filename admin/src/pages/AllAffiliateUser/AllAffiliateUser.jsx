import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaEye,
  FaUserCheck,
  FaUserSlash,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaIdCard,
  FaWallet,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const USERS_PER_PAGE = 15;

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const AllAffiliateUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [activatingUser, setActivatingUser] = useState(null);
  const [commissionLoading, setCommissionLoading] = useState(false);

  const [commissionData, setCommissionData] = useState({
    gameLossCommission: "",
    depositCommission: "",
    referCommission: "",
    gameWinCommission: "",
  });

  const fetchAffiliateUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/users/admin/affiliate-users");

      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load affiliate users",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let updatedUsers = [...users];

    if (statusFilter === "active") {
      updatedUsers = updatedUsers.filter((user) => user.isActive);
    } else if (statusFilter === "inactive") {
      updatedUsers = updatedUsers.filter((user) => !user.isActive);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();

      updatedUsers = updatedUsers.filter((user) => {
        const userId = user?.userId?.toLowerCase() || "";
        const phone = user?.phone?.toLowerCase() || "";
        const email = user?.email?.toLowerCase() || "";

        return userId.includes(q) || phone.includes(q) || email.includes(q);
      });
    }

    return updatedUsers;
  }, [users, searchText, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const handleOpenActivateModal = (user) => {
    setActivatingUser(user);
    setCommissionData({
      gameLossCommission: user?.gameLossCommission ?? "",
      depositCommission: user?.depositCommission ?? "",
      referCommission: user?.referCommission ?? "",
      gameWinCommission: user?.gameWinCommission ?? "",
    });
    setActivateModalOpen(true);
  };

  const handleCommissionChange = (e) => {
    setCommissionData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleActivateUser = async () => {
    try {
      if (!activatingUser?._id) {
        return toast.error("No affiliate user selected");
      }

      setCommissionLoading(true);

      const payload = {
        isActive: true,
        gameLossCommission: Number(commissionData.gameLossCommission) || 0,
        depositCommission: Number(commissionData.depositCommission) || 0,
        referCommission: Number(commissionData.referCommission) || 0,
        gameWinCommission: Number(commissionData.gameWinCommission) || 0,
      };

      const { data } = await api.patch(
        `/api/users/admin/affiliate-users/${activatingUser._id}/toggle-active`,
        payload,
      );

      if (data?.success) {
        toast.success(data.message || "Affiliate user activated successfully");
        setActivateModalOpen(false);
        setActivatingUser(null);
        fetchAffiliateUsers();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to activate affiliate user",
      );
    } finally {
      setCommissionLoading(false);
    }
  };

  const handleDeactivateUser = async (user) => {
    try {
      const { data } = await api.patch(
        `/api/users/admin/affiliate-users/${user._id}/toggle-active`,
        { isActive: false },
      );

      if (data?.success) {
        toast.success(
          data.message || "Affiliate user deactivated successfully",
        );
        fetchAffiliateUsers();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to deactivate affiliate user",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] text-white">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <div className="rounded-2xl border border-green-700/40 bg-gradient-to-r from-black via-green-950/30 to-black p-4 md:p-5 shadow-lg shadow-green-900/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                All Affiliate Users
              </h1>
              <p className="text-sm md:text-base text-green-200/80 mt-1">
                Manage affiliate users, activate accounts, set commissions, and
                monitor account status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[360px]">
              <div className="rounded-xl border border-green-700/40 bg-black/40 px-4 py-3">
                <p className="text-xs text-green-300/80">Total</p>
                <p className="text-lg font-semibold">{users.length}</p>
              </div>
              <div className="rounded-xl border border-green-700/40 bg-black/40 px-4 py-3">
                <p className="text-xs text-green-300/80">Active</p>
                <p className="text-lg font-semibold">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
              <div className="rounded-xl border border-green-700/40 bg-black/40 px-4 py-3">
                <p className="text-xs text-green-300/80">Inactive</p>
                <p className="text-lg font-semibold">
                  {users.filter((u) => !u.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black/90 via-green-950/20 to-black/90 p-4 md:p-5 shadow-lg shadow-green-900/20 mb-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-base" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by User ID, Phone or Email"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/60 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`cursor-pointer px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  statusFilter === option.value
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black border-green-400 shadow-lg shadow-green-600/30"
                    : "bg-black/60 text-white border-green-700/50 hover:bg-green-900/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-green-700/40 bg-black/60 p-6 text-center text-green-200">
            Loading affiliate users...
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="rounded-2xl border border-green-700/40 bg-black/60 p-6 text-center text-green-200">
            No affiliate users found
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-green-700/40 bg-gradient-to-b from-black/90 via-green-950/20 to-black/90 p-4 shadow-lg shadow-green-900/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {user.userId}
                  </h3>
                  <p className="text-sm text-green-200/80 mt-1">
                    {user.email || "No email"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.isActive
                      ? "bg-green-500/20 text-green-300 border border-green-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-green-100">
                <div className="flex items-center gap-2">
                  <FaPhoneAlt className="text-green-400" />
                  <span>{user.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaWallet className="text-green-400" />
                  <span>Balance: {user.balance || 0}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDetails(user)}
                  className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 border border-green-700/50 text-white hover:bg-green-900/30"
                >
                  <FaEye />
                  View
                </button>

                {user.isActive ? (
                  <button
                    type="button"
                    onClick={() => handleDeactivateUser(user)}
                    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                  >
                    <FaUserSlash />
                    Deactivate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenActivateModal(user)}
                    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30"
                  >
                    <FaUserCheck />
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-2xl border border-green-700/40 bg-gradient-to-b from-black/90 via-green-950/20 to-black/90 overflow-hidden shadow-lg shadow-green-900/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-gradient-to-r from-green-700/30 to-emerald-700/20 text-left">
                <th className="px-5 py-4 text-sm font-semibold text-green-100">
                  User ID
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-green-100">
                  Phone
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-green-100">
                  Email
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-green-100">
                  Balance
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-green-100">
                  Referral Code
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-green-100">
                  Status
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-green-100 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-green-200"
                  >
                    Loading affiliate users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-green-200"
                  >
                    No affiliate users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`border-t border-green-700/20 hover:bg-green-900/10 transition-colors ${
                      index % 2 === 0 ? "bg-black/20" : "bg-transparent"
                    }`}
                  >
                    <td className="px-5 py-4 text-sm text-white font-medium">
                      {user.userId}
                    </td>
                    <td className="px-5 py-4 text-sm text-green-100">
                      {user.phone || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-sm text-green-100">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-sm text-green-100">
                      {user.balance || 0}
                    </td>
                    <td className="px-5 py-4 text-sm text-green-100">
                      {user.referralCode || "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-500/20 text-green-300 border border-green-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(user)}
                          className="cursor-pointer px-3 py-2 rounded-lg bg-black/60 border border-green-700/50 text-white hover:bg-green-900/30 text-sm"
                        >
                          View Details
                        </button>

                        {user.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivateUser(user)}
                            className="cursor-pointer px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-sm"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenActivateModal(user)}
                            className="cursor-pointer px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 text-sm"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-5 rounded-2xl border border-green-700/40 bg-gradient-to-r from-black via-green-950/20 to-black p-4 shadow-lg shadow-green-900/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-green-200/80 text-center md:text-left">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * USERS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-white">
              {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {filteredUsers.length}
            </span>{" "}
            users
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 rounded-xl bg-black/60 border border-green-700/50 text-white hover:bg-green-900/30 flex items-center gap-2"
            >
              <FaChevronLeft />
              Prev
            </button>

            <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-200 text-sm font-medium">
              Page {currentPage} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 rounded-xl bg-black/60 border border-green-700/50 text-white hover:bg-green-900/30 flex items-center gap-2"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {detailsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black shadow-2xl shadow-green-900/30 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-green-700/30 bg-gradient-to-r from-green-700/30 to-emerald-700/20">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Affiliate User Details
              </h2>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="cursor-pointer p-2 rounded-lg hover:bg-green-900/30 text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard
                icon={<FaIdCard />}
                title="User ID"
                value={selectedUser.userId}
              />
              <DetailCard
                icon={<FaUsers />}
                title="Full Name"
                value={
                  `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim() ||
                  "N/A"
                }
              />
              <DetailCard
                icon={<FaPhoneAlt />}
                title="Phone"
                value={selectedUser.phone || "N/A"}
              />
              <DetailCard
                icon={<FaEnvelope />}
                title="Email"
                value={selectedUser.email || "N/A"}
              />
              <DetailCard
                icon={<FaWallet />}
                title="Balance"
                value={selectedUser.balance ?? 0}
              />
              <DetailCard
                title="Referral Code"
                value={selectedUser.referralCode || "N/A"}
              />
              <DetailCard
                title="Status"
                value={selectedUser.isActive ? "Active" : "Inactive"}
              />
              <DetailCard
                title="Referral Count"
                value={selectedUser.referralCount ?? 0}
              />
              <DetailCard
                title="Game Loss Commission"
                value={selectedUser.gameLossCommission ?? 0}
              />
              <DetailCard
                title="Deposit Commission"
                value={selectedUser.depositCommission ?? 0}
              />
              <DetailCard
                title="Refer Commission"
                value={selectedUser.referCommission ?? 0}
              />
              <DetailCard
                title="Game Win Commission"
                value={selectedUser.gameWinCommission ?? 0}
              />
            </div>

            <div className="px-5 pb-5 md:px-6 md:pb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="cursor-pointer px-5 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-200 hover:bg-green-500/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Modal */}
      {activateModalOpen && activatingUser && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-green-700/40 bg-gradient-to-b from-black via-green-950/20 to-black shadow-2xl shadow-green-900/30 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-green-700/30 bg-gradient-to-r from-green-700/30 to-emerald-700/20">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Activate Affiliate User
              </h2>
              <button
                type="button"
                onClick={() => setActivateModalOpen(false)}
                className="cursor-pointer p-2 rounded-lg hover:bg-green-900/30 text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="mb-5 rounded-xl border border-green-700/30 bg-black/40 p-4">
                <p className="text-sm text-green-300/80">Selected User</p>
                <h3 className="text-lg font-semibold text-white mt-1">
                  {activatingUser.userId}
                </h3>
                <p className="text-sm text-green-100 mt-1">
                  {activatingUser.phone}{" "}
                  {activatingUser.email ? `• ${activatingUser.email}` : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CommissionInput
                  label="Game Loss Commission"
                  name="gameLossCommission"
                  value={commissionData.gameLossCommission}
                  onChange={handleCommissionChange}
                />

                <CommissionInput
                  label="Deposit Commission"
                  name="depositCommission"
                  value={commissionData.depositCommission}
                  onChange={handleCommissionChange}
                />

                <CommissionInput
                  label="Refer Commission"
                  name="referCommission"
                  value={commissionData.referCommission}
                  onChange={handleCommissionChange}
                />

                <CommissionInput
                  label="Game Win Commission"
                  name="gameWinCommission"
                  value={commissionData.gameWinCommission}
                  onChange={handleCommissionChange}
                />
              </div>
            </div>

            <div className="px-5 pb-5 md:px-6 md:pb-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setActivateModalOpen(false)}
                className="cursor-pointer px-5 py-3 rounded-xl bg-black/60 border border-green-700/50 text-white hover:bg-green-900/30"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleActivateUser}
                disabled={commissionLoading}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold hover:from-green-400 hover:to-emerald-400 shadow-lg shadow-green-600/30"
              >
                {commissionLoading ? "Activating..." : "Activate User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailCard = ({ icon, title, value }) => {
  return (
    <div className="rounded-xl border border-green-700/30 bg-black/40 p-4">
      <div className="flex items-center gap-2 text-green-300/80 text-sm">
        {icon ? <span>{icon}</span> : null}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-white font-medium break-words">{value}</p>
    </div>
  );
};

const CommissionInput = ({ label, name, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm text-green-200 mb-2">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl bg-black/70 border border-green-700/50 text-white placeholder-green-300/50 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
};

export default AllAffiliateUser;
