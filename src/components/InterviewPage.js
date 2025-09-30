import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { generateQuestion } from '../services/aiService';
const DIFFICULTY_ORDER = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
const DIFFICULTY_TIME = { easy: 20, medium: 60, hard: 120 };
const InterviewPage = ({ initialQuestions, initialCurrent, initialAnswer, initialCandidate, initialTimer }) => {
    // const navigate = useNavigate(); // Removed unused variable
    const candidate = initialCandidate || useSelector((state) => state.candidate);
    // const dispatch = useDispatch();
    const [questions, setQuestions] = useState(initialQuestions || []);
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
    const [finalScore, setFinalScore] = useState(null);
    const timerRef = useRef(null);
    useEffect(() => {
        const fetchQuestion = async () => {
            if (current >= DIFFICULTY_ORDER.length)
                return;
            setLoading(true);
            const difficulty = DIFFICULTY_ORDER[current];
            const timerDuration = DIFFICULTY_TIME[difficulty];
            console.log('Question number:', current + 1);
            console.log('Difficulty:', difficulty);
            console.log('Timer duration:', timerDuration);
            console.log('Timer started at:', Date.now());
            try {
                const result = await generateQuestion(difficulty, { skills: [], experience: [], education: [], projects: [] }, current);
                setQuestions(prevQs => {
                    const newQs = [...prevQs];
                    newQs[current] = result;
                    return newQs;
                });
                setTimer(timerDuration);
                setAnswer('');
            }
            catch (err) {
                setQuestions(prevQs => {
                    const newQs = [...prevQs];
                    newQs[current] = { question: 'Failed to generate question.' };
                    return newQs;
                });
            }
            finally {
                setLoading(false);
            }
        };
        if (typeof current === 'number' && current < DIFFICULTY_ORDER.length && !questions[current])
            fetchQuestion();
        // eslint-disable-next-line
    }, [current]);
    useEffect(() => {
        if (questions[current] && !loading && current < DIFFICULTY_ORDER.length) {
            if (timerRef.current)
                clearInterval(timerRef.current);
            console.log('Timer effect triggered for question:', current + 1);
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
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
            if (timerRef.current)
                clearInterval(timerRef.current);
        };
        // eslint-disable-next-line
    }, [questions, current, loading]);
    const handleSubmit = async () => {
        if (!questions[current] || loading || completed)
            return;
        setLoading(true);
        try {
            // TODO: Implement answer evaluation logic and scoring here
            // For now, just mark as completed or go to next question
            setTimeout(() => {
                if (current === DIFFICULTY_ORDER.length - 1) {
                    setCompleted(true);
                    setFinalScore(0); // Placeholder
                }
                else {
                    setCurrent(c => c + 1);
                }
            }, 2000);
        }
        catch (err) {
            // setFeedback('Failed to score answer.');
            console.error('Error evaluating answer:', err);
        }
        finally {
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
        return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-white font-sans antialiased", children: _jsxs("div", { className: "w-full max-w-xl bg-white rounded-xl shadow-2xl p-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-blue-700 mb-4", children: "Interview Complete!" }), _jsxs("div", { className: "text-xl text-gray-800 mb-2", children: ["Your Final Score: ", _jsx("span", { className: "font-bold text-green-600", children: finalScore })] }), _jsx("div", { className: "mt-4", children: "Thank you for participating in the interview." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-white font-sans antialiased", children: _jsxs("div", { className: "w-full max-w-xl bg-white rounded-xl shadow-2xl p-8", children: [_jsxs("div", { className: "mb-4 text-gray-700 text-lg font-semibold text-center", children: ["Question ", current + 1, " / ", DIFFICULTY_ORDER.length] }), _jsxs("div", { className: "mb-2 text-sm text-gray-500 text-center", children: ["Difficulty: ", _jsx("span", { className: "font-bold", children: DIFFICULTY_ORDER[current].toUpperCase() })] }), _jsx("div", { className: "mb-6 text-xl font-bold text-blue-700 text-center min-h-[60px]", children: questions[current]?.question || 'Loading...' }), _jsx("div", { className: "flex items-center justify-center mb-4", children: _jsxs("span", { className: "font-mono text-lg text-gray-600", children: ["Time: ", timer, "s"] }) }), _jsx("textarea", { className: "w-full min-h-[80px] border rounded-lg p-3 mb-4 text-gray-800", value: answer, onChange: e => setAnswer(e.target.value), disabled: loading, placeholder: "Type your answer here..." }), _jsx("button", { className: "w-full py-3 bg-blue-500 text-white rounded-lg font-semibold shadow-lg mb-2", onClick: handleSubmit, disabled: loading, children: loading ? 'Submitting...' : 'Submit Answer' })] }) }));
};
export default InterviewPage;
