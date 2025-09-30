from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import json
import requests
import pdfplumber
from docx import Document

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# --- Configure these environment variables or replace with your values ---
GROQ_API_URL = os.environ.get("GROQ_API_URL", "https://api.openai.com/v1/chat/completions")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "replace_with_key")
MODEL_NAME = os.environ.get("MODEL_NAME", "gpt-4o-mini")  # adjust as needed
# -----------------------------------------------------------------------

def extract_text_from_pdf(file_path):
    text_parts = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text_parts.append(page.extract_text() or "")
    except Exception:
        pass
    return "\n".join(text_parts).strip()

def extract_text_from_docx(file_path):
    text_parts = []
    try:
        doc = Document(file_path)
        for p in doc.paragraphs:
            text_parts.append(p.text)
    except Exception:
        pass
    return "\n".join(text_parts).strip()

def extract_basic_contact_info(text, filename=""):
    # Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text) if text else None
    # Phone (simple)
    phone_match = re.search(r'(\+?\d{1,3}[\s-]?)?($?\d{3}$?[\s-]?)?\d{3}[\s-]?\d{4}', text) if text else None

    # Name: first non-empty line that doesn't contain email/phone and has at least two words
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    name = ""
    for line in lines:
        if email_match and email_match.group() in line:
            continue
        if phone_match and phone_match.group() in line:
            continue
        if len(line.split()) >= 2 and not re.search(r'\d', line):
            name = line
            break

    extracted_info = {
        "name": name or "",
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else ""
    }
    return extracted_info

@app.route("/validate_resume", methods=["POST"])
def validate_resume():
    """
    Accepts a file upload via 'file' (form-data).
    Returns JSON describing extracted contact fields and whether resume is valid.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    filename = file.filename or "uploaded_resume"
    _, ext = os.path.splitext(filename.lower())

    tmp_path = f"/tmp/{filename}"
    try:
        file.save(tmp_path)
    except Exception as e:
        return jsonify({"error": f"Could not save uploaded file: {e}"}), 500

    text = ""
    if ext in [".pdf"]:
        text = extract_text_from_pdf(tmp_path)
    elif ext in [".docx", ".doc"]:
        text = extract_text_from_docx(tmp_path)
    elif ext in [".txt"]:
        try:
            with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception:
            text = ""
    else:
        # Try to treat unknown as text
        try:
            with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception:
            text = ""

    # Remove temp file
    try:
        os.remove(tmp_path)
    except Exception:
        pass

    if not text:
        return jsonify({
            "is_valid_resume": False,
            "reason": "Uploaded file could not be parsed or is empty",
            "extracted_info": {"name": "", "email": "", "phone": ""},
            "missing_fields": ["name", "email", "phone"],
            "confidence": "low",
            "resume": filename,
            "raw_text": ""
        }), 400

    extracted_info = extract_basic_contact_info(text, filename)
    required_fields = ["name", "email", "phone"]
    missing_fields = [f for f in required_fields if not extracted_info.get(f)]

    return jsonify({
        "is_valid_resume": len(missing_fields) == 0,
        "reason": "" if len(missing_fields) == 0 else "Missing required fields: " + ", ".join(missing_fields),
        "extracted_info": extracted_info,
        "missing_fields": missing_fields,
        "confidence": "high" if len(missing_fields) == 0 else "medium",
        "resume": filename,
        "raw_text": text[:10000]  # limit raw text size returned
    }), (200 if len(missing_fields) == 0 else 400)

@app.route("/generate_question", methods=["POST"])
def generate_question():
    """
    Expects JSON with keys: answersAndScores (list), difficulty (easy/medium/hard), context (optional)
    Returns a generated interview question (JSON).
    """
    data = request.get_json() or {}
    answers_and_scores = data.get("answersAndScores", [])
    difficulty = data.get("difficulty", "medium")
    context = data.get("context", "")

    # Format answers for prompt
    answers_str = "\n".join([
        f"Q{i+1}: {item.get('question','')}\nA: {item.get('answer','')}\nScore: {item.get('score','')}"
        for i, item in enumerate(answers_and_scores)
    ])

    prompt = f"""
You are conducting a technical interview for a Full Stack Developer position (React/Node.js).

Candidate background:
{context}

Previous Q/As:
{answers_str}

Generate ONE {difficulty} level question that can be answered verbally in the time limit:
- Easy (20 seconds): Simple concept explanation or definition
- Medium (60 seconds): How-to or comparison question
- Hard (120 seconds): Design approach or problem-solving strategy

Return ONLY valid JSON (no comments):
{{
  "question": "single focused question here",
  "category": "React/Node.js/Full Stack",
  "difficulty": "{difficulty}",
  "expected_duration": 20
}}
"""

    try:
        resp = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL_NAME,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 300,
                "temperature": 0.7
            },
            timeout=15
        )
        resp.raise_for_status()
        groq_data = resp.json()
        # Adapt to OpenAI-style response or generic
        content = ""
        if "choices" in groq_data and len(groq_data["choices"]) > 0:
            choice = groq_data["choices"][0]
            # Chat-style
            if "message" in choice:
                content = choice["message"].get("content", "")
            else:
                content = choice.get("text", "")
        else:
            content = groq_data.get("content", "")

        # Extract first JSON object in content
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            json_string = json_match.group(0)
            json_string = re.sub(r'//.*?(?=\n|$)', '', json_string)
            json_string = re.sub(r',([\s]*[}\]])', r'\1', json_string)
            try:
                question_data = json.loads(json_string)
                return jsonify(question_data)
            except Exception:
                pass

        # Fallback: attempt to parse as JSON directly
        try:
            return jsonify(json.loads(content))
        except Exception:
            # Final fallback: return content as question text
            return jsonify({"question": content.strip(), "difficulty": difficulty})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/evaluate_answer", methods=["POST"])
def evaluate_answer():
    """
    Expects JSON with: question, answer, difficulty
    Returns: {"score": int, "feedback": "short text"}
    """
    data = request.get_json() or {}
    question = data.get("question", "")
    answer = data.get("answer", "")
    difficulty = data.get("difficulty", "medium")

    if not answer or str(answer).strip() == "":
        return jsonify({"score": 0, "feedback": "No answer provided"}), 200

    prompt = f"""
You are an expert technical interviewer. Score this answer strictly:

Question: {question}
Answer: {answer}

Scoring rules:
- Only give a score of 8-10 for truly excellent, complete, and correct answers.
- Give 4-7 for partial, incomplete, or somewhat correct answers.
- Give 0-3 for mostly incorrect, missing, or irrelevant answers.

Return ONLY this JSON (keep feedback under 100 words):
{{"score": 0, "feedback": "brief feedback"}}
"""

    try:
        resp = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL_NAME,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 160,
                "temperature": 0.1
            },
            timeout=12
        )
        resp.raise_for_status()
        groq_data = resp.json()

        content = ""
        if "choices" in groq_data and len(groq_data["choices"]) > 0:
            choice = groq_data["choices"][0]
            if "message" in choice:
                content = choice["message"].get("content", "")
            else:
                content = choice.get("text", "")
        else:
            content = groq_data.get("content", "")

        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            json_string = json_match.group(0)
            json_string = re.sub(r'//.*?(?=\n|$)', '', json_string)
            json_string = re.sub(r',([\s]*[}\]])', r'\1', json_string)
            try:
                result = json.loads(json_string)
                score = int(result.get("score", 0))
                feedback = result.get("feedback", "No feedback provided")
                return jsonify({"score": score, "feedback": feedback}), 200
            except Exception:
                pass

        # Fallback: try parsing content directly
        try:
            result = json.loads(content)
            score = int(result.get("score", 0))
            feedback = result.get("feedback", "No feedback provided")
            return jsonify({"score": score, "feedback": feedback}), 200
        except Exception:
            # last resort
            return jsonify({"score": 0, "feedback": content.strip()[:200]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generate_summary", methods=["POST"])
def generate_summary():
    """
    Example endpoint to summarize answers_and_scores or resume context.
    Accepts JSON: { answersAndScores: [...], context: "..." }
    """
    data = request.get_json() or {}
    answers_and_scores = data.get("answersAndScores", [])
    context = data.get("context", "")

    answers_str = "\n".join([
        f"Q{i+1}: {item.get('question','')}\nA: {item.get('answer','')}\nScore: {item.get('score','')}"
        for i, item in enumerate(answers_and_scores)
    ])

    prompt = f"Summarize candidate background and performance.\n\nContext:\n{context}\n\nQ/As:\n{answers_str}\n\nReturn JSON: {{'summary':'short summary'}}"

    try:
        resp = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL_NAME,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 300,
                "temperature": 0.3
            },
            timeout=12
        )
        resp.raise_for_status()
        groq_data = resp.json()
        content = ""
        if "choices" in groq_data and len(groq_data["choices"]) > 0:
            choice = groq_data["choices"][0]
            if "message" in choice:
                content = choice["message"].get("content", "")
            else:
                content = choice.get("text", "")
        else:
            content = groq_data.get("content", "")

        # Attempt to extract JSON
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            json_string = json_match.group(0)
            json_string = re.sub(r'//.*?(?=\n|$)', '', json_string)
            json_string = re.sub(r',([\s]*[}\]])', r'\1', json_string)
            try:
                return jsonify(json.loads(json_string))
            except Exception:
                pass

        return jsonify({"summary": content.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
