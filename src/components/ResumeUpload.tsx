import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCandidateInfo, resetCandidate } from '../redux/candidateSlice';

const REQUIRED_FIELDS = ['name', 'email', 'phone'];

type ResumeUploadProps = {
  onStartInterview?: () => void;
};


const ResumeUpload: React.FC<ResumeUploadProps> = ({ onStartInterview }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [pendingCandidate, setPendingCandidate] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState(false);
  const [ready, setReady] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFileName(selectedFile.name);
    setFile(selectedFile);
    setError(null);
    dispatch(resetCandidate());
    setChatMode(false);
    setMissingFields([]);
    setPendingCandidate(null);
    setReady(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
  const response = await fetch('http://localhost:5001/validate_resume', {
        method: 'POST',
        body: formData
      });
      let result;
      try {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        result = await response.json();
      } catch (jsonErr) {
        setError('Resume validation failed: Invalid server response.');
        setLoading(false);
        return;
      }
      if (!result.is_valid_resume) {
        setError(result.reason || 'This document is not a valid resume.');
        setLoading(false);
        return;
      }
      const info = result.extracted_info || {};
      const missing = REQUIRED_FIELDS.filter(f => !info[f] || info[f].trim() === '');
      if (missing.length > 0) {
        setChatMode(true);
        setMissingFields(missing);
        setPendingCandidate({
          name: info.name ?? '',
          email: info.email ?? '',
          phone: info.phone ?? '',
          resume: selectedFile.name,
          raw_text: ''
        });
        setLoading(false);
        return;
      }
      dispatch(setCandidateInfo({
        name: info.name ?? '',
        email: info.email ?? '',
        phone: info.phone ?? '',
        resume: selectedFile.name,
        raw_text: ''
      }));
      setReady(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Resume validation failed.');
      setLoading(false);
    }
  };

  const handleChatSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const field = missingFields[0];
    const updatedCandidate = { ...pendingCandidate, [field]: chatInput.trim() };
    setPendingCandidate(updatedCandidate);
    setChatInput('');
    const remaining = missingFields.slice(1);
    if (remaining.length > 0) {
      setMissingFields(remaining);
    } else {
      dispatch(setCandidateInfo(updatedCandidate));
      setChatMode(false);
      setReady(true);
    }
  };

  const handleStartInterview = () => {
    if (onStartInterview) onStartInterview();
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Resume</h2>
      <input
        type="file"
        accept=".pdf,.docx"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {!fileName && (
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold mb-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Select Resume (PDF or DOCX)'}
        </button>
      )}
      {fileName && !chatMode && (
        <div className="mb-4 text-center">
          <div className="text-lg font-medium text-gray-800 mb-2">Selected file: {fileName}</div>
          <button
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
          >
            {loading ? 'Processing...' : 'Change File'}
          </button>
        </div>
      )}
      {chatMode && (
        <form onSubmit={handleChatSend} className="mt-6">
          <div className="mb-2 text-gray-700">Please enter your {missingFields[0]}:</div>
          <input
            type="text"
            className="w-full p-2 border rounded mb-2"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            required
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded"
          >Submit</button>
        </form>
      )}
      {ready && !chatMode && (
        <button
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold mt-4"
          onClick={handleStartInterview}
        >
          Start Interview
        </button>
      )}
      {error && (
        <div className="mt-4 text-center text-red-600 font-medium">{error}</div>
      )}
      <p className="mt-6 text-sm text-center text-gray-500">Supported formats: PDF, DOCX</p>
    </div>
  );
};

export default ResumeUpload;