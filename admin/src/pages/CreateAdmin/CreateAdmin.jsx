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
      {
        key: "add-feature-games",
        label: "Add Feature Games ( /add-feature-games )",
      },
      { key: "add-sports", label: "Add Sports ( /add-sports )" },
      { key: "bet-history", label: "Bet History ( /bet-history )" },

      { key: "bulk-adjustment", label: "Bulk Adjustment ( /bulk-adjustment )" },
      { key: "add-promotion", label: "Add Promotion ( /add-promotion )" },

      { key: "add-slider", label: "Add Slider ( /add-slider )" },
      { key: "add-notice", label: "Add Notice ( /add-notice )" },
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
      {
        key: "aff-hero-controller",
        label: "Affiliate Hero Controller ( /aff-hero-controller )",
      },
      {
        key: "aff-campaigns-controller",
        label: "Affiliate Campaigns Controller ( /aff-campaigns-controller )",
      },
      {
        key: "aff-faq-controller",
        label: "Affiliate FAQ Controller ( /aff-faq-controller )",
      },
      {
        key: "aff-commission-controller",
        label: "Affiliate Commission Controller ( /aff-commission-controller )",
      },
      {
        key: "aff-commission-structure-controller",
        label:
          "Affiliate Commission Structure Controller ( /aff-commission-structure-controller )",
      },
      {
        key: "aff-jackpot-controller",
        label: "Affiliate Jackpot Controller ( /aff-jackpot-controller )",
      },
      {
        key: "aff-jackpot-structure-controller",
        label:
          "Affiliate Jackpot Structure Controller ( /aff-jackpot-structure-controller )",
      },
      {
        key: "aff-elite-club-controller",
        label: "Affiliate Elite Club Controller ( /aff-elite-club-controller )",
      },
      {
        key: "aff-how-to-join-controller",
        label:
          "Affiliate How To Join Controller ( /aff-how-to-join-controller )",
      },
      {
        key: "aff-about-us-controller",
        label: "Affiliate About Us Controller ( /aff-about-us-controller )",
      },
      {
        key: "aff-why-us-controller",
        label: "Affiliate Why Us Controller ( /aff-why-us-controller )",
      },
      {
        key: "aff-supports-controller",
        label: "Affiliate Supports Controller ( /aff-supports-controller )",
      },
      {
        key: "aff-footer-controller",
        label: "Affiliate Footer Controller ( /aff-footer-controller )",
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

  const selectAllCreatePerms = () => {
    setPermissions(allPerms.map((p) => p.key));
  };

  const clearCreatePerms = () => {
    setPermissions([]);
  };

  const selectAllEditPerms = () => {
    setEditPermissions(allPerms.map((p) => p.key));
  };

  const clearEditPerms = () => {
    setEditPermissions([]);
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
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/20 to-black p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl lg:text-4xl">
          Manage Admin Accounts
        </h2>

        <div className="mb-10 rounded-2xl border border-green-700/40 bg-black/65 p-5 shadow-2xl shadow-green-900/30 backdrop-blur-md sm:p-7 lg:p-9">
          <h3 className="mb-6 text-xl font-bold text-green-300/90 sm:text-2xl">
            Create New Admin
          </h3>

          <form onSubmit={submitCreate} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-green-300/90">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 text-white placeholder-green-400/50 transition-all focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-green-300/90">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 pr-11 text-white placeholder-green-400/50 transition-all focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] cursor-pointer text-green-400 transition-colors hover:text-green-300"
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
              <label className="mb-2 block text-sm font-medium text-green-300/90">
                Role
              </label>
              <select
                className="w-full cursor-pointer rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 text-white transition-all focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="sub">Sub Admin</option>
                <option value="mother">Mother Admin</option>
              </select>
            </div>

            {role !== "mother" && (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-green-300/90">
                    Permissions
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllCreatePerms}
                      className="cursor-pointer rounded-lg border border-green-600/50 bg-green-900/30 px-3 py-1.5 text-xs text-green-100 hover:bg-green-800/40"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearCreatePerms}
                      className="cursor-pointer rounded-lg border border-red-600/50 bg-red-900/30 px-3 py-1.5 text-xs text-red-100 hover:bg-red-800/40"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid max-h-[320px] grid-cols-1 gap-3 overflow-y-auto pr-1 [scrollbar-width:none] sm:grid-cols-2 lg:grid-cols-3">
                  {allPerms.map((p) => (
                    <label
                      key={p.key}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 transition-colors hover:bg-green-900/30"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        className="h-5 w-5 cursor-pointer accent-green-500"
                      />
                      <span className="text-sm text-green-100">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl border border-green-400/40 bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-3.5 text-lg font-semibold text-black shadow-lg shadow-green-600/40 transition-all duration-300 hover:from-green-400 hover:to-emerald-400 md:w-auto"
            >
              Create Admin
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-green-700/40 bg-black/65 p-5 shadow-2xl shadow-green-900/30 backdrop-blur-md sm:p-7 lg:p-9">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="text-xl font-bold text-green-300/90 sm:text-2xl">
              All Admin Accounts
            </h3>

            <button
              onClick={loadAdmins}
              className="cursor-pointer rounded-xl border border-green-700/50 bg-black/70 px-6 py-2.5 text-green-200 transition-all duration-300 hover:border-green-500/60 hover:bg-green-900/40 hover:text-white"
            >
              Refresh List
            </button>
          </div>

          {loadingList ? (
            <div className="py-10 text-center text-green-300/70">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="py-10 text-center text-green-300/70">
              No admin accounts found
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((a) => {
                const isEditing = editingId === a._id;

                return (
                  <div
                    key={a._id}
                    className="rounded-xl border border-green-700/40 bg-black/50 p-5 transition-colors hover:border-green-500/50"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-lg font-bold text-green-100">
                          {a.email}
                        </p>

                        <p className="mt-1 text-sm">
                          Role:{" "}
                          <span className="font-semibold text-green-300">
                            {a.role === "mother" ? "Mother Admin" : "Sub Admin"}
                          </span>
                        </p>

                        {a.role !== "mother" && (
                          <p className="mt-1 break-words text-sm text-green-200/80">
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
                              className="cursor-pointer rounded-lg bg-blue-700/80 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => confirmDelete(a._id)}
                              className="cursor-pointer rounded-lg bg-red-700/80 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => submitEdit(a._id)}
                              className="cursor-pointer rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-2.5 font-medium text-black transition-colors hover:from-green-400 hover:to-emerald-400"
                            >
                              Save Changes
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="cursor-pointer rounded-lg border border-green-700/50 bg-black/70 px-5 py-2.5 text-green-200 transition-colors hover:bg-green-900/40 hover:text-white"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 grid grid-cols-1 gap-6 border-t border-green-700/30 pt-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-green-300/90">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 text-white placeholder-green-400/50 transition-all focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Update email"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-green-300/90">
                            Role
                          </label>
                          <select
                            className="w-full cursor-pointer rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 text-white transition-all focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option value="sub">Sub Admin</option>
                            <option value="mother">Mother Admin</option>
                          </select>
                        </div>

                        <div className="relative">
                          <label className="mb-2 block text-sm font-medium text-green-300/90">
                            New Password
                          </label>
                          <input
                            type={showEditPassword ? "text" : "password"}
                            className="w-full rounded-xl border border-green-700/50 bg-black/70 px-4 py-3 pr-11 text-white placeholder-green-400/50 transition-all focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                            value={editNewPassword}
                            onChange={(e) => setEditNewPassword(e.target.value)}
                            placeholder="Leave empty to keep current"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowEditPassword(!showEditPassword)
                            }
                            className="absolute right-4 top-[42px] cursor-pointer text-green-400 transition-colors hover:text-green-300"
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
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <label className="block text-sm font-medium text-green-300/90">
                                Permissions
                              </label>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={selectAllEditPerms}
                                  className="cursor-pointer rounded-lg border border-green-600/50 bg-green-900/30 px-3 py-1.5 text-xs text-green-100 hover:bg-green-800/40"
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={clearEditPerms}
                                  className="cursor-pointer rounded-lg border border-red-600/50 bg-red-900/30 px-3 py-1.5 text-xs text-red-100 hover:bg-red-800/40"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <div className="grid max-h-[320px] grid-cols-1 gap-3 overflow-y-auto pr-1 [scrollbar-width:none] sm:grid-cols-2 lg:grid-cols-3">
                              {allPerms.map((p) => (
                                <label
                                  key={p.key}
                                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-green-700/40 bg-black/50 px-4 py-3 transition-colors hover:bg-green-900/30"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editPermissions.includes(p.key)}
                                    onChange={() => toggleEditPerm(p.key)}
                                    className="h-5 w-5 cursor-pointer accent-green-500"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-green-700/60 bg-black/90 p-6 shadow-2xl shadow-green-900/50">
              <h3 className="mb-4 text-xl font-bold text-green-300">
                Confirm Delete
              </h3>

              <p className="mb-6 text-green-100/90">
                Are you sure you want to delete this admin account?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-green-700/50 bg-black/70 py-3 text-green-200 transition-all hover:bg-green-900/40 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="flex-1 cursor-pointer rounded-xl bg-red-700 py-3 font-semibold text-white transition-all hover:bg-red-600"
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
