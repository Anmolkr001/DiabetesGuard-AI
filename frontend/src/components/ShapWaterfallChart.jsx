import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const ShapWaterfallChart = ({ factors, baseValue }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        No local SHAP explainability factors available for this assessment track.
      </div>
    );
  }

  // Format data for Recharts horizontal bar
  const chartData = factors.map((item) => ({
    name: item.feature_label || item.feature,
    contribution: item.contribution,
    val: item.value,
    direction: item.direction,
    interpretation: item.clinical_interpretation
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs max-w-xs border border-slate-700">
          <p className="font-bold text-sm mb-1">{data.name}</p>
          <p className="text-slate-300">Measured Value: <span className="font-mono text-white font-semibold">{data.val}</span></p>
          <p className="mt-1">
            Impact: <span className={data.contribution > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
              {data.contribution > 0 ? `+${data.contribution}` : data.contribution}
            </span>
          </p>
          <p className="mt-1.5 text-slate-400 italic text-[11px] leading-tight">{data.interpretation}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Explainable AI — Feature Impact (SHAP)</h3>
          <p className="text-xs text-slate-500">
            Statistical attribution of each feature pushing the score higher (red) or lower (green)
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center text-rose-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></span> Increases Risk
          </span>
          <span className="flex items-center text-emerald-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Lowers Risk
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 11 }} domain={['dataMin - 0.05', 'dataMax + 0.05']} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar dataKey="contribution" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.contribution > 0 ? '#E53935' : '#43A047'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-slate-400 mt-4 text-center">
        Note: SHAP values represent model score attributions. They illustrate mathematical contributions, not proven clinical causality.
      </p>
    </div>
  );
};

export default ShapWaterfallChart;

