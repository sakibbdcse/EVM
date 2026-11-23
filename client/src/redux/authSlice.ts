import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Address {
  id: number;
  division: string;
  district: string;
  city?: string | null;
  village?: string | null;
  other_address_details?: string | null;
}

export type UserRole = "voter" | "presiding_officer" | "admin" | "super_admin";

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  birthdate?: string | null;
  nid: string;
  role: UserRole;
  has_voted: boolean;
  address_id?: number | null;
  address?: Address | null;
  photo?: string | null;
  photo_url?: string | null;
  date_joined?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Safely rehydrate from localStorage
const getSavedToken = (): string | null => {
  return localStorage.getItem("token") || null;
};

const getSavedUser = (): User | null => {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

const initialToken = getSavedToken();
const initialUser = getSavedUser();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    setHasVoted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.has_voted = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, updateUser, setHasVoted, logout } = authSlice.actions;
export default authSlice.reducer;
