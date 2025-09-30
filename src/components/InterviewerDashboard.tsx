import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import Login from './Login';
import { logout, setAuthState } from '../redux/authSlice';
import { setInterviews } from '../redux/candidateHistorySlice';


const sortOptions = [
  { value: 'score', label: 'Score (High to Low)' },
  { value: 'date', label: 'Date Completed' },
  { value: 'name', label: 'Name (A-Z)' },
];

const InterviewerDashboard: React.FC = () => {
  const interviews = useSelector((state: RootState) => state.candidateHistory.interviews);
  console.log('InterviewerDashboard Redux candidateHistory:', interviews);
  console.log('InterviewerDashboard localStorage candidateInterviews:', JSON.parse(localStorage.getItem('candidateInterviews') || '[]'));
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selected, setSelected] = useState<string | null>(null);

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
      } catch (e) {
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
    } else if (sortBy === 'date') {
      data = [...data].sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());
    } else if (sortBy === 'name') {
      data = [...data].sort((a, b) => a.name.localeCompare(b.name));
    }
    return data;
  }, [interviews, search, sortBy]);

  const selectedInterview = data.find(i => i.id === selected);

  if (!isAuthenticated) {
    return <Login onSuccess={() => {
      dispatch(setAuthState({ isAuthenticated: true, username: localStorage.getItem('interviewerAuth') ? JSON.parse(localStorage.getItem('interviewerAuth')!).username : '' }));
      hydrateInterviews();
    }} />;
  }
  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur rounded-xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Interviewer Dashboard</h2>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-blue-100 transition"
            onClick={() => {
              dispatch(logout());
              localStorage.removeItem('interviewerAuth');
            }}
          >Logout</button>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="font-semibold text-gray-700">Sort by:</label>
            <select
              id="sortBy"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search by candidate name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <p className="text-gray-600 text-center mb-4">View all candidates and their interview results here.</p>
        {/* Candidate list */}
        {data.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-xl font-semibold mb-2">No completed interviews yet.</div>
            <div>Switch to the Interviewee tab to generate test data.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-center">Final Score</th>
                  <th className="px-4 py-2 text-center">Date Completed</th>
                  <th className="px-4 py-2 text-center">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.map(i => (
                  <tr key={i.id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-2 font-medium">{i.name}</td>
                    <td className="px-4 py-2">{i.email}</td>
                    <td className="px-4 py-2">{i.phone}</td>
                    <td className="px-4 py-2 text-center font-bold text-blue-700">{i.finalScore}</td>
                    <td className="px-4 py-2 text-center text-gray-500">{new Date(i.dateCompleted).toLocaleString()}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition"
                        onClick={() => setSelected(i.id)}
                      >View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Candidate detail modal/page */}
        {selectedInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <button
                className="fixed top-6 right-6 z-10 text-gray-500 hover:text-blue-600 text-2xl focus:outline-none bg-white rounded-full shadow p-2"
                onClick={() => setSelected(null)}
                aria-label="Close"
                title="Close"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <h3 className="text-xl font-bold text-blue-700 mb-2">{selectedInterview.name} ({selectedInterview.email})</h3>
              <div className="mb-2 text-gray-700">Phone: {selectedInterview.phone}</div>
              <div className="mb-4 text-gray-600">Completed: {new Date(selectedInterview.dateCompleted).toLocaleString()}</div>
              <div className="mb-4 text-lg font-semibold">Final Score: <span className="text-green-600">{selectedInterview.finalScore}</span></div>
              {selectedInterview.summary && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold mb-2 text-blue-700">AI Performance Summary</h4>
                  <div className="text-gray-800">{selectedInterview.summary}</div>
                </div>
              )}
              <div className="mb-4">
                <h4 className="font-bold mb-2">Questions & Answers</h4>
                <div className="space-y-4">
                  {selectedInterview.questions.map((q, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="mb-2 text-sm text-gray-500">Q{idx + 1} ({q.difficulty.toUpperCase()})</div>
                      <div className="font-semibold mb-2 text-blue-800">{q.question}</div>
                      <div className="mb-2"><span className="font-bold">Answer:</span> {q.answer}</div>
                      <div className="mb-2"><span className="font-bold">Score:</span> <span className="text-green-700">{q.score}</span></div>
                      {q.feedback && (
                        <div className="mb-2"><span className="font-bold">AI Feedback:</span> {q.feedback}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewerDashboard;