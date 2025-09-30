export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  resume: string;
  raw_text: string;
}

export declare function extractResume(file: File): Promise<ResumeData>;
export declare function generateQuestion(payload: { raw_text: string }, difficulty: string): Promise<{ question: string }>;
export declare function evaluateAnswer(question: string, answer: string): Promise<{ score: number; feedback?: string }>;
