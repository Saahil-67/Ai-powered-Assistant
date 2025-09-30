import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  startLoading,
  setError,
  addQuestion,
  submitAnswer,
  nextQuestion,
  completeInterview,
  loadMockQuestions,
  selectCurrentQuestion,
  selectIsLastQuestion,
  selectInterviewProgress
} from '../redux/interviewSlice';
import { Loader2, Clock, AlertCircle } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { loading, error, completed } = useSelector((state: RootState) => state.interview);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const isLastQuestion = useSelector(selectIsLastQuestion);
  const progress = useSelector(selectInterviewProgress);
  
  // Local state
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load initial questions
  useEffect(() => {
    if (!currentQuestion) {
      dispatch(loadMockQuestions());
    }
  }, [currentQuestion, dispatch]);

  // Timer management
  useEffect(() => {
    if (currentQuestion && !loading) {
      // Reset timer states
      setTimeLeft(currentQuestion.timeLimit);
      setTimeSpent(0);

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start new timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit(); // Auto-submit when timer expires
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, loading]);

  const handleSubmit = () => {
    if (!currentQuestion || loading) return;

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Submit answer
    dispatch(submitAnswer({ answer, timeSpent }));
    setAnswer('');

    // Move to next question or complete
    if (isLastQuestion) {
      dispatch(completeInterview());
    } else {
      dispatch(nextQuestion());
    }
  };

  const getTimerColor = () => {
    const ratio = timeLeft / (currentQuestion?.timeLimit || 1);
    if (ratio <= 0.2) return 'bg-red-500';
    if (ratio <= 0.5) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  // Loading state
  if (loading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Preparing your interview...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry Interview
        </button>
      </div>
    );
  }

  // Completion state
  if (completed) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Complete!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for completing the interview. Your responses have been recorded.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <div className="font-semibold text-lg text-gray-700">
            Question {progress.current} of {progress.total}
          </div>
          <div className="text-sm text-gray-500">
            Difficulty: {currentQuestion?.difficulty.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <div className={`font-mono ${getTimerColor()} px-3 py-1 rounded-full text-white`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Question:</h3>
        <p className="text-gray-700">{currentQuestion?.text}</p>
      </div>

      {/* Answer Input */}
      <div className="space-y-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={loading}
          placeholder="Type your answer here..."
          className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default ChatInterface;