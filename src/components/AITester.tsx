// src/components/AITester.tsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const AITester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">AI Service Tester</h2>
      
      <div className="space-y-4">
        <button
          onClick={testAI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Testing AI...</span>
            </div>
          ) : (
            'Test AI Connection'
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-600 mb-2">Error:</h3>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-600 mb-2">Success!</h3>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>Current Configuration:</p>
          <ul className="list-disc list-inside">
            <li>Model: {import.meta.env.VITE_HUGGING_FACE_MODEL}</li>
            <li>Token Set: {import.meta.env.VITE_HUGGING_FACE_TOKEN ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AITester;