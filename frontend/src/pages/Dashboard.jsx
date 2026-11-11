import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Stethoscope, HeartPulse, AlertCircle, History, BarChart3, ArrowRight, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import { DiaCareAvatar } from '../components/DiaCareChatbot';
import { assessmentService } from '../services/api';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histData, metricsData] = await Promise.all([
          assessmentService.getHistory(),
          assessmentService.getModelMetrics()
        ]);
        setHistory(histData || []);
        setMetrics(metricsData || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary-900 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-300" />
            <span>Multi-Track Screening Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Healthcare Screening Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Welcome to DiabetesGuard AI. Select a specialized screening track or inspect model calibration benchmarks and assessment records.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/clinical"
              className="glass-btn-primary px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition"
            >
              Start Clinical Test
            </Link>
            <Link
              to="/lifestyle"
              className="glass-btn px-5 py-2.5 rounded-full text-xs font-bold text-white/90 shadow-md hover:text-white transition"
            >
              Start Lifestyle Survey
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-diacare'))}
              className="glass-btn px-5 py-2.5 rounded-full text-xs font-bold text-white transition flex items-center space-x-2 border-sky-400/40 hover:border-sky-300 cursor-pointer shadow-lg"
            >
              <DiaCareAvatar size={18} />
              <span>Ask DiaCare AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Track Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl w-fit mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Clinical Laboratory</h3>
            <p className="text-xs text-slate-500 mt-1">
              Fasting/OGTT glucose, insulin, and BMI. Calibrated Stacking with live SHAP attribution.
            </p>
          </div>
          <Link to="/clinical" className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
            Open Assessment <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit mb-3">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Non-Invasive Lifestyle</h3>
            <p className="text-xs text-slate-500 mt-1">
              21 demographic & behavioral survey indicators. Population-scale community screening.
            </p>
          </div>
          <Link to="/lifestyle" className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
            Open Assessment <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl w-fit mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Acute Symptom Triage</h3>
            <p className="text-xs text-slate-500 mt-1">
              Polyuria, polydipsia, and rapid weight loss symptom checklists.
            </p>
          </div>
          <Link to="/symptoms" className="mt-4 text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center">
            Open Assessment <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Assessment Log Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-base">Recent Assessment Records</h3>
          </div>
          <Link to="/history" className="text-xs text-primary-600 font-semibold hover:underline">
            View All History
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 py-4">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No assessments completed yet. Launch an assessment above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Track</th>
                  <th className="py-3 px-4">Calibrated Probability</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 5).map((row) => (
                  <tr key={row.assessment_uuid} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800 capitalize">
                      {row.track_code.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {(row.calibrated_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {row.risk_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

