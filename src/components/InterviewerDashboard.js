import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Login from './Login';
import { logout, setAuthState } from '../redux/authSlice';
import { setInterviews } from '../redux/candidateHistorySlice';
const sortOptions = [
    { value: 'score', label: 'Score (High to Low)' },
    { value: 'date', label: 'Date Completed' },
    { value: 'name', label: 'Name (A-Z)' },
];
const InterviewerDashboard = () => {
    const interviews = useSelector((state) => state.candidateHistory.interviews);
    console.log('InterviewerDashboard Redux candidateHistory:', interviews);
    console.log('InterviewerDashboard localStorage candidateInterviews:', JSON.parse(localStorage.getItem('candidateInterviews') || '[]'));
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [selected, setSelected] = useState(null);
    // Persist login state on refresh
    useEffect(() => {
        // Hydrate auth state
        const stored = localStorage.getItem('interviewerAuth');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.isAuthenticated && parsed.username) {
                dispatch(setAuthState(parsed));
            }
        }
        hydrateInterviews();
    }, [dispatch]);
    const hydrateInterviews = () => {
        const interviewsLS = localStorage.getItem('candidateInterviews');
        if (interviewsLS) {
            try {
                const parsedInterviews = JSON.parse(interviewsLS);
                if (Array.isArray(parsedInterviews)) {
                    dispatch(setInterviews(parsedInterviews));
                }
            }
            catch (e) {
                console.error('Error parsing candidateInterviews from localStorage:', e);
            }
        }
    };
    const data = useMemo(() => {
        let data = interviews;
        if (search) {
            data = data.filter(interview => interview.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (sortBy === 'score') {
            data = [...data].sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
        }
        else if (sortBy === 'date') {
            data = [...data].sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());
        }
        else if (sortBy === 'name') {
            data = [...data].sort((a, b) => a.name.localeCompare(b.name));
        }
        return data;
    }, [interviews, search, sortBy]);
    const selectedInterview = data.find(i => i.id === selected);
    if (!isAuthenticated) {
        return _jsx(Login, { onSuccess: () => {
                dispatch(setAuthState({ isAuthenticated: true, username: localStorage.getItem('interviewerAuth') ? JSON.parse(localStorage.getItem('interviewerAuth')).username : '' }));
                hydrateInterviews();
            } });
    }
    return (_jsx("div", { className: "min-h-[600px] flex flex-col items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-4xl mx-auto bg-white/80 backdrop-blur rounded-xl p-8 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 text-center", children: "Interviewer Dashboard" }), _jsx("button", { className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-blue-100 transition", onClick: () => {
                                dispatch(logout());
                                localStorage.removeItem('interviewerAuth');
                            }, children: "Logout" })] }), _jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between mb-6 gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { htmlFor: "sortBy", className: "font-semibold text-gray-700", children: "Sort by:" }), _jsx("select", { id: "sortBy", className: "px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400", value: sortBy, onChange: e => setSortBy(e.target.value), children: sortOptions.map(opt => (_jsx("option", { value: opt.value, children: opt.label }, opt.value))) })] }), _jsx("input", { type: "text", className: "px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400", placeholder: "Search by candidate name...", value: search, onChange: e => setSearch(e.target.value) })] }), _jsx("p", { className: "text-gray-600 text-center mb-4", children: "View all candidates and their interview results here." }), data.length === 0 ? (_jsxs("div", { className: "text-center py-16 text-gray-500", children: [_jsx("div", { className: "text-xl font-semibold mb-2", children: "No completed interviews yet." }), _jsx("div", { children: "Switch to the Interviewee tab to generate test data." })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full table-auto border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-blue-100", children: [_jsx("th", { className: "px-4 py-2 text-left", children: "Name" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Email" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Phone" }), _jsx("th", { className: "px-4 py-2 text-center", children: "Final Score" }), _jsx("th", { className: "px-4 py-2 text-center", children: "Date Completed" }), _jsx("th", { className: "px-4 py-2 text-center", children: "Details" })] }) }), _jsx("tbody", { children: data.map(i => (_jsxs("tr", { className: "hover:bg-blue-50 transition", children: [_jsx("td", { className: "px-4 py-2 font-medium", children: i.name }), _jsx("td", { className: "px-4 py-2", children: i.email }), _jsx("td", { className: "px-4 py-2", children: i.phone }), _jsx("td", { className: "px-4 py-2 text-center font-bold text-blue-700", children: i.finalScore }), _jsx("td", { className: "px-4 py-2 text-center text-gray-500", children: new Date(i.dateCompleted).toLocaleString() }), _jsx("td", { className: "px-4 py-2 text-center", children: _jsx("button", { className: "px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition", onClick: () => setSelected(i.id), children: "View" }) })] }, i.id))) })] }) })), selectedInterview && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative", style: { maxHeight: '80vh', overflowY: 'auto' }, children: [_jsx("button", { className: "fixed top-6 right-6 z-10 text-gray-500 hover:text-blue-600 text-2xl focus:outline-none bg-white rounded-full shadow p-2", onClick: () => setSelected(null), "aria-label": "Close", title: "Close", style: { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }, children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) }), _jsxs("h3", { className: "text-xl font-bold text-blue-700 mb-2", children: [selectedInterview.name, " (", selectedInterview.email, ")"] }), _jsxs("div", { className: "mb-2 text-gray-700", children: ["Phone: ", selectedInterview.phone] }), _jsxs("div", { className: "mb-4 text-gray-600", children: ["Completed: ", new Date(selectedInterview.dateCompleted).toLocaleString()] }), _jsxs("div", { className: "mb-4 text-lg font-semibold", children: ["Final Score: ", _jsx("span", { className: "text-green-600", children: selectedInterview.finalScore })] }), selectedInterview.summary && (_jsxs("div", { className: "mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "font-bold mb-2 text-blue-700", children: "AI Performance Summary" }), _jsx("div", { className: "text-gray-800", children: selectedInterview.summary })] })), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "font-bold mb-2", children: "Questions & Answers" }), _jsx("div", { className: "space-y-4", children: selectedInterview.questions.map((q, idx) => (_jsxs("div", { className: "border rounded-lg p-4 bg-gray-50", children: [_jsxs("div", { className: "mb-2 text-sm text-gray-500", children: ["Q", idx + 1, " (", q.difficulty.toUpperCase(), ")"] }), _jsx("div", { className: "font-semibold mb-2 text-blue-800", children: q.question }), _jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "font-bold", children: "Answer:" }), " ", q.answer] }), _jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "font-bold", children: "Score:" }), " ", _jsx("span", { className: "text-green-700", children: q.score })] }), q.feedback && (_jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "font-bold", children: "AI Feedback:" }), " ", q.feedback] }))] }, idx))) })] })] }) }))] }) }));
};
export default InterviewerDashboard;
