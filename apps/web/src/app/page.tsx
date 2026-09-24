import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#0a0d14]">
      <div className="inline-block px-3 py-1 mb-4 border border-cyan-500/30 rounded-full text-cyan-400 text-sm">
        CyberLab — Phase 1 Foundation
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white">
        Learn Cybersecurity. <br />
        <span className="text-cyan-400">Break Things Safely.</span> <br />
        Build Real Skills.
      </h1>
      <p className="max-w-2xl text-slate-400 mb-8 text-lg">
        Learn cybersecurity through guided lessons, practical challenges, and isolated hands-on labs.
      </p>
      <div className="flex gap-4">
        <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-md font-bold transition">
          Start Learning
        </button>
        <button className="border border-slate-700 hover:border-slate-500 text-white px-6 py-3 rounded-md font-medium transition">
          Explore Labs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full text-left">
        <div className="p-6 border border-slate-800 bg-slate-950/50 rounded-lg">
          <h3 className="text-cyan-400 font-bold mb-2">Learning Paths</h3>
          <p className="text-slate-400 text-sm">Structured tracks for Red Teaming, Web Security, and SOC operations.</p>
        </div>
        <div className="p-6 border border-slate-800 bg-slate-950/50 rounded-lg">
          <h3 className="text-cyan-400 font-bold mb-2">Hands-on Labs</h3>
          <p className="text-slate-400 text-sm">Isolated Docker-backed environments for realistic penetration testing.</p>
        </div>
        <div className="p-6 border border-slate-800 bg-slate-950/50 rounded-lg">
          <h3 className="text-cyan-400 font-bold mb-2">How It Works</h3>
          <p className="text-slate-400 text-sm">Interactive tasks, real-time flags, and immediate feedback.</p>
        </div>
      </div>
    </div>
  );
}
