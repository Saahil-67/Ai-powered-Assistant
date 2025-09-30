import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { generateQuestion } from '../services/aiService';
const ApiTest = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const handleTest = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            // Dummy resume and difficulty
            const resp = await generateQuestion('easy', { skills: ['React', 'Node.js', 'AWS'], experience: [], education: [], projects: [] }, 0);
            setResult(resp);
        }
        catch (err) {
            setError(err?.message || 'API call failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "p-6 border rounded-xl bg-white shadow", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "Flask API Test" }), _jsx("button", { onClick: handleTest, disabled: loading, className: "px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold mb-4", children: loading ? 'Testing...' : 'Test /generate_question Endpoint' }), error && _jsx("div", { className: "text-red-600 mt-2", children: error }), result && (_jsx("pre", { className: "mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto", children: JSON.stringify(result, null, 2) }))] }));
};
export default ApiTest;
