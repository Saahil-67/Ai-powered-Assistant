export interface UIState {
    activeTab: 'interviewee' | 'interviewer';
}
export declare const setActiveTab: import("@reduxjs/toolkit").ActionCreatorWithPayload<"interviewee" | "interviewer", "ui/setActiveTab">;
declare const _default: import("redux").Reducer<UIState>;
export default _default;
