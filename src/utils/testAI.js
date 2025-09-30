// src/utils/testAI.ts
// Use a more accessible model
const DEFAULT_MODEL = 'facebook/opt-1.3b';
const API_BASE = 'https://api-inference.huggingface.co/models/';
// Simple test resume data
const testResumeContext = {
    skills: ['React', 'TypeScript'],
    experience: ['Frontend Developer for 2 years'],
    education: ['Computer Science Degree'],
    projects: ['Built a chat application']
};
// Test function for generating a question
export const testAIConnection = async () => {
    const MODEL = import.meta.env.VITE_HUGGING_FACE_MODEL || DEFAULT_MODEL;
    const MODEL_URL = `${API_BASE}${MODEL}`;
    const TOKEN = import.meta.env.VITE_HUGGING_FACE_TOKEN;
    console.log('Testing AI Connection...');
    console.log('Using model:', MODEL);
    console.log('Token exists:', !!TOKEN);
    try {
        // Simple test prompt
        const testPrompt = 'Generate a simple coding interview question about arrays.';
        console.log('Sending test prompt:', testPrompt);
        const response = await fetch(MODEL_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: testPrompt,
                parameters: {
                    max_length: 200,
                    temperature: 0.7,
                    top_p: 0.9,
                }
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw API Response:', data);
        try {
            const parsedResponse = JSON.parse(data[0].generated_text);
            console.log('Parsed Response:', parsedResponse);
            return parsedResponse;
        }
        catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            console.log('Raw generated text:', data[0].generated_text);
            return null;
        }
    }
    catch (error) {
        console.error('API Error:', error);
        return null;
    }
};
// Test function for the full question generation flow
export const testQuestionGeneration = async () => {
    console.log('Testing full question generation...');
    try {
        const result = await fetch('/api/test-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                difficulty: 'easy',
                resumeContext: testResumeContext
            })
        });
        const data = await result.json();
        console.log('Generated Question:', data);
        return data;
    }
    catch (error) {
        console.error('Question Generation Error:', error);
        return null;
    }
};
// Make functions available in the browser console
if (typeof window !== 'undefined') {
    window.testAIConnection = testAIConnection;
    window.testQuestionGeneration = testQuestionGeneration;
}
