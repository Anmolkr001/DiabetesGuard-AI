import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Shield, BarChart3, History, Info, Stethoscope, HeartPulse,
  AlertCircle, Sparkles, Bot, ChevronLeft, ChevronRight
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Clinical (Lab)', path: '/clinical', icon: Stethoscope },
    { name: 'Lifestyle (Survey)', path: '/lifestyle', icon: HeartPulse },
    { name: 'Symptoms', path: '/symptoms', icon: AlertCircle },
    { name: 'History', path: '/history', icon: History },
    { name: 'Model Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'About & Research', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10"
      style={{ background: 'rgba(15, 11, 46, 0.88)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo with 3D Glossy Shield + Back/Forward History Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div
                className="relative rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 50%, #1d4ed8 100%)',
                  boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4), inset -2px -2px 5px rgba(0,0,0,0.25), inset 2px 2px 5px rgba(255,255,255,0.4)',
                }}
              >
                <Shield className="w-5 h-5 text-white drop-shadow" />
                {/* 3D highlight */}
                <div
                  className="absolute top-1 left-1.5 w-3.5 h-2 rounded-full"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)' }}
                />
              </div>

              <div>
                <span className="text-lg font-black tracking-tight text-white">
                  Diabetes<span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Guard</span>
                </span>
                <span className="ml-2 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  AI v1.0
                </span>
              </div>
            </Link>

            {/* Back & Forward History Navigation */}
            <div className="flex items-center space-x-1 pl-2 sm:pl-3 border-l border-white/10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-sm"
                title="Go Back"
                aria-label="Go Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate(1)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-sm"
                title="Go Forward"
                aria-label="Go Forward"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Special DiaCare AI Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-diacare'))}
              className="flex items-center space-x-1.5 ml-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border bg-indigo-500/20 text-sky-300 border-indigo-400/40 hover:bg-indigo-500/35 hover:text-white"
            >
              <Bot className="w-3.5 h-3.5 text-sky-300" />
              <span>DiaCare AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
