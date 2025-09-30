import { jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';
import ChatInterface from '../components/ChatInterface';
const IntervieweeView = () => {
    const [uploaded] = useState(false);
    return (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: !uploaded ? (_jsx(ResumeUpload, {})) : (_jsx(ChatInterface, {})) }));
};
export default IntervieweeView;
