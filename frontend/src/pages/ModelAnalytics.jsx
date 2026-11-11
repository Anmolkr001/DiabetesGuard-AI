import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { assessmentService } from '../services/api';

const ModelAnalytics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await assessmentService.getModelMetrics();
        setMetrics(data || []);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const chartData = metrics.map((m) => ({
    name: m.track_code === 'pima_clinical' ? 'Clinical (Stacking)' : m.track_code === 'cdc_lifestyle' ? 'Lifestyle (XGBoost)' : 'Symptoms (RF)',
    'ROC-AUC': m.test_roc_auc,
    'PR-AUC': m.test_pr_auc || 0,
    Accuracy: m.test_accuracy || 0,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-primary-600" />
          Model Benchmarks & Scientific Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Empirical evaluation results strictly measured on untouched, locked held-out test splits with probability calibration
        </p>
      </div>

      {/* Comparative Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Locked Test Set Performance Comparison</h3>
        <p className="text-xs text-slate-500 mb-6">Discrimination metrics (ROC-AUC, PR-AUC, and Accuracy) across all three experimental tracks</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 1.05]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="ROC-AUC" fill="#1976D2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="PR-AUC" fill="#388E3C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Accuracy" fill="#F57C00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Technical Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-2">
          <Award className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-slate-900 text-sm">Comprehensive Model Registry & Metrics</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Track</th>
                <th className="py-3 px-4">Algorithm & Calibration</th>
                <th className="py-3 px-4">Test ROC-AUC</th>
                <th className="py-3 px-4">Brier Score</th>
                <th className="py-3 px-4">ECE</th>
                <th className="py-3 px-4">Train N</th>
                <th className="py-3 px-4">Test N</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {metrics.map((row) => (
                <tr key={row.track_code} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 capitalize">
                    {row.track_code.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600">
                    {row.model_name}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">
                    {row.test_roc_auc.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {row.test_brier_score?.toFixed(4) || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    {row.test_ece?.toFixed(4) || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {row.training_sample_size.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {row.test_sample_size.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModelAnalytics;

