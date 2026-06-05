import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Users, TrendingUp, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const KPICard = ({ title, value, subtitle, icon, colorClass, loading }) => (
  <div className="glass-card relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass}`}></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">
          {loading ? <div className="h-9 w-24 bg-gray-800 rounded animate-pulse"></div> : value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-20 text-').replace('500', '400')}`}>
        {icon}
      </div>
    </div>
    <p className="text-sm text-gray-500">{loading ? 'Loading...' : subtitle}</p>
  </div>
);

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueByPersona'],
    queryFn: async () => (await api.get('/dashboard/revenue-by-persona')).data
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthlyTrend'],
    queryFn: async () => (await api.get('/dashboard/monthly-trend')).data
  });

  const { data: recentActions, isLoading: actionsLoading } = useQuery({
    queryKey: ['recentActions'],
    queryFn: async () => (await api.get('/dashboard/recent-actions')).data
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Executive Dashboard</h1>
          <p className="text-gray-400">Overview of customer intelligence and agent performance</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Customers" 
          value={stats ? formatNumber(stats.totalCustomers) : 0} 
          subtitle="Across 6 persona segments"
          icon={<Users size={24} className="text-indigo-400" />}
          colorClass="bg-indigo-500"
          loading={statsLoading}
        />
        <KPICard 
          title="Total Est. Revenue" 
          value={stats ? formatCurrency(stats.totalRevenue) : 0} 
          subtitle="Based on avg. monetary value"
          icon={<DollarSign size={24} className="text-emerald-400" />}
          colorClass="bg-emerald-500"
          loading={statsLoading}
        />
        <KPICard 
          title="Avg. CLV Score" 
          value={stats ? stats.avgClv : 0} 
          subtitle="Customer Lifetime Value index"
          icon={<TrendingUp size={24} className="text-cyan-400" />}
          colorClass="bg-cyan-500"
          loading={statsLoading}
        />
        <KPICard 
          title="High Churn Risk" 
          value={stats ? `${stats.churnRate}%` : '0%'} 
          subtitle="Critical intervention required"
          icon={<AlertTriangle size={24} className="text-red-400" />}
          colorClass="bg-red-500"
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Persona Chart */}
        <div className="glass-card lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Revenue by Segment</h3>
          <div className="h-72 w-full">
            {revenueLoading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#1f2937', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Actions Feed */}
        <div className="glass-card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Agent Activity</h3>
            <Activity size={18} className="text-indigo-400" />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {actionsLoading ? (
               <div className="text-gray-500 text-center py-8">Loading feed...</div>
            ) : recentActions?.slice(0, 5).map((action, i) => (
              <div key={i} className="flex gap-4 items-start p-3 rounded-lg hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700/50">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${action.priority === 'high' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : action.priority === 'medium' ? 'bg-yellow-400' : 'bg-cyan-400'}`}></div>
                <div>
                  <p className="text-sm text-gray-200 font-medium mb-1">{action.actionType}</p>
                  <p className="text-xs text-gray-400 mb-2">Targeting: <span className="text-indigo-300">{action.persona}</span></p>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                    <span>Reward: <span className={action.expectedNetReward >= 0 ? 'text-emerald-400' : 'text-red-400'}>{action.expectedNetReward}</span></span>
                    <span>Cost: ${action.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="glass-card lg:col-span-3">
          <h3 className="text-lg font-bold text-white mb-6">Customer Growth Trend</h3>
          <div className="h-64 w-full">
            {monthlyLoading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                  <Area type="monotone" dataKey="customers" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCustomers)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
