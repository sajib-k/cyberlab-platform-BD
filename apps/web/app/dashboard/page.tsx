'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch("http://localhost:4000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl text-cyan-400">Loading your cyber command center...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">Unable to load your dashboard.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back, {data.user.username} 👋
            </h1>
            <p className="text-slate-400 mt-1">Continue your cybersecurity journey.</p>
          </div>
        </div>

        {/* Gamification Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-sm font-medium text-slate-400">Total XP</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{data.gamification.xp} XP</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-sm font-medium text-slate-400">Current Level</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">Level {data.gamification.level}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-sm font-medium text-slate-400">Level Progress</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data.gamification.progressPercent}%</div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${data.gamification.progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-sm font-medium text-slate-400">Overall Progress</span>
            <div className="text-2xl font-bold text-blue-400 mt-1">{data.progress.overallPercent}%</div>
          </div>
        </div>

        {/* Current Learning Section */}
        {data.currentLearning && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-cyan-900/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Continue Learning</h2>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-cyan-400">{data.currentLearning.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{data.currentLearning.description}</p>
              </div>
              <a
                href={data.currentLearning.ctaLink}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition shrink-0"
              >
                Continue Learning
              </a>
            </div>
          </div>
        )}

        {/* Learning Paths Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.learningPaths.map((path: any) => (
              <div key={path.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {path.difficulty}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-3">{path.title}</h3>
                  <p className="text-slate-400 text-sm mt-2">{path.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm text-slate-400">{path.progressPercent}% Complete</span>
                  <a
                    href={`/learning-paths/${path.id}`}
                    className="text-sm font-medium text-cyan-400 hover:underline"
                  >
                    View Path →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
