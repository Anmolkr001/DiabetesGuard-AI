import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Shield, BarChart3, History, Info, Stethoscope, HeartPulse,
  AlertCircle, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { DiaCareAvatar } from './DiaCareChatbot';
import { GlassButton, GlassTab, GlassDot } from './GlassButton';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact 7 navigation tabs specified by user
  const navTabs = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Clinical', path: '/clinical', tag: 'Lab', icon: Stethoscope },
    { name: 'Lifestyle', path: '/lifestyle', tag: 'Survey', icon: HeartPulse },
    { name: 'Symptoms', path: '/symptoms', icon: AlertCircle },
    { name: 'History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Research', path: '/about', icon: Info },
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
    <header className="glass-nav px-3 sm:px-5 py-2.5 sm:py-3 transition-all">
      <div className="flex items-center justify-between">
        
        {/* Left: 3D Glossy Shield Logo + Circular Back/Forward Glass Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/"
            className="flex items-center space-x-2 sm:space-x-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="relative rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 50%, #1d4ed8 100%)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4), inset -2px -2px 4px rgba(0,0,0,0.25), inset 2px 2px 4px rgba(255,255,255,0.4)',
              }}
            >
              <Shield className="w-4 h-4 text-white drop-shadow" />
              <div
                className="absolute top-1 left-1.5 w-3 h-1.5 rounded-full"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)' }}
              />
            </div>

            <div className="hidden sm:block">
              <span className="text-base font-black tracking-tight text-white">
                Diabetes<span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Guard</span>
              </span>
            </div>
          </Link>

          {/* Circular glass-btn--icon Back & Forward Buttons */}
          <div className="flex items-center space-x-1 pl-1 sm:pl-2 border-l border-white/10">
            <GlassButton
              onClick={() => navigate(-1)}
              variant="default"
              size="icon"
              className="glass-btn--icon"
              title="Go Back"
              ariaLabel="Go Back"
            >
              <ChevronLeft className="w-4 h-4 text-slate-200" />
            </GlassButton>
            <GlassButton
              onClick={() => navigate(1)}
              variant="default"
              size="icon"
              className="glass-btn--icon"
              title="Go Forward"
              ariaLabel="Go Forward"
            >
              <ChevronRight className="w-4 h-4 text-slate-200" />
            </GlassButton>
          </div>
        </div>

        {/* Center: Desktop Floating Capsule Tabs (GlassTab) */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {navTabs.map((tab) => {
            const active = isLinkActive(tab.path);
            const Icon = tab.icon;
            return (
              <GlassTab
                key={tab.name}
                to={tab.path}
                isActive={active}
                icon={Icon}
                label={tab.name}
                tag={tab.tag}
              />
            );
          })}
        </nav>

        {/* Right: DiaCare AI Button (glass-btn--ai with glass-dot) + Mobile Menu Toggle */}
        <div className="flex items-center space-x-2">
          {/* DiaCare AI Button with glass-dot */}
          <GlassButton
            onClick={handleOpenDiaCare}
            variant="ai"
            size="sm"
            className="rounded-full font-bold px-3.5 py-1.5 shadow-lg"
            title="Open DiaCare AI Medical Assistant"
            ariaLabel="Open DiaCare AI Medical Assistant"
          >
            <DiaCareAvatar size={18} className="mr-1.5" />
            <span className="hidden xs:inline sm:inline">DiaCare AI</span>
            <span className="inline xs:hidden sm:hidden">AI</span>
            <GlassDot className="ml-2" />
          </GlassButton>

          {/* Mobile Menu Toggle Button (Screens < lg) */}
          <div className="lg:hidden">
            <GlassButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="default"
              size="icon"
              className="glass-btn--icon"
              ariaLabel="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
            </GlassButton>
          </div>
        </div>

      </div>

      {/* Mobile Drawer (Expandable Glass Capsule List on small viewports) */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 px-2 pb-2 space-y-1.5 animate-fade-in-down">
          {navTabs.map((tab) => {
            const active = isLinkActive(tab.path);
            const Icon = tab.icon;
            return (
              <GlassTab
                key={tab.name}
                to={tab.path}
                isActive={active}
                icon={Icon}
                label={tab.name}
                tag={tab.tag}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full justify-start py-2 px-3 text-xs"
              />
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
