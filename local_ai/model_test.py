#!/usr/bin/env python3
import requests
import os

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "YOUR_GROQ_API_KEY"  # Replace with your actual key
MODEL_NAME = "llama-3.1-8b-instant"
BASE_URL = 'http://localhost:5001'

# --- Interview Question Generation ---
def generate_interview_question(resume_text, difficulty="medium"):
    prompt = f"""
    Given this resume:
    {resume_text}

    Generate a {difficulty} technical interview question that:
    1. Tests skills mentioned in the resume
    2. Is specific to their experience level
    3. Can be answered in 3-5 minutes

    Format the response as JSON:
    {{
        "question": "the interview question",
        "category": "main skill being tested",
        "difficulty": "{difficulty}",
        "expected_duration": time_in_seconds
    }}
    """
    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 512,
            "temperature": 0.7
        }
    )
    return response.json()

# --- Answer Evaluation ---
def evaluate_answer(question, answer):
    prompt = f"""
    You are an expert technical interviewer. Score this answer:

    Question: {question}
    Answer: {answer}

    Provide a JSON response with:
    {{
        "score": (number between 0-100),
        "feedback": "detailed feedback explaining the score"
    }}
    """
    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 256,
            "temperature": 0.3
        }
    )
    return response.json()

if __name__ == "__main__":
    # Test question generation
    resume_text = "Frontend: React, TypeScript, HTML5, CSS3\nBackend: Node.js, Express\nCloud: AWS (S3, Lambda)\nExperience: Built responsive web apps, led team of 3 developers."
    print("Testing Groq API for interview question generation...")
    question_resp = generate_interview_question(resume_text, "medium")
    print("Groq API Question Response:")
    print(question_resp)

    # Test answer evaluation
    test_question = "Explain how you would design a scalable web application."
    test_answer = "I would use microservices, load balancing, and caching to ensure scalability."
    print("\nTesting Groq API for answer evaluation...")
    eval_resp = evaluate_answer(test_question, test_answer)
    print("Groq API Evaluation Response:")
    print(eval_resp)