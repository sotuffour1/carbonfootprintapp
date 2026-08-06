'use client';

import React, { useEffect, useState } from 'react';
import { 
  Car, 
  Zap, 
  Utensils, 
  Trash2, 
  Filter, 
  Calendar, 
  Trash, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles,
  ArrowUpDown,
  Search
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { 
  EmissionSource, 
  EmissionCategory, 
  getCategoryIcon, 
  getCategoryColor 
} from '@/lib/emissions';
import { dataService } from '@/lib/supabase/client';

export default function HistoryPage() {
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: 'USER' | 'ADMIN' } | null>(null);

  useEffect(() => {
    async function loadData() {
      const u = await dataService.getCurrentUser();
      setUser(u);
      const data = await dataService.getEmissionSources();
      setSources(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity log?')) return;
    await dataService.deleteEmissionSource(id);
    setSources(prev => prev.filter(s => s.id !== id));
  };

  // Filter sources
  const filteredSources = sources.filter(s => {
    const matchesCategory = filterCategory === 'ALL' || s.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      (s.activity_label || s.activity_type).toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTotalCO2 = filteredSources.reduce((sum, s) => sum + s.co2e_kg, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-theme flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name || 'Jane Doe'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  user?.role === 'ADMIN' 
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' 
                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {user?.role || 'USER'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {user?.email || 'eco.user@example.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Logs</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{sources.length}</div>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-zinc-800" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Lifetime Impact</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {sources.reduce((a, b) => a + b.co2e_kg, 0).toFixed(1)} kg
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log Management Header & Controls */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Activity Log History
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Full ledger of recorded activities stored under the unified EmissionSource table.
              </p>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Categories</option>
                <option value="TRANSPORT">Transport</option>
                <option value="ENERGY">Energy</option>
                <option value="FOOD">Food</option>
                <option value="WASTE">Waste</option>
              </select>
            </div>
          </div>

          {/* Filter summary bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl">
            <span>Showing {filteredSources.length} of {sources.length} activity entries</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              Filtered Total: <span className="text-emerald-600 dark:text-emerald-400">{filteredTotalCO2.toFixed(2)} kg CO₂e</span>
            </span>
          </div>

          {/* Activity Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading activity history...</div>
          ) : filteredSources.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No activity entries found matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-zinc-800/60 text-gray-500 dark:text-gray-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Category</th>
                    <th className="px-4 py-3">Activity</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">CO₂e Impact</th>
                    <th className="px-4 py-3">Logged Date</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredSources.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}>
                          <span>{item.category}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                        {item.activity_label || item.activity_type}
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-900 dark:text-white tabular-nums">
                        {item.co2e_kg.toFixed(2)} kg
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(item.logged_at).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete entry"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
