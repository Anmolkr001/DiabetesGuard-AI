import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ClinicalAssessment from './pages/ClinicalAssessment';
import LifestyleAssessment from './pages/LifestyleAssessment';
import SymptomAssessment from './pages/SymptomAssessment';
import PredictionResults from './pages/PredictionResults';
import AssessmentHistory from './pages/AssessmentHistory';
import ModelAnalytics from './pages/ModelAnalytics';
import AboutResearch from './pages/AboutResearch';
import DiaCarePage from './pages/DiaCarePage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clinical" element={<ClinicalAssessment />} />
            <Route path="/lifestyle" element={<LifestyleAssessment />} />
            <Route path="/symptoms" element={<SymptomAssessment />} />
            <Route path="/results" element={<PredictionResults />} />
            <Route path="/history" element={<AssessmentHistory />} />
            <Route path="/analytics" element={<ModelAnalytics />} />
            <Route path="/about" element={<AboutResearch />} />
            <Route path="/diacare" element={<DiaCarePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

