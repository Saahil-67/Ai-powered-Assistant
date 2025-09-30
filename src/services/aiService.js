const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const HF_MODEL = import.meta.env.VITE_HF_MODEL;
const API_FALLBACK = import.meta.env.VITE_API_FALLBACK === 'true';
const API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function makeHFRequest(prompt, retries = MAX_RETRIES) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: prompt }),
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data[0];
    }
    catch (error) {
        if (retries > 0) {
            await sleep(RETRY_DELAY);
            return makeHFRequest(prompt, retries - 1);
        }
        throw error;
    }
}
// Load environment variables
const HUGGING_FACE_TOKEN = import.meta.env.VITE_HUGGING_FACE_TOKEN;
const MODEL_URL = `https://api-inference.huggingface.co/models/${import.meta.env.VITE_HUGGING_FACE_MODEL}`;
// Prompts for different question types
const QUESTION_PROMPTS = {
    easy: "Generate an entry-level technical interview question",
    medium: "Generate an intermediate technical interview question",
    hard: "Generate a challenging technical interview question"
};
const generatePrompt = (difficulty, resumeContext) => {
    const basePrompt = QUESTION_PROMPTS[difficulty];
    const skillsContext = resumeContext.skills.join(', ');
    const experienceContext = resumeContext.experience.join('. ');
    return `
    Given a candidate with the following background:
    Skills: ${skillsContext}
    Experience: ${experienceContext}

    ${basePrompt} that:
    1. Tests their knowledge in one of their core skills
    2. Relates to their work experience
    3. Has clear evaluation criteria
    4. Can be answered in ${difficulty === 'easy' ? '2' : difficulty === 'medium' ? '3' : '5'} minutes

    Format the response as JSON with:
    {
      "question": "the question text",
      "category": "skill being tested",
      "difficulty": "${difficulty}",
      "scoringCriteria": ["criterion1", "criterion2", ...]
    }
  `;
};
export const generateQuestion = async (difficulty, resumeContext, questionIndex) => {
    try {
        const response = await fetch('/generate_question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                difficulty,
                resumeContext,
                questionIndex
            })
        });
        if (!response.ok) {
            throw new Error('Failed to generate question');
        }
        const parsedResponse = await response.json();
        if (parsedResponse.error) {
            return { error: parsedResponse.error };
        }
        return {
            question: {
                id: `q${questionIndex}`,
                text: parsedResponse.question,
                difficulty: parsedResponse.difficulty || difficulty,
                category: parsedResponse.category,
                expectedDuration: difficulty === 'easy' ? 120 : difficulty === 'medium' ? 180 : 300,
                timeLimit: difficulty === 'easy' ? 120 : difficulty === 'medium' ? 180 : 300,
                scoringCriteria: parsedResponse.scoringCriteria
            }
        };
    } catch (error) {
        console.error('AI service error:', error);
        return { error: 'Failed to generate question from backend.' };
    }
};
export async function scoreAnswer(question, answer, timeSpent) {
    if (API_FALLBACK || !HF_TOKEN) {
        // Return mock scoring for demo/fallback
        return {
            score: {
                score: 8.5,
                feedback: 'Good explanation of concepts with room for improvement in practical examples.',
                strengths: ['Clear communication', 'Technical accuracy'],
                improvements: ['Add more specific examples', 'Consider edge cases'],
                technicalAccuracy: 8.5,
                communicationClarity: 9.0,
                completeness: 8.0
            }
        };
    }
    const prompt = `Score the following React interview answer:
  
  Question: ${question.text}
  Expected Duration: ${question.expectedDuration} seconds
  Actual Time Spent: ${timeSpent} seconds
  
  Answer: ${answer}
  
  Scoring Criteria:
  ${question.scoringCriteria?.join('\n')}
  
  Provide a JSON response with:
  {
    "score": number between 0-10,
    "feedback": "overall feedback",
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "technicalAccuracy": number between 0-10,
    "communicationClarity": number between 0-10,
    "completeness": number between 0-10
  }`;
    try {
        const response = await makeHFRequest(prompt);
        if (response.error) {
            throw new Error(response.error);
        }
        const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error('Invalid scoring response format');
        const scoring = JSON.parse(jsonMatch[0]);
        return {
            score: {
                score: scoring.score,
                feedback: scoring.feedback,
                strengths: scoring.strengths,
                improvements: scoring.improvements,
                technicalAccuracy: scoring.technicalAccuracy,
                communicationClarity: scoring.communicationClarity,
                completeness: scoring.completeness
            }
        };
    }
    catch (error) {
        console.error('Failed to score answer:', error);
        // Return mock scoring on error
        return {
            score: {
                score: 7.5,
                feedback: 'Unable to process scoring. Default feedback provided.',
                strengths: ['Answer provided within time limit'],
                improvements: ['Consider providing more details'],
                technicalAccuracy: 7.5,
                communicationClarity: 7.5,
                completeness: 7.5
            },
            error: error instanceof Error ? error.message : 'Failed to score answer'
        };
    }
}
