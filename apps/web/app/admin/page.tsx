'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch('http://localhost:4000/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403 || res.status === 401) {
          setError('403 — Access Denied. Administrator privileges required.');
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch admin overview');

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Unable to load administrative data.');
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center">
        <div className="animate-pulse">Loading administrative command center...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex flex-col items-center justify-center p-6">
        <div className="text-2xl font-bold mb-2">Access Restricted</div>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 pr-6 hidden md:block space-y-2">
        <div className="text-xl font-bold text-cyan-400 mb-6">CyberLab Admin</div>
        <a href="/admin" className="block px-4 py-2.5 rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-800/50 font-medium">Overview</a>
        <a href="/admin/audit-logs" className="block px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition">Audit Logs</a>
        <a href="/dashboard" className="block px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition mt-10">← User Dashboard</a>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
          <p className="text-slate-400">System metrics and platform statistics foundation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <span className="text-sm font-medium text-slate-400">Total Users</span>
            <div className="text-3xl font-bold text-cyan-400 mt-2">{data?.users?.total}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <span className="text-sm font-medium text-slate-400">Learning Paths</span>
            <div className="text-3xl font-bold text-purple-400 mt-2">{data?.content?.learningPaths}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <span className="text-sm font-medium text-slate-400">Courses</span>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{data?.content?.courses}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <span className="text-sm font-medium text-slate-400">Rooms</span>
            <div className="text-3xl font-bold text-blue-400 mt-2">{data?.content?.rooms}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <span className="text-sm font-medium text-slate-400">Tasks</span>
            <div className="text-3xl font-bold text-amber-400 mt-2">{data?.content?.tasks}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <span className="text-sm font-medium text-slate-400">Questions</span>
            <div className="text-3xl font-bold text-rose-400 mt-2">{data?.content?.questions}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
