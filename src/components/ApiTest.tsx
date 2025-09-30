import React, { useState } from 'react';
import type { PayloadAction } from '@reduxjs/toolkit';
import { generateQuestion } from '../services/api';

const ApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Dummy resume and difficulty
      const resp = await generateQuestion('React, Node.js, AWS', 'easy');
      setResult(resp);
    } catch (err: any) {
      setError(err?.message || 'API call failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-xl bg-white shadow">
      <h2 className="text-lg font-bold mb-4">Flask API Test</h2>
      <button
        onClick={handleTest}
        disabled={loading}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold mb-4"
      >
        {loading ? 'Testing...' : 'Test /generate_question Endpoint'}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {result && (
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ApiTest;
