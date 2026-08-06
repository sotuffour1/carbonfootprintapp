'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Leaf, 
  PlusCircle, 
  TrendingDown, 
  TrendingUp, 
  FileText, 
  Activity, 
  Car, 
  Zap, 
  Utensils, 
  Trash2,
  Sparkles,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import Navbar from '@/components/Navbar';
import { 
  EmissionSource, 
  EmissionCategory, 
  generateSuggestion,
  getCategoryColor
} from '@/lib/emissions';
import { dataService } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

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

  // Compute metrics
  const totalEmissionsKg = sources.reduce((acc, s) => acc + s.co2e_kg, 0);
  const totalEmissionsTonnes = totalEmissionsKg / 1000;

  // Breakdown by category
  const categoryTotals: Record<EmissionCategory, number> = {
    TRANSPORT: 0,
    ENERGY: 0,
    FOOD: 0,
    WASTE: 0
  };

  sources.forEach(s => {
    if (categoryTotals[s.category] !== undefined) {
      categoryTotals[s.category] += s.co2e_kg;
    }
  });

  // Category Pie Chart Data
  const pieData = [
    { name: 'Transport', category: 'TRANSPORT', value: parseFloat(categoryTotals.TRANSPORT.toFixed(2)), color: '#3B82F6' },
    { name: 'Energy', category: 'ENERGY', value: parseFloat(categoryTotals.ENERGY.toFixed(2)), color: '#F59E0B' },
    { name: 'Food', category: 'FOOD', value: parseFloat(categoryTotals.FOOD.toFixed(2)), color: '#10B981' },
    { name: 'Waste', category: 'WASTE', value: parseFloat(categoryTotals.WASTE.toFixed(2)), color: '#8B5CF6' },
  ].filter(d => d.value > 0);

  // Highest category driver
  let topCategory: EmissionCategory = 'TRANSPORT';
  let maxVal = 0;
  (Object.keys(categoryTotals) as EmissionCategory[]).forEach(cat => {
    if (categoryTotals[cat] > maxVal) {
      maxVal = categoryTotals[cat];
      topCategory = cat;
    }
  });

  const suggestion = generateSuggestion(topCategory);

  // Recent activity logs (for Bar Chart)
  const recentLogsChartData = sources
    .slice(0, 7)
    .reverse()
    .map((s, idx) => ({
      name: new Date(s.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      CO2e: parseFloat(s.co2e_kg.toFixed(2)),
      activity: s.activity_label || s.activity_type
    }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-theme flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'Eco Advocate'} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Here is your personal environmental impact summary and footprint insights.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/log"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm shadow-md transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log New Activity</span>
            </Link>
            <Link
              href="/reports"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium text-sm transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </Link>
          </div>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1: Total Footprint */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total CO₂ Footprint
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                {totalEmissionsKg < 1000 ? totalEmissionsKg.toFixed(1) : totalEmissionsTonnes.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {totalEmissionsKg < 1000 ? 'kg CO₂e' : 'tonnes CO₂e'}
              </span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Based on {sources.length} logged activities</span>
            </div>
          </div>

          {/* KPI 2: Top Driver */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Primary Driver
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                {topCategory.toLowerCase()}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {maxVal > 0 ? `${((maxVal / (totalEmissionsKg || 1)) * 100).toFixed(0)}% of total emissions` : 'No activity logged'}
            </div>
          </div>

          {/* KPI 3: Avg activity footprint */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Avg per Activity
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                {sources.length > 0 ? (totalEmissionsKg / sources.length).toFixed(1) : '0'}
              </span>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                kg / log
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Across all 4 core categories
            </div>
          </div>

          {/* KPI 4: Action Status */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tracking Streak
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Unified abstraction engine ready
            </div>
          </div>
        </div>

        {/* Suggestion Recommendation Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Tailored Reduction Advice</span>
            </div>
            <p className="text-base sm:text-lg text-emerald-50 leading-relaxed font-medium">
              "{suggestion.tip}"
            </p>
          </div>
          <Link
            href="/log"
            className="flex-shrink-0 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>Log Action</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown Chart */}
          <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Category Breakdown
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Distribution across Transport, Energy, Food, and Waste
                  </p>
                </div>
              </div>

              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No activity data logged yet.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [`${val} kg CO₂e`, 'Emissions']}
                        contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', borderColor: '#27272a', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Stats Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-100 dark:border-zinc-800 mt-4">
              {[
                { label: 'Transport', category: 'TRANSPORT', color: 'bg-blue-500' },
                { label: 'Energy', category: 'ENERGY', color: 'bg-amber-500' },
                { label: 'Food', category: 'FOOD', color: 'bg-emerald-500' },
                { label: 'Waste', category: 'WASTE', color: 'bg-purple-500' },
              ].map(cat => (
                <div key={cat.category} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cat.label}</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                      {categoryTotals[cat.category as EmissionCategory].toFixed(1)} kg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Bar Chart */}
          <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Recent Logs Trend
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    CO₂e impact per recent activity entry
                  </p>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View All History →
                </Link>
              </div>

              {recentLogsChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No recent activities recorded.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentLogsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                      <Tooltip 
                        formatter={(val: any) => [`${val} kg CO₂e`, 'Impact']}
                        contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', borderColor: '#27272a', color: '#fff' }}
                      />
                      <Bar dataKey="CO2e" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="pt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800">
              <span>Uniform EmissionSource model active</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero category branching</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
