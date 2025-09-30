import { configureStore } from '@reduxjs/toolkit';
import candidateReducer from './candidateSlice';
import interviewReducer from './interviewSlice';
import uiReducer from './uiSlice';
import candidateHistoryReducer from './candidateHistorySlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    candidate: candidateReducer,
    interview: interviewReducer,
    ui: uiReducer,
    candidateHistory: candidateHistoryReducer,
    auth: authReducer,
  },
});

/* Export only the inferred store types – no slice‑state types are re‑exported */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
