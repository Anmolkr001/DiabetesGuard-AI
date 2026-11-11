import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, ShieldAlert, Info } from 'lucide-react';
import { assessmentService } from '../services/api';
import { formatErrorMessage } from '../utils/formatError';

const SymptomAssessment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    age: 45,
    gender: 1, // Male
    polyuria: 1, // Frequent urination
    polydipsia: 1, // Excessive thirst
    sudden_weight_loss: 0,
    weakness: 1,
    polyphagia: 0,
    genital_thrush: 0,
    visual_blurring: 0,
    itching: 0,
    irritability: 0,
    delayed_healing: 0,
    partial_paresis: 0,
    muscle_stiffness: 0,
    alopecia: 0,
    obesity: 0,
  });

  const toggleSymptom = (key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await assessmentService.assessUci(formData);
      sessionStorage.setItem('latest_assessment', JSON.stringify(result));
      navigate('/results', { state: { result } });
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const symptomList = [
    { key: 'polyuria', label: 'Frequent / Excessive Urination (Polyuria)', important: true },
    { key: 'polydipsia', label: 'Excessive / Unquenchable Thirst (Polydipsia)', important: true },
    { key: 'sudden_weight_loss', label: 'Unexplained Rapid Weight Loss', important: true },
    { key: 'weakness', label: 'Generalized Fatigue / Muscle Weakness' },
    { key: 'polyphagia', label: 'Excessive / Constant Hunger (Polyphagia)' },
    { key: 'visual_blurring', label: 'Blurry or Impaired Vision' },
    { key: 'genital_thrush', label: 'Frequent Genital Yeast Infections' },
    { key: 'itching', label: 'Persistent Itching / Pruritus' },
    { key: 'irritability', label: 'Unusual Mood Swings / Irritability' },
    { key: 'delayed_healing', label: 'Slow Wound / Cut Healing' },
    { key: 'muscle_stiffness', label: 'Muscle Stiffness / Cramping' },
    { key: 'alopecia', label: 'Noticeable Hair Thinning (Alopecia)' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Acute Symptom-Based Triage</h1>
            <p className="text-xs text-slate-500">Track 3: UCI Clinical Outpatient Symptoms • Calibrated Random Forest</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-2.5 mt-4">
          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Critical Research Notice:</strong> Classic symptoms like Polyuria and Polydipsia are physiological consequences of high glucose levels, not pre-disease predictors. This module identifies active symptomatic presentation for immediate clinical evaluation.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              min="16"
              max="95"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Biological Sex</label>
            <div className="flex items-center space-x-2 pt-0.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 0 })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  formData.gender === 0
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>👩 Female</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 1 })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  formData.gender === 1
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>👨 Male</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Check Any Presenting Symptoms:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {symptomList.map((item) => {
              const isChecked = formData[item.key] === 1;
              return (
                <div
                  key={item.key}
                  onClick={() => toggleSymptom(item.key)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                    isChecked
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex-1 pr-2">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl flex items-center shadow-md disabled:opacity-50 transition"
          >
            {loading ? 'Evaluating Symptoms...' : 'Run Symptom Triage Evaluation'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SymptomAssessment;

