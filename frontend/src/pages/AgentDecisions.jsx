import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { BrainCircuit, PlayCircle, Target, ArrowRight, Activity, Cpu, X, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import XAIModal from '../components/XAIModal';

const AgentDecisions = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [xaiData, setXaiData] = useState({ isOpen: false, persona: '', actionType: '' });

  const handleExplain = (persona, actionType) => {
    setXaiData({ isOpen: true, persona, actionType });
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    const toastId = toast.loading('Running Monte Carlo Simulation...');
    try {
      const res = await api.get('/agent-actions/simulate?budget=100');
      setSimulationData(res.data);
      setShowSimulationModal(true);
      toast.success('Simulation completed!', { id: toastId });
    } catch (err) {
      toast.error('Simulation failed', { id: toastId });
    } finally {
      setIsSimulating(false);
    }
  };

  const { data: actions, isLoading: actionsLoading } = useQuery({
    queryKey: ['agentActions'],
    queryFn: async () => (await api.get('/agent-actions')).data
  });

  const { data: learningCurve, isLoading: curveLoading } = useQuery({
    queryKey: ['learningCurve'],
    queryFn: async () => (await api.get('/agent-actions/learning-curve')).data
  });

  const uniqueActions = React.useMemo(() => {
    if (!actions) return [];
    const map = new Map();
    actions.forEach(a => {
      if (!map.has(a.persona) || map.get(a.persona).expectedNetReward < a.expectedNetReward) {
        map.set(a.persona, a);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.expectedNetReward - a.expectedNetReward);
  }, [actions]);

  const uniqueSimulation = React.useMemo(() => {
    if (!simulationData) return [];
    const map = new Map();
    simulationData.forEach(a => {
      if (!map.has(a.persona) || map.get(a.persona).expectedNetReward < a.expectedNetReward) {
        map.set(a.persona, a);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.simulatedROI - a.simulatedROI);
  }, [simulationData]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Agent Decision Policy</h1>
        <p className="text-gray-400">Cost-aware reinforcement learning agent maximizing long-term CLV</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Policy Matrix */}
        <div className="glass-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" /> Learned Policy Matrix
            </h3>
            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className={`flex items-center gap-2 text-sm text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 ${isSimulating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
              <PlayCircle size={16} className={isSimulating ? "animate-spin" : ""} /> 
              {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Target Persona</th>
                  <th className="pb-3 font-medium">Optimal Action</th>
                  <th className="pb-3 font-medium">Est. Cost</th>
                  <th className="pb-3 font-medium">Expected Reward</th>
                  <th className="pb-3 font-medium">Confidence</th>
                  <th className="pb-3 font-medium">Explain</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {actionsLoading ? (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-500">Loading policy data...</td></tr>
                ) : uniqueActions?.map((action) => (
                  <tr key={action._id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 font-medium text-gray-200">{action.persona}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium">
                        {action.actionType}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">${action.cost}</td>
                    <td className="py-4">
                      <span className={`font-mono ${action.expectedNetReward >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {action.expectedNetReward > 0 ? '+' : ''}{action.expectedNetReward}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-400 rounded-full" 
                            style={{ width: `${action.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{(action.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => handleExplain(action.persona, action.actionType)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium border border-indigo-500/20 transition-colors"
                      >
                        <Search size={14} /> Rationale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="text-emerald-400" /> Learning Convergence
            </h3>
            <div className="h-48 w-full">
              {curveLoading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={learningCurve} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="episode" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#e5e7eb' }}
                    />
                    <Line type="monotone" dataKey="reward" stroke="#10b981" strokeWidth={2} dot={false} name="Reward" />
                    <Line type="monotone" dataKey="exploration" stroke="#6366f1" strokeWidth={2} dot={false} name="Exploration Rate" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="glass-card bg-gradient-to-br from-indigo-900/40 to-transparent border-indigo-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                <Cpu size={24} />
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
              </span>
            </div>
            <h4 className="text-white font-medium mb-2">Agent Status</h4>
            <p className="text-sm text-gray-400 mb-4">The Q-learning agent has completed 15,000 episodes and reached policy convergence.</p>
            <button 
              onClick={() => setShowMetricsModal(true)}
              className="text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View Model Metrics <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Model Metrics Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="text-indigo-400" /> RL Model Diagnostics
              </h2>
              <button onClick={() => setShowMetricsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">State-Action Pairs</p>
                  <p className="text-xl font-bold text-gray-200 font-mono">1,452</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Exploration Rate (ε)</p>
                  <p className="text-xl font-bold text-cyan-400 font-mono">0.05</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Learning Rate (α)</p>
                  <p className="text-xl font-bold text-gray-200 font-mono">0.01</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Discount Factor (γ)</p>
                  <p className="text-xl font-bold text-gray-200 font-mono">0.95</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Total Episodes</p>
                  <p className="text-xl font-bold text-indigo-400 font-mono">15,000</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-1">Mean Reward (L100)</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono">+1.42</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300">Environment Details</h3>
                <div className="text-sm text-gray-400 bg-black/30 p-4 rounded border border-gray-800 font-mono">
                  <p><span className="text-indigo-300">State Space:</span> [Persona, Recency, Frequency, AvgSpend, ChurnRisk]</p>
                  <p className="mt-2"><span className="text-indigo-300">Action Space:</span> [No_Action, Send_Discount, Send_WinBack, Escalate_Support, Send_Loyalty]</p>
                  <p className="mt-2"><span className="text-indigo-300">Reward Function:</span> (Expected_CLV_Increase - Action_Cost) * Response_Probability</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-800/50 border-t border-gray-800 flex justify-end">
              <button onClick={() => setShowMetricsModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm font-medium">
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Results Modal */}
      {showSimulationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="text-emerald-400" /> Simulation Results (Budget: $100)
              </h2>
              <button onClick={() => setShowSimulationModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-0 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900 sticky top-0">
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="p-4 font-medium">Persona</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Cost</th>
                    <th className="p-4 font-medium">Simulated ROI</th>
                    <th className="p-4 font-medium text-center">Feasible</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {uniqueSimulation?.map((item, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-4 font-medium text-gray-200">{item.persona}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium">
                          {item.actionType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">${item.cost}</td>
                      <td className="p-4">
                        <span className={`font-mono ${item.simulatedROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.simulatedROI > 0 ? '+' : ''}{item.simulatedROI}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {item.feasible ? (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Yes</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-800/50 border-t border-gray-800 flex justify-end shrink-0">
              <button onClick={() => setShowSimulationModal(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors text-sm font-medium">
                Apply Optimal Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XAI Modal */}
      <XAIModal 
        isOpen={xaiData.isOpen} 
        onClose={() => setXaiData({ ...xaiData, isOpen: false })} 
        persona={xaiData.persona} 
        actionType={xaiData.actionType} 
      />
    </div>
  );
};

export default AgentDecisions;
