import { createSlice } from '@reduxjs/toolkit';
/* Initial state */
const initialState = {
    activeTab: 'interviewee',
};
/* -------------------------------------------------
   Slice definition
   ------------------------------------------------- */
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
    },
});
/* -------------------------------------------------
   Export actions and reducer
   ------------------------------------------------- */
export const { setActiveTab } = uiSlice.actions;
export default uiSlice.reducer;
