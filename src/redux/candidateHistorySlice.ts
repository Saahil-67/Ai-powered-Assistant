import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CandidateInterview } from '../types/interview';

// CandidateInterview type is now imported from types/interview.ts

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
