import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const CreateAdmin = () => {
  const token = localStorage.getItem("token");

  const allPerms = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard ( / )" },
      { key: "profile", label: "Profile ( /profile )" },

      { key: "all-user", label: "All Users ( /all-user )" },
      {
        key: "all-affiliate-user",
        label: "All Affiliate Users ( /all-affiliate-user )",
      },
      {
        key: "all-user-details",
        label: "User Details ( /all-user-details/:id )",
      },
      {
        key: "affiliate-user-details",
        label: "Affiliate User Details ( /affiliate-user-details/:id )",
      },

      { key: "add-deposit", label: "Add Deposit ( /add-deposit )" },
      {
        key: "deposit-request",
        label: "Deposit Request ( /deposit-request )",
      },
      {
        key: "deposit-request-details",
        label: "Deposit Request Details ( /deposit-request/:id )",
      },
      {
        key: "add-auto-deposit",
        label: "Auto Deposit Setting ( /add-auto-deposit )",
      },
      {
        key: "auto-deposit-history",
        label: "Auto Deposit History ( /auto-deposit-history )",
      },

      { key: "add-withdraw", label: "Add Withdraw ( /add-withdraw )" },
      {
        key: "withdraw-request",
        label: "Withdraw Request ( /withdraw-request )",
      },
      {
        key: "withdraw-request-details",
        label: "Withdraw Request Details ( /withdraw-request/:id )",
      },

      {
        key: "aff-add-withdraw",
        label: "Aff Add Withdraw ( /aff-add-withdraw )",
      },
      {
        key: "aff-withdraw-request",
        label: "Aff Withdraw Request ( /aff-withdraw-request )",
      },
      {
        key: "aff-withdraw-request-details",
        label:
          "Aff Withdraw Request Details ( /aff-withdraw-request-details/:id )",
      },

      {
        key: "add-game-category",
        label: "Add Game Category ( /add-game-category )",
      },
      { key: "add-provider", label: "Add Provider ( /add-provider )" },
      { key: "add-games", label: "Add Games ( /add-games )" },
      { key: "add-sports", label: "Add Sports ( /add-sports )" },
      {
        key: "add-feature-games",
        label: "Add Feature Games ( /add-feature-games )",
      },
      { key: "bet-history", label: "Bet History ( /bet-history )" },

      { key: "bulk-adjustment", label: "Bulk Adjustment ( /bulk-adjustment )" },

      { key: "add-promotion", label: "Add Promotion ( /add-promotion )" },

      {
        key: "add-slider",
        label: "Add Slider ( /add-slider )",
      },
      {
        key: "add-notice",
        label: "Add Notice ( /add-notice )",
      },
      {
        key: "footer-controller",
        label: "Footer Controller ( /footer-controller )",
      },
      {
        key: "site-identity-controller",
        label: "Site Identity Controller ( /site-identity-controller )",
      },
      {
        key: "add-social-link",
        label: "Add Social Link ( /add-social-link )",
      },

      {
        key: "aff-site-identity-controller",
        label:
          "Affiliate Site Identity Controller ( /aff-site-identity-controller )",
      },
      {
        key: "add-aff-social-link",
        label: "Add Affiliate Social Link ( /add-aff-social-link )",
      },
    ],
    [],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("sub");
  const [permissions, setPermissions] = useState([]);

  const [admins, setAdmins] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("sub");
  const [editPermissions, setEditPermissions] = useState([]);
  const [editNewPassword, setEditNewPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  const togglePerm = (k) => {
    setPermissions((p) =>
      p.includes(k) ? p.filter((x) => x !== k) : [...p, k],
    );
  };

  const toggleEditPerm = (k) => {
    setEditPermissions((p) =>
      p.includes(k) ? p.filter((x) => x !== k) : [...p, k],
    );
  };

  const loadAdmins = async () => {
    if (!token) return;
    try {
      setLoadingList(true);
      const { data } = await api.get("/api/admin/admins", authHeaders);
      setAdmins(data?.admins || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load admins");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const resetCreate = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setRole("sub");
    setPermissions([]);
  };

  const submitCreate = async (e) => {
    e.preventDefault();

    if (!token) {
      return toast.error("Admin token not found. Please login.");
    }

    try {
      await api.post(
        "/api/admin/create-admin",
        {
          email,
          password,
          role,
          permissions: role === "mother" ? [] : permissions,
        },
        authHeaders,
      );

      toast.success("Admin created successfully");
      resetCreate();
      loadAdmins();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    }
  };

  const startEdit = (a) => {
    setEditingId(a._id);
    setEditEmail(a.email || "");
    setEditRole(a.role || "sub");
    setEditPermissions(Array.isArray(a.permissions) ? a.permissions : []);
    setEditNewPassword("");
    setShowEditPassword(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEmail("");
    setEditRole("sub");
    setEditPermissions([]);
    setEditNewPassword("");
    setShowEditPassword(false);
  };

  const submitEdit = async (id) => {
    if (!token) return toast.error("Admin token not found. Please login.");

    try {
      const payload = {
        role: editRole,
        permissions: editRole === "mother" ? [] : editPermissions,
      };

      if (editEmail.trim() !== "") {
        payload.email = editEmail.trim().toLowerCase();
      }

      if (editNewPassword.trim().length > 0) {
        payload.newPassword = editNewPassword.trim();
      }

      await api.put(`/api/admin/admins/${id}`, payload, authHeaders);

      toast.success("Admin updated successfully");
      cancelEdit();
      loadAdmins();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    }
  };

  const confirmDelete = (id) => setDeleteConfirmId(id);

  const handleDelete = async () => {
    if (!deleteConfirmId || !token) {
      setDeleteConfirmId(null);
      return;
    }

    try {
      await api.delete(`/api/admin/admins/${deleteConfirmId}`, authHeaders);
      toast.success("Admin deleted");
      if (editingId === deleteConfirmId) cancelEdit();
      loadAdmins();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/20 to-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Manage Admin Accounts
        </h2>

        <div className="bg-black/65 backdrop-blur-md border border-green-700/40 rounded-2xl p-5 sm:p-7 lg:p-9 shadow-2xl shadow-green-900/30 mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-green-300/90 mb-6">
            Create New Admin
          </h3>

          <form onSubmit={submitCreate} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-green-300/90 mb-2">
                  Email
                </label>
                <input
                  className="w-full bg-black/70 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-400/50 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-green-300/90 mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-black/70 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-400/50 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-300/90 mb-2">
                Role
              </label>
              <select
                className="w-full bg-black/70 border border-green-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="sub">Sub Admin</option>
                <option value="mother">Mother Admin</option>
              </select>
            </div>

            {role !== "mother" && (
              <div>
                <label className="block text-sm font-medium text-green-300/90 mb-3">
                  Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto [scrollbar-width:none] pr-1">
                  {allPerms.map((p) => (
                    <label
                      key={p.key}
                      className="flex items-center gap-3 bg-black/50 border border-green-700/40 rounded-xl px-4 py-3 hover:bg-green-900/30 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        className="h-5 w-5 accent-green-500 cursor-pointer"
                      />
                      <span className="text-sm text-green-100">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="cursor-pointer w-full md:w-auto px-8 py-3.5 rounded-xl font-semibold text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black shadow-lg shadow-green-600/40 border border-green-400/40 transition-all duration-300"
            >
              Create Admin
            </button>
          </form>
        </div>

        <div className="bg-black/65 backdrop-blur-md border border-green-700/40 rounded-2xl p-5 sm:p-7 lg:p-9 shadow-2xl shadow-green-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-green-300/90">
              All Admin Accounts
            </h3>
            <button
              onClick={loadAdmins}
              className="cursor-pointer px-6 py-2.5 rounded-xl bg-black/70 border border-green-700/50 hover:bg-green-900/40 hover:border-green-500/60 text-green-200 hover:text-white transition-all duration-300"
            >
              Refresh List
            </button>
          </div>

          {loadingList ? (
            <div className="text-center py-10 text-green-300/70">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-10 text-green-300/70">
              No admin accounts found
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((a) => {
                const isEditing = editingId === a._id;

                return (
                  <div
                    key={a._id}
                    className="bg-black/50 border border-green-700/40 rounded-xl p-5 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-lg text-green-100">
                          {a.email}
                        </p>
                        <p className="text-sm mt-1">
                          Role:{" "}
                          <span className="font-semibold text-green-300">
                            {a.role === "mother" ? "Mother Admin" : "Sub Admin"}
                          </span>
                        </p>
                        {a.role !== "mother" && (
                          <p className="text-sm text-green-200/80 mt-1 break-words">
                            Permissions:{" "}
                            {Array.isArray(a.permissions) &&
                            a.permissions.length > 0
                              ? a.permissions.join(", ")
                              : "None"}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => startEdit(a)}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-blue-700/80 hover:bg-blue-600 text-white font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(a._id)}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-red-700/80 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => submitEdit(a._id)}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-medium transition-colors"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="cursor-pointer px-5 py-2.5 rounded-lg bg-black/70 border border-green-700/50 hover:bg-green-900/40 text-green-200 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 pt-6 border-t border-green-700/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-green-300/90 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full bg-black/70 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-400/50 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Update email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-300/90 mb-2">
                            Role
                          </label>
                          <select
                            className="w-full bg-black/70 border border-green-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all cursor-pointer"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option value="sub">Sub Admin</option>
                            <option value="mother">Mother Admin</option>
                          </select>
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium text-green-300/90 mb-2">
                            New Password
                          </label>
                          <input
                            type={showEditPassword ? "text" : "password"}
                            className="w-full bg-black/70 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-400/50 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all pr-11"
                            value={editNewPassword}
                            onChange={(e) => setEditNewPassword(e.target.value)}
                            placeholder="Leave empty to keep current"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowEditPassword(!showEditPassword)
                            }
                            className="absolute right-4 top-[42px] text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                          >
                            {showEditPassword ? (
                              <FaEyeSlash size={20} />
                            ) : (
                              <FaEye size={20} />
                            )}
                          </button>
                        </div>

                        {editRole !== "mother" && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-green-300/90 mb-3">
                              Permissions
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto [scrollbar-width:none] pr-1">
                              {allPerms.map((p) => (
                                <label
                                  key={p.key}
                                  className="flex items-center gap-3 bg-black/50 border border-green-700/40 rounded-xl px-4 py-3 hover:bg-green-900/30 transition-colors cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editPermissions.includes(p.key)}
                                    onChange={() => toggleEditPerm(p.key)}
                                    className="h-5 w-5 accent-green-500 cursor-pointer"
                                  />
                                  <span className="text-sm text-green-100">
                                    {p.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 border border-green-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-green-900/50">
              <h3 className="text-xl font-bold text-green-300 mb-4">
                Confirm Delete
              </h3>
              <p className="text-green-100/90 mb-6">
                Are you sure you want to delete this admin account?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="cursor-pointer flex-1 py-3 rounded-xl bg-black/70 border border-green-700/50 hover:bg-green-900/40 text-green-200 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="cursor-pointer flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAdmin;
