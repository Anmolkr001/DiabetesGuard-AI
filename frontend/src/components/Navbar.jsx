import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Shield, BarChart3, History, Info, Stethoscope, HeartPulse,
  AlertCircle, ChevronLeft, ChevronRight, Menu, X, Sparkles
} from 'lucide-react';
import { DiaCareAvatar } from './DiaCareChatbot';

/**
 * ═══════════════════════════════════════════════════════════════════
 * Ultra-Stylish Chromatic Navbar Component
 * ═══════════════════════════════════════════════════════════════════
 * Features:
 * - Jewel-tone chromatic button system (each tab has unique neon identity)
 * - Holographic Cyber Aurora DiaCare AI pill with animated live beacon
 * - Specular crystal Back & Forward navigation buttons
 * - Flowing rainbow chromatic hairline glow on bottom edge
 * - Responsive mobile menu drawer with identical chromatic styling
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dedicated Chromatic Palette & Config for Every Navigation Tab
  const navTabs = [
    {
      name: 'Dashboard',
      path: '/',
      icon: Activity,
      tabClass: 'nav-tab-sky',
      iconColor: 'text-sky-400',
    },
    {
      name: 'Clinical',
      tag: 'Lab',
      path: '/clinical',
      icon: Stethoscope,
      tabClass: 'nav-tab-blue',
      iconColor: 'text-indigo-400',
      badgeClass: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40',
    },
    {
      name: 'Lifestyle',
      tag: 'Survey',
      path: '/lifestyle',
      icon: HeartPulse,
      tabClass: 'nav-tab-emerald',
      iconColor: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
    },
    {
      name: 'Symptoms',
      tag: 'Check',
      path: '/symptoms',
      icon: AlertCircle,
      tabClass: 'nav-tab-amber',
      iconColor: 'text-amber-400',
      badgeClass: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
    },
    {
      name: 'History',
      path: '/history',
      icon: History,
      tabClass: 'nav-tab-purple',
      iconColor: 'text-purple-400',
    },
    {
      name: 'Model Analytics',
      tag: 'SHAP',
      path: '/analytics',
      icon: BarChart3,
      tabClass: 'nav-tab-pink',
      iconColor: 'text-pink-400',
      badgeClass: 'bg-pink-500/25 text-pink-200 border-pink-400/40',
    },
    {
      name: 'About & Research',
      path: '/about',
      icon: Info,
      tabClass: 'nav-tab-teal',
      iconColor: 'text-teal-400',
    },
  ];

  const isLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const handleOpenDiaCare = () => {
    window.dispatchEvent(new CustomEvent('open-diacare'));
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-2xl shadow-xl shadow-black/30 transition-all duration-300"
      style={{
        background: 'rgba(11, 8, 33, 0.88)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ─── 1. Brand Logo + Tactile Glass Back/Forward Navigation ─── */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2.5 sm:space-x-3 group focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* 3D Glossy Shield Emblem */}
              <div
                className="relative rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
                style={{
                  width: 38,
                  height: 38,
                  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 50%, #4f46e5 100%)',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.5), inset -2px -2px 5px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.45)',
                }}
              >
                <Shield className="w-5 h-5 text-white drop-shadow" />
                {/* 3D Specular arc */}
                <div
                  className="absolute top-1 left-1.5 w-3.5 h-2 rounded-full"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)' }}
                />
              </div>

              {/* Title & Version Badge */}
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-sm">
                  Diabetes<span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Guard</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full shadow-sm">
                  AI v1.0
                </span>
              </div>
            </Link>

            {/* Tactile Crystal Glass Back & Forward History Navigation */}
            <div className="flex items-center space-x-1 pl-1.5 sm:pl-3 border-l border-white/10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                title="Go Back (History)"
                aria-label="Go Back in Navigation History"
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.06] hover:bg-sky-500/20 border border-white/10 hover:border-sky-400/50 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-[0_0_12px_rgba(56,189,248,0.35)] backdrop-blur-md cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate(1)}
                title="Go Forward (History)"
                aria-label="Go Forward in Navigation History"
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.06] hover:bg-sky-500/20 border border-white/10 hover:border-sky-400/50 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-[0_0_12px_rgba(56,189,248,0.35)] backdrop-blur-md cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── 2. Desktop Navigation (Jewel-Tone Chromatic Tabs) ─── */}
          <nav className="hidden lg:flex items-center space-x-1.5" aria-label="Main Navigation">
            {navTabs.map((tab) => {
              const active = isLinkActive(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  className={`nav-tab-btn ${tab.tabClass} ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={`w-3.5 h-3.5 mr-1.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      active ? 'text-white' : tab.iconColor
                    }`}
                  />
                  <span>{tab.name}</span>
                  {tab.tag && (
                    <span
                      className={`ml-1.5 text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded-md border tracking-wide transition-all ${
                        active
                          ? 'bg-white/25 text-white border-white/40'
                          : tab.badgeClass
                      }`}
                    >
                      {tab.tag}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Special Holographic Cyber Aurora DiaCare AI Button */}
            <button
              type="button"
              onClick={handleOpenDiaCare}
              className="nav-diacare-aurora ml-2 group"
              title="Open DiaCare AI Medical Assistant"
              aria-label="Open DiaCare AI Medical Assistant"
            >
              {/* Shimmer reflection sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none rounded-xl" />

              <DiaCareAvatar size={18} className="mr-1.5 transition-transform duration-300 group-hover:rotate-6 drop-shadow" />
              <span className="font-extrabold tracking-wide drop-shadow-sm text-xs">DiaCare AI</span>

              {/* Live pulsing glowing emerald beacon */}
              <span className="relative flex h-2 w-2 ml-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </span>

              <span className="ml-1.5 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-white/20 text-white border border-white/30 backdrop-blur-sm shadow-sm">
                3.5
              </span>
            </button>
          </nav>

          {/* ─── 3. Medium Screens (Condensed Chromatic View) ─── */}
          <div className="hidden md:flex lg:hidden items-center space-x-1.5">
            <Link
              to="/"
              className={`nav-tab-btn nav-tab-sky ${isLinkActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/clinical"
              className={`nav-tab-btn nav-tab-blue ${isLinkActive('/clinical') ? 'active' : ''}`}
            >
              Clinical
            </Link>
            <Link
              to="/lifestyle"
              className={`nav-tab-btn nav-tab-emerald ${isLinkActive('/lifestyle') ? 'active' : ''}`}
            >
              Lifestyle
            </Link>

            <button
              type="button"
              onClick={handleOpenDiaCare}
              className="nav-diacare-aurora px-2.5 py-1 text-xs"
              title="Open DiaCare AI"
            >
              <DiaCareAvatar size={16} className="mr-1" />
              <span>AI</span>
              <span className="w-1.5 h-1.5 ml-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.08] hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white transition cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-sky-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* ─── 4. Mobile Screen Controls (< md) ─── */}
          <div className="flex md:hidden items-center space-x-1.5">
            <button
              type="button"
              onClick={handleOpenDiaCare}
              className="nav-diacare-aurora px-2.5 py-1 text-xs"
              aria-label="Open DiaCare AI Assistant"
            >
              <DiaCareAvatar size={16} className="mr-1" />
              <span>AI</span>
              <span className="w-1.5 h-1.5 ml-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.08] hover:bg-white/15 border border-white/15 text-slate-200 transition cursor-pointer"
              aria-label="Toggle Mobile Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-sky-400" /> : <Menu className="w-4 h-4 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* ─── Dynamic Rainbow Chromatic Hairline ─── */}
      <div className="nav-hairline-glow" />

      {/* ─── 5. Mobile Glassy Drawer Menu ─── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-white/10 px-4 py-4 space-y-2 backdrop-blur-2xl transition-all duration-300 animate-fade-in-down"
          style={{ background: 'rgba(11, 8, 33, 0.97)' }}
        >
          <div className="grid grid-cols-1 gap-2">
            {navTabs.map((tab) => {
              const active = isLinkActive(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-tab-btn ${tab.tabClass} ${active ? 'active' : ''} w-full justify-between py-2.5 px-4 text-xs font-semibold`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-2.5 flex-shrink-0 ${active ? 'text-white' : tab.iconColor}`} />
                    <span>{tab.name}</span>
                  </div>
                  {tab.tag && (
                    <span
                      className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-md border tracking-wider ${
                        active
                          ? 'bg-white/25 text-white border-white/40'
                          : tab.badgeClass
                      }`}
                    >
                      {tab.tag}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Mobile DiaCare AI CTA Button */}
            <button
              type="button"
              onClick={handleOpenDiaCare}
              className="nav-diacare-aurora w-full justify-center py-2.5 px-4 text-xs font-bold mt-2"
            >
              <DiaCareAvatar size={20} className="mr-2" />
              <span>Open DiaCare AI Medical Assistant</span>
              <span className="relative flex h-2 w-2 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
