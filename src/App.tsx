import React, { useState, useEffect } from 'react';
import ResumeUpload from './components/ResumeUpload';
import InterviewPage from './components/InterviewPage';
import InterviewerDashboard from './components/InterviewerDashboard';

type TabType = 'interviewee' | 'interviewer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('interviewee');
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  // Detect incomplete interview on app load
  useEffect(() => {
    console.log('App.tsx: Checking localStorage keys:', Object.keys(localStorage));
    const saved = localStorage.getItem('incompleteInterview');
    console.log('App.tsx: incompleteInterview value:', saved);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Safeguard: only resume if current is within valid range
      const maxQuestions = 6; // DIFFICULTY_ORDER.length
      if (typeof parsed.current === 'number' && parsed.current >= 0 && parsed.current < maxQuestions) {
        setShowWelcomeBack(true);
        setResumeData(parsed);
        console.log('App.tsx: Welcome Back modal should show.');
      } else {
        // Out of bounds, start fresh
        localStorage.removeItem('incompleteInterview');
        setShowWelcomeBack(false);
        setResumeData(null);
        console.log('App.tsx: Invalid progress, starting fresh.');
      }
    } else {
      console.log('App.tsx: No incomplete interview found. Modal will not show.');
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 font-sans antialiased">
      <div className="container max-w-[1200px] mx-auto px-5 py-10 min-h-screen flex items-center justify-center">
        <div className="w-full bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl">
          <div className="p-8">
            {/* Tab Navigation */}
            <div className="flex mb-8 justify-center">
              <button
                className={`px-8 py-3 rounded-l-lg font-semibold text-lg transition-all ${activeTab === 'interviewee' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('interviewee')}
              >
                Interviewee
              </button>
              <button
                className={`px-8 py-3 rounded-r-lg font-semibold text-lg transition-all ${activeTab === 'interviewer' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('interviewer')}
              >
                Interviewer
              </button>
            </div>

            {/* Welcome Back Modal */}
            {showWelcomeBack && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative">
                  <h3 className="text-xl font-bold text-blue-700 mb-2">Welcome Back!</h3>
                  <div className="mb-4 text-gray-700">You have an unfinished interview. Would you like to continue where you left off?</div>
                  <div className="flex gap-4 justify-center">
                    <button
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition"
                      onClick={() => {
                        setInterviewStarted(true);
                        setShowWelcomeBack(false);
                      }}
                    >Resume Interview</button>
                    <button
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-blue-100 transition"
                      onClick={() => {
                        localStorage.removeItem('incompleteInterview');
                        setShowWelcomeBack(false);
                        setInterviewStarted(false);
                      }}
                    >Start Fresh</button>
                  </div>
                </div>
              </div>
            )}
            {/* Tab Content */}
            {activeTab === 'interviewee' ? (
              interviewStarted ? (
                <InterviewPage
                  onComplete={() => {
                    setInterviewStarted(false);
                    // Clear incomplete interview after finishing
                    localStorage.removeItem('incompleteInterview');
                    setResumeData(null);
                  }}
                  {...(resumeData ? {
                    initialQuestions: resumeData.questions,
                    initialCurrent: resumeData.current,
                    initialAnswer: resumeData.answer,
                    initialCandidate: resumeData.candidate,
                    initialTimer: resumeData.timer
                  } : {})}
                />
              ) : (
                <ResumeUpload onStartInterview={() => {
                  setInterviewStarted(true);
                  // Always clear incomplete interview when starting fresh
                  localStorage.removeItem('incompleteInterview');
                  setResumeData(null);
                }} />
              )
            ) : (
              <InterviewerDashboard />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;