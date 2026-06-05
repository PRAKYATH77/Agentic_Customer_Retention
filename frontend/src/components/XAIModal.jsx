import React, { useState, useEffect } from 'react';
import { X, Network, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const XAIModal = ({ isOpen, onClose, persona, actionType }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && persona && actionType) {
      setLoading(true);
      setError(null);
      api.post('/xai/explain', { persona, actionType })
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load XAI rationale. Is the Python API running?');
          setLoading(false);
        });
    }
  }, [isOpen, persona, actionType]);

  if (!isOpen) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 font-medium mb-1">{data.feature}</p>
          <p className={`font-mono font-bold ${data.value > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            Contribution: {data.value > 0 ? '+' : ''}{(data.value * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="text-indigo-400" /> Explainable AI (XAI) Rationale
            </h2>
            <p className="text-sm text-gray-400 mt-1">Interpreting the Reinforcement Learning Policy</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Target Persona</span>
              <p className="text-lg font-medium text-gray-200 mt-1">{persona}</p>
            </div>
            <div className="flex-1 bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-4">
              <span className="text-xs text-indigo-400/70 uppercase tracking-wider font-semibold">Selected Action</span>
              <p className="text-lg font-bold text-indigo-300 mt-1 capitalize">{actionType.replace('_', ' ')}</p>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" /> Feature Importance (SHAP Values)
          </h3>

          <div className="h-72 w-full bg-black/20 rounded-xl p-4 border border-gray-800">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Querying Python API...</span>
              </div>
            ) : error ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-red-400 gap-2">
                <AlertCircle size={24} />
                <span>{error}</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[-1, 1]} />
                  <YAxis dataKey="feature" type="category" stroke="#6b7280" tick={{ fill: '#d1d5db', fontSize: 12 }} width={120} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937', opacity: 0.4 }} />
                  <ReferenceLine x={0} stroke="#4b5563" />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {!loading && !error && (
            <div className="mt-6 bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200/80 leading-relaxed flex items-start gap-3">
              <TrendingUp className="text-blue-400 shrink-0 mt-0.5" size={18} />
              <p>
                <strong>Interpretation:</strong> Features with positive green bars increased the Q-Value (expected reward) for this action, while negative red bars decreased it. The agent chose this action because the net positive feature contributions outweighed the negative costs and risks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default XAIModal;
