import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/* -------------------------------------------------
   Slice state – **private** (no export)
   ------------------------------------------------- */
export interface UIState {
  activeTab: 'interviewee' | 'interviewer';
}

/* Initial state */
const initialState: UIState = {
  activeTab: 'interviewee',
};

/* -------------------------------------------------
   Slice definition
   ------------------------------------------------- */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<'interviewee' | 'interviewer'>) {
      state.activeTab = action.payload;
    },
  },
});

/* -------------------------------------------------
   Export actions and reducer
   ------------------------------------------------- */
export const { setActiveTab } = uiSlice.actions;
export default uiSlice.reducer;
