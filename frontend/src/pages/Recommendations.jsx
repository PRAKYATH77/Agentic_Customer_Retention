import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ShoppingBag, ArrowRight, Filter, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { translateCategory } from '../utils/translations';

const Recommendations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPersona, setSelectedPersona] = useState(searchParams.get('persona') || '');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (selectedPersona) {
      setSearchParams({ persona: selectedPersona });
    } else {
      setSearchParams({});
    }
  }, [selectedPersona, setSearchParams]);
  
  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => (await api.get('/personas')).data
  });

  const { data: rules, isLoading } = useQuery({
    queryKey: ['aprioriRules', selectedPersona],
    queryFn: async () => (await api.get(`/apriori-rules${selectedPersona ? `?persona=${selectedPersona}` : ''}`)).data
  });

  // Unique list of products for demo UI purposes
  const allProducts = Array.from(new Set(rules?.flatMap(r => [...r.antecedents, ...r.consequents]) || []));

  const filteredRules = rules?.filter(rule => 
    !selectedProduct || 
    rule.antecedents.includes(selectedProduct) || 
    rule.consequents.includes(selectedProduct)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Product Recommendations</h1>
          <p className="text-gray-400">Apriori association rules discovered per customer segment</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 appearance-none pr-8"
            >
              <option value="">All Personas</option>
              {personas?.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="glass-card lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="pb-3 font-medium px-4">If they buy...</th>
                  <th className="pb-3 font-medium px-4">They also buy...</th>
                  <th className="pb-3 font-medium px-4 text-center">Confidence</th>
                  <th className="pb-3 font-medium px-4 text-center">Lift (Multiplier)</th>
                  <th className="pb-3 font-medium px-4">Segment</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-500">Loading rules...</td></tr>
                ) : filteredRules?.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-500">No rules found for this selection.</td></tr>
                ) : filteredRules?.map((rule) => (
                  <tr key={rule._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {rule.antecedents.map((item, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-300 text-xs">
                            {translateCategory(item)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <ArrowRight size={16} className="text-gray-600" />
                        <div className="flex flex-wrap gap-1">
                          {rule.consequents.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded text-xs">
                              {translateCategory(item)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-gray-300">{(rule.confidence * 100).toFixed(1)}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono text-xs">
                        {rule.lift.toFixed(2)}x
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {rule.persona.replace(' Customers', '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="text-indigo-400" /> Top Categories
            </h3>
            <div className="space-y-3">
              {allProducts.slice(0, 8).map((product, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedProduct(selectedProduct === product ? null : product)}
                  className={`flex items-center justify-between text-sm p-2 rounded cursor-pointer transition-colors ${selectedProduct === product ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-gray-800/50 border border-transparent'}`}
                >
                  <span className={`capitalize ${selectedProduct === product ? 'text-indigo-300 font-medium' : 'text-gray-300'}`}>{translateCategory(product)}</span>
                  <span className={`text-xs ${selectedProduct === product ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
                    {selectedProduct === product ? 'Clear Filter' : 'View Rules'}
                  </span>
                </div>
              ))}
              {allProducts.length === 0 && !isLoading && (
                <div className="text-sm text-gray-500">No categories found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
