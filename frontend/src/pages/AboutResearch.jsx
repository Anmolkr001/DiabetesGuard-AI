import React from 'react';
import { BookOpen, ShieldAlert, Users, Award, ExternalLink, Globe } from 'lucide-react';

const AboutResearch = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About & Research Documentation</h1>
        <p className="text-sm text-slate-500 mt-1">
          DiabetesGuard AI — Final Year B.Tech Information Technology Capstone Project
        </p>
      </div>

      {/* Critical Scientific Distinction */}
      <section className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-blue-900 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          <h2>Critical Distinction: Existing Status vs. Future Risk</h2>
        </div>
        <p className="text-xs text-blue-950 leading-relaxed">
          In healthcare machine learning literature, existing diabetes-status classification and future diabetes-risk prediction are frequently conflated.
          <strong> Existing-status classification</strong> uses current cross-sectional metrics (glucose, BMI, lifestyle, or symptoms) to estimate the likelihood of active disease.
          <strong> Prospective future-risk prediction</strong> requires longitudinal cohort tracking over multiple years with subjects initially free of disease.
          This platform strictly presents its models as <em>cross-sectional screening estimators</em>, maintaining scientific correctness.
        </p>
      </section>

      {/* Indian Population Data Availability Investigation */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
          <Globe className="w-5 h-5 text-primary-600" />
          <h2>Indian Population Diabetes Data Investigation</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          As part of the research scope, we investigated the availability of legitimate Indian diabetes datasets:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1">ICMR-INDIAB Study</h4>
            <p className="text-slate-600">
              Large-scale epidemiological study published by ICMR. Provides state-wise aggregate prevalence figures, but individual-level clinical microdata is strictly restricted under institutional data-sharing agreements.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1">NFHS (National Family Health Survey)</h4>
            <p className="text-slate-600">
              Contains self-reported chronic disease questions across nationwide households, but lacks detailed biochemical lab measurements (fasting insulin, OGTT 2-hr curves) needed for clinical modeling.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 italic">
          <strong>Research Note on PIMA:</strong> The PIMA Indians dataset concerns adult women of Pima heritage in Arizona, USA. It must NEVER be conflated as representative of the Indian subcontinent population.
        </p>
      </section>

      {/* Implemented Research Contributions */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Implemented Research Contributions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Contribution 1</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1 mb-2">Stacking Ensemble Learning</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesized predictions from Logistic Regression, Random Forest, XGBoost, and SVM using out-of-fold probability meta-features without training leakage.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Contribution 2</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1 mb-2">Probability Calibration</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applied Sigmoid (Platt) calibration to ensure that calculated percentages faithfully represent empirical event frequencies, reducing ECE to under 0.05.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Contribution 3</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1 mb-2">Explainable AI with SHAP</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrated exact TreeExplainer Shapley attributions, providing both population-level beeswarm charts and local patient-specific waterfall explanations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutResearch;

