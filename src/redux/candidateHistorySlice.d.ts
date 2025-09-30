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
    summary?: string;
    dateCompleted: string;
}
export interface CandidateHistoryState {
    interviews: CandidateInterview[];
}
export declare const addInterview: import("@reduxjs/toolkit").ActionCreatorWithPayload<CandidateInterview, "candidateHistory/addInterview">, setInterviews: import("@reduxjs/toolkit").ActionCreatorWithPayload<CandidateInterview[], "candidateHistory/setInterviews">, resetHistory: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"candidateHistory/resetHistory">;
declare const _default: import("redux").Reducer<CandidateHistoryState>;
export default _default;
