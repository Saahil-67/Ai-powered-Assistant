interface CandidateState {
    name: string;
    email: string;
    phone: string;
    resume: string;
    raw_text: string;
    score: number;
    summary: string;
    chatHistory: Array<{
        role: string;
        message: string;
    }>;
}
export declare const setCandidateInfo: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<CandidateState>, "candidate/setCandidateInfo">, addChatMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    role: string;
    message: string;
}, "candidate/addChatMessage">, setScore: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "candidate/setScore">, setSummary: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "candidate/setSummary">, resetCandidate: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"candidate/resetCandidate">;
declare const _default: import("redux").Reducer<CandidateState>;
export default _default;
