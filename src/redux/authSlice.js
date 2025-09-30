import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isAuthenticated: false,
    username: null,
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            state.isAuthenticated = true;
            state.username = action.payload;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.username = null;
        },
        setAuthState(state, action) {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.username = action.payload.username;
        },
    },
});
export const { login, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;
