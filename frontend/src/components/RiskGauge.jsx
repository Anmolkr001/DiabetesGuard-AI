import React from 'react';

const RiskGauge = ({ probability, category, confidenceInterval }) => {
  const pct = Math.round(probability * 100);
  
  // Categorize colors
  let color = '#43A047'; // Green
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (probability >= 0.55) {
    color = '#E53935'; // Red
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (probability >= 0.25) {
    color = '#FB8C00'; // Amber
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  // SVG Gauge calculations (semi-circle)
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (probability * circumference);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
        <svg className="w-48 h-48 transform -rotate-180" viewBox="0 0 200 200">
          {/* Background arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="18"
            strokeDasharray={circumference}
            strokeDashoffset="0"
          />
          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="18"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute top-12 flex flex-col items-center">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {pct}%
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
            Calibrated Risk
          </span>
        </div>
      </div>

      <div className={`mt-4 px-3 py-1 text-xs font-semibold rounded-full border ${badgeBg}`}>
        {category}
      </div>

      {confidenceInterval && (
        <div className="mt-3 text-xs text-slate-500 text-center">
          Confidence Interval: <span className="font-semibold text-slate-700">{(confidenceInterval.lower * 100).toFixed(1)}% – {(confidenceInterval.upper * 100).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

export default RiskGauge;

