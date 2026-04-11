import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaPhoneAlt,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const USERS_PER_PAGE = 15;

const filterOptions = [
  { label: "All Users", value: "all" },
  { label: "Active Users", value: "active" },
  { label: "Inactive Users", value: "inactive" },
];

const MyUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/affiliate/my-users");

      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load referred users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUsers();
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

        return (
          userId.includes(q) || phone.includes(q) || email.includes(q)
        );
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

  const handleToggleStatus = async (user) => {
    try {
      setToggleLoadingId(user._id);

      const { data } = await api.patch(
        `/api/affiliate/my-users/${user._id}/toggle-status`,
        {
          isActive: !user.isActive,
        }
      );

      if (data?.success) {
        toast.success(data.message);

        setUsers((prev) =>
          prev.map((item) =>
            item._id === user._id
              ? { ...item, isActive: !item.isActive }
              : item
          )
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update user status"
      );
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] text-gray-100">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <div className="rounded-2xl border border-green-800/40 bg-gradient-to-r from-gray-950 via-green-950/30 to-gray-950 p-4 md:p-5 shadow-lg shadow-green-950/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                My Users
              </h1>
              <p className="text-sm md:text-base text-green-200/80 mt-1">
                Manage all users referred by you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[360px]">
              <div className="rounded-xl border border-green-700/40 bg-gray-900/40 px-4 py-3">
                <p className="text-xs text-green-300/80">Total</p>
                <p className="text-lg font-semibold">{users.length}</p>
              </div>
              <div className="rounded-xl border border-green-700/40 bg-gray-900/40 px-4 py-3">
                <p className="text-xs text-green-300/80">Active</p>
                <p className="text-lg font-semibold">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
              <div className="rounded-xl border border-green-700/40 bg-gray-900/40 px-4 py-3">
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
      <div className="rounded-2xl border border-green-800/40 bg-gradient-to-b from-gray-950/90 via-green-950/20 to-gray-950/90 p-4 md:p-5 shadow-lg shadow-green-950/20 mb-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-base" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by User ID, Phone or Email"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/70 border border-green-700/50 text-white placeholder-green-300/60 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`cursor-pointer px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  statusFilter === option.value
                    ? "bg-gradient-to-r from-green-600 to-teal-600 text-white border-green-400 shadow-lg shadow-green-700/30"
                    : "bg-gray-900/60 text-white border-green-700/50 hover:bg-green-900/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-green-800/40 bg-gray-900/60 p-6 text-center text-green-200">
            Loading users...
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="rounded-2xl border border-green-800/40 bg-gray-900/60 p-6 text-center text-green-200">
            No users found
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-2xl border border-green-800/40 bg-gradient-to-b from-gray-950/90 via-green-950/20 to-gray-950/90 p-4 shadow-lg shadow-green-950/20"
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
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
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
                  <FaEnvelope className="text-green-400" />
                  <span>{user.email || "N/A"}</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(user)}
                  disabled={toggleLoadingId === user._id}
                  className={`w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                    user.isActive
                      ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                      : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                  }`}
                >
                  {user.isActive ? <FaUserSlash /> : <FaUserCheck />}
                  {toggleLoadingId === user._id
                    ? "Updating..."
                    : user.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-2xl border border-green-800/40 bg-gradient-to-b from-gray-950/90 via-green-950/20 to-gray-950/90 overflow-hidden shadow-lg shadow-green-950/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="bg-gradient-to-r from-green-700/30 to-teal-700/20 text-left">
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
                    colSpan="5"
                    className="px-5 py-10 text-center text-green-200"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-green-200"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`border-t border-green-800/20 hover:bg-green-900/10 transition-colors ${
                      index % 2 === 0 ? "bg-gray-900/20" : "bg-transparent"
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
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        disabled={toggleLoadingId === user._id}
                        className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 px-4 py-2 rounded-lg text-sm transition-all ${
                          user.isActive
                            ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                            : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                      >
                        {toggleLoadingId === user._id
                          ? "Updating..."
                          : user.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-5 rounded-2xl border border-green-800/40 bg-gradient-to-r from-gray-950 via-green-950/20 to-gray-950 p-4 shadow-lg shadow-green-950/20">
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
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 rounded-xl bg-gray-900/60 border border-green-700/50 text-white hover:bg-green-900/30 flex items-center gap-2"
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
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 rounded-xl bg-gray-900/60 border border-green-700/50 text-white hover:bg-green-900/30 flex items-center gap-2"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyUsers;