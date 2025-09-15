import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  birthdate: string;
  is_verified: boolean;
  nid: string;
  role: "voter" | "presiding_officer" | "admin";
  address?: Address; // 👈 full address object instead of id
  photo?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
