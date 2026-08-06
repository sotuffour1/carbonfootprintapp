'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, LogIn, Sparkles } from 'lucide-react';
import { dataService } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Set user state
      dataService.setCurrentUser({
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0] || 'User',
        role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER'
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUser = () => {
    dataService.setCurrentUser({
      id: 'demo-user-123',
      email: 'eco.user@example.com',
      name: 'Jane Doe',
      role: 'USER'
    });
    router.push('/dashboard');
  };

  const handleDemoAdmin = () => {
    dataService.setCurrentUser({
      id: 'admin-user-999',
      email: 'admin@footprint.org',
      name: 'Admin User',
      role: 'ADMIN'
    });
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-theme">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white shadow-lg">
            <Leaf className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to Footprint
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Track, reduce, and neutralize your personal carbon footprint
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 shadow-xl rounded-2xl border border-gray-100 dark:border-zinc-800">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDemoUser}
                className="py-2.5 px-3 rounded-lg border border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Demo User</span>
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="py-2.5 px-3 rounded-lg border border-amber-600/30 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
