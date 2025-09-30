import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { generateQuestion } from '../services/aiService';
import type { RootState } from '../redux/store';


const DIFFICULTY_ORDER: Array<'easy' | 'medium' | 'hard'> = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
const DIFFICULTY_TIME = { easy: 20, medium: 60, hard: 120 };

type InterviewPageProps = {
  onComplete?: () => void;
  initialQuestions?: any[];
  initialCurrent?: number;
  initialAnswer?: string;
  initialCandidate?: any;
  initialTimer?: number;
};

const InterviewPage: React.FC<InterviewPageProps> = ({ initialQuestions, initialCurrent, initialAnswer, initialCandidate, initialTimer }) => {
  // const navigate = useNavigate(); // Removed unused variable
  const candidate = initialCandidate || useSelector((state: RootState) => state.candidate);
  // Required fields for interview
  const REQUIRED_FIELDS = ['name', 'email', 'phone'];
  const missingFields = REQUIRED_FIELDS.filter(f => !candidate?.[f] || candidate[f].trim() === '');
  // const dispatch = useDispatch();
  const [questions, setQuestions] = useState<any[]>(initialQuestions || []);
  const [current, setCurrent] = useState(initialCurrent ?? 0);
  const [answer, setAnswer] = useState(initialAnswer ?? '');
  const [timer, setTimer] = useState(initialTimer ?? DIFFICULTY_TIME[DIFFICULTY_ORDER[0]]);
  const [completed, setCompleted] = useState(false);

  // Save progress to localStorage whenever state changes (except when completed)
  useEffect(() => {
    if (!completed) {
      const progress = {
        candidate,
        questions,
        current,
        answer,
        timer,
        date: Date.now(),
      };
      localStorage.setItem('incompleteInterview', JSON.stringify(progress));
      console.log('InterviewPage: Saved progress to localStorage:', progress);
    }
  }, [candidate, questions, current, answer, timer, completed]);

  const [loading, setLoading] = useState(false);
  // const [score, setScore] = useState<number | null>(null);
  // feedback state removed
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (current >= DIFFICULTY_ORDER.length) return;
      setLoading(true);
      const difficulty = DIFFICULTY_ORDER[current];
      const timerDuration = DIFFICULTY_TIME[difficulty];
      console.log('Question number:', current + 1);
      console.log('Difficulty:', difficulty);
      console.log('Timer duration:', timerDuration);
      console.log('Timer started at:', Date.now());
      try {
        // Use all available candidate info for context
        const resumeContext = {
          skills: candidate.skills || [],
          experience: candidate.experience || [],
          education: candidate.education || [],
          projects: candidate.projects || [],
          raw_text: candidate.raw_text || ''
        };
        const result = await generateQuestion(difficulty, resumeContext, current);
        setQuestions(prevQs => {
          const newQs = [...prevQs];
          newQs[current] = result;
          return newQs;
        });
        setTimer(timerDuration);
        setAnswer('');
      } catch (err: unknown) {
        setQuestions(prevQs => {
          const newQs = [...prevQs];
          newQs[current] = { question: 'Failed to generate question.' };
          return newQs;
        });
      } finally {
        setLoading(false);
      }
    };
    if (
      typeof current === 'number' &&
      current < DIFFICULTY_ORDER.length &&
      !questions[current] &&
      missingFields.length === 0 // Only fetch if all required fields are present
    ) {
      fetchQuestion();
    }
    // eslint-disable-next-line
  }, [current]);

  useEffect(() => {
    if (questions[current] && !loading && current < DIFFICULTY_ORDER.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      console.log('Timer effect triggered for question:', current + 1);
      timerRef.current = setInterval(() => {
        setTimer((prev: number) => {
          if (prev <= 1) {
            console.log('Auto-submitting question:', current + 1, 'at', Date.now());
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [questions, current, loading]);

  const handleSubmit = async () => {
    if (!questions[current] || loading || completed) return;
    setLoading(true);
    try {
      // TODO: Implement answer evaluation logic and scoring here
      // For now, just mark as completed or go to next question
      setTimeout(() => {
        if (current === DIFFICULTY_ORDER.length - 1) {
          setCompleted(true);
          setFinalScore(0); // Placeholder
        } else {
          setCurrent(c => c + 1);
        }
      }, 2000);
    } catch (err: unknown) {
  // setFeedback('Failed to score answer.');
      console.error('Error evaluating answer:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear incomplete data on finish
  useEffect(() => {
    if (completed) {
      localStorage.removeItem('incompleteInterview');
    }
  }, [completed]);

  // Block interview if required fields are missing
  if (missingFields.length > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans antialiased">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Missing Required Information</h2>
          <div className="text-lg text-gray-800 mb-2">
            Please provide the following before starting the interview:
          </div>
          <ul className="mb-4 text-red-600 font-semibold">
            {missingFields.map(f => <li key={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</li>)}
          </ul>
          <div className="text-gray-600">Return to the previous step to complete your profile.</div>
        </div>
      </div>
    );
  }
  if (completed) {
    console.log('Displaying scores (completion):', questions.map(q => q?.score));
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans antialiased">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Interview Complete!</h2>
          <div className="text-xl text-gray-800 mb-2">Your Final Score: <span className="font-bold text-green-600">{finalScore}</span></div>
          <div className="mt-4">Thank you for participating in the interview.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans antialiased">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-8">
        <div className="mb-4 text-gray-700 text-lg font-semibold text-center">
          Question {current + 1} / {DIFFICULTY_ORDER.length}
        </div>
        <div className="mb-2 text-sm text-gray-500 text-center">Difficulty: <span className="font-bold">{DIFFICULTY_ORDER[current].toUpperCase()}</span></div>
        <div className="mb-6 text-xl font-bold text-blue-700 text-center min-h-[60px]">
          {questions[current]?.question || 'Loading...'}
        </div>
        <div className="flex items-center justify-center mb-4">
          <span className="font-mono text-lg text-gray-600">Time: {timer}s</span>
        </div>
        <textarea
          className="w-full min-h-[80px] border rounded-lg p-3 mb-4 text-gray-800"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
           disabled={loading}
          placeholder="Type your answer here..."
        />
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold shadow-lg mb-2"
          onClick={handleSubmit}
           disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
        {/* Score and feedback UI removed as score is not defined */}
      </div>
    </div>
  );
};

export default InterviewPage;
