import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle,
  FileText, Printer, Utensils, Ban, Dumbbell, Activity, Info, Heart,
  Check, X, Droplet, Sparkles, BookOpen, Clock, Stethoscope
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import { GlassButton } from '../components/GlassButton';

const PredictionResults = () => {
  const location = useLocation();
  let result = location.state?.result;
  const [activeTab, setActiveTab] = useState('consume');

  if (!result && typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('latest_assessment');
      if (saved) {
        result = JSON.parse(saved);
      }
    } catch (e) {
      // ignore parse error
    }
  }

  if (!result) {
    return <Navigate to="/" replace />;
  }

  const trackTitles = {
    pima_clinical: 'Track 1: Clinical Laboratory Risk Assessment',
    cdc_lifestyle: 'Track 2: Non-Invasive Lifestyle Screening',
    uci_symptoms: 'Track 3: Acute Symptom Triage Evaluation',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {trackTitles[result.track_code] || result.track_code}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Screening Assessment Report</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identifier: <span className="font-mono text-slate-600">{result.assessment_id}</span> • Model: {result.model_name}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <GlassButton
            onClick={() => window.print()}
            variant="light"
            size="sm"
            className="rounded-xl font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print / Save PDF</span>
          </GlassButton>
          <GlassButton
            to="/"
            variant="light"
            size="sm"
            className="rounded-xl font-semibold shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Back to Dashboard</span>
          </GlassButton>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <RiskGauge
            probability={result.calibrated_probability}
            category={result.risk_category}
            confidenceInterval={result.confidence_interval}
          />
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-2">
              {result.calibrated_probability >= 0.5 ? (
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
              <span>Assessment Summary</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              The calibrated predictive model computed a score of{' '}
              <strong className="text-slate-900">{result.probability_percentage}%</strong> based on your input profile.
              Categorized under <strong className="text-primary-700">{result.risk_category}</strong>.
            </p>

            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-3">
              Recommended Next Steps & Clinical Guidance:
            </h4>
            <ul className="space-y-2.5">
              {result.recommended_next_steps?.map((step, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-700 font-bold flex items-center justify-center mr-2.5 flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Probability Calibration: Platt Sigmoid Applied</span>
            <span className="font-semibold text-emerald-600">ECE &lt; 0.05 Calibrated</span>
          </div>
        </div>
      </div>

      {/* Local Explainable AI Waterfall Section (PIMA Track) */}
      {result.top_contributing_factors && result.top_contributing_factors.length > 0 && (
        <ShapWaterfallChart
          factors={result.top_contributing_factors}
          baseValue={result.shap_base_value}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Personalized Diabetes Management, Nutrition & Action Plan
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evidence-Based Clinical Guidance (ADA & ICMR Guidelines)</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Personalized Diabetes Action & Lifestyle Guide
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clear recommendations for diet, foods to restrict, physical exercise, and how to interpret your medical test report
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              <Activity className="w-4 h-4 text-primary-600" />
              <span>Category: {result.risk_category}</span>
            </div>
          </div>

          {/* Navigation Tabs (GlassButton) */}
          <div className="flex flex-wrap gap-2 mt-6">
            <GlassButton
              onClick={() => setActiveTab('consume')}
              variant={activeTab === 'consume' ? 'success' : 'light'}
              size="sm"
              className="rounded-xl font-bold"
            >
              <Utensils className="w-3.5 h-3.5 mr-1.5" />
              <span>🥗 What to Consume</span>
            </GlassButton>

            <GlassButton
              onClick={() => setActiveTab('avoid')}
              variant={activeTab === 'avoid' ? 'warning' : 'light'}
              size="sm"
              className="rounded-xl font-bold"
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" />
              <span>🚫 What to Avoid</span>
            </GlassButton>

            <GlassButton
              onClick={() => setActiveTab('lifestyle')}
              variant={activeTab === 'lifestyle' ? 'primary' : 'light'}
              size="sm"
              className="rounded-xl font-bold"
            >
              <Dumbbell className="w-3.5 h-3.5 mr-1.5" />
              <span>🏃 Exercise & Daily Routine</span>
            </GlassButton>

            <GlassButton
              onClick={() => setActiveTab('labGuide')}
              variant={activeTab === 'labGuide' ? 'primary' : 'light'}
              size="sm"
              className="rounded-xl font-bold"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              <span>🔬 How to Read Your Lab Report</span>
            </GlassButton>

            <GlassButton
              onClick={() => setActiveTab('clinicalNext')}
              variant={activeTab === 'clinicalNext' ? 'warning' : 'light'}
              size="sm"
              className="rounded-xl font-bold"
            >
              <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
              <span>🩺 Clinical Next Steps</span>
            </GlassButton>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: WHAT TO CONSUME */}
          {activeTab === 'consume' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Nutritional Philosophy:</strong> Focus on foods with a <strong>Low Glycemic Index (GI &lt; 55)</strong>, high dietary fiber, lean proteins, and anti-inflammatory healthy fats. These slow carbohydrate absorption, prevent postprandial glucose spikes, and improve cellular insulin sensitivity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Complex Carbs & Fiber */}
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">1</span>
                    <h4>High-Fiber & Complex Carbohydrates</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Whole & Steel-Cut Oats:</strong> Rich in beta-glucan soluble fiber which blunts glucose absorption.</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Legumes & Pulses:</strong> Lentils (dal), chickpeas (chana), and kidney beans (rajma) providing sustained energy release.</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Quinoa & Barley:</strong> Nutrient-dense alternatives to refined white grains.</span></li>
                  </ul>
                </div>

                {/* Non-Starchy Vegetables */}
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
                    <h4>Non-Starchy & Leafy Green Vegetables</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Dark Leafy Greens:</strong> Spinach (palak), fenugreek (methi), kale — packed with magnesium and antioxidants.</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Cruciferous Veggies:</strong> Broccoli, cauliflower, cabbage, and Brussels sprouts.</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Functional Vegetables:</strong> Bitter gourd (karela) and bottle gourd (lauki) known for insulin-mimetic charantin compounds.</span></li>
                  </ul>
                </div>

                {/* Lean Proteins */}
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                    <h4>High-Satiety Lean Proteins</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Fatty Fish & Poultry:</strong> Salmon, mackerel, sardines (Omega-3 fatty acids) and skinless chicken breast.</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Plant Proteins:</strong> Tofu, tempeh, sprouted moong beans, and low-fat paneer (cottage cheese).</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Eggs:</strong> Whole boiled or poached eggs (high satiety with zero glycemic impact).</span></li>
                  </ul>
                </div>

                {/* Healthy Fats & Hydration */}
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">4</span>
                    <h4>Cardioprotective Fats & Hydration</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Raw Nuts & Seeds:</strong> Soaked almonds (8-10/day), walnuts, chia seeds, and ground flaxseeds.</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Healthy Cooking Oils:</strong> Extra virgin olive oil, cold-pressed mustard oil in controlled quantities.</span></li>
                    <li className="flex items-start"><Check className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Optimal Hydration:</strong> 2.5–3 liters of plain water daily; green tea or unsweetened cinnamon infusions.</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHAT TO AVOID */}
          {activeTab === 'avoid' && (
            <div className="space-y-6">
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Metabolic Warning:</strong> Foods with high simple sugars and refined starches trigger immediate hyperinsulinemia, exhaust pancreatic beta cells, and accelerate vascular microangiopathy. Strict reduction is critical for glycemic stability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Refined Sugars & Beverages */}
                <div className="border border-rose-200/80 rounded-xl p-4.5 bg-rose-50/30">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="text-rose-950">Simple Sugars & Sweetened Drinks</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Sugar-Sweetened Sodas & Colas:</strong> Contain high-fructose corn syrup which drives hepatic steatosis.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Packaged Fruit Juices:</strong> Stripped of dietary fiber, delivering a rapid glucose surge into circulation.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Commercial Sweets & Mithai:</strong> Traditional confections with concentrated refined sugar, condensed milk, and ghee.</span></li>
                  </ul>
                </div>

                {/* Ultra-Processed Carbs */}
                <div className="border border-rose-200/80 rounded-xl p-4.5 bg-rose-50/30">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="text-rose-950">Refined Starches & Ultra-Processed Carbs</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Refined Wheat Flour (Maida):</strong> White bread, naan, parathas, pizza crusts, and commercial burger buns.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Polished White Rice in High Volume:</strong> High GI carbohydrate that converts rapidly into blood glucose.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Instant Cereals & Pastries:</strong> Extruded breakfast cereals, muffins, and bakery goods.</span></li>
                  </ul>
                </div>

                {/* Trans & Saturated Fats */}
                <div className="border border-rose-200/80 rounded-xl p-4.5 bg-rose-50/30">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">3</span>
                    <h4 className="text-rose-950">Trans Fats & Deep-Fried Snacks</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Deep-Fried Street Foods:</strong> Samosas, pakoras, bhature, french fries, and potato chips fried in reused oil.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Hydrogenated Vegetable Oils (Vanaspati):</strong> Contain trans-fatty acids that worsen systemic insulin resistance.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Processed Deli Meats:</strong> Sausages, hot dogs, and cured meats high in sodium and chemical nitrates.</span></li>
                  </ul>
                </div>

                {/* Sedentary & Toxic Habits */}
                <div className="border border-rose-200/80 rounded-xl p-4.5 bg-rose-50/30">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">4</span>
                    <h4 className="text-rose-950">Habits That Impair Glucose Regulation</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Prolonged Sedentary Sitting (&gt;60 min uninterrupted):</strong> Inhibits lipoprotein lipase activity in skeletal muscle.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Heavy Alcohol Consumption:</strong> Disrupts hepatic gluconeogenesis and can induce erratic nocturnal hypoglycemia.</span></li>
                    <li className="flex items-start"><X className="w-3.5 h-3.5 text-rose-600 mr-2 flex-shrink-0 mt-0.5" /><span><strong>Smoking & Tobacco Chewing:</strong> Nicotine directly injures vascular endothelium and accelerates diabetic kidney and eye damage.</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXERCISE & DAILY ACTIONS */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
                <Dumbbell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Physiological Mechanism:</strong> Skeletal muscle is responsible for over <strong>80% of postprandial glucose clearance</strong>. Muscle contraction triggers the translocation of <strong>GLUT4 glucose transporters</strong> to the cell surface <em>independently of insulin</em>, providing an immediate non-pharmaceutical blood sugar lowering effect.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 150 min aerobic */}
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h4>150 Min / Week Aerobic</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Aim for 30 minutes of moderate aerobic activity 5 days per week:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Brisk walking (approx. 5 km/hr pace)</li>
                    <li>• Outdoor cycling or stationary bike</li>
                    <li>• Swimming or water aerobics</li>
                    <li>• Low-impact dance or elliptical trainer</li>
                  </ul>
                </div>

                {/* Resistance Training */}
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h4>Resistance Training (2-3x/wk)</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Stimulates myofibrillar hypertrophy and boosts baseline metabolic rate:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Bodyweight squats and wall sits</li>
                    <li>• Light dumbbells or resistance bands</li>
                    <li>• Push-ups (wall/incline/standard)</li>
                    <li>• Core strengthening (planks, bird-dog)</li>
                  </ul>
                </div>

                {/* Post-Meal Walks & Sleep */}
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2.5">
                    <Heart className="w-4 h-4 text-blue-600" />
                    <h4>Post-Meal Habit & Sleep</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Crucial daily micro-habits that directly modulate insulin sensitivity:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• <strong>10–15 min walk</strong> after lunch & dinner</li>
                    <li>• <strong>7–8 hours</strong> of consistent, restful sleep</li>
                    <li>• <strong>Stress reduction:</strong> 10 min daily deep breathing</li>
                    <li>• Break up sitting every 45 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO READ YOUR MEDICAL REPORT */}
          {activeTab === 'labGuide' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-indigo-900">
                <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Benchmark Guide:</strong> Understand your clinical laboratory blood tests and physiological metrics based on international diagnostic criteria (American Diabetes Association / WHO standards).
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Biomarker / Test Name</th>
                      <th className="px-4 py-3">Normal Reference</th>
                      <th className="px-4 py-3">Prediabetes (Impaired)</th>
                      <th className="px-4 py-3">Diabetes Diagnostic Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">Fasting Plasma Glucose (FPG)</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">&lt; 100 mg/dL</td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">100 – 125 mg/dL (IFG)</td>
                      <td className="px-4 py-3 text-rose-700 font-semibold">&ge; 126 mg/dL</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">Oral Glucose Tolerance (2-hr OGTT)</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">&lt; 140 mg/dL</td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">140 – 199 mg/dL (IGT)</td>
                      <td className="px-4 py-3 text-rose-700 font-semibold">&ge; 200 mg/dL</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">HbA1c (Glycated Hemoglobin)</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">&lt; 5.7%</td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">5.7% – 6.4%</td>
                      <td className="px-4 py-3 text-rose-700 font-semibold">&ge; 6.5%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">Body Mass Index (BMI)</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">18.5 – 24.9 kg/m²</td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">25.0 – 29.9 kg/m² (Overweight)</td>
                      <td className="px-4 py-3 text-rose-700 font-semibold">&ge; 30.0 kg/m² (Obese)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">Blood Pressure (Resting)</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">&lt; 120/80 mm Hg</td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">120–129 / &lt;80 mm Hg</td>
                      <td className="px-4 py-3 text-rose-700 font-semibold">&ge; 130/80 mm Hg (Hypertension)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
                <span className="font-bold text-slate-800">💡 Important Asian / Indian Demographic Context:</span>
                <p className="mt-1">
                  According to ICMR-INDIAB consensus guidelines, the Asian Indian population exhibits higher body fat percentages and abdominal visceral adiposity at lower BMI levels. Consequently, an Asian-specific overweight threshold of <strong>BMI &ge; 23 kg/m²</strong> and obesity threshold of <strong>BMI &ge; 25 kg/m²</strong> is clinically applied in regional practice.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: CLINICAL NEXT STEPS */}
          {activeTab === 'clinicalNext' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
                <Stethoscope className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Responsible Healthcare Protocol:</strong> An AI assessment is a screening risk indicator, NOT a clinical diagnosis. Always present these findings to an authorized medical doctor or endocrinologist who will order venous laboratory blood tests to confirm your glycemic profile.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <h4 className="font-bold text-sm text-slate-900 mb-2">1. Confirmatory Laboratory Tests</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• <strong>Venous Fasting Plasma Glucose (FPG):</strong> Minimum 8-10 hour overnight fast.</li>
                    <li>• <strong>Standardized HbA1c Test:</strong> Measures 90-day average glycemia.</li>
                    <li>• <strong>Fasting Lipid Profile:</strong> Total cholesterol, LDL, HDL, and triglycerides.</li>
                    <li>• <strong>Serum Creatinine & eGFR:</strong> Baseline renal filtration audit.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50">
                  <h4 className="font-bold text-sm text-slate-900 mb-2">2. Preventive Complication Screenings</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• <strong>Comprehensive Dilated Eye Exam:</strong> Annual fundus exam to check retinal microvasculature.</li>
                    <li>• <strong>Urine Microalbumin / Creatinine Ratio (UACR):</strong> Early detection of diabetic nephropathy.</li>
                    <li>• <strong>Comprehensive Foot Examination:</strong> Monofilament sensory testing and peripheral pulse check.</li>
                    <li>• <strong>Cardiovascular Risk Assessment:</strong> Electrocardiogram (ECG) and blood pressure audit.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3.5 text-xs text-amber-950">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sm text-amber-900">Responsible Healthcare Disclaimer</p>
          <p className="leading-relaxed text-amber-800">{result.disclaimer}</p>
          <p className="text-[11px] text-amber-700 italic pt-1">
            This application is an engineering research prototype for academic final-year demonstration. It does not replace medical consultation, clinical laboratory blood testing, or physician diagnosis.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
        <GlassButton
          to="/history"
          variant="light"
          size="sm"
          className="rounded-xl font-semibold shadow-sm"
        >
          <FileText className="w-4 h-4 mr-1.5" />
          <span>View in Assessment History Log</span>
        </GlassButton>
        <GlassButton
          to={result.track_code === 'pima_clinical' ? '/clinical' : result.track_code === 'cdc_lifestyle' ? '/lifestyle' : '/symptoms'}
          variant="primary"
          size="md"
          className="rounded-xl font-bold shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Repeat Assessment</span>
        </GlassButton>
      </div>
    </div>
  );
};

export default PredictionResults;

