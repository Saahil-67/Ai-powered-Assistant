export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    candidate: import("./candidateSlice").CandidateState;
    interview: import("./interviewSlice").InterviewState;
    ui: import("./uiSlice").UIState;
    candidateHistory: import("./candidateHistorySlice").CandidateHistoryState;
    auth: import("./authSlice").AuthState;
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<{
        candidate: import("./candidateSlice").CandidateState;
        interview: import("./interviewSlice").InterviewState;
        ui: import("./uiSlice").UIState;
        candidateHistory: import("./candidateHistorySlice").CandidateHistoryState;
        auth: import("./authSlice").AuthState;
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
