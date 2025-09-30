import type { InterviewQuestion, ScoringResponse, Difficulty } from '../types/interview';
interface ResumeContext {
    skills: string[];
    experience: string[];
    education: string[];
    projects: string[];
}
interface AIResponse {
    question?: InterviewQuestion;
    error?: string;
}
export declare const generateQuestion: (difficulty: Difficulty, resumeContext: ResumeContext, questionIndex: number) => Promise<AIResponse>;
export declare function scoreAnswer(question: InterviewQuestion, answer: string, timeSpent: number): Promise<ScoringResponse>;
export {};
