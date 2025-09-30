#!/usr/bin/env python3
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import json
import argparse
from typing import List, Dict
import os

class LocalAIService:
    def __init__(self):
        # Configure 4-bit quantization
        self.quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        
        # Use Phi-2 but load in 4-bit precision
        self.model_name = "microsoft/phi-2"
        
        try:
            print("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            
            print("Loading quantized model...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=self.quantization_config,
                device_map="auto",
                trust_remote_code=True
            )
            self.model_loaded = True
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model_loaded = False

    def generate_prompt(self, resume_text: str, difficulty: str) -> str:
        return f"""Given this resume:
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
}}"""

    def generate_questions(
        self, 
        resume_text: str, 
        num_questions: int = 3,
        difficulty: str = "medium"
    ) -> List[Dict]:
        # Fallback questions if model fails
        fallback_questions = [
            {
                "question": "Explain how you would design a scalable web application based on your experience.",
                "category": "System Design",
                "difficulty": difficulty,
                "expected_duration": 180
            },
            {
                "question": "Describe a challenging technical problem you solved in your projects.",
                "category": "Problem Solving",
                "difficulty": difficulty,
                "expected_duration": 180
            },
            {
                "question": "How would you improve the performance of a slow web application?",
                "category": "Performance",
                "difficulty": difficulty,
                "expected_duration": 180
            }
        ]

        if not self.model_loaded:
            print("Model not loaded, using fallback questions")
            return fallback_questions[:num_questions]

        try:
            prompt = self.generate_prompt(resume_text, difficulty)
            
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
            
            # Generate with conservative parameters for memory
            outputs = self.model.generate(
                **inputs,
                max_length=512,
                num_return_sequences=1,
                temperature=0.7,
                top_p=0.9,
                pad_token_id=self.tokenizer.eos_token_id
            )

            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract JSON from response
            try:
                # Find JSON-like structure in the response
                start_idx = response.find('{')
                end_idx = response.rfind('}') + 1
                json_str = response[start_idx:end_idx]
                question_data = json.loads(json_str)
                return [question_data]  # Return as list for consistency
            except:
                print("Failed to parse model output, using fallback")
                return fallback_questions[:num_questions]

        except Exception as e:
            print(f"Error generating questions: {e}")
            return fallback_questions[:num_questions]

def main():
    parser = argparse.ArgumentParser(description='Generate interview questions from resume')
    parser.add_argument('--resume', type=str, required=True, help='Path to resume text file')
    parser.add_argument('--num_questions', type=int, default=3, help='Number of questions to generate')
    parser.add_argument('--difficulty', type=str, default='medium', help='Question difficulty')
    
    args = parser.parse_args()
    
    # Read resume text
    with open(args.resume, 'r') as f:
        resume_text = f.read()
    
    service = LocalAIService()
    questions = service.generate_questions(
        resume_text,
        num_questions=args.num_questions,
        difficulty=args.difficulty
    )
    
    print(json.dumps(questions, indent=2))

if __name__ == "__main__":
    main()