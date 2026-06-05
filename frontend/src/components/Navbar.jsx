import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 z-20 bg-transparent border-b border-gray-800/50 backdrop-blur-md">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search customers, segments, campaigns..." 
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-full py-2.5 pl-12 pr-4 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-800"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-200">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 ml-2 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
