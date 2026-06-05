import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Users, TrendingUp, TrendingDown, Minus, Crown, Heart, Moon, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getIcon = (iconName) => {
  switch(iconName) {
    case 'crown': return <Crown size={24} />;
    case 'trending-up': return <TrendingUp size={24} />;
    case 'heart': return <Heart size={24} />;
    case 'moon': return <Moon size={24} />;
    case 'alert-triangle': return <AlertTriangle size={24} />;
    case 'x-circle': return <XCircle size={24} />;
    default: return <Users size={24} />;
  }
};

const Segments = () => {
  const navigate = useNavigate();
  const { data: personas, isLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => (await api.get('/personas')).data
  });

  if (isLoading) return <div className="text-gray-400 p-8">Loading customer segments...</div>;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Customer Segments</h1>
        <p className="text-gray-400">Behavioral clustering using RFM and KMeans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas?.map((persona) => (
          <div key={persona._id} className="glass-card relative group hover:-translate-y-1 transition-transform">
            <div 
              className="absolute top-0 left-0 w-1 h-full rounded-l-xl opacity-80"
              style={{ backgroundColor: persona.color }}
            ></div>
            
            <div className="flex justify-between items-start mb-4">
              <div 
                className="p-3 rounded-xl bg-opacity-10"
                style={{ backgroundColor: `${persona.color}20`, color: persona.color }}
              >
                {getIcon(persona.icon)}
              </div>
              <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-gray-800/50">
                {persona.trend === 'up' && <TrendingUp size={14} className="text-emerald-400" />}
                {persona.trend === 'down' && <TrendingDown size={14} className="text-red-400" />}
                {persona.trend === 'stable' && <Minus size={14} className="text-gray-400" />}
                <span className={persona.trend === 'down' ? 'text-red-400' : persona.trend === 'up' ? 'text-emerald-400' : 'text-gray-400'}>
                  {Math.abs(persona.trendValue)}%
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{persona.name}</h3>
            <p className="text-sm text-gray-400 mb-6 line-clamp-2 h-10">{persona.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Population</p>
                <p className="text-lg font-bold text-gray-200">{persona.count.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Avg Spend</p>
                <p className="text-lg font-bold text-gray-200">${persona.avgMonetary.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Recency (Days)</span>
                <span className="text-gray-300 font-medium">{persona.avgRecency}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Frequency (Orders)</span>
                <span className="text-gray-300 font-medium">{persona.avgFrequency}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Churn Risk</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${persona.churnRisk}%`,
                        backgroundColor: persona.churnRisk > 70 ? '#EF4444' : persona.churnRisk > 40 ? '#F59E0B' : '#10B981'
                      }}
                    ></div>
                  </div>
                  <span className={`font-medium ${persona.churnRisk > 70 ? 'text-red-400' : persona.churnRisk > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {persona.churnRisk}%
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate(`/recommendations?persona=${encodeURIComponent(persona.name)}`)}
              className="w-full mt-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium text-white transition-colors"
            >
              Explore Segment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Segments;
