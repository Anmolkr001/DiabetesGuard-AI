import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { assessmentService } from '../services/api';
import { formatErrorMessage } from '../utils/formatError';

const LifestyleAssessment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    high_bp: 1,
    high_chol: 1,
    chol_check: 1,
    bmi: 29.5,
    smoker: 0,
    stroke: 0,
    heart_disease: 0,
    phys_activity: 1,
    fruits: 1,
    veggies: 1,
    heavy_alcohol: 0,
    any_healthcare: 1,
    no_doc_cost: 0,
    gen_hlth: 3,
    ment_hlth: 0,
    phys_hlth: 1,
    diff_walk: 0,
    sex: 1,
    age_bracket: 8,
    education: 5,
    income: 6,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await assessmentService.assessCdc(formData);
      sessionStorage.setItem('latest_assessment', JSON.stringify(result));
      navigate('/results', { state: { result } });
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-sm hover:shadow transition mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Non-Invasive Lifestyle Screener</h1>
            <p className="text-xs text-slate-500">Track 2: CDC BRFSS Indicators • Calibrated XGBoost Model</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 flex items-start space-x-2.5 mt-4">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p>
            Zero laboratory blood draws required. This screening model evaluates survey indicators, daily activity, and demographic factors trained on over 200,000 CDC BRFSS records.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Biological Sex Selector */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Patient Biological Sex
              </span>
              <span className="text-[11px] text-slate-500">
                BRFSS epidemiological model calibrates risk weighting based on demographic sex
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, sex: 0 }))}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  formData.sex === 0
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>👩 Female</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, sex: 1 }))}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  formData.sex === 1
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>👨 Male</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Health Perception
            </label>
            <select
              name="gen_hlth"
              value={formData.gen_hlth}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="1">1 — Excellent</option>
              <option value="2">2 — Very Good</option>
              <option value="3">3 — Good</option>
              <option value="4">4 — Fair</option>
              <option value="5">5 — Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Body Mass Index (BMI) [kg/m²]
            </label>
            <input
              type="number"
              step="0.1"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              min="12"
              max="70"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              High Blood Pressure History?
            </label>
            <select
              name="high_bp"
              value={formData.high_bp}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="0">No High Blood Pressure</option>
              <option value="1">Yes, Diagnosed High BP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              High Cholesterol History?
            </label>
            <select
              name="high_chol"
              value={formData.high_chol}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="0">No High Cholesterol</option>
              <option value="1">Yes, Diagnosed High Cholesterol</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Activity (Past 30 Days)
            </label>
            <select
              name="phys_activity"
              value={formData.phys_activity}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="1">Yes, Active</option>
              <option value="0">No Regular Physical Activity</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Age Category
            </label>
            <select
              name="age_bracket"
              value={formData.age_bracket}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="1">18–24 years</option>
              <option value="3">30–34 years</option>
              <option value="5">40–44 years</option>
              <option value="7">50–54 years</option>
              <option value="8">55–59 years</option>
              <option value="9">60–64 years</option>
              <option value="11">70–74 years</option>
              <option value="13">80+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Smoked &ge;100 Cigarettes in Lifetime?
            </label>
            <select
              name="smoker"
              value={formData.smoker}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Difficulty Walking or Climbing Stairs?
            </label>
            <select
              name="diff_walk"
              value={formData.diff_walk}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="0">No Difficulty</option>
              <option value="1">Yes, Serious Difficulty</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center shadow-md disabled:opacity-50 transition"
          >
            {loading ? 'Evaluating Lifestyle Factors...' : 'Generate Non-Invasive Assessment'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default LifestyleAssessment;

