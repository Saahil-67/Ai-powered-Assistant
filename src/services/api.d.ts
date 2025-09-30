export function generateQuestion(difficulty: string): Promise<{ question: string }>; 
export function evaluateAnswer(question: string, answer: string): Promise<{ choices?: { score: number, feedback?: string }[], score?: number, feedback?: string }>; 
export function generateSummary(answers: Array<{ question: string, answer: string, score: number, feedback?: string, difficulty: string }>): Promise<{ summary: string }>;
