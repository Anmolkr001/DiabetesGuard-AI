import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowRight, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { assessmentService } from '../services/api';
import { formatErrorMessage } from '../utils/formatError';

const ClinicalAssessment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [gender, setGender] = useState('female');
  const [formData, setFormData] = useState({
    pregnancies: 2,
    glucose: 140,
    blood_pressure: 80,
    skin_thickness: 25,
    insulin: 120,
    bmi: 31.5,
    diabetes_pedigree: 0.45,
    age: 40,
    gender: 'female',
  });

  const handleGenderChange = (selected) => {
    setGender(selected);
    setFormData((prev) => ({
      ...prev,
      gender: selected,
      pregnancies: selected === 'male' ? 0 : (prev.pregnancies === 0 ? 1 : prev.pregnancies),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await assessmentService.assessPima(formData);
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
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Clinical Laboratory Assessment</h1>
            <p className="text-xs text-slate-500">Track 1: PIMA Model Pipeline • Calibrated Stacking Ensemble + SHAP</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 flex items-start space-x-2.5 mt-4">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p>
            This track requires measured clinical data (oral glucose tolerance test, blood pressure, fasting/post-load insulin).
            Outputs a calibrated probability estimate with real-time SHAP feature attributions.
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
        {/* Biological Sex Selector (Female / Male) */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Patient Biological Sex
              </span>
              <span className="text-[11px] text-slate-500">
                Select patient biological sex to configure gender-specific clinical fields
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  gender === 'female'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>👩 Female</span>
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  gender === 'male'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>👨 Male</span>
              </button>
            </div>
          </div>

          {gender === 'male' && (
            <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Male Patient Assessment Active:</strong> The PIMA reference model was originally derived from a clinical cohort of adult females. For male evaluations, the pregnancy variable is automatically locked to <strong>0</strong> (non-applicable), and the risk score is evaluated via metabolic parameters (Glucose, BMI, Blood Pressure, Insulin, Age, and Genetic Pedigree).
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plasma Glucose (2-hr OGTT) [mg/dL]
            </label>
            <input
              type="number"
              name="glucose"
              value={formData.glucose}
              onChange={handleChange}
              min="40"
              max="350"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">Normal &lt;140, Impaired 140–199, Diabetic &ge;200</span>
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
            <span className="text-[11px] text-slate-400">Normal 18.5–24.9, Overweight 25–29.9, Obese &ge;30</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Diastolic Blood Pressure [mm Hg]
            </label>
            <input
              type="number"
              name="blood_pressure"
              value={formData.blood_pressure}
              onChange={handleChange}
              min="30"
              max="200"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Serum Insulin (2-Hour) [µU/mL]
            </label>
            <input
              type="number"
              name="insulin"
              value={formData.insulin}
              onChange={handleChange}
              min="5"
              max="900"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Triceps Skinfold Thickness [mm]
            </label>
            <input
              type="number"
              name="skin_thickness"
              value={formData.skin_thickness}
              onChange={handleChange}
              min="5"
              max="100"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Age [Years]
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="21"
              max="100"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">PIMA cohort is restricted to adults &ge;21</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Number of Pregnancies
            </label>
            {gender === 'female' ? (
              <input
                type="number"
                name="pregnancies"
                value={formData.pregnancies}
                onChange={handleChange}
                min="0"
                max="25"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            ) : (
              <div className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-600 flex items-center justify-between">
                <span className="font-semibold text-slate-700">0 (Not Applicable for Male)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">Locked</span>
              </div>
            )}
            <span className="text-[11px] text-slate-400">
              {gender === 'female' ? 'Total pregnancies (0 if none)' : 'Benchmarked at 0 for male screening'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Diabetes Pedigree Function Score
            </label>
            <input
              type="number"
              step="0.01"
              name="diabetes_pedigree"
              value={formData.diabetes_pedigree}
              onChange={handleChange}
              min="0.05"
              max="3.0"
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">Genetic pedigree score (standard average ~0.47)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center shadow-md disabled:opacity-50 transition"
          >
            {loading ? 'Evaluating Model & SHAP...' : 'Generate Clinical Risk Assessment'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClinicalAssessment;

