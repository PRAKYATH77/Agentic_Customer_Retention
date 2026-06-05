import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BrainCircuit, ShoppingBag, MessageSquareText, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Segments', path: '/segments', icon: <Users size={20} /> },
    { name: 'Agent Policy', path: '/agent-decisions', icon: <BrainCircuit size={20} /> },
    { name: 'Recommendations', path: '/recommendations', icon: <ShoppingBag size={20} /> },
    { name: 'AI Messages', path: '/messages', icon: <MessageSquareText size={20} /> },
  ];

  return (
    <div className="w-64 bg-[#0B1120] border-r border-gray-800 flex flex-col z-20 shadow-2xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <BrainCircuit size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          AgentMind
        </h1>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4">
        <div className="glass-card p-4 rounded-xl text-sm border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-gray-300">
            <Settings size={16} />
            <span className="font-medium">System Status</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">RL Agent</span>
            <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
