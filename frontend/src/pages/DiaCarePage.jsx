import React from 'react';
import DiaCareChatbot from '../components/DiaCareChatbot';
import { Bot, Sparkles, Shield, Stethoscope } from 'lucide-react';

const DiaCarePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI-Powered Medical Report Analyzer & Diabetes Educator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Medo AI Health Assistant
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Upload your laboratory blood reports (PDF, JPG, PNG) for instant biomarker extraction, or chat directly to learn about culturally relevant Indian nutrition, physical exercise (GLUT4 activation), and diabetes management.
          </p>
        </div>
      </div>

      {/* Embedded Chatbot & Analyzer Component */}
      <DiaCareChatbot fullPage={true} />
    </div>
  );
};

export default DiaCarePage;

