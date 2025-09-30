import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { generateQuestion, evaluateAnswer } from '../services/api';
import { 
  startLoading,
  setError,
  addQuestion,
  setAnswer,
  addScore,
  nextQuestion,
  completeInterview
} from '../redux/interviewSlice';
import { Loader2, Clock } from 'lucide-react';

const DIFFICULTY_ORDER = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
const DIFFICULTY_TIME = { easy: 20, medium: 60, hard: 120 };

const ChatInterface: React.FC = () => {
  const dispatch = useDispatch();
  const { questions, currentQuestion, loading, error, completed } = useSelector((state: RootState) => state.interview);
  const candidate = useSelector((state: RootState) => state.candidate);
  const [answer, setAnswerText] = useState('');
  const [timer, setTimer] = useState(DIFFICULTY_TIME[DIFFICULTY_ORDER[currentQuestion]]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch question from backend
  useEffect(() => {
    const fetchQuestion = async () => {
      if (questions.length <= currentQuestion && !completed) {
        dispatch(startLoading());
        try {
          const difficulty = DIFFICULTY_ORDER[currentQuestion];
          const resumeData = candidate.resume || '';
          const result = await generateQuestion(resumeData, difficulty);
          if (result?.question) {
            dispatch(addQuestion(result.question));
            setTimer(DIFFICULTY_TIME[difficulty]);
            setAnswerText('');
          } else {
            dispatch(setError(result?.error || 'Failed to generate question.'));
          }
        } catch (err: any) {
          dispatch(setError(err?.message || 'Failed to generate question.'));
        }
      }
    };
    fetchQuestion();
    // eslint-disable-next-line
  }, [currentQuestion]);

  // Timer logic
  useEffect(() => {
    if (questions[currentQuestion] && !loading && !completed) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
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
  }, [questions, currentQuestion, loading, completed]);

  // Submit answer and get score
  const handleSubmit = async () => {
    if (!questions[currentQuestion] || loading || completed) return;
    dispatch(startLoading());
    try {
      dispatch(setAnswer({ answer, index: currentQuestion }));
      const result = await evaluateAnswer(questions[currentQuestion].text, answer);
      if (result?.score !== undefined) {
        dispatch(addScore({
          score: result.score,
          feedback: result.feedback || '',
          strengths: [],
          improvements: [],
          technicalAccuracy: 0,
          communicationClarity: 0,
          completeness: 0
        }));
      } else {
        dispatch(setError(result?.error || 'Failed to score answer.'));
      }
      setAnswerText('');
      if (currentQuestion === 5) {
        dispatch(completeInterview());
      } else {
        dispatch(nextQuestion());
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to submit answer.'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Processing...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Retry Interview
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Complete!</h2>
        <p className="text-gray-600 mb-6">Thank you for completing the interview.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const timerColor = timer <= 5 ? 'bg-red-500' : timer <= 15 ? 'bg-yellow-400' : 'bg-green-400';
  const progress = ((timer / (DIFFICULTY_TIME[DIFFICULTY_ORDER[currentQuestion]] || 1)) * 100).toFixed(0);

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="font-semibold text-lg text-gray-700">
          Question {currentQuestion + 1} of 6
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <div className={`font-mono ${timerColor} px-3 py-1 rounded-full text-white`}>
            {timer}s
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Question:</h3>
        <p className="text-gray-700">{currentQ?.text}</p>
      </div>
      <div className="space-y-4">
        <textarea
          value={answer}
          onChange={e => setAnswerText(e.target.value)}
          disabled={loading}
          placeholder="Type your answer here..."
          className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !answer.trim()}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            'Submit Answer'
          )}
        </button>
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold tracking-wide shadow">
          {DIFFICULTY_ORDER[currentQuestion].toUpperCase()}
        </div>
        <div className="w-1/3 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-3 rounded-full ${timerColor} transition-all duration-300`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
