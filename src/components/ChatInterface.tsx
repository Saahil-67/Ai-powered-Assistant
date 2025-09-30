import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { generateQuestion } from '../services/aiService';

import { Clock } from 'lucide-react';

const DIFFICULTY_ORDER = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
const DIFFICULTY_TIME: Record<string, number> = { easy: 20, medium: 60, hard: 120 };

const ChatInterface: React.FC = () => {
  const { questions, currentQuestion } = useSelector((state: RootState) => state.interview);
  const [answer, setAnswerText] = useState('');
  const [timer, setTimer] = useState(DIFFICULTY_TIME[DIFFICULTY_ORDER[currentQuestion]]);
  const timerRef = useRef<number | null>(null);

  // Fetch question from backend
  useEffect(() => {
    const fetchQuestion = async () => {
      const difficulty = DIFFICULTY_ORDER[currentQuestion];
      // TODO: If you want to use resume context, add those fields to CandidateState and populate them.
      // For now, just call generateQuestion with dummy context:
  await generateQuestion(difficulty as 'easy' | 'medium' | 'hard', { skills: [], experience: [], education: [], projects: [] }, currentQuestion);
      // TODO: Use setQuestions/setCurrentQuestion as needed
      // TODO: Dispatch setQuestions or setCurrentQuestion as needed
    };
    fetchQuestion();
    // eslint-disable-next-line
  }, [currentQuestion]);

  // Timer logic
  useEffect(() => {
  if (questions[currentQuestion]) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setTimer((prev: number) => {
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
  }, [questions, currentQuestion]);

  // Submit answer and get score
  const handleSubmit = async () => {
    // TODO: Implement answer submission logic using available actions
  };



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
          placeholder="Type your answer here..."
          className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          Submit Answer
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
