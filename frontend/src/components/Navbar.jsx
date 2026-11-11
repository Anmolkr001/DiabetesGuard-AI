import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Shield, BarChart3, History, Info, Stethoscope, HeartPulse,
  AlertCircle, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { DiaCareAvatar } from './DiaCareChatbot';
import GlassButton from './GlassButton';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Clinical (Lab)', path: '/clinical', icon: Stethoscope },
    { name: 'Lifestyle (Survey)', path: '/lifestyle', icon: HeartPulse },
    { name: 'Symptoms', path: '/symptoms', icon: AlertCircle },
    { name: 'History', path: '/history', icon: History },
    { name: 'Model Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'About & Research', path: '/about', icon: Info },
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
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
      style={{ background: 'rgba(15, 11, 46, 0.88)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo with 3D Glossy Shield + Glassy Back/Forward Navigation */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
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

            {/* Glassy Back & Forward History Navigation */}
            <div className="flex items-center space-x-1.5 pl-2 sm:pl-3 border-l border-white/10">
              <GlassButton
                onClick={() => navigate(-1)}
                size="icon"
                title="Go Back"
                ariaLabel="Go Back"
                className="w-8 h-8 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 text-slate-200" />
              </GlassButton>
              <GlassButton
                onClick={() => navigate(1)}
                size="icon"
                title="Go Forward"
                ariaLabel="Go Forward"
                className="w-8 h-8 rounded-xl"
              >
                <ChevronRight className="w-4 h-4 text-slate-200" />
              </GlassButton>
            </div>
          </div>

          {/* Desktop Navigation Links (Consistent Glassmorphism Tabs) */}
          <nav className="hidden lg:flex items-center space-x-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              const Icon = link.icon;
              return (
                <GlassButton
                  key={link.name}
                  to={link.path}
                  isActive={active}
                  size="sm"
                  className="rounded-xl font-semibold tracking-wide text-xs"
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span>{link.name}</span>
                </GlassButton>
              );
            })}

            {/* Special Glassy DiaCare AI Button */}
            <GlassButton
              onClick={handleOpenDiaCare}
              variant="primary"
              size="sm"
              className="ml-2 rounded-xl font-bold text-xs"
              title="Open DiaCare AI Medical Assistant"
              ariaLabel="Open DiaCare AI Medical Assistant"
            >
              <DiaCareAvatar size={19} className="mr-1.5" />
              <span>DiaCare AI</span>
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            </GlassButton>
          </nav>

          {/* Medium Screen Nav (More compact horizontal glass scroll strip) */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            <GlassButton
              to="/"
              isActive={isLinkActive('/')}
              size="sm"
              className="rounded-xl text-xs"
            >
              Dashboard
            </GlassButton>
            <GlassButton
              to="/clinical"
              isActive={isLinkActive('/clinical')}
              size="sm"
              className="rounded-xl text-xs"
            >
              Clinical
            </GlassButton>
            <GlassButton
              to="/lifestyle"
              isActive={isLinkActive('/lifestyle')}
              size="sm"
              className="rounded-xl text-xs"
            >
              Lifestyle
            </GlassButton>
            <GlassButton
              onClick={handleOpenDiaCare}
              variant="primary"
              size="sm"
              className="rounded-xl text-xs"
            >
              <DiaCareAvatar size={18} className="mr-1" />
              <span>AI</span>
            </GlassButton>
            <GlassButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon"
              className="w-8 h-8 rounded-xl ml-1"
              ariaLabel="More navigation tabs"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </GlassButton>
          </div>

          {/* Mobile Menu Toggle Button (Screens < md) */}
          <div className="flex md:hidden items-center space-x-2">
            <GlassButton
              onClick={handleOpenDiaCare}
              variant="primary"
              size="sm"
              className="rounded-xl px-2.5 py-1 text-xs"
              ariaLabel="Open DiaCare AI"
            >
              <DiaCareAvatar size={18} className="mr-1" />
              <span>AI</span>
            </GlassButton>
            <GlassButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon"
              className="w-9 h-9 rounded-xl"
              ariaLabel="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
            </GlassButton>
          </div>

        </div>
      </div>

      {/* Mobile Glassy Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-white/10 px-4 py-4 space-y-2 backdrop-blur-2xl transition-all duration-300"
          style={{ background: 'rgba(15, 11, 46, 0.96)' }}
        >
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              const Icon = link.icon;
              return (
                <GlassButton
                  key={link.name}
                  to={link.path}
                  isActive={active}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full justify-start py-2.5 px-4 rounded-xl text-xs font-semibold"
                >
                  <Icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <span>{link.name}</span>
                </GlassButton>
              );
            })}

            <GlassButton
              onClick={handleOpenDiaCare}
              variant="primary"
              className="w-full justify-center py-2.5 px-4 rounded-xl text-xs font-bold mt-2"
            >
              <DiaCareAvatar size={20} className="mr-2" />
              <span>Open DiaCare AI Medical Assistant</span>
              <span className="ml-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            </GlassButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
