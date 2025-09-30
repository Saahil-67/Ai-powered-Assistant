
import React, { useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { validateResume } from '../services/api';
import { setCandidateInfo, resetCandidate } from '../redux/candidateSlice';
import { useNavigate } from 'react-router-dom';

type ResumeUploadProps = {
  onStartInterview?: () => void;
};

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onStartInterview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
      setError(null);
      // Clear previous candidate/interview state
      dispatch(resetCandidate());
      setChatMode(false);
      setChatMessages([]);
      setMissingFields([]);
      setPendingCandidate(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFileName(droppedFile.name);
      setFile(droppedFile);
      setError(null);
      // Clear previous candidate/interview state
      dispatch(resetCandidate());
      setChatMode(false);
      setChatMessages([]);
      setMissingFields([]);
      setPendingCandidate(null);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'bot' | 'user', text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [pendingCandidate, setPendingCandidate] = useState<any>(null);

  const handleStartInterview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
  // Use AI-powered validation
  const result = await validateResume(file);
      console.log('AI resume validation result:', result);
      if (!result.is_valid_resume) {
        setError(result.reason || 'This document is not a valid resume.');
        setLoading(false);
        // Clear upload state and allow retry
        setFileName(null);
        setFile(null);
        dispatch(resetCandidate());
        setChatMode(false);
        setChatMessages([]);
        setMissingFields([]);
        setPendingCandidate(null);
        return;
      }
      // Always check for missing Name, Email, Phone
      const info = result.extracted_info || {};
      const requiredFields = ['name', 'email', 'phone'];
      const missing = requiredFields.filter(f => !info[f] || info[f].trim() === '');
      if (missing.length > 0) {
        setChatMode(true);
        setMissingFields(missing);
        setPendingCandidate({
          name: info.name ?? '',
          email: info.email ?? '',
          phone: info.phone ?? '',
          resume: fileName ?? '',
          raw_text: ''
        });
        setChatMessages([
          { role: 'bot', text: `I couldn't find your ${missing[0]} in your resume. Please provide it:` }
        ]);
        setLoading(false);
        return;
      }
      dispatch(setCandidateInfo({
        name: info.name ?? '',
        email: info.email ?? '',
        phone: info.phone ?? '',
        resume: fileName ?? '',
        raw_text: ''
      }));
      navigate('/interview');
      if (onStartInterview) onStartInterview();
    } catch (err: any) {
      setError(err?.message || 'Resume validation failed.');
      // Clear upload state and allow retry
      setFileName(null);
      setFile(null);
      dispatch(resetCandidate());
      setChatMode(false);
      setChatMessages([]);
      setMissingFields([]);
      setPendingCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  // Chat logic for collecting missing fields
  const handleChatSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const field = missingFields[0];
    const updatedCandidate = { ...pendingCandidate, [field]: chatInput.trim() };
    setChatMessages(msgs => [...msgs, { role: 'user', text: chatInput.trim() }]);
    setChatInput('');
    const nextMissing = missingFields.slice(1);
    if (nextMissing.length > 0) {
      setMissingFields(nextMissing);
      setPendingCandidate(updatedCandidate);
      setTimeout(() => {
        setChatMessages(msgs => [...msgs, { role: 'bot', text: `I couldn't find your ${nextMissing[0]}. Please provide it:` }]);
      }, 500);
    } else {
      // All fields collected, update candidate and start interview
      dispatch(setCandidateInfo(updatedCandidate));
      setChatMode(false);
      navigate('/interview');
      if (onStartInterview) onStartInterview();
    }
  };

  return (
  <div className="min-h-[600px] flex flex-col items-center justify-center p-4 bg-white">
      {/* Upload card with improved visibility */}
      <div
        className="w-full max-w-2xl mx-auto rounded-2xl p-10"
        style={{
          background: '#fff',
          boxShadow: '0 8px 32px rgba(60, 60, 120, 0.18)',
          border: '1.5px solid #e0e7ef',
          color: '#222',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#1e293b' }}>
            Upload Your Resume
          </h2>
          <p className="text-center mb-6" style={{ color: '#475569', fontSize: '1.08rem' }}>
            Get started by uploading your resume to begin the interview process
          </p>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-xl
            transition-all duration-300 ease-in-out
            p-12 mb-6
          `}
          style={{
            background: isDragging ? '#e0f2fe' : '#f8fafc',
            borderColor: isDragging ? '#38bdf8' : '#cbd5e1',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="hidden"
          />

          {/* Icon */}
          <div className={`
            mx-auto mb-4 w-20 h-20 rounded-full
            flex items-center justify-center
            transition-all duration-300 transform
            ${isDragging 
              ? 'bg-blue-500 scale-110' 
              : 'bg-blue-100 group-hover:scale-105'
            }
          `}>
            {fileName ? (
              <FileText className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-blue-500'}`} />
            ) : (
              <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-blue-500'}`} />
            )}
          </div>

          {/* Upload text */}
          <div className="text-center">
            {fileName ? (
              <>
                <p className="text-sm text-gray-500 mb-1">Selected file:</p>
                <p className="text-lg font-medium text-gray-800">{fileName}</p>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold mb-2" style={{ color: '#334155' }}>
                  Drop your resume here
                </p>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  or click to browse
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action button or chat UI */}
        {fileName && !chatMode && (
          <div className="flex justify-center">
            <button
              className="
              px-8 py-3 bg-blue-500 text-white rounded-lg
              font-semibold shadow-lg transform transition-all duration-200
              hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]
            "
              onClick={handleStartInterview}
              disabled={loading}
            >
              {loading ? 'Extracting...' : 'Start Interview'}
            </button>
          </div>
        )}
        {chatMode && (
          <div className="w-full max-w-lg mx-auto mt-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow">
              <div className="mb-4 text-lg font-semibold text-blue-700 text-center">Pre-Interview Chat</div>
              <div className="space-y-3 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`px-4 py-2 rounded-lg ${msg.role === 'bot' ? 'bg-blue-100 text-blue-900' : 'bg-blue-500 text-white'}`}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSend} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`Enter your ${missingFields[0]}...`}
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition"
                >Send</button>
              </form>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 text-center text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Footer text */}
        <p className="mt-6 text-sm text-center" style={{ color: '#64748b' }}>
          Supported formats: PDF, DOCX
        </p>
      </div>
    </div>
  );
};

export default ResumeUpload;