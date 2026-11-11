import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Upload, FileText, CheckCircle2, AlertTriangle,
  Sparkles, RefreshCw, X, HelpCircle, Utensils, Heart, Activity,
  ChevronRight, ArrowRight, ShieldCheck, Stethoscope, AlertCircle
} from 'lucide-react';
import { diacareService } from '../services/api';
import { formatErrorMessage } from '../utils/formatError';

const DiaCareChatbot = () => {
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
    scrollToBottom();
  }, [messages, loading]);

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
      // Build context from report if available
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

      // Add a notification message to the chat
      const botMsg = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `📄 **Report Analyzed Successfully!**\n\nI reviewed **${file.name}**. I extracted **${res.analysis.extracted_parameters?.length || 0} biomarkers**.\n\n**Summary:** ${res.analysis.overall_summary}\n\nYou can ask me specific questions about your results below!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setReportError(formatErrorMessage(err));
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold tracking-tight">DiaCare AI Health Assistant</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                Live Gemini 3.5
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ask about Indian diets, blood test values, symptoms, or upload your laboratory report
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
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
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition flex items-center space-x-1.5 backdrop-blur-sm"
          >
            <Upload className="w-3.5 h-3.5 text-sky-300" />
            <span>{reportLoading ? 'Analyzing...' : 'Upload Medical Report'}</span>
          </button>

          <button
            onClick={() => setMessages([{
              id: Date.now().toString(),
              sender: 'assistant',
              text: "Conversation cleared. How can I help you with your diabetes health today?",
              time: 'Just now'
            }])}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Report Extraction Panel (when report loaded) + Right Chat Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        
        {/* Left Section: Active Report Analysis Card (4 cols if report exists, otherwise hidden or quick tips) */}
        {reportAnalysis && (
          <div className="lg:col-span-4 p-5 bg-slate-50 border-r border-slate-200/80 overflow-y-auto max-h-[600px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary-600" />
                <span>Extracted Lab Findings</span>
              </div>
              <button
                onClick={() => { setReportAnalysis(null); setReportFile(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Close report context"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Extracted Parameters List */}
            <div className="space-y-2.5">
              {reportAnalysis.extracted_parameters?.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition ${
                    p.is_abnormal
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold">{p.parameter_name}</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      p.is_abnormal ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.clinical_status || (p.is_abnormal ? 'Elevated' : 'Normal')}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-lg font-black text-slate-900">{p.extracted_value}</span>
                    <span className="text-slate-500 font-semibold">{p.unit}</span>
                    {p.reference_range && (
                      <span className="text-[10px] text-slate-400">Ref: {p.reference_range}</span>
                    )}
                  </div>
                  {p.layperson_explanation && (
                    <p className="mt-1 text-[11px] text-slate-600 leading-tight">
                      {p.layperson_explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Suggested Doctor Questions */}
            {reportAnalysis.suggested_doctor_questions?.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950">
                <span className="font-bold flex items-center space-x-1.5 text-amber-900 mb-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Questions for Your Doctor:</span>
                </span>
                <ul className="space-y-1.5 text-[11px] text-amber-800">
                  {reportAnalysis.suggested_doctor_questions.map((q, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-1.5 font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Right Section: Chat Interface */}
        <div className={`${reportAnalysis ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col justify-between p-6 bg-white`}>
          
          {/* Message List */}
          <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2 pb-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-blue-600'
                      : m.is_emergency
                        ? 'bg-rose-600'
                        : 'bg-gradient-to-br from-indigo-600 to-sky-500'
                  }`}
                >
                  {m.sender === 'user' ? '👤' : m.is_emergency ? '🚨' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : m.is_emergency
                        ? 'bg-rose-50 border border-rose-300 text-rose-950 font-medium'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p>{m.text}</p>
                  
                  {/* Citations if available */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                      <span className="font-bold text-slate-600">Authoritative Sources: </span>
                      {m.citations.map((c, i) => (
                        <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border border-slate-200 mr-1 mt-1">
                          📚 {c.organization} ({c.title})
                        </span>
                      ))}
                    </div>
                  )}

                  <span className={`block mt-1.5 text-[9px] ${m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 pl-11">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-slate-500 ml-1">DiaCare AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              💡 Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about diabetes diet, blood sugar numbers, medications..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-40 flex items-center space-x-1"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaCareChatbot;
