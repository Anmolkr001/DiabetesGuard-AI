import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Upload, FileText, CheckCircle2, AlertTriangle,
  Sparkles, RefreshCw, X, ChevronDown, ChevronUp, Stethoscope,
  MessageCircle, Minimize2, Paperclip
} from 'lucide-react';
import { diacareService } from '../services/api';
import { formatErrorMessage } from '../utils/formatError';

/* ─── Custom High-Tech 3D Medo AI Avatar ─── */
export const DiaCareAvatar = ({ size = 36, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_14px_rgba(56,189,248,0.5)]"
      >
        <defs>
          <linearGradient id="dcHelmet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <linearGradient id="dcVisor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1120" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          <linearGradient id="dcOrbit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
          </linearGradient>

          <filter id="dcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbiting Holographic Ring */}
        <g className="animate-orbit-spin" style={{ transformOrigin: '50px 50px' }}>
          <ellipse
            cx="50"
            cy="50"
            rx="46"
            ry="18"
            stroke="url(#dcOrbit)"
            strokeWidth="3.5"
            strokeDasharray="8 5"
            transform="rotate(-25 50 50)"
          />
          <circle cx="94" cy="50" r="4" fill="#38bdf8" filter="url(#dcGlow)" />
        </g>

        {/* Robot Head (Glossy 3D Helmet) */}
        <rect
          x="18"
          y="18"
          width="64"
          height="60"
          rx="24"
          fill="url(#dcHelmet)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
        />

        {/* Glossy Top Light Curve */}
        <path
          d="M 28 22 Q 50 18 72 22 Q 50 26 28 22"
          fill="rgba(255, 255, 255, 0.75)"
        />

        {/* Cyber Ear Nodes */}
        <rect x="11" y="38" width="8" height="20" rx="4" fill="#4f46e5" stroke="#38bdf8" strokeWidth="1" />
        <rect x="81" y="38" width="8" height="20" rx="4" fill="#4f46e5" stroke="#38bdf8" strokeWidth="1" />

        {/* Dark Visor Screen */}
        <rect
          x="24"
          y="28"
          width="52"
          height="38"
          rx="14"
          fill="url(#dcVisor)"
          stroke="rgba(56, 189, 248, 0.5)"
          strokeWidth="1.5"
        />

        {/* Visor Glass Arc */}
        <path
          d="M 28 32 Q 50 36 72 32 Q 50 30 28 32"
          fill="rgba(255, 255, 255, 0.28)"
        />

        {/* Expressive Glowing Cyan LED Eyes */}
        <g className="animate-robot-blink">
          <rect x="33" y="42" width="10" height="11" rx="5" fill="#38bdf8" filter="url(#dcGlow)" />
          <rect x="57" y="42" width="10" height="11" rx="5" fill="#38bdf8" filter="url(#dcGlow)" />
        </g>

        {/* Medical Intelligence Forehead Sensor */}
        <path
          d="M 50 21 L 50 26 M 47.5 23.5 L 52.5 23.5"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#dcGlow)"
        />
      </svg>
    </div>
  );
};


/* ─── Main Medo AI Chatbot Component ─── */
const DiaCareChatbot = ({ fullPage = false }) => {
  const [isOpen, setIsOpen] = useState(fullPage);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hello! I am **Medo**, your Intelligent Diabetes Health Assistant.\n\nYou can ask me anything about diabetes nutrition (especially **Indian foods & balanced meals**), medications, symptoms, or **upload your lab report** (PDF or image) for a structured breakdown.\n\n*Note: I provide educational guidance and do not replace your doctor's clinical diagnosis.*",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportAnalysis, setReportAnalysis] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Global event listener to toggle open from any button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-diacare', handleOpen);
    window.addEventListener('close-diacare', handleClose);
    window.addEventListener('open-medo', handleOpen);
    window.addEventListener('close-medo', handleClose);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !fullPage) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-diacare', handleOpen);
      window.removeEventListener('close-diacare', handleClose);
      window.removeEventListener('open-medo', handleOpen);
      window.removeEventListener('close-medo', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullPage]);

  const quickPrompts = [
    { label: '🥗 Indian Food Guide', query: 'What are the best Indian foods, dals, and vegetables for managing diabetes?' },
    { label: '🍚 Can I Eat Rice?', query: 'Can people with high blood sugar eat rice, and what are healthier alternatives?' },
    { label: '🩸 HbA1c vs Glucose', query: 'What is the exact difference between an HbA1c test and a fasting blood glucose test?' },
    { label: '🏃 Exercise & GLUT4', query: 'How does daily walking and resistance exercise lower blood sugar without insulin?' },
    { label: '💊 Metformin Info', query: 'What is Metformin, how does it work in the body, and what questions should I ask my doctor?' },
    { label: '🇮🇳 हिंदी में समझाएं', query: 'मधुमेह में मुझे क्या खाना चाहिए और किन चीजों से परहेज करना चाहिए?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let reportContext = null;
      if (reportAnalysis) {
        reportContext = `Uploaded Report Findings: ${reportAnalysis.overall_summary}. Extracted Values: ` +
          reportAnalysis.extracted_parameters.map(p => `${p.parameter_name}: ${p.extracted_value} ${p.unit} (${p.clinical_status || 'analyzed'})`).join(', ');
      }

      const res = await diacareService.chat({
        message: textToSend,
        report_context: reportContext,
        language: selectedLanguage,
        history: messages.slice(-6).map(m => ({ sender: m.sender, message: m.text }))
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.reply,
        is_emergency: res.is_emergency,
        citations: res.citations || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ **Notice:** ${formatErrorMessage(err)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportFile(file);
    setReportLoading(true);
    setReportError(null);

    try {
      const res = await diacareService.analyzeReport(file);
      setReportAnalysis(res.analysis);
      setShowReportDetails(true);

      const botMsg = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `📄 **Report Analyzed Successfully!**\n\nI reviewed **${file.name}** and extracted **${res.analysis.extracted_parameters?.length || 0} biomarkers**.\n\n**Summary:** ${res.analysis.overall_summary}\n\nYou can ask me specific questions about your results below!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setReportError(formatErrorMessage(err));
    } finally {
      setReportLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      id: Date.now().toString(),
      sender: 'assistant',
      text: "Conversation cleared. How can I help you with your diabetes health today?",
      time: 'Just now'
    }]);
    setReportAnalysis(null);
    setReportFile(null);
    setShowReportDetails(false);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. STYLISH GLASSY FLOATING ACTION BUTTON (COMPACT 3D AI ORB)
  // ─────────────────────────────────────────────────────────────
  if (!isOpen && !fullPage) {
    return (
      <aside aria-label="Medo AI Assistant trigger" className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center group">
        {/* Slide-out Glassy Tooltip on Hover */}
        <div className="hidden sm:flex items-center space-x-2 mr-3 px-3.5 py-1.5 rounded-full glass-btn text-white text-xs font-bold shadow-xl opacity-0 translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
          <span>Ask Medo AI</span>
        </div>

        {/* Floating 3D AI Orb Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] sm:rounded-[26px] flex items-center justify-center glass-btn-primary animate-neon-pulse shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group-hover:shadow-[0_0_35px_rgba(56,189,248,0.7)]"
          aria-label="Open Medo AI Health Assistant"
        >
          {/* Radial radar beacon wave */}
          <span className="absolute inset-0 rounded-[24px] sm:rounded-[26px] bg-sky-400 opacity-20 animate-ping pointer-events-none" />

          {/* 3D Animated Medo Avatar */}
          <DiaCareAvatar size={38} className="relative z-10 transition-transform duration-300 group-hover:scale-105" />

          {/* Live Status indicator dot badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 shadow-[0_0_10px_#34d399]" />
          </span>

          {/* Futuristic bottom mini-tag */}
          <span className="absolute -bottom-1 px-1.5 py-0.2 rounded-full bg-slate-900/90 border border-sky-400/50 text-[8px] font-black text-sky-300 tracking-wider uppercase z-20 shadow-md">
            AI
          </span>
        </button>
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SCULPTED FUTURISTIC CAPSULE CHATBOT POD
  // ─────────────────────────────────────────────────────────────
  const containerClasses = fullPage
    ? "bg-white/95 backdrop-blur-2xl rounded-[38px] border border-white/40 shadow-2xl overflow-hidden flex flex-col h-[750px]"
    : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[450px] md:w-[470px] h-[630px] max-h-[86vh] rounded-[38px] rounded-br-[18px] shadow-2xl bg-white/95 backdrop-blur-2xl border border-white/50 flex flex-col overflow-hidden animate-fade-in-up transition-all duration-300";

  return (
    <div
      className={containerClasses}
      style={{
        boxShadow: '0 30px 90px -15px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.4), 0 0 45px -5px rgba(99, 102, 241, 0.35)'
      }}
    >
      {/* ─── Sculpted Futuristic Header Dome ─── */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-5 py-4 text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden border-b border-white/10 rounded-t-[38px]">
        {/* Subtle ambient light splash in header */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-3 relative z-10">
          {/* 3D Animated Avatar in Glassy Orb */}
          <div className="relative">
            <DiaCareAvatar size={42} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-indigo-200 bg-clip-text text-transparent">
                Medo AI
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold uppercase tracking-wider flex items-center shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                Live Gemini 3.5
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">Indian Diet • Reports • Education</p>
          </div>
        </div>

        {/* Action Controls with Glassy Buttons */}
        <div className="flex items-center space-x-2 relative z-10">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />

          {/* Glassy Upload Report Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={reportLoading}
            className="glass-btn px-3 py-1.5 rounded-full text-[11px] font-bold text-white flex items-center space-x-1.5 cursor-pointer"
            title="Upload Laboratory Report (PDF/Images)"
          >
            <Paperclip className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">{reportLoading ? 'Analyzing...' : 'Report'}</span>
          </button>

          {/* Glassy Reset Button */}
          <button
            onClick={handleReset}
            className="glass-btn w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            title="Clear Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Glassy Close (X) Button */}
          {!fullPage && (
            <button
              onClick={() => setIsOpen(false)}
              className="glass-btn w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-300 hover:border-rose-400/50 cursor-pointer"
              title="Close Medo AI"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Extracted Report Accordion (if report loaded) ─── */}
      {reportAnalysis && (
        <div className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 text-xs flex-shrink-0">
          <div
            onClick={() => setShowReportDetails(!showReportDetails)}
            className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-indigo-50/50 transition"
          >
            <div className="flex items-center space-x-2 text-indigo-950 font-bold">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Extracted Findings ({reportAnalysis.extracted_parameters?.length || 0} biomarkers)</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 text-[11px] font-semibold">
              <span>{showReportDetails ? 'Hide' : 'Inspect'}</span>
              {showReportDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </div>

          {showReportDetails && (
            <div className="p-3 max-h-48 overflow-y-auto space-y-2 border-t border-slate-200/60 bg-white/80">
              {reportAnalysis.extracted_parameters?.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border text-[11px] transition ${
                    p.is_abnormal ? 'bg-rose-50/90 border-rose-200 text-rose-950' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>{p.parameter_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${p.is_abnormal ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {p.clinical_status || (p.is_abnormal ? 'Elevated' : 'Normal')}
                    </span>
                  </div>
                  <div className="mt-1 text-slate-600">
                    <strong className="text-slate-900 text-sm">{p.extracted_value}</strong> {p.unit}
                    {p.reference_range && <span className="text-slate-400 ml-2">(Ref: {p.reference_range})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Messages Feed ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/60 via-white/80 to-slate-50/60">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            {m.sender === 'user' ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md text-xs font-bold flex-shrink-0">
                👤
              </div>
            ) : m.is_emergency ? (
              <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md text-xs font-bold flex-shrink-0">
                🚨
              </div>
            ) : (
              <DiaCareAvatar size={28} className="flex-shrink-0" />
            )}

            <div
              className={`max-w-[84%] rounded-3xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
                  : m.is_emergency
                    ? 'bg-rose-50 border border-rose-300 text-rose-950 font-medium'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-sm'
              }`}
            >
              <p>{m.text}</p>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span className="font-bold text-slate-600">Clinical Sources: </span>
                  {m.citations.map((c, i) => (
                    <span key={i} className="inline-block bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 mr-1 mt-1 font-medium">
                      📚 {c.organization}
                    </span>
                  ))}
                </div>
              )}

              <span className={`block mt-1.5 text-[9px] font-semibold ${m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 pl-9">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] font-medium text-slate-500 ml-1">Medo AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Glassy Quick Prompts Bar (horizontal scrollable pills) ─── */}
      <div className="px-4 pt-2.5 pb-2 bg-white/90 border-t border-slate-100 flex-shrink-0">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="glass-chip px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-700 hover:text-indigo-600 transition whitespace-nowrap flex-shrink-0 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Sculpted Floating Glassy Input Dock ─── */}
      <div className="p-3.5 bg-white/95 border-t border-slate-100/80 flex-shrink-0 rounded-b-[38px] rounded-br-[18px]">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center space-x-2 bg-slate-100/90 rounded-full p-1.5 border border-slate-200/90 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-400/30 transition shadow-inner"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Medo about diet, blood sugar, reports..."
            disabled={loading}
            className="flex-1 px-4 py-1.5 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="glass-btn-primary w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer disabled:opacity-40 transition"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export const MedoAvatar = DiaCareAvatar;
export default DiaCareChatbot;
