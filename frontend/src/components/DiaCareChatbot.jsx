import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Upload, FileText, CheckCircle2, AlertTriangle,
  Sparkles, RefreshCw, X, HelpCircle, Utensils, Heart, Activity,
  ChevronRight, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Stethoscope, AlertCircle,
  MessageCircle, Minimize2
} from 'lucide-react';
import { diacareService } from '../services/api';
import { formatErrorMessage } from '../utils/formatError';

const DiaCareChatbot = ({ fullPage = false }) => {
  const [isOpen, setIsOpen] = useState(fullPage);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hello! I am **DiaCare AI**, your Intelligent Diabetes Health Assistant.\n\nYou can ask me anything about diabetes nutrition (especially **Indian foods & balanced meals**), medications, symptoms, or **upload your lab report** (PDF or image) for a structured breakdown.\n\n*Note: I provide educational guidance and do not replace your doctor's clinical diagnosis.*",
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

  // Global listener so any button on the page can open DiaCare
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-diacare', handleOpen);
    window.addEventListener('close-diacare', handleClose);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !fullPage) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-diacare', handleOpen);
      window.removeEventListener('close-diacare', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullPage]);

  const quickPrompts = [
    { label: '🥗 Indian Food Guide', query: 'What are the best Indian foods, dals, and vegetables for managing diabetes?' },
    { label: '🍚 Can I Eat Rice?', query: 'Can people with high blood sugar eat rice, and what are healthier alternatives?' },
    { label: '🩸 Explain HbA1c vs Glucose', query: 'What is the exact difference between an HbA1c test and a fasting blood glucose test?' },
    { label: '🏃 Exercise & GLUT4', query: 'How does daily walking and resistance exercise lower blood sugar without insulin?' },
    { label: '💊 What is Metformin?', query: 'What is Metformin, how does it work in the body, and what questions should I ask my doctor?' },
    { label: '🇮🇳 हिंदी में बताएं', query: 'मधुमेह में मुझे क्या खाना चाहिए और किन चीजों से परहेज करना चाहिए?' }
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
        text: `⚠️ **Connection Notice:** ${formatErrorMessage(err)}`,
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
  // 1. FLOATING ACTION BUTTON (Visible when closed & !fullPage)
  // ─────────────────────────────────────────────────────────────
  if (!isOpen && !fullPage) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center space-x-2.5 px-4 py-3.5 rounded-2xl text-white font-bold text-xs shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 50%, #7c3aed 100%)',
            boxShadow: '0 12px 35px rgba(79, 70, 229, 0.45), inset 1px 1px 2px rgba(255,255,255,0.4)',
          }}
          aria-label="Open DiaCare AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white drop-shadow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <span className="font-extrabold tracking-tight">Ask DiaCare AI</span>
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CHATBOT WINDOW (Floating popup or Full Page)
  // ─────────────────────────────────────────────────────────────
  const containerClasses = fullPage
    ? "bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col h-[750px]"
    : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[460px] md:w-[480px] h-[620px] max-h-[86vh] rounded-3xl shadow-2xl bg-white border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in-up";

  return (
    <div
      className={containerClasses}
      style={!fullPage ? {
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4), 0 0 1px 1px rgba(0,0,0,0.06)'
      } : {}}
    >
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3.5 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-xl shadow-md flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold tracking-tight">DiaCare AI Assistant</h3>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                Live Gemini 3.5
              </span>
            </div>
            <p className="text-[10px] text-slate-300">Indian diet • Lab reports • Education</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={reportLoading}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[11px] font-semibold text-white transition flex items-center space-x-1 backdrop-blur-sm"
            title="Upload Lab Report (PDF/Image)"
          >
            <Upload className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">{reportLoading ? 'Analyzing...' : 'Report'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-white/5 hover:bg-white/15 rounded-xl text-slate-300 hover:text-white transition"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {!fullPage && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 bg-white/10 hover:bg-rose-500/80 rounded-xl text-slate-300 hover:text-white transition ml-1"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Extracted Report Accordion (if report loaded) */}
      {reportAnalysis && (
        <div className="bg-slate-50 border-b border-slate-200 text-xs flex-shrink-0">
          <div
            onClick={() => setShowReportDetails(!showReportDetails)}
            className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
          >
            <div className="flex items-center space-x-2 text-indigo-900 font-bold">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Report Findings ({reportAnalysis.extracted_parameters?.length || 0} biomarkers)</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
              <span>{showReportDetails ? 'Hide' : 'View'}</span>
              {showReportDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </div>

          {showReportDetails && (
            <div className="p-3 max-h-48 overflow-y-auto space-y-2 border-t border-slate-200/60 bg-white">
              {reportAnalysis.extracted_parameters?.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-[11px] ${
                    p.is_abnormal ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>{p.parameter_name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] ${p.is_abnormal ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {p.clinical_status || (p.is_abnormal ? 'Elevated' : 'Normal')}
                    </span>
                  </div>
                  <div className="mt-0.5 text-slate-600">
                    <strong className="text-slate-900">{p.extracted_value}</strong> {p.unit}
                    {p.reference_range && <span className="text-slate-400 ml-1.5">(Ref: {p.reference_range})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm text-xs ${
                m.sender === 'user'
                  ? 'bg-blue-600'
                  : m.is_emergency
                    ? 'bg-rose-600'
                    : 'bg-gradient-to-br from-indigo-600 to-sky-500'
              }`}
            >
              {m.sender === 'user' ? '👤' : m.is_emergency ? '🚨' : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : m.is_emergency
                    ? 'bg-rose-50 border border-rose-300 text-rose-950 font-medium'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-sm'
              }`}
            >
              <p>{m.text}</p>
              
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span className="font-bold text-slate-600">Sources: </span>
                  {m.citations.map((c, i) => (
                    <span key={i} className="inline-block bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 mr-1 mt-1">
                      📚 {c.organization}
                    </span>
                  ))}
                </div>
              )}

              <span className={`block mt-1 text-[9px] ${m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
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
            <span className="text-[11px] font-medium text-slate-500 ml-1">DiaCare AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar (horizontal scroll) */}
      <div className="px-3 pt-2 pb-1.5 bg-white border-t border-slate-100 flex-shrink-0">
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition whitespace-nowrap flex-shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask DiaCare about diet, blood sugar, reports..."
            disabled={loading}
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-40 flex items-center space-x-1"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiaCareChatbot;
