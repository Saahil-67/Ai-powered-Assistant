import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generateQuestion, evaluateAnswer } from '../services/api';
import type { RootState } from '../redux/store';
import { addInterview } from '../redux/candidateHistorySlice';

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

const InterviewPage: React.FC<InterviewPageProps> = ({ onComplete, initialQuestions, initialCurrent, initialAnswer, initialCandidate, initialTimer }) => {
  // const navigate = useNavigate(); // Removed unused variable
  const candidate = initialCandidate || useSelector((state: RootState) => state.candidate);
  const dispatch = useDispatch();
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
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
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
        const result = await generateQuestion({ raw_text: candidate.raw_text }, difficulty);
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
    if (typeof current === 'number' && current < DIFFICULTY_ORDER.length && !questions[current]) fetchQuestion();
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
      const result = await evaluateAnswer(questions[current].question, answer);
      console.log('Received evaluation:', result);
      // Try to extract score from result.choices[0].score
      const score = result?.choices?.[0]?.score ?? result?.score ?? 0;
      console.log('Score from backend:', score);
      setScore(score);
      setFeedback(result.feedback || '');
      // Store score and answer in questions array
      setQuestions(qs => {
        const newQs = [...qs];
        newQs[current] = { ...newQs[current], score, answer };
        console.log('Saving score to Redux/state:', score, newQs);
        return newQs;
      });
      setTimeout(() => {
        setScore(null);
        setFeedback('');
        if (current === DIFFICULTY_ORDER.length - 1) {
          // Interview complete
          setCompleted(true);
          // Calculate final score using up-to-date scores
          const scores = [
            ...questions.slice(0, DIFFICULTY_ORDER.length - 1).map(q => q?.score || 0),
            score
          ];
          console.log('Individual question scores:', scores);
          const total = scores.reduce((a, b) => a + b, 0);
          console.log('Final score calculated:', total);
          setFinalScore(total);
          // Prepare answers and scores for summary
          const answersAndScores = questions.map((q, i) => ({
            question: q?.question || '',
            answer: q?.answer || (i === current ? answer : ''),
            score: q?.score ?? (i === current ? score : 0),
            feedback: q?.feedback,
            difficulty: DIFFICULTY_ORDER[i],
          }));
          console.log('InterviewPage: Calling generateSummary with:', answersAndScores);
          import('../services/api').then(api => {
            api.generateSummary(answersAndScores).then((summaryResult: { summary: string }) => {
              console.log('InterviewPage: Received summary from backend:', summaryResult);
              const interviewData = {
                id: `${candidate.email}-${Date.now()}`,
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                resume: candidate.resume,
                raw_text: candidate.raw_text,
                questions: answersAndScores,
                finalScore: total,
                summary: summaryResult.summary,
                dateCompleted: new Date().toISOString(),
              };
              console.log('InterviewPage: Saving interview with summary to Redux/localStorage:', interviewData);
              dispatch(addInterview(interviewData));
              // Optionally, persist to localStorage
              const prev = JSON.parse(localStorage.getItem('candidateInterviews') || '[]');
              localStorage.setItem('candidateInterviews', JSON.stringify([...prev, interviewData]));
              console.log('InterviewPage: Saved interviews in localStorage:', JSON.parse(localStorage.getItem('candidateInterviews') || '[]'));
        setFeedback('Failed to score answer.');
            }).catch(err => {
              console.error('InterviewPage: Error generating summary:', err as unknown);
              // Save interview without summary if summary fails
              const interviewData = {
                id: `${candidate.email}-${Date.now()}`,
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                resume: candidate.resume,
                raw_text: candidate.raw_text,
                questions: answersAndScores,
                finalScore: total,
                summary: '',
                dateCompleted: new Date().toISOString(),
              };
              dispatch(addInterview(interviewData));
              const prev = JSON.parse(localStorage.getItem('candidateInterviews') || '[]');
              localStorage.setItem('candidateInterviews', JSON.stringify([...prev, interviewData]));
              if (onComplete) onComplete();
            });
          });
        } else {
          setCurrent(c => c + 1);
        }
      }, 2000);
  } catch (err: unknown) {
      setFeedback('Failed to score answer.');
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
          disabled={loading || !!score}
          placeholder="Type your answer here..."
        />
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold shadow-lg mb-2"
          onClick={handleSubmit}
          disabled={loading || !!score}
        >
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
        {score !== null && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-green-600">Score: {score}</div>
            <div className="text-gray-700 mt-2">{feedback}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
