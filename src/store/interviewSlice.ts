import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { InterviewQuestion, AnswerScore } from '../types/interview';

interface InterviewState {
  questions: InterviewQuestion[];
  answers: string[];
  scores: AnswerScore[];
  currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
  missingFields: string[];
  interviewComplete: boolean;
}

const initialState: InterviewState = {
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
    setError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addQuestion: (state, action: PayloadAction<InterviewQuestion>) => {
      state.questions.push(action.payload);
      state.loading = false;
    },
    setAnswer: (state, action: PayloadAction<{ answer: string; index: number }>) => {
      const { answer, index } = action.payload;
      if (index >= 0 && index < state.questions.length) {
        state.answers[index] = answer;
      }
    },
    addScore: (state, action: PayloadAction<AnswerScore>) => {
      state.scores.push(action.payload);
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length) {
        state.currentQuestionIndex += 1;
      }
    },
    setMissingFields: (state, action: PayloadAction<string[]>) => {
      state.missingFields = action.payload;
    },
    completeInterview: (state) => {
      state.interviewComplete = true;
    },
    resetInterview: () => initialState
  }
});

export const {
  startLoading,
  setError,
  addQuestion,
  setAnswer,
  addScore,
  nextQuestion,
  setMissingFields,
  completeInterview,
  resetInterview
} = interviewSlice.actions;

export default interviewSlice.reducer;