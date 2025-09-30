export type Difficulty = 'easy' | 'medium' | 'hard';
interface Question {
    id: string;
    text: string;
    difficulty: Difficulty;
    answer: string;
    timeLimit: number;
    submitted: boolean;
}
export interface InterviewState {
    questions: Question[];
    currentQuestion: number;
    isPaused: boolean;
    startTime: number | null;
    endTime: number | null;
}
export declare const setQuestions: import("@reduxjs/toolkit").ActionCreatorWithPayload<Question[], "interview/setQuestions">, setCurrentQuestion: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "interview/setCurrentQuestion">, submitAnswer: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    index: number;
    answer: string;
}, "interview/submitAnswer">, setPaused: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "interview/setPaused">, setStartTime: import("@reduxjs/toolkit").ActionCreatorWithPayload<number | null, "interview/setStartTime">, setEndTime: import("@reduxjs/toolkit").ActionCreatorWithPayload<number | null, "interview/setEndTime">, resetInterview: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"interview/resetInterview">;
declare const _default: import("redux").Reducer<InterviewState>;
export default _default;
