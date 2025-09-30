import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { generateQuestion } from '../services/aiService';
import { Clock } from 'lucide-react';
const DIFFICULTY_ORDER = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
const DIFFICULTY_TIME = { easy: 20, medium: 60, hard: 120 };
const ChatInterface = () => {
    const { questions, currentQuestion } = useSelector((state) => state.interview);
    const [answer, setAnswerText] = useState('');
    const [timer, setTimer] = useState(DIFFICULTY_TIME[DIFFICULTY_ORDER[currentQuestion]]);
    const timerRef = useRef(null);
    // Fetch question from backend
    useEffect(() => {
        const fetchQuestion = async () => {
            const difficulty = DIFFICULTY_ORDER[currentQuestion];
            // TODO: If you want to use resume context, add those fields to CandidateState and populate them.
            // For now, just call generateQuestion with dummy context:
            await generateQuestion(difficulty, { skills: [], experience: [], education: [], projects: [] }, currentQuestion);
            // TODO: Use setQuestions/setCurrentQuestion as needed
            // TODO: Dispatch setQuestions or setCurrentQuestion as needed
        };
        fetchQuestion();
        // eslint-disable-next-line
    }, [currentQuestion]);
    // Timer logic
    useEffect(() => {
        if (questions[currentQuestion]) {
            if (timerRef.current)
                clearInterval(timerRef.current);
            timerRef.current = window.setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
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
    return (_jsxs("div", { className: "bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { className: "font-semibold text-lg text-gray-700", children: ["Question ", currentQuestion + 1, " of 6"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { className: `font-mono ${timerColor} px-3 py-1 rounded-full text-white`, children: [timer, "s"] })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-800 mb-2", children: "Question:" }), _jsx("p", { className: "text-gray-700", children: currentQ?.text })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("textarea", { value: answer, onChange: e => setAnswerText(e.target.value), placeholder: "Type your answer here...", className: "w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { onClick: handleSubmit, disabled: !answer.trim(), className: "w-full py-2 px-4 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors", children: "Submit Answer" })] }), _jsxs("div", { className: "flex items-center justify-between mt-8", children: [_jsx("div", { className: "text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold tracking-wide shadow", children: DIFFICULTY_ORDER[currentQuestion].toUpperCase() }), _jsx("div", { className: "w-1/3 h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: `h-3 rounded-full ${timerColor} transition-all duration-300`, style: { width: `${progress}%` } }) })] })] }));
};
export default ChatInterface;
