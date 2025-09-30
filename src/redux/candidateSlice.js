import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    name: '',
    email: '',
    phone: '',
    resume: '',
    raw_text: '',
    score: 0,
    summary: '',
    chatHistory: [],
};
const candidateSlice = createSlice({
    name: 'candidate',
    initialState,
    reducers: {
        setCandidateInfo(state, action) {
            Object.assign(state, action.payload);
        },
        addChatMessage(state, action) {
            state.chatHistory.push(action.payload);
        },
        setScore(state, action) {
            state.score = action.payload;
        },
        setSummary(state, action) {
            state.summary = action.payload;
        },
        resetCandidate(state) {
            Object.assign(state, initialState);
        },
    },
});
export const { setCandidateInfo, addChatMessage, setScore, setSummary, resetCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;
