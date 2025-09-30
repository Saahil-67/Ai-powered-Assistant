import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CandidateState {
  name: string;
  email: string;
  phone: string;
  resume: string;
  raw_text: string;
  score: number;
  summary: string;
  chatHistory: Array<{ role: string; message: string }>;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
}

const initialState: CandidateState = {
  name: '',
  email: '',
  phone: '',
  resume: '',
  raw_text: '',
  score: 0,
  summary: '',
  chatHistory: [],
  skills: [],
  experience: [],
  education: [],
  projects: [],
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    setCandidateInfo(state, action: PayloadAction<Partial<CandidateState>>) {
      Object.assign(state, action.payload);
    },
    addChatMessage(state, action: PayloadAction<{ role: string; message: string }>) {
      state.chatHistory.push(action.payload);
    },
    setScore(state, action: PayloadAction<number>) {
      state.score = action.payload;
    },
    setSummary(state, action: PayloadAction<string>) {
      state.summary = action.payload;
    },
    resetCandidate(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setCandidateInfo, addChatMessage, setScore, setSummary, resetCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;
