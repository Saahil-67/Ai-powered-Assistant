# AI-Powered Interview Assistant (Swipe Internship Assignment)

## Description
A full-stack web application that automates technical interviews using Groq's Llama 3.1-8b-instant model. Candidates upload their resume, answer timed AI-generated questions, and receive instant scoring and feedback. Interviewers can view candidate results, summaries, and manage sessions via a secure dashboard.

## Features
- Resume validation and info extraction
- AI-generated technical questions and answers (Groq API)
- Timed interview flow with difficulty levels
- Automated scoring and feedback
- Interviewer dashboard with candidate search, sorting, and summaries
- Authentication for interviewer access

## Tech Stack
- **Frontend:** React, TypeScript, Redux, Tailwind CSS
- **Backend:** Python, Flask
- **AI:** Groq API (Llama 3.1-8b-instant)

## Prerequisites
- Node.js (v16+ recommended)
- Python 3.8+
- Groq API key

## Installation
1. **Clone the repository:**
  ```bash
  git clone https://github.com/yourusername/swipe-interview-assistant.git
  cd swipe-interview-assistant
  ```
2. **Frontend setup:**
  ```bash
  npm install
  npm run dev
  ```
3. **Backend setup:**
  ```bash
  cd local_ai
  pip install -r requirements.txt
  python app.py
  ```

## Environment Variables
Create a `.env` file in the project root:
```
GROQ_API_KEY=your_groq_api_key_here
```
See `.env.example` for reference.

## Usage
- Interviewee: Upload your resume, answer AI questions, and receive instant feedback.
- Interviewer: Log in to view candidate results, sort/search, and read AI-generated summaries.
- Resume incomplete interviews with the "Welcome Back" modal.

## Project Structure
```
├── src/
│   ├── components/
│   ├── redux/
│   ├── services/
│   └── data/
├── local_ai/
│   ├── app.py
│   └── ...
├── .env.example
├── requirements.txt
├── README.md
└── ...
```

## API Endpoints
- `POST /validate_resume` — Validate and extract info from resume
- `POST /generate_question` — Generate AI interview question (Groq API)
- `POST /evaluate_answer` — Score candidate answer (Groq API)
- `POST /generate_summary` — Generate AI summary of interview (Groq API)
- `GET /get_candidate` — Get candidate info

## Screenshots
*Add screenshots here to showcase the UI and features.*

## Assignment Context
This project was developed as part of the Swipe internship assignment to demonstrate full-stack engineering, AI integration, and user experience design.

## Author
Saahil Manglani

