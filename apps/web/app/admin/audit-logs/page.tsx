'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditLogsPage() {
  const [logsData, setLogsData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`http://localhost:4000/api/admin/audit-logs?page=${page}&limit=15`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403 || res.status === 401) {
          setError('403 — Access Denied.');
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch audit logs');

        const json = await res.json();
        setLogsData(json);
      } catch (err: any) {
        setError(err.message || 'Unable to load audit logs.');
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 pr-6 hidden md:block space-y-2">
        <div className="text-xl font-bold text-cyan-400 mb-6">CyberLab Admin</div>
        <a href="/admin" className="block px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition">Overview</a>
        <a href="/admin/audit-logs" className="block px-4 py-2.5 rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-800/50 font-medium">Audit Logs</a>
        <a href="/dashboard" className="block px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition mt-10">← User Dashboard</a>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-8 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
            <p className="text-slate-400">Track administrative and system security events.</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-950/50 border border-red-800 p-4 rounded-xl text-red-400">{error}</div>
        ) : loading ? (
          <div className="text-cyan-400 animate-pulse">Loading audit logs...</div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                    <th className="p-4 font-semibold">Action</th>
                    <th className="p-4 font-semibold">Actor (User)</th>
                    <th className="p-4 font-semibold">Entity</th>
                    <th className="p-4 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logsData?.items?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">No audit logs found.</td>
                    </tr>
                  ) : (
                    logsData?.items?.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-850/50 transition">
                        <td className="p-4 font-mono text-cyan-400">{log.action}</td>
                        <td className="p-4 text-slate-300">{log.user?.username || log.userId}</td>
                        <td className="p-4 text-slate-400">{log.entityType ? `${log.entityType} (${log.entityId || 'N/A'})` : '—'}</td>
                        <td className="p-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/30">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition text-sm"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">Page {logsData?.page} of {Math.ceil((logsData?.total || 1) / (logsData?.limit || 15))}</span>
              <button
                disabled={page * (logsData?.limit || 15) >= (logsData?.total || 0)}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
