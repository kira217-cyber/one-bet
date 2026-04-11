import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    rehydrateAuth: (state) => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          state.user = JSON.parse(storedUser);
          state.token = storedToken;
        } else {
          state.user = null;
          state.token = null;
        }
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        state.user = null;
        state.token = null;
      } finally {
        state.loading = false;
      }
    },

    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;

      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { rehydrateAuth, setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
