import type { PayloadAction } from '@reduxjs/toolkit';
import type { InterviewQuestion, AnswerScore } from '../types/interview';
interface InterviewState {
    questions: InterviewQuestion[];
    answers: string[];
    scores: AnswerScore[];
    currentQuestionIndex: number;
    loading: boolean;
    error: string | null;
    missingFields: string[];
    interviewComplete: boolean;
}
export declare const interviewSlice: import("@reduxjs/toolkit").Slice<InterviewState, {
    startLoading: (state: import("immer").WritableDraft<InterviewState>) => void;
    setError: (state: import("immer").WritableDraft<InterviewState>, action: PayloadAction<string>) => void;
    addQuestion: (state: import("immer").WritableDraft<InterviewState>, action: PayloadAction<InterviewQuestion>) => void;
    setAnswer: (state: import("immer").WritableDraft<InterviewState>, action: PayloadAction<{
        answer: string;
        index: number;
    }>) => void;
    addScore: (state: import("immer").WritableDraft<InterviewState>, action: PayloadAction<AnswerScore>) => void;
    nextQuestion: (state: import("immer").WritableDraft<InterviewState>) => void;
    setMissingFields: (state: import("immer").WritableDraft<InterviewState>, action: PayloadAction<string[]>) => void;
    completeInterview: (state: import("immer").WritableDraft<InterviewState>) => void;
    resetInterview: () => InterviewState;
}, "interview", "interview", import("@reduxjs/toolkit").SliceSelectors<InterviewState>>;
export declare const startLoading: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"interview/startLoading">, setError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "interview/setError">, addQuestion: import("@reduxjs/toolkit").ActionCreatorWithPayload<InterviewQuestion, "interview/addQuestion">, setAnswer: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    answer: string;
    index: number;
}, "interview/setAnswer">, addScore: import("@reduxjs/toolkit").ActionCreatorWithPayload<AnswerScore, "interview/addScore">, nextQuestion: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"interview/nextQuestion">, setMissingFields: import("@reduxjs/toolkit").ActionCreatorWithPayload<string[], "interview/setMissingFields">, completeInterview: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"interview/completeInterview">, resetInterview: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"interview/resetInterview">;
declare const _default: import("redux").Reducer<InterviewState>;
export default _default;
