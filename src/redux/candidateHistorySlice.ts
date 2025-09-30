import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CandidateInterview {
  id: string;
  name: string;
  email: string;
  phone: string;
  resume: string;
  raw_text: string;
  questions: Array<{
    question: string;
    answer: string;
    score: number;
    feedback?: string;
    difficulty: string;
  }>;
  finalScore: number;
  dateCompleted: string;
}

interface CandidateHistoryState {
  interviews: CandidateInterview[];
}

const initialState: CandidateHistoryState = {
  interviews: [],
};

const candidateHistorySlice = createSlice({
  name: 'candidateHistory',
  initialState,
  reducers: {
    addInterview(state, action: PayloadAction<CandidateInterview>) {
      state.interviews.push(action.payload);
    },
    setInterviews(state, action: PayloadAction<CandidateInterview[]>) {
      state.interviews = action.payload;
    },
    resetHistory(state) {
      state.interviews = [];
    },
  },
});

export const { addInterview, setInterviews, resetHistory } = candidateHistorySlice.actions;
export default candidateHistorySlice.reducer;
