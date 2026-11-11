import React from 'react';

/**
 * RiskGauge
 * Precision SVG Semi-Circular Calibrated Risk Gauge
 * Renders an unclipped, perfectly curved arc with smooth animation,
 * clinical color gradations, and WCAG AA contrast.
 */
const RiskGauge = ({ probability = 0, category = 'Standard Risk', confidenceInterval }) => {
  const pct = Math.round(probability * 100);
  const clampedProb = Math.max(0, Math.min(1, probability));

  // Visual Theme & Gradients based on Clinical Risk Level
  let gradientId = 'gaugeLow';
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  let dropShadowColor = 'rgba(16, 185, 129, 0.35)';

  if (clampedProb >= 0.55) {
    gradientId = 'gaugeHigh';
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200/80';
    dropShadowColor = 'rgba(225, 29, 72, 0.4)';
  } else if (clampedProb >= 0.25) {
    gradientId = 'gaugeMed';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dropShadowColor = 'rgba(245, 158, 11, 0.4)';
  }

  // Precision Semi-Circle Arc Geometry
  // Center: (100, 95), Radius: 76
  // Left point: (24, 95), Right point: (176, 95), Apex: (100, 19)
  // Arc length = PI * Radius = PI * 76 = ~238.761
  const radius = 76;
  const arcLength = Math.PI * radius; // 238.761
  const strokeDashoffset = arcLength * (1 - clampedProb);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gauge Container (Proper viewBox prevents any clipping) */}
      <div className="relative w-56 h-36 flex items-center justify-center">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Low Risk Emerald Gradient */}
            <linearGradient id="gaugeLow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Moderate Risk Amber Gradient */}
            <linearGradient id="gaugeMed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* High Risk Rose / Red Gradient */}
            <linearGradient id="gaugeHigh" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>

            {/* Soft Ambient Glow Filter */}
            <filter id="gaugeGlow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={dropShadowColor} />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 24 95 A 76 76 0 0 1 176 95"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Calibrated Risk Progress Arc */}
          <path
            d="M 24 95 A 76 76 0 0 1 176 95"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center Percentage & Calibrated Risk Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 pointer-events-none select-none">
          <span className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            {pct}%
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mt-1.5">
            Calibrated Risk
          </span>
        </div>
      </div>

      {/* Clinical Risk Classification Pill */}
      <div className={`mt-3 px-3.5 py-1 text-xs font-bold rounded-full border shadow-sm ${badgeBg}`}>
        {category}
      </div>

      {/* 95% Confidence Interval */}
      {confidenceInterval && (
        <div className="mt-3 text-xs text-slate-500 text-center font-medium">
          Confidence Interval:{' '}
          <span className="font-bold text-slate-800">
            {(confidenceInterval.lower * 100).toFixed(1)}% – {(confidenceInterval.upper * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default RiskGauge;
