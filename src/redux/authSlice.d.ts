export interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
}
export declare const login: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "auth/login">, logout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"auth/logout">, setAuthState: import("@reduxjs/toolkit").ActionCreatorWithPayload<AuthState, "auth/setAuthState">;
declare const _default: import("redux").Reducer<AuthState>;
export default _default;
