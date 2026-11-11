import React, { useEffect, useState } from 'react';
import { History, FileText, Filter } from 'lucide-react';
import { assessmentService } from '../services/api';

const AssessmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await assessmentService.getHistory();
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = filter === 'all'
    ? history
    : history.filter((item) => item.track_code === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <History className="w-6 h-6 mr-2 text-primary-600" />
            Assessment History & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Persisted assessment records stored in database with calibrated predictions and metadata
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="all">All Tracks</option>
            <option value="pima_clinical">Clinical (PIMA)</option>
            <option value="cdc_lifestyle">Lifestyle (CDC)</option>
            <option value="uci_symptoms">Symptoms (UCI)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No assessment records match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">UUID</th>
                  <th className="py-3.5 px-4">Track</th>
                  <th className="py-3.5 px-4">Calibrated Probability</th>
                  <th className="py-3.5 px-4">Risk Category</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((row) => (
                  <tr key={row.assessment_uuid} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {row.assessment_uuid.substring(0, 13)}...
                    </td>
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
                      {new Date(row.created_at).toLocaleString()}
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

export default AssessmentHistory;

