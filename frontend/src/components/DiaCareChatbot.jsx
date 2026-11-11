import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Upload, FileText, CheckCircle2, AlertTriangle,
  Sparkles, RefreshCw, X, ChevronDown, ChevronUp, Stethoscope,
  MessageCircle, Minimize2, Paperclip, Move, GripVertical
} from 'lucide-react';
import medoDoctorImg from '../assets/medo-doctor.jpg';
import { diacareService } from '../services/api';
import { formatErrorMessage } from '../utils/formatError';

/**
 * ═══════════════════════════════════════════════════════════════════
 * Custom 3D Friendly Dr. Medo AI Avatar (Pixar-Style Character)
 * ═══════════════════════════════════════════════════════════════════
 */
export const DiaCareAvatar = ({ size = 38, className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden border-2 border-white/90 bg-gradient-to-tr from-sky-400 via-indigo-500 to-sky-200 shadow-md transition-transform duration-300 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: '0 4px 14px rgba(56, 189, 248, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.6)'
      }}
    >
      <img
        src={medoDoctorImg}
        alt="Dr. Medo AI"
        className="w-full h-full object-cover object-top select-none pointer-events-none"
        onError={(e) => {
          e.target.src = '/medo-doctor.jpg';
        }}
      />
    </div>
  );
};

export const MedoAvatar = DiaCareAvatar;

/**
 * ═══════════════════════════════════════════════════════════════════
 * Main Moveable Dr. Medo AI Chatbot & Clinical Assistant Pod
 * ═══════════════════════════════════════════════════════════════════
 */
const DiaCareChatbot = ({ fullPage = false }) => {
  const [isOpen, setIsOpen] = useState(fullPage);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hello! I am **Dr. Medo**, your Intelligent Healthcare & Diabetes Assistant.\n\nI can help you with:\n• **Clinical Diagnoses & Evaluation:** Reviewing your fasting glucose, HbA1c, or lab biomarkers.\n• **Personalized Medical Advice:** Target setting, complication screening, and hypoglycemia protocols.\n• **Structured Treatment Plans:** Medical Nutrition Therapy (Indian plate method), GLUT4 exercise, and medication overviews.\n• **Lab Report Analysis:** Upload your laboratory PDF or image for an instant structured breakdown!\n\n*Note: I provide evidence-based educational guidance aligned with ADA 2024 & ICMR guidelines to support you and your doctor.*",
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

  // Moveable / Draggable Positions (Can be placed anywhere on the dashboard)
  const [floatingPos, setFloatingPos] = useState(null);
  const [podPos, setPodPos] = useState(null);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const podDraggingRef = useRef(false);
  const podDragStartRef = useRef({ x: 0, y: 0 });
  const podInitialPosRef = useRef({ x: 0, y: 0 });

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

  // Handle window resize to clamp positions
  useEffect(() => {
    const handleResize = () => {
      if (floatingPos) {
        setFloatingPos((prev) => {
          if (!prev) return prev;
          return {
            x: Math.min(prev.x, window.innerWidth - 80),
            y: Math.min(prev.y, window.innerHeight - 80),
          };
        });
      }
      if (podPos) {
        setPodPos((prev) => {
          if (!prev) return prev;
          return {
            x: Math.min(prev.x, window.innerWidth - 480),
            y: Math.min(prev.y, window.innerHeight - 640),
          };
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [floatingPos, podPos]);

  // ─────────────────────────────────────────────────────────────
  // DRAG LOGIC FOR FLOATING LAUNCHER BUTTON
  // ─────────────────────────────────────────────────────────────
  const handleLauncherPointerDown = (e) => {
    if (e.button && e.button !== 0) return; // Only primary click

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;

    dragStartRef.current = { x: clientX, y: clientY };

    let curX = floatingPos ? floatingPos.x : (window.innerWidth - 90);
    let curY = floatingPos ? floatingPos.y : (window.innerHeight - 100);
    initialPosRef.current = { x: curX, y: curY };

    const handlePointerMove = (moveEvt) => {
      if (!isDraggingRef.current) return;
      const curX = moveEvt.clientX ?? (moveEvt.touches && moveEvt.touches[0].clientX) ?? 0;
      const curY = moveEvt.clientY ?? (moveEvt.touches && moveEvt.touches[0].clientY) ?? 0;

      const deltaX = curX - dragStartRef.current.x;
      const deltaY = curY - dragStartRef.current.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.min(Math.max(12, initialPosRef.current.x + deltaX), window.innerWidth - 76);
      const newY = Math.min(Math.max(12, initialPosRef.current.y + deltaY), window.innerHeight - 76);

      setFloatingPos({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      // If user tapped/clicked without dragging, open chatbot!
      if (!hasMovedRef.current) {
        setIsOpen(true);
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  // ─────────────────────────────────────────────────────────────
  // DRAG LOGIC FOR OPEN CHAT POD HEADER
  // ─────────────────────────────────────────────────────────────
  const handlePodHeaderPointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    if (e.button && e.button !== 0) return;
    if (fullPage) return;

    podDraggingRef.current = true;
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;

    podDragStartRef.current = { x: clientX, y: clientY };

    const chatWidth = Math.min(470, window.innerWidth - 24);
    const chatHeight = Math.min(650, window.innerHeight - 24);

    let curX = podPos ? podPos.x : (window.innerWidth - chatWidth - 24);
    let curY = podPos ? podPos.y : (window.innerHeight - chatHeight - 24);
    podInitialPosRef.current = { x: Math.max(12, curX), y: Math.max(12, curY) };

    const handleHeaderMove = (moveEvt) => {
      if (!podDraggingRef.current) return;
      const curX = moveEvt.clientX ?? (moveEvt.touches && moveEvt.touches[0].clientX) ?? 0;
      const curY = moveEvt.clientY ?? (moveEvt.touches && moveEvt.touches[0].clientY) ?? 0;

      const deltaX = curX - podDragStartRef.current.x;
      const deltaY = curY - podDragStartRef.current.y;

      const newX = Math.min(Math.max(10, podInitialPosRef.current.x + deltaX), window.innerWidth - chatWidth - 10);
      const newY = Math.min(Math.max(10, podInitialPosRef.current.y + deltaY), window.innerHeight - chatHeight - 10);

      setPodPos({ x: newX, y: newY });
    };

    const handleHeaderUp = () => {
      podDraggingRef.current = false;
      window.removeEventListener('mousemove', handleHeaderMove);
      window.removeEventListener('mouseup', handleHeaderUp);
      window.removeEventListener('touchmove', handleHeaderMove);
      window.removeEventListener('touchend', handleHeaderUp);
    };

    window.addEventListener('mousemove', handleHeaderMove);
    window.addEventListener('mouseup', handleHeaderUp);
    window.addEventListener('touchmove', handleHeaderMove, { passive: false });
    window.addEventListener('touchend', handleHeaderUp);
  };

  const quickPrompts = [
    { label: '🩺 Clinical Diagnoses', query: 'What are the exact diagnostic criteria and thresholds for Pre-Diabetes and Type 2 Diabetes according to ADA 2024?' },
    { label: '💡 Medical Advice Targets', query: 'What personalized glycemic targets, complication screenings, and lifestyle advice should I follow?' },
    { label: '📋 Comprehensive Treatment Plan', query: 'Can you provide a structured diabetes treatment plan covering medical nutrition therapy, GLUT4 exercise, and medication overviews?' },
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
        text: `📄 **Report Analyzed Successfully by Dr. Medo!**\n\nI reviewed **${file.name}** and extracted **${res.analysis.extracted_parameters?.length || 0} biomarkers**.\n\n**Summary:** ${res.analysis.overall_summary}\n\nYou can ask me specific questions about your clinical diagnosis, medical advice, or treatment plan below!`,
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
      text: "Conversation cleared. How can Dr. Medo help you with your clinical diagnosis, medical advice, or treatment plan today?",
      time: 'Just now'
    }]);
    setReportAnalysis(null);
    setReportFile(null);
    setShowReportDetails(false);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. MOVEABLE DR. MEDO FLOATING LAUNCHER (3D DOCTOR AVATAR)
  // ─────────────────────────────────────────────────────────────
  if (!isOpen && !fullPage) {
    const launcherStyle = floatingPos
      ? { left: `${floatingPos.x}px`, top: `${floatingPos.y}px`, position: 'fixed' }
      : { right: '1.5rem', bottom: '1.5rem', position: 'fixed' };

    return (
      <aside
        aria-label="Dr. Medo AI Assistant trigger"
        style={launcherStyle}
        className="z-50 select-none group touch-none"
      >
        {/* Slide-out Tooltip on Hover */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-btn text-white text-xs font-bold shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
          <span>Click to Chat • Drag to Move</span>
        </div>

        {/* 3D Dr. Medo Character Capsule Orb */}
        <div
          onMouseDown={handleLauncherPointerDown}
          onTouchStart={handleLauncherPointerDown}
          className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-500 shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing group-hover:shadow-[0_0_35px_rgba(56,189,248,0.7)]"
          title="Dr. Medo AI • Click to open, drag anywhere on dashboard"
        >
          {/* Radar beacon wave */}
          <span className="absolute inset-0 rounded-full bg-sky-400 opacity-20 animate-ping pointer-events-none" />

          {/* Dr. Medo Image Avatar */}
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/95 shadow-inner bg-slate-900">
            <img
              src={medoDoctorImg}
              alt="Dr. Medo AI"
              className="w-full h-full object-cover object-top select-none pointer-events-none"
              onError={(e) => {
                e.target.src = '/medo-doctor.jpg';
              }}
            />
          </div>

          {/* Live Heartbeat Indicator Dot */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 shadow-[0_0_10px_#34d399]" />
          </span>

          {/* Bottom Medo Tag Badge */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 border border-sky-400/60 text-[8px] font-black text-sky-300 tracking-wider uppercase z-20 shadow-md whitespace-nowrap">
            DR. MEDO
          </span>
        </div>
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SCULPTED MOVEABLE CAPSULE CHATBOT POD
  // ─────────────────────────────────────────────────────────────
  const podStyle = (!fullPage && podPos)
    ? { left: `${podPos.x}px`, top: `${podPos.y}px`, position: 'fixed' }
    : (!fullPage)
      ? { right: '1.5rem', bottom: '1.5rem', position: 'fixed' }
      : {};

  const containerClasses = fullPage
    ? "bg-white/95 backdrop-blur-2xl rounded-[38px] border border-white/40 shadow-2xl overflow-hidden flex flex-col h-[750px]"
    : "z-50 w-[95vw] sm:w-[460px] md:w-[480px] h-[640px] max-h-[88vh] rounded-[38px] rounded-br-[18px] shadow-2xl bg-white/95 backdrop-blur-2xl border border-white/50 flex flex-col overflow-hidden animate-fade-in-up transition-shadow duration-300";

  return (
    <div
      style={{
        ...podStyle,
        boxShadow: '0 30px 90px -15px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.4), 0 0 45px -5px rgba(99, 102, 241, 0.35)'
      }}
      className={containerClasses}
    >
      {/* ─── Sculpted Moveable Header Dome (Drag to reposition anywhere) ─── */}
      <div
        onMouseDown={handlePodHeaderPointerDown}
        onTouchStart={handlePodHeaderPointerDown}
        className={`bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-5 py-4 text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden border-b border-white/10 rounded-t-[38px] ${
          fullPage ? '' : 'cursor-grab active:cursor-grabbing select-none'
        }`}
        title={fullPage ? undefined : "Drag header to move chat pod anywhere on screen"}
      >
        {/* Subtle ambient light splash in header */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-3 relative z-10 pointer-events-none">
          {/* 3D Dr. Medo Avatar */}
          <div className="relative">
            <DiaCareAvatar size={42} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-indigo-200 bg-clip-text text-transparent">
                Dr. Medo AI
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold uppercase tracking-wider flex items-center shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                Live Gemini 3.5
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">Diagnoses • Medical Advice • Treatment Plans</p>
          </div>
        </div>

        {/* Action Controls with Glassy Buttons (Pointer events enabled) */}
        <div className="flex items-center space-x-2 relative z-10">
          {!fullPage && (
            <div className="hidden sm:flex items-center text-[10px] text-slate-400 font-semibold mr-1">
              <Move className="w-3 h-3 mr-1" />
              <span>Move</span>
            </div>
          )}

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
            <div className="p-4 space-y-3 max-h-56 overflow-y-auto border-t border-slate-200/60 bg-white/70">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reportAnalysis.extracted_parameters?.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-200/80 bg-white">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{p.parameter_name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${p.is_abnormal ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {p.clinical_status || (p.is_abnormal ? 'Abnormal' : 'Normal')}
                      </span>
                    </div>
                    <p className="font-mono text-sm font-bold text-indigo-700 mt-1">
                      {p.extracted_value} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{p.layperson_explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Chat Messages Stream ─── */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <DiaCareAvatar size={30} className="flex-shrink-0 mt-0.5" />
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                  : m.is_emergency
                    ? 'bg-rose-50 border border-rose-300 text-rose-950 font-medium'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

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
            <span className="text-[11px] font-medium text-slate-500 ml-1">Dr. Medo AI is reviewing...</span>
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
            placeholder="Ask Dr. Medo about diagnoses, advice, treatment plans..."
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

export default DiaCareChatbot;
