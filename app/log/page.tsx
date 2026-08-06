'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  Zap, 
  Utensils, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Calculator,
  PlusCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { 
  EmissionCategory, 
  EmissionFactor, 
  calculateEmissions, 
  getCategoryIcon, 
  getCategoryColor 
} from '@/lib/emissions';
import { dataService } from '@/lib/supabase/client';

export default function LogActivityPage() {
  const router = useRouter();
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<EmissionCategory>('TRANSPORT');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');

  useEffect(() => {
    async function loadData() {
      const factorsList = await dataService.getEmissionFactors();
      setFactors(factorsList);
      
      // Default to first activity in TRANSPORT
      const transportFactors = factorsList.filter(f => f.category === 'TRANSPORT');
      if (transportFactors.length > 0) {
        setSelectedActivity(transportFactors[0].activity_type);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter factors for chosen category
  const categoryFactors = factors.filter(f => f.category === selectedCategory);
  
  // Current active factor
  const activeFactor = categoryFactors.find(f => f.activity_type === selectedActivity) || categoryFactors[0];

  // Update selected activity when category changes
  const handleCategorySelect = (category: EmissionCategory) => {
    setSelectedCategory(category);
    const available = factors.filter(f => f.category === category);
    if (available.length > 0) {
      setSelectedActivity(available[0].activity_type);
    }
  };

  // Real-time calculation
  const numericQuantity = typeof quantity === 'number' ? quantity : 0;
  const calculated = activeFactor 
    ? calculateEmissions(selectedCategory, activeFactor.activity_type, numericQuantity, factors)
    : { co2e_kg: 0 };
  const estimatedCO2e = calculated.co2e_kg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFactor || numericQuantity <= 0) return;

    setSubmitting(true);
    try {
      const currentUser = await dataService.getCurrentUser();
      const userId = currentUser ? currentUser.id : 'demo-user-123';

      await dataService.addEmissionSource({
        category: selectedCategory,
        activity_type: activeFactor.activity_type,
        activity_label: activeFactor.activity_label,
        quantity: numericQuantity,
        unit: activeFactor.factor_unit,
        co2e_kg: estimatedCO2e,
        logged_at: new Date().toISOString()
      });

      setSuccessMsg(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Error logging activity:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { type: EmissionCategory; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { type: 'TRANSPORT', label: 'Transport', icon: Car, color: 'bg-blue-500', desc: 'Car travel, flights, transit' },
    { type: 'ENERGY', label: 'Energy', icon: Zap, color: 'bg-amber-500', desc: 'Electricity, heating, gas' },
    { type: 'FOOD', label: 'Food', icon: Utensils, color: 'bg-emerald-500', desc: 'Dietary consumption' },
    { type: 'WASTE', label: 'Waste', icon: Trash2, color: 'bg-purple-500', desc: 'Landfill, recycling, compost' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-theme flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Log Activity
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Record a daily activity to measure and update your carbon footprint in real-time.
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-sm">Activity logged successfully! Redirecting to Dashboard...</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 border border-gray-200 dark:border-zinc-800 text-center animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading activity factors...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Category Selection */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Activity Category
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => handleCategorySelect(cat.type)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col items-start space-y-3 ${
                        isSelected 
                          ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20' 
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${cat.color} text-white flex items-center justify-center shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {cat.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Activity Details & Quantity */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Enter Activity Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Activity Type
                  </label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categoryFactors.map(f => (
                      <option key={f.id} value={f.activity_type}>
                        {f.activity_label} ({f.factor_value} kg CO2e / {f.factor_unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Quantity ({activeFactor?.factor_unit || 'units'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 25"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      required
                      className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-gray-400 dark:text-gray-500 uppercase font-medium">
                      {activeFactor?.factor_unit}
                    </span>
                  </div>
                </div>
              </div>

              {activeFactor?.source_reference && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span>Factor Benchmark Source: {activeFactor.source_reference}</span>
                </div>
              )}
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-800/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Instant Impact Estimate
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold tabular-nums mt-0.5 text-white">
                    {estimatedCO2e.toFixed(2)}{' '}
                    <span className="text-lg font-normal text-emerald-200">kg CO₂e</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || numericQuantity <= 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {submitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Log Activity</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
