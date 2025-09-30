import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    questions: [],
    answers: [],
    scores: [],
    currentQuestionIndex: 0,
    loading: false,
    error: null,
    missingFields: [],
    interviewComplete: false
};
export const interviewSlice = createSlice({
    name: 'interview',
    initialState,
    reducers: {
        startLoading: (state) => {
            state.loading = true;
            state.error = null;
        },
        setError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addQuestion: (state, action) => {
            state.questions.push(action.payload);
            state.loading = false;
        },
        setAnswer: (state, action) => {
            const { answer, index } = action.payload;
            if (index >= 0 && index < state.questions.length) {
                state.answers[index] = answer;
            }
        },
        addScore: (state, action) => {
            state.scores.push(action.payload);
        },
        nextQuestion: (state) => {
            if (state.currentQuestionIndex < state.questions.length) {
                state.currentQuestionIndex += 1;
            }
        },
        setMissingFields: (state, action) => {
            state.missingFields = action.payload;
        },
        completeInterview: (state) => {
            state.interviewComplete = true;
        },
        resetInterview: () => initialState
    }
});
export const { startLoading, setError, addQuestion, setAnswer, addScore, nextQuestion, setMissingFields, completeInterview, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
