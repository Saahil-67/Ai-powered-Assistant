import React from 'react';
type InterviewPageProps = {
    onComplete?: () => void;
    initialQuestions?: any[];
    initialCurrent?: number;
    initialAnswer?: string;
    initialCandidate?: any;
    initialTimer?: number;
};
declare const InterviewPage: React.FC<InterviewPageProps>;
export default InterviewPage;
