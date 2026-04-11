export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectAuthLoading = (state) => state.auth.loading;

export const selectIsAuthenticated = (state) => {
  const { user, token } = state.auth;
  return !!user && !!token;
};

export const selectUserRole = (state) => state.auth?.user?.role || null;

export const selectIsAffiliateUser = (state) =>
  state.auth?.user?.role === "aff-user";

export const selectIsNormalUser = (state) =>
  state.auth?.user?.role === "user";

export const selectIsAdmin = (state) =>
  state.auth?.user?.role === "admin";