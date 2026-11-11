import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Stethoscope, HeartPulse, AlertCircle, History, BarChart3,
  ArrowRight, ShieldCheck, Sparkles, ChevronRight
} from 'lucide-react';
import { DiaCareAvatar } from '../components/DiaCareChatbot';
import GlassButton from '../components/GlassButton';
import ClinicalDecisionHub from '../components/ClinicalDecisionHub';
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative">
      
      {/* Ambient Gradient Glow Blobs for Dashboard Card & Button Blur Refraction */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-72 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Banner with Glassy Specular Edge and Ambient Light Flares */}
      <div
        className="rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-white/15 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 11, 46, 0.95) 0%, rgba(30, 27, 75, 0.92) 50%, rgba(15, 23, 42, 0.96) 100%)',
          boxShadow: '0 20px 50px -10px rgba(15, 11, 46, 0.5), inset 0 1.5px 2px rgba(255, 255, 255, 0.25)'
        }}
      >
        {/* Internal ambient glowing orbs behind banner buttons */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-sky-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md mb-4 border border-white/15 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
            <span>Multi-Track Screening Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Healthcare Screening Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Welcome to DiabetesGuard AI. Select a specialized screening track or inspect model calibration benchmarks and assessment records.
          </p>

          {/* Banner Action Buttons (Consistent Glassmorphism Style) */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <GlassButton
              to="/clinical"
              variant="primary"
              size="md"
              className="rounded-xl font-bold shadow-lg shadow-indigo-500/30"
              title="Start Clinical Test"
            >
              Start Clinical Test
            </GlassButton>

            <GlassButton
              to="/lifestyle"
              variant="default"
              size="md"
              className="rounded-xl font-bold shadow-md hover:border-white/40"
              title="Start Lifestyle Survey"
            >
              Start Lifestyle Survey
            </GlassButton>

            <GlassButton
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-medo'));
                window.dispatchEvent(new CustomEvent('open-diacare'));
              }}
              variant="default"
              size="md"
              className="rounded-xl font-bold border-sky-400/40 hover:border-sky-300 shadow-md text-sky-100"
              title="Ask Medo AI Medical Assistant"
            >
              <DiaCareAvatar size={18} className="mr-2" />
              <span>Ask Medo AI</span>
              <span className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Track Quick Actions (Glassmorphic Cards + High-Contrast Glassy Action Buttons) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Track 1: Clinical Laboratory */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl w-fit mb-3 border border-blue-100">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Clinical Laboratory</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Fasting/OGTT glucose, insulin, and BMI. Calibrated Stacking with live SHAP attribution.
            </p>
          </div>
          <GlassButton
            to="/clinical"
            variant="surface"
            size="sm"
            className="mt-5 rounded-xl font-semibold text-blue-700 hover:text-blue-800 border-blue-200/90 hover:border-blue-400 shadow-sm w-fit"
            title="Open Clinical Assessment"
          >
            <span>Open Assessment</span>
            <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </GlassButton>
        </div>

        {/* Track 2: Non-Invasive Lifestyle */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit mb-3 border border-emerald-100">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Non-Invasive Lifestyle</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              21 demographic & behavioral survey indicators. Population-scale community screening.
            </p>
          </div>
          <GlassButton
            to="/lifestyle"
            variant="surface"
            size="sm"
            className="mt-5 rounded-xl font-semibold text-emerald-700 hover:text-emerald-800 border-emerald-200/90 hover:border-emerald-400 shadow-sm w-fit"
            title="Open Lifestyle Assessment"
          >
            <span>Open Assessment</span>
            <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </GlassButton>
        </div>

        {/* Track 3: Acute Symptom Triage */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl w-fit mb-3 border border-amber-100">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Acute Symptom Triage</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Polyuria, polydipsia, and rapid weight loss symptom checklists.
            </p>
          </div>
          <GlassButton
            to="/symptoms"
            variant="surface"
            size="sm"
            className="mt-5 rounded-xl font-semibold text-amber-700 hover:text-amber-800 border-amber-200/90 hover:border-amber-400 shadow-sm w-fit"
            title="Open Symptoms Assessment"
          >
            <span>Open Assessment</span>
            <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </GlassButton>
        </div>
      </div>

      {/* Clinical Diagnoses, Medical Advice & Treatment Plans Hub */}
      <ClinicalDecisionHub />

      {/* Recent Assessment Log Preview (Glass Card + Glassy View All Button) */}
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-base">Recent Assessment Records</h3>
          </div>
          <GlassButton
            to="/history"
            variant="surface"
            size="sm"
            className="rounded-xl font-semibold text-indigo-700 hover:text-indigo-800 border-indigo-200/80 hover:border-indigo-400 shadow-sm w-fit"
            title="View All History Records"
          >
            <span>View All History</span>
            <ChevronRight className="ml-1 w-3.5 h-3.5" />
          </GlassButton>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading history...</p>
        ) : history.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-slate-500">No assessments completed yet.</p>
            <GlassButton
              to="/clinical"
              variant="surface"
              size="sm"
              className="rounded-xl text-primary-700 border-primary-200 font-semibold"
            >
              Start First Assessment
            </GlassButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Track</th>
                  <th className="py-3 px-4">Calibrated Probability</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 5).map((row) => (
                  <tr key={row.assessment_uuid} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 capitalize">
                      {row.track_code.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {(row.calibrated_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
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
