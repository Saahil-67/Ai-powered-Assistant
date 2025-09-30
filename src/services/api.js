// --- AI Summary Generation ---
export async function generateSummary(answersAndScores) {
  const response = await fetch(`${BASE_URL}/generate_summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answersAndScores })
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Failed to parse summary response.');
  }
  if (!response.ok) {
    throw new Error(data?.error || 'Summary generation failed.');
  }
  return data;
}
// --- AI Resume Validation ---
export async function validateResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await fetch(`${BASE_URL}/validate_resume`, {
    method: 'POST',
    body: formData
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Failed to parse server response.');
  }
  if (!response.ok) {
    throw new Error(data?.error || 'Resume validation failed.');
  }
  return data;
}
// src/services/api.js

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// --- Resume Extraction ---
export async function extractResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await fetch(`${BASE_URL}/extract_resume`, {
    method: 'POST',
    body: formData
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Failed to parse server response.');
  }
  if (!response.ok) {
    // Attach backend error message if present
    throw new Error(data?.error || 'Resume extraction failed.');
  }
  return data;
}

// --- Question Generation ---
export async function generateQuestion(resumeData, difficulty = 'medium') {
  const response = await fetch(`${BASE_URL}/generate_question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume: resumeData, difficulty })
  });
  return response.json();
}

// --- Answer Evaluation ---
export async function evaluateAnswer(question, answer) {
  const response = await fetch(`${BASE_URL}/evaluate_answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer })
  });
  return response.json();
}

// --- Get Candidate Data ---
export async function getCandidateData(candidateId) {
  const response = await fetch(`${BASE_URL}/candidate/${candidateId}`);
  return response.json();
}
