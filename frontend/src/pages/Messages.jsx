import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { MessageSquareText, Copy, ThumbsUp, Send, UserCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Messages = () => {
  const [selectedPersona, setSelectedPersona] = useState('');

  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => (await api.get('/personas')).data
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', selectedPersona],
    queryFn: async () => (await api.get(`/messages${selectedPersona ? `?persona=${selectedPersona}` : ''}`)).data
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard');
  };

  const getToneIcon = (tone) => {
    switch (tone) {
      case 'positive': return <ThumbsUp size={14} className="text-emerald-400" />;
      case 'urgent': return <Zap size={14} className="text-yellow-400" />;
      default: return <UserCheck size={14} className="text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">AI Message Studio</h1>
          <p className="text-gray-400">LLM-generated personalized marketing communications</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedPersona('')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedPersona === '' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            All Segments
          </button>
          {personas?.map(p => (
            <button 
              key={p._id}
              onClick={() => setSelectedPersona(p.name)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border border-transparent ${
                selectedPersona === p.name 
                  ? 'bg-gray-800 text-white border-gray-600 shadow-lg' 
                  : 'bg-gray-900/50 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
              }`}
              style={selectedPersona === p.name ? { borderColor: p.color, boxShadow: `0 4px 12px ${p.color}30` } : {}}
            >
              {p.name.split('/')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Generating message gallery...</div>
        ) : messages?.map((msg) => (
          <div key={msg._id} className="glass-card flex flex-col hover:-translate-y-1 transition-transform group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2.5 py-1 bg-gray-800 rounded-lg text-xs font-medium text-gray-300 border border-gray-700 flex items-center gap-1.5">
                {getToneIcon(msg.sentimentTone)}
                <span className="capitalize">{msg.sentimentTone}</span>
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wider ${
                msg.channel === 'email' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                msg.channel === 'sms' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                msg.channel === 'push' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {msg.channel}
              </span>
            </div>
            
            <p className="text-sm text-indigo-300 mb-2 font-medium">{msg.persona.split('/')[0].trim()}</p>
            
            <div className="flex-1 bg-gray-900/50 rounded-xl p-4 border border-gray-800/80 mb-4 relative group-hover:border-indigo-500/30 transition-colors">
              <MessageSquareText size={16} className="absolute top-4 right-4 text-gray-700" />
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "{msg.message}"
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-auto">
              <div className="text-xs text-gray-500">
                Score: <span className={msg.effectiveness > 70 ? 'text-emerald-400 font-medium' : 'text-yellow-400 font-medium'}>{msg.effectiveness}%</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCopy(msg.message)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
                <button 
                  className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                  title="Deploy message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
