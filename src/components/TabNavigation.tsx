import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { setActiveTab } from '../redux/uiSlice';
import IntervieweeView from '../pages/IntervieweeView';
import InterviewerView from '../pages/InterviewerView';

const tabs = [
  { key: 'interviewee', label: 'Interviewee' },
  { key: 'interviewer', label: 'Interviewer' },
];

const TabNavigation: React.FC = () => {
  const activeTab = useSelector((state: RootState) => state.ui?.activeTab || 'interviewee');
  const dispatch = useDispatch();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="tab-nav flex gap-1 mb-8 bg-white/90 backdrop-blur-lg rounded-xl p-2 shadow-lg" style={{boxShadow:'0 8px 32px rgba(0,0,0,0.1)'}}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab flex-1 py-3 px-6 rounded-lg font-medium text-base transition-all duration-200 focus:outline-none
              ${activeTab === tab.key ? 'active bg-blue-500 text-white shadow-lg' : 'text-slate-500 bg-transparent hover:bg-blue-50'}`}
            onClick={() => dispatch(setActiveTab(tab.key as 'interviewee' | 'interviewer'))}
            aria-selected={activeTab === tab.key}
            style={activeTab === tab.key ? {boxShadow:'0 4px 12px rgba(59,130,246,0.3)'} : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="main-card bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl px-0 py-0" style={{boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
        {activeTab === 'interviewee' ? <IntervieweeView /> : <InterviewerView />}
      </div>
    </div>
  );
};

export default TabNavigation;
