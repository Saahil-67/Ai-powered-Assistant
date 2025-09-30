import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/authSlice';
const DEMO_USER = 'admin';
const DEMO_PASS = 'password';
const Login = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === DEMO_USER && password === DEMO_PASS) {
            dispatch(login(username));
            localStorage.setItem('interviewerAuth', JSON.stringify({ isAuthenticated: true, username }));
            setError('');
            if (onSuccess)
                onSuccess();
        }
        else {
            setError('Invalid credentials.');
        }
    };
    return (_jsx("div", { className: "min-h-[400px] flex flex-col items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md mx-auto bg-white/80 backdrop-blur rounded-xl p-8 shadow-xl", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6 text-center", children: "Interviewer Login" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Username" }), _jsx("input", { type: "text", className: "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400", value: username, onChange: e => setUsername(e.target.value), required: true, autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Password" }), _jsx("input", { type: "password", className: "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400", value: password, onChange: e => setPassword(e.target.value), required: true })] }), error && _jsx("div", { className: "text-red-600 text-center font-medium", children: error }), _jsx("button", { type: "submit", className: "w-full py-3 bg-blue-500 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition", children: "Login" })] }), _jsxs("div", { className: "mt-6 text-sm text-center text-gray-500", children: ["Demo credentials: ", _jsx("span", { className: "font-mono", children: "admin / password" })] })] }) }));
};
export default Login;
