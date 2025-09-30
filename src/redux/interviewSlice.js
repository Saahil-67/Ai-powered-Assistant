import { createSlice } from '@reduxjs/toolkit';
/* Initial state */
const initialState = {
    questions: [],
    currentQuestion: 0,
    isPaused: false,
    startTime: null,
    endTime: null,
};
/* -------------------------------------------------
   Slice definition
   ------------------------------------------------- */
const interviewSlice = createSlice({
    name: 'interview',
    initialState,
    reducers: {
        setQuestions(state, action) {
            state.questions = action.payload;
        },
        setCurrentQuestion(state, action) {
            state.currentQuestion = action.payload;
        },
        submitAnswer(state, action) {
            const { index, answer } = action.payload;
            if (state.questions[index]) {
                state.questions[index].answer = answer;
                state.questions[index].submitted = true;
            }
        },
        setPaused(state, action) {
            state.isPaused = action.payload;
        },
        setStartTime(state, action) {
            state.startTime = action.payload;
        },
        setEndTime(state, action) {
            state.endTime = action.payload;
        },
        resetInterview(state) {
            Object.assign(state, initialState);
        },
    },
});
/* -------------------------------------------------
   Export actions and reducer
   ------------------------------------------------- */
export const { setQuestions, setCurrentQuestion, submitAnswer, setPaused, setStartTime, setEndTime, resetInterview, } = interviewSlice.actions;
export default interviewSlice.reducer;
