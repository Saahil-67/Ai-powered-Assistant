export type Difficulty = 'easy' | 'medium' | 'hard';

export interface InterviewQuestion {
  id: string;
  text: string;
  difficulty: Difficulty;
  category: string;
  expectedDuration: number;
  sampleAnswer?: string;
  scoringCriteria?: string[];
}

export interface QuestionResponse {
  question: InterviewQuestion;
  error?: string;
}

export interface AnswerScore {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  technicalAccuracy: number;
  communicationClarity: number;
  completeness: number;
}

export interface ScoringResponse {
  score: AnswerScore;
  error?: string;
}

export interface InterviewConfig {
  totalQuestions: number;
  questionsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  timeByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}