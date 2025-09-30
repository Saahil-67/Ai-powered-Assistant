import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  answer: string;
  timeLimit: number;
  submitted: boolean;
}

interface InterviewState {
  questions: Question[];
  currentQuestion: number;
  isPaused: boolean;
  startTime: number | null;
  endTime: number | null;
}

const initialState: InterviewState = {
  questions: [],
  currentQuestion: 0,
  isPaused: false,
  startTime: null,
  endTime: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setQuestions(state, action: PayloadAction<Question[]>) {
      state.questions = action.payload;
    },
    setCurrentQuestion(state, action: PayloadAction<number>) {
      state.currentQuestion = action.payload;
    },
    submitAnswer(state, action: PayloadAction<{ index: number; answer: string }>) {
      const { index, answer } = action.payload;
      if (state.questions[index]) {
        state.questions[index].answer = answer;
        state.questions[index].submitted = true;
      }
    },
    setPaused(state, action: PayloadAction<boolean>) {
      state.isPaused = action.payload;
    },
    setStartTime(state, action: PayloadAction<number | null>) {
      state.startTime = action.payload;
    },
    setEndTime(state, action: PayloadAction<number | null>) {
      state.endTime = action.payload;
    },
    resetInterview(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setQuestions, setCurrentQuestion, submitAnswer, setPaused, setStartTime, setEndTime, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
