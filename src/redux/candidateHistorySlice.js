import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    interviews: [],
};
const candidateHistorySlice = createSlice({
    name: 'candidateHistory',
    initialState,
    reducers: {
        addInterview(state, action) {
            state.interviews.push(action.payload);
        },
        setInterviews(state, action) {
            state.interviews = action.payload;
        },
        resetHistory(state) {
            state.interviews = [];
        },
    },
});
export const { addInterview, setInterviews, resetHistory } = candidateHistorySlice.actions;
export default candidateHistorySlice.reducer;
