import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../redux/uiSlice';
import IntervieweeView from '../pages/IntervieweeView';
import InterviewerView from '../pages/InterviewerView';
const tabs = [
    { key: 'interviewee', label: 'Interviewee' },
    { key: 'interviewer', label: 'Interviewer' },
];
const TabNavigation = () => {
    const activeTab = useSelector((state) => state.ui?.activeTab || 'interviewee');
    const dispatch = useDispatch();
    return (_jsxs("div", { className: "w-full max-w-4xl mx-auto", children: [_jsx("div", { className: "tab-nav flex gap-1 mb-8 bg-white/90 backdrop-blur-lg rounded-xl p-2 shadow-lg", style: { boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }, children: tabs.map(tab => (_jsx("button", { className: `tab flex-1 py-3 px-6 rounded-lg font-medium text-base transition-all duration-200 focus:outline-none
              ${activeTab === tab.key ? 'active bg-blue-500 text-white shadow-lg' : 'text-slate-500 bg-transparent hover:bg-blue-50'}`, onClick: () => dispatch(setActiveTab(tab.key)), "aria-selected": activeTab === tab.key, style: activeTab === tab.key ? { boxShadow: '0 4px 12px rgba(59,130,246,0.3)' } : {}, children: tab.label }, tab.key))) }), _jsx("div", { className: "main-card bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl px-0 py-0", style: { boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }, children: activeTab === 'interviewee' ? _jsx(IntervieweeView, {}) : _jsx(InterviewerView, {}) })] }));
};
export default TabNavigation;
