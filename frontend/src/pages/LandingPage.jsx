import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, HeartPulse, AlertCircle, ShieldCheck, CheckCircle2,
  ChevronRight, BarChart2, Brain, Activity, Zap, Lock, Sparkles, Bot
} from 'lucide-react';
import { DiaCareAvatar } from '../components/DiaCareChatbot';

/* ─── 3D Tilt Card ─── */
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const handleMouseMove = useCallback((e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
    setStyle({ transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(1.02)`, transition: 'transform 0.08s ease-out' });
  }, []);
  const handleMouseLeave = useCallback(() => {
    setStyle({ transform: 'perspective(800px) rotateX(0) rotateY(0) translateZ(0) scale(1)', transition: 'transform 0.5s ease-out' });
  }, []);
  return <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={style} className={className}>{children}</div>;
};

/* ─── 3D CSS Pill Capsule ─── */
const Capsule3D = ({ className = '', color1 = '#6366f1', color2 = '#3b82f6' }) => (
  <div className={`relative ${className}`} style={{ width: 60, height: 130 }}>
    <div className="absolute inset-0 rounded-full animate-float-slow" style={{
      background: `linear-gradient(180deg, ${color1} 0%, ${color1} 48%, ${color2} 52%, ${color2} 100%)`,
      boxShadow: `0 20px 60px ${color1}66, inset -8px -8px 20px rgba(0,0,0,0.3), inset 8px 8px 20px rgba(255,255,255,0.2)`,
      borderRadius: '9999px',
    }}>
      {/* Glossy highlight */}
      <div className="absolute top-3 left-3 w-5 h-12 rounded-full" style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)',
      }} />
    </div>
  </div>
);

/* ─── 3D CSS Sphere ─── */
const Sphere3D = ({ className = '', size = 80, color = '#6366f1' }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full" style={{
      background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4), ${color} 50%, rgba(0,0,0,0.3))`,
      boxShadow: `0 15px 50px ${color}55, inset 0 -5px 15px rgba(0,0,0,0.3)`,
    }} />
  </div>
);

/* ─── 3D DNA Helix (CSS) ─── */
const DNAHelix = ({ className = '' }) => (
  <div className={`relative ${className}`} style={{ width: 50, height: 160 }}>
    {[0, 1, 2, 3, 4, 5].map(i => (
      <div key={i} className="absolute flex items-center justify-between" style={{
        top: i * 28,
        width: '100%',
        transform: `rotateY(${i * 30}deg)`,
      }}>
        <div className="w-3.5 h-3.5 rounded-full" style={{
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), ${i % 2 === 0 ? '#818cf8' : '#38bdf8'})`,
          boxShadow: `0 4px 15px ${i % 2 === 0 ? '#818cf855' : '#38bdf855'}`,
        }} />
        <div className="flex-1 h-0.5 mx-0.5" style={{
          background: `linear-gradient(90deg, ${i % 2 === 0 ? '#818cf8' : '#38bdf8'}88, rgba(255,255,255,0.15), ${i % 2 === 0 ? '#38bdf8' : '#818cf8'}88)`,
        }} />
        <div className="w-3.5 h-3.5 rounded-full" style={{
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), ${i % 2 === 0 ? '#38bdf8' : '#818cf8'})`,
          boxShadow: `0 4px 15px ${i % 2 === 0 ? '#38bdf855' : '#818cf855'}`,
        }} />
      </div>
    ))}
  </div>
);

/* ─── 3D Shield ─── */
const Shield3D = ({ className = '' }) => (
  <div className={`relative ${className}`} style={{ width: 100, height: 120 }}>
    <svg viewBox="0 0 100 120" fill="none" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
        <linearGradient id="shieldShine" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M50 5 L95 25 L95 65 Q95 95 50 115 Q5 95 5 65 L5 25 Z" fill="url(#shieldGrad)" />
      <path d="M50 5 L95 25 L95 65 Q95 95 50 115 Q5 95 5 65 L5 25 Z" fill="url(#shieldShine)" />
      {/* Check mark */}
      <path d="M30 58 L45 73 L72 43" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </div>
);

/* ─── 3D Heart ─── */
const Heart3D = ({ className = '' }) => (
  <div className={`relative ${className}`} style={{ width: 70, height: 65 }}>
    <svg viewBox="0 0 70 65" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="heartGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="60%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </radialGradient>
      </defs>
      <path d="M35 60 C-5 35 -5 10 17.5 5 C30 0 35 15 35 15 C35 15 40 0 52.5 5 C75 10 75 35 35 60Z"
        fill="url(#heartGrad)" filter="drop-shadow(0 8px 25px rgba(225,29,72,0.5))" />
      <path d="M35 60 C-5 35 -5 10 17.5 5 C30 0 35 15 35 15 C35 15 40 0 52.5 5 C75 10 75 35 35 60Z"
        fill="url(#shieldShine)" opacity="0.3" />
    </svg>
  </div>
);

/* ─── Stethoscope Orb ─── */
const StethoOrb = ({ className = '' }) => (
  <div className={`relative ${className}`} style={{ width: 120, height: 120 }}>
    <div className="absolute inset-0 rounded-full" style={{
      background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), #6366f1 45%, #312e81)',
      boxShadow: '0 25px 80px rgba(99,102,241,0.5), inset 0 -8px 20px rgba(0,0,0,0.4), inset 5px 5px 15px rgba(255,255,255,0.15)',
    }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Stethoscope className="w-10 h-10 text-white/90 drop-shadow-lg" />
      </div>
      {/* Glossy highlight */}
      <div className="absolute top-2.5 left-5 w-7 h-10 rounded-full" style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
      }} />
    </div>
  </div>
);


/* ─── 3D Sequential Letter-by-Letter Title ─── */
const ConvergingTitle = () => {
  const [animKey, setAnimKey] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
    // All 13 letters finish arriving sequentially around 2.1s
    const timer = setTimeout(() => setSettled(true), 2150);
    return () => clearTimeout(timer);
  }, [animKey]);

  const word1 = ['D', 'I', 'A', 'B', 'E', 'T', 'E', 'S'];
  const word2 = ['G', 'U', 'A', 'R', 'D'];

  // Real 3D Extrusion Layered Shadows
  const textShadow3DWord1 = '0 1px 0 #e2e8f0, 0 2px 0 #cbd5e1, 0 3px 0 #94a3b8, 0 4px 0 #64748b, 0 5px 0 #475569, 0 8px 20px rgba(0, 0, 0, 0.45), 0 0 45px rgba(99, 102, 241, 0.35)';
  const textShadow3DWord2 = '0 1px 0 #38bdf8, 0 2px 0 #0284c7, 0 3px 0 #2563eb, 0 4px 0 #1d4ed8, 0 5px 0 #0f172a, 0 8px 22px rgba(14, 165, 233, 0.5), 0 0 50px rgba(99, 102, 241, 0.4)';

  return (
    <div
      key={animKey}
      onClick={() => setAnimKey((k) => k + 1)}
      className="cursor-pointer select-none group relative py-3"
      title="Click title to replay 3D letter assembly"
      style={{ perspective: '1400px' }}
    >
      <h1 className="text-[3.4rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[7.8rem] font-black leading-[0.92] tracking-tight">
        {/* ROW 1: DIABETES (Appears letter by letter) */}
        <div className="flex justify-center items-center overflow-visible">
          {word1.map((char, index) => {
            const delay = 0.06 + index * 0.09;
            return (
              <span
                key={`w1-${index}`}
                className="inline-block text-white transition-all duration-300 group-hover:scale-105"
                style={{
                  animation: settled
                    ? 'none'
                    : `letterPop3D 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
                  textShadow: textShadow3DWord1,
                  display: 'inline-block',
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* ROW 2: GUARD (Appears sequentially after DIABETES) */}
        <div className="flex justify-center items-center overflow-visible mt-2 sm:mt-3">
          {word2.map((char, index) => {
            const delay = 0.85 + index * 0.10;
            return (
              <span
                key={`w2-${index}`}
                className="inline-block bg-gradient-to-b from-sky-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105"
                style={{
                  animation: settled
                    ? 'none'
                    : `letterPop3D 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.08)',
                  textShadow: textShadow3DWord2,
                  display: 'inline-block',
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </h1>
    </div>
  );
};


/* ═════════════════ LANDING PAGE ═════════════════ */
const LandingPage = () => {
  const tracks = [
    {
      title: 'Clinical Assessment',
      track: 'Track 1',
      subtitle: 'Laboratory Diagnostic Metrics',
      desc: 'Evaluates measured biochemical indicators (OGTT Glucose, Insulin, BP, BMI). Calibrated Stacking Ensemble with live SHAP explainability.',
      path: '/clinical',
      icon: Stethoscope,
      badge: 'Blood Test Required',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200/80',
      iconLight: '#38bdf8',
      iconDark: '#2563eb',
      iconShadow: 'rgba(37, 99, 235, 0.35)',
      gradient: 'from-blue-500 to-cyan-400',
      gradientBg: 'from-blue-500/10 to-cyan-400/5',
      borderGlow: 'hover:border-blue-400/60',
      shadowColor: 'hover:shadow-blue-500/25',
      btnGradient: 'from-blue-600 to-sky-500',
      accentColor: '#2563eb',
      lightBg: 'rgba(56, 189, 248, 0.04)',
      metric: '0.814',
      metricModel: 'Stacking Ensemble',
      tagColor: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Lifestyle Screener',
      track: 'Track 2',
      subtitle: 'Non-Invasive Survey Indicators',
      desc: 'Community-scale triage using 21 CDC BRFSS lifestyle & demographic variables. Zero blood draw required.',
      path: '/lifestyle',
      icon: HeartPulse,
      badge: '100% Non-Invasive',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconLight: '#34d399',
      iconDark: '#059669',
      iconShadow: 'rgba(5, 150, 105, 0.35)',
      gradient: 'from-emerald-500 to-teal-400',
      gradientBg: 'from-emerald-500/10 to-teal-400/5',
      borderGlow: 'hover:border-emerald-400/60',
      shadowColor: 'hover:shadow-emerald-500/25',
      btnGradient: 'from-emerald-600 to-teal-500',
      accentColor: '#059669',
      lightBg: 'rgba(52, 211, 153, 0.05)',
      metric: '0.827',
      metricModel: 'XGBoost Calibrated',
      tagColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Symptom Triage',
      track: 'Track 3',
      subtitle: 'Acute Symptom Checker',
      desc: 'Immediate outpatient evaluation of hyperglycemia-induced complaints (Polyuria, Polydipsia, weight loss). Direct referral screener.',
      path: '/symptoms',
      icon: AlertCircle,
      badge: 'Symptom Presentation',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/80',
      iconLight: '#fbbf24',
      iconDark: '#d97706',
      iconShadow: 'rgba(217, 119, 6, 0.35)',
      gradient: 'from-amber-500 to-orange-400',
      gradientBg: 'from-amber-500/10 to-orange-400/5',
      borderGlow: 'hover:border-amber-400/60',
      shadowColor: 'hover:shadow-amber-500/25',
      btnGradient: 'from-amber-600 to-orange-500',
      accentColor: '#d97706',
      lightBg: 'rgba(251, 191, 36, 0.04)',
      metric: '0.999',
      metricModel: 'Random Forest',
      tagColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  const pillars = [
    { icon: Lock,     title: 'Zero Data Leakage',       desc: 'Preprocessors & calibration fitted strictly on training folds', gradient: 'from-emerald-500 to-green-400' },
    { icon: Activity, title: 'Probability Calibration',  desc: 'Platt Sigmoid scaling with ECE < 0.05 across all tracks',      gradient: 'from-blue-500 to-cyan-400' },
    { icon: Brain,    title: 'Explainable AI (SHAP)',     desc: 'Live Shapley force breakdowns for every individual prediction', gradient: 'from-violet-500 to-purple-400' },
    { icon: Zap,      title: 'Fairness & Parity Audits', desc: 'Benchmarked across age brackets, BMI strata, populations',     gradient: 'from-amber-500 to-orange-400' },
  ];

  return (
    <div className="relative overflow-hidden">

      {/* ═══════════════ HERO — SPACERS-STYLE ═══════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f0b2e 0%, #1a1145 30%, #181058 60%, #0f0b2e 100%)' }}
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Ambient glow blobs */}
        <div className="absolute pointer-events-none" style={{ width: 700, height: 700, top: '-15%', left: '-10%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 65%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ width: 500, height: 500, bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, rgba(56,189,248,0.12), transparent 65%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ width: 350, height: 350, top: '20%', right: '15%', background: 'radial-gradient(circle, rgba(244,114,182,0.08), transparent 65%)', borderRadius: '50%' }} />

        {/* ─── 3D FLOATING OBJECTS ─── */}
        {/* Left side objects */}
        <div className="absolute animate-float-slow" style={{ left: '5%', top: '18%' }}>
          <Capsule3D color1="#818cf8" color2="#6366f1" />
        </div>
        <div className="absolute animate-float-reverse hidden lg:block" style={{ left: '12%', bottom: '18%' }}>
          <Heart3D />
        </div>
        <div className="absolute animate-float hidden md:block" style={{ left: '3%', bottom: '35%' }}>
          <Sphere3D size={35} color="#f472b6" />
        </div>

        {/* Right side objects */}
        <div className="absolute animate-float-reverse" style={{ right: '4%', top: '12%' }}>
          <Shield3D />
        </div>
        <div className="absolute animate-float-slow hidden lg:block" style={{ right: '10%', bottom: '15%' }}>
          <DNAHelix />
        </div>
        <div className="absolute animate-float hidden md:block" style={{ right: '18%', top: '35%' }}>
          <Sphere3D size={28} color="#34d399" />
        </div>

        {/* Overlapping center objects — IN FRONT OF TEXT for the Spacers effect */}
        <div className="absolute z-20 animate-float-slow hidden md:block" style={{ left: '18%', top: '38%' }}>
          <StethoOrb />
        </div>
        <div className="absolute z-20 animate-float-reverse hidden md:block" style={{ right: '15%', top: '32%' }}>
          <Capsule3D color1="#0ea5e9" color2="#06b6d4" className="rotate-[25deg]" />
        </div>

        {/* Floating mini spheres */}
        <Sphere3D size={18} color="#a78bfa" className="absolute animate-float" style={{ left: '30%', top: '15%' }} />
        <Sphere3D size={14} color="#38bdf8" className="absolute animate-float-reverse" style={{ right: '30%', bottom: '20%' }} />
        <Sphere3D size={22} color="#fb923c" className="absolute animate-float-slow" style={{ left: '45%', bottom: '12%' }} />
        <Sphere3D size={16} color="#34d399" className="absolute animate-float" style={{ right: '40%', top: '10%' }} />
        <Sphere3D size={12} color="#f472b6" className="absolute animate-float-reverse" style={{ left: '60%', top: '20%' }} />

        {/* ─── CONTENT (between background and overlapping objects) ─── */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Subtitle */}
          <p
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-indigo-300/70 mb-6 animate-fade-in-down"
            style={{ animationDelay: '0.2s' }}
          >
            Explainable AI-Based Diabetes Screening Platform
          </p>

          {/* MASSIVE TITLE — Parallel Converging Letter Assembly */}
          <ConvergingTitle />

          {/* Subtitle description */}
          <p
            className="mt-8 text-base sm:text-lg text-slate-400/80 leading-relaxed max-w-xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.7s' }}
          >
            Multi-track calibrated screening with real-time SHAP explainability.
            Clinical labs, lifestyle surveys, or symptom presentation — choose your track.
          </p>

          {/* Glassy CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <Link
              to="/clinical"
              className="glass-btn-primary group relative inline-flex items-center px-8 py-4 rounded-full text-white font-bold text-sm shadow-xl transition-all duration-300"
            >
              <span className="relative flex items-center">
                Begin Assessment <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-medo'));
                window.dispatchEvent(new CustomEvent('open-diacare'));
              }}
              className="glass-btn group relative inline-flex items-center px-7 py-3.5 rounded-full text-white font-bold text-sm shadow-xl transition-all duration-300 hover:border-sky-300/60 cursor-pointer"
            >
              <DiaCareAvatar size={24} className="mr-2.5" />
              <span>Ask Medo AI</span>
              <span className="ml-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            </button>
            <Link
              to="/analytics"
              className="glass-btn inline-flex items-center px-7 py-3.5 rounded-full text-white/90 font-bold text-sm shadow-xl hover:text-white transition-all duration-300"
            >
              <BarChart2 className="mr-2 w-5 h-5 text-indigo-300" /> Model Analytics
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-indigo-400/50 rounded-full animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ═══════════════ TRACK CARDS — 3D ELEVATED ═══════════════ */}
      <section className="relative py-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 100%)' }}>
        {/* Decorative gradient orbs behind cards */}
        <div className="absolute pointer-events-none" style={{ width: 600, height: 600, top: '-200px', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ width: 300, height: 300, bottom: '-80px', left: '10%', background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ width: 300, height: 300, bottom: '-80px', right: '10%', background: 'radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%)', borderRadius: '50%' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 bg-white rounded-full border border-indigo-100 shadow-sm mb-5">
              Multi-Track Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Choose Your Assessment Track
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-xl mx-auto">
              Tailored ML pipelines for clinical labs, community survey triage, or acute outpatient checks
            </p>
          </div>

          {/* 3D Perspective Container */}
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 lg:gap-8" style={{ perspective: '1400px' }}>
            {tracks.map((track, i) => {
              const Icon = track.icon;
              const isFeatured = i === 1;
              return (
                <div
                  key={track.title}
                  className={`flex-1 max-w-sm mx-auto md:mx-0 transition-all duration-700 ${isFeatured ? 'md:-mt-6 md:mb-0 md:z-20' : 'md:z-10'}`}
                  style={{
                    transform: isFeatured
                      ? 'translateZ(40px)'
                      : i === 0
                        ? 'rotateY(3deg) translateZ(-10px)'
                        : 'rotateY(-3deg) translateZ(-10px)',
                  }}
                >
                  <TiltCard
                    className={`group relative h-full rounded-3xl p-[2px] transition-all duration-500 ${
                      isFeatured
                        ? 'shadow-2xl shadow-emerald-500/15 hover:shadow-3xl hover:shadow-emerald-500/25'
                        : 'shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-slate-300/60'
                    }`}
                    style={{
                      background: isFeatured
                        ? 'linear-gradient(135deg, #10b981, #06b6d4, #10b981)'
                        : 'linear-gradient(135deg, #e2e8f0, #f1f5f9, #e2e8f0)',
                    }}
                  >
                    <div className={`relative h-full rounded-[22px] p-8 flex flex-col justify-between ${
                      isFeatured ? 'bg-white' : 'bg-white'
                    }`}>
                      {/* Featured tag */}
                      {isFeatured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30 z-10">
                          ★ Most Popular
                        </div>
                      )}

                      {/* Top section */}
                      <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                          {/* 3D glossy icon orb */}
                          <div className="relative" style={{ width: 52, height: 52 }}>
                            <div className="absolute inset-0 rounded-2xl" style={{
                              background: `linear-gradient(135deg, ${track.iconLight}, ${track.iconDark})`,
                              boxShadow: `0 8px 25px ${track.iconShadow}, inset -3px -3px 8px rgba(0,0,0,0.15), inset 3px 3px 8px rgba(255,255,255,0.25)`,
                            }}>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                              </div>
                              {/* Glossy shine */}
                              <div className="absolute top-1 left-1.5 w-5 h-3 rounded-full" style={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)',
                              }} />
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {track.track}
                            </span>
                            <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${track.badgeStyle}`}>
                              {track.badge}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-900 mb-1">{track.title}</h3>
                        <p className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-4 ${isFeatured ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {track.subtitle}
                        </p>
                        <p className="text-[13px] text-slate-500 leading-relaxed">{track.desc}</p>
                      </div>

                      {/* Bottom metric + button */}
                      <div className="relative mt-8">
                        <div className="flex items-end justify-between py-4 border-t border-slate-100 mb-5">
                          <div>
                            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                              Test Performance
                            </span>
                            <span className="text-xs text-slate-500 font-medium mt-0.5 block">{track.metricModel}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-black tracking-tight" style={{
                              background: `linear-gradient(135deg, ${track.iconLight}, ${track.iconDark})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                              {track.metric}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-bold -mt-0.5">ROC-AUC</span>
                          </div>
                        </div>

                        <Link
                          to={track.path}
                          className="group/btn w-full py-3.5 px-5 rounded-2xl text-white text-sm font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                          style={{
                            background: `linear-gradient(135deg, ${track.iconLight}, ${track.iconDark})`,
                            boxShadow: `0 6px 20px ${track.iconShadow}`,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 10px 30px ${track.iconShadow}`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 6px 20px ${track.iconShadow}`; }}
                        >
                          Launch Screener <ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>

          {/* Bottom decorative line */}
          <div className="mt-16 flex justify-center">
            <div className="h-1 w-32 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-400 opacity-40" />
          </div>
        </div>
      </section>

      {/* ═══════════════ PILLARS — DARK 3D ═══════════════ */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(170deg, #0f0b2e 0%, #181058 50%, #0f0b2e 100%)' }}>
        <div className="absolute pointer-events-none" style={{ width: 500, height: 500, top: '-150px', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)', borderRadius: '50%' }} />

        {/* Floating decorative spheres */}
        <Sphere3D size={25} color="#818cf8" className="absolute animate-float opacity-50" style={{ left: '8%', top: '20%' }} />
        <Sphere3D size={18} color="#38bdf8" className="absolute animate-float-reverse opacity-40" style={{ right: '10%', bottom: '25%' }} />
        <Sphere3D size={14} color="#f472b6" className="absolute animate-float-slow opacity-30" style={{ left: '70%', top: '15%' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20 mb-4">
              Core Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Architectural Pillars</h2>
            <p className="mt-3 text-base text-slate-400 max-w-lg mx-auto">Scientific rigour at every layer of the prediction pipeline</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: '1000px' }}>
            {pillars.map((p) => {
              const PIcon = p.icon;
              return (
                <TiltCard key={p.title} className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500">
                  <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${p.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center shadow-lg mb-5`}>
                    <PIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{p.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to Begin Your Screening?</h2>
          <p className="text-lg text-blue-100/80 mb-10 max-w-lg mx-auto">Select a track to receive your calibrated, explainable assessment report in seconds.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/clinical" className="px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <Stethoscope className="inline w-4 h-4 mr-2 -mt-0.5" /> Clinical Lab Track
            </Link>
            <Link to="/lifestyle" className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-bold text-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300">
              <HeartPulse className="inline w-4 h-4 mr-2 -mt-0.5" /> Lifestyle Screener
            </Link>
            <Link to="/symptoms" className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white font-bold text-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300">
              <AlertCircle className="inline w-4 h-4 mr-2 -mt-0.5" /> Symptom Triage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
