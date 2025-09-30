import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  category: string;
  expectedDuration: number;
  scoringCriteria?: string[];
  answer: string;
  timeLimit: number;
  submitted: boolean;
  score?: number;
  feedback?: string;
}

interface InterviewState {
  questions: Question[];
  currentQuestion: number;
  isPaused: boolean;
  startTime: number | null;
  endTime: number | null;
  loading: boolean;
  error: string | null;
  completed: boolean;
}

const initialState: InterviewState = {
  questions: [],
  currentQuestion: 0,
  isPaused: false,
  startTime: null,
  endTime: null,
  loading: false,
  error: null,
  completed: false,
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
    startLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addQuestion(state, action: PayloadAction<Question>) {
      state.questions.push({
        ...action.payload,
        answer: '',
        submitted: false
      });
      state.loading = false;
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
    setAnswer(state, action: PayloadAction<{ answer: string; index: number }>) {
      const { answer, index } = action.payload;
      if (index >= 0 && index < state.questions.length) {
        state.questions[index].answer = answer;
      }
    },
    addScore(state, action: PayloadAction<{ score: number; feedback: string }>) {
      const { score, feedback } = action.payload;
      if (state.questions[state.currentQuestion]) {
        state.questions[state.currentQuestion].score = score;
        state.questions[state.currentQuestion].feedback = feedback;
      }
    },
    nextQuestion(state) {
      if (state.currentQuestion < state.questions.length - 1) {
        state.currentQuestion += 1;
      }
    },
    completeInterview(state) {
      state.isPaused = true;
      state.endTime = Date.now();
    },
  },
});

export const { setQuestions, setCurrentQuestion, submitAnswer, setPaused, setStartTime, setEndTime, resetInterview, setAnswer, addScore, nextQuestion, completeInterview, startLoading, setError, addQuestion } = interviewSlice.actions;
export default interviewSlice.reducer;
