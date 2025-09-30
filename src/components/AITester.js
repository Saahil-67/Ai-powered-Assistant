import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/AITester.tsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
const AITester = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const testAI = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        const MODEL = import.meta.env.VITE_HUGGING_FACE_MODEL;
        const TOKEN = import.meta.env.VITE_HUGGING_FACE_TOKEN;
        const MODEL_URL = `https://api-inference.huggingface.co/models/${MODEL}`;
        try {
            console.log('Testing AI with model:', MODEL);
            const response = await fetch(MODEL_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: 'Generate a simple coding question about arrays.',
                    parameters: {
                        max_length: 100,
                        temperature: 0.7,
                    }
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
            console.log('API Response:', data);
        }
        catch (err) {
            console.error('API Error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "p-4 border rounded-lg bg-white shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "AI Service Tester" }), _jsxs("div", { className: "space-y-4", children: [_jsx("button", { onClick: testAI, disabled: loading, className: "px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50", children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: "Testing AI..." })] })) : ('Test AI Connection') }), error && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-red-600 mb-2", children: "Error:" }), _jsx("pre", { className: "text-sm text-red-700 whitespace-pre-wrap", children: error })] })), result && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-green-600 mb-2", children: "Success!" }), _jsx("pre", { className: "text-sm text-green-700 whitespace-pre-wrap", children: JSON.stringify(result, null, 2) })] })), _jsxs("div", { className: "text-sm text-gray-500", children: [_jsx("p", { children: "Current Configuration:" }), _jsxs("ul", { className: "list-disc list-inside", children: [_jsxs("li", { children: ["Model: ", import.meta.env.VITE_HUGGING_FACE_MODEL] }), _jsxs("li", { children: ["Token Set: ", import.meta.env.VITE_HUGGING_FACE_TOKEN ? 'Yes' : 'No'] })] })] })] })] }));
};
export default AITester;
