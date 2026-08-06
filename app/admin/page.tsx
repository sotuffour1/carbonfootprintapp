'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  Database, 
  Layers, 
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { 
  EmissionFactor, 
  EmissionCategory, 
  getCategoryColor 
} from '@/lib/emissions';
import { dataService } from '@/lib/supabase/client';

export default function AdminPage() {
  const router = useRouter();
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // New factor form state
  const [newCategory, setNewCategory] = useState<EmissionCategory>('TRANSPORT');
  const [newActivityType, setNewActivityType] = useState('');
  const [newActivityLabel, setNewActivityLabel] = useState('');
  const [newFactorValue, setNewFactorValue] = useState<number>(0.1);
  const [newUnit, setNewUnit] = useState('km');
  const [newSourceRef, setNewSourceRef] = useState('DEFRA 2024');

  useEffect(() => {
    async function loadData() {
      const u = await dataService.getCurrentUser();
      setUser(u);
      
      // Note: If user is not admin in live Supabase, optional redirect or notice
      const list = await dataService.getEmissionFactors();
      setFactors(list);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStartEdit = (f: EmissionFactor) => {
    setEditingId(f.id);
    setEditValue(f.factor_value);
  };

  const handleSaveEdit = async (id: string) => {
    await dataService.updateEmissionFactor(id, { factor_value: editValue });
    setFactors(prev => prev.map(f => f.id === id ? { ...f, factor_value: editValue } : f));
    setEditingId(null);
  };

  const handleAddFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityType || !newActivityLabel) return;

    const newF = await dataService.addEmissionFactor({
      category: newCategory,
      activity_type: newActivityType.toLowerCase().replace(/\s+/g, '_'),
      activity_label: newActivityLabel,
      factor_value: newFactorValue,
      factor_unit: newUnit,
      source_reference: newSourceRef,
    });

    setFactors(prev => [...prev, newF]);
    setShowAddModal(false);
    // Reset form
    setNewActivityType('');
    setNewActivityLabel('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-theme flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs uppercase tracking-wider">
                Admin Control Portal
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
              Emission Factors Registry
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage benchmark emission factors dynamically. Adding or updating factors here immediately updates calculations across all users without code deployments.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-md transition-all flex items-center space-x-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Factor</span>
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-4 sm:p-6 text-purple-900 dark:text-purple-200 flex items-start space-x-3 text-xs sm:text-sm">
          <Database className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Zero-Code Expansion Design:</span> All activity types (e.g., EV charging, solar energy, vegan meal, compost) derive their CO₂e multipliers dynamically from this `emission_factors` table.
          </div>
        </div>

        {/* Factors Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Active Factor Benchmarks ({factors.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading factors...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-zinc-800/60 text-gray-500 dark:text-gray-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Category</th>
                    <th className="px-4 py-3">Activity Label</th>
                    <th className="px-4 py-3">System Key</th>
                    <th className="px-4 py-3">Factor Value (kg CO₂e)</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Reference Source</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {factors.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(f.category)}`}>
                          <span>{f.category}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                        {f.activity_label}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {f.activity_type}
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-900 dark:text-white tabular-nums">
                        {editingId === f.id ? (
                          <input
                            type="number"
                            step="0.001"
                            value={editValue}
                            onChange={(e) => setEditValue(parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 border border-purple-500 rounded bg-white dark:bg-zinc-800 text-sm font-bold focus:outline-none"
                          />
                        ) : (
                          <span>{f.factor_value}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium">
                        / {f.factor_unit}
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {f.source_reference || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {editingId === f.id ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleSaveEdit(f.id)}
                              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(f)}
                            className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                            title="Edit Factor Value"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add New Emission Factor
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddFactor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EmissionCategory)}
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="ENERGY">ENERGY</option>
                    <option value="FOOD">FOOD</option>
                    <option value="WASTE">WASTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Activity Display Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electric Scooter"
                    value={newActivityLabel}
                    onChange={(e) => setNewActivityLabel(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    System Identifier Key
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. electric_scooter"
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Factor Value (kg CO₂e)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newFactorValue}
                      onChange={(e) => setNewFactorValue(parseFloat(e.target.value))}
                      required
                      className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="km, kWh, kg"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Benchmark Reference Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DEFRA 2024 / EPA 2023"
                    value={newSourceRef}
                    onChange={(e) => setNewSourceRef(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-md"
                  >
                    Create Factor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
