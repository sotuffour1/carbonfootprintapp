'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Car, 
  Zap, 
  Utensils, 
  Trash2, 
  Sparkles, 
  BarChart3, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { dataService } from '@/lib/supabase/client';

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: 'USER' | 'ADMIN' } | null>(null);

  useEffect(() => {
    dataService.getCurrentUser().then(u => setUser(u));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col transition-theme">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified Activity Abstraction Model</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Measure your climate impact with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">effortless clarity</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Footprint unifies all emission-producing activities — from car trips to kWh of electricity — into a single elegant standard. Clear outcomes, zero raw math clutter.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-950/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>{user ? "Go to Dashboard" : "Start Calculating"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/log"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-900 dark:text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Try Activity Logger</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Four Categories, One Concept */}
      <section className="py-16 bg-white dark:bg-zinc-900/60 border-y border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Four Categories. One Abstraction.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              No category-specific code branches. Every real-world activity maps cleanly into a uniform EmissionSource model.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Transport',
                desc: 'Petrol, diesel, electric vehicles, motorbikes, buses & flights measured by distance.',
                icon: Car,
                color: 'bg-blue-500',
                sample: '120 km Petrol Car → 23.04 kg CO₂e'
              },
              {
                title: 'Energy',
                desc: 'Grid electricity, natural gas heating, solar offset measured by power consumption.',
                icon: Zap,
                color: 'bg-amber-500',
                sample: '150 kWh Electricity → 34.95 kg CO₂e'
              },
              {
                title: 'Food',
                desc: 'Beef, poultry, plant-based diets, seafood & dairy measured by dietary weight.',
                icon: Utensils,
                color: 'bg-emerald-500',
                sample: '1.5 kg Beef → 40.50 kg CO₂e'
              },
              {
                title: 'Waste',
                desc: 'Household landfill, recycled plastic, paper & compost measured by waste volume.',
                icon: Trash2,
                color: 'bg-purple-500',
                sample: '10 kg Landfill → 5.80 kg CO₂e'
              },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl ${cat.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200/60 dark:border-zinc-800/80 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {cat.sample}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architectural Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Instant Feedback & Recharts</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Log activities with real-time impact calculations. View category breakdown pie charts and historical trend bars instantly.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Formal PDF Exports</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Generate carbon reports and download verified PDFs via Next.js Route Handlers or client-side print layout export.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Supabase PostgreSQL & RLS</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Row-Level Security isolates user log data. Benchmark factors update dynamically via database changes without code edits.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-zinc-800 py-8 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Footprint — Personal Carbon Footprint Calculator • Built with Next.js 14 & Supabase
        </div>
      </footer>
    </div>
  );
}
