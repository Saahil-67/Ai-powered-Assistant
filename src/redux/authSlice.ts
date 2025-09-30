import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      state.isAuthenticated = true;
      state.username = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.username = null;
    },
    setAuthState(state, action: PayloadAction<AuthState>) {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.username = action.payload.username;
    },
  },
});

export const { login, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;
