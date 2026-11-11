import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200/60 bg-slate-50/80 backdrop-blur-md py-8 mt-16 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-medium text-slate-600">© 2026 DiabetesGuard AI. All rights reserved.</span>
        </div>
        <p className="text-slate-400">
          Academic Research Prototype • Healthcare Risk Screening & Explainable AI
        </p>
      </div>
    </footer>
  );
};

export default Footer;
