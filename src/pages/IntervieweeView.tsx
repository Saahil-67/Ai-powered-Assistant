
import React, { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';
import ChatInterface from '../components/ChatInterface';

const IntervieweeView: React.FC = () => {
  const [uploaded] = useState(false);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {!uploaded ? (
        <ResumeUpload />
      ) : (
        <ChatInterface />
      )}
    </div>
  );
};

export default IntervieweeView;
