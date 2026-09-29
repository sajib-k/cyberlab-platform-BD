'use client';

import React, { useState, useEffect } from 'react';

interface MachinePanelProps {
  machine?: {
    id: string;
    status: 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'EXPIRED' | 'ERROR';
    ipAddress?: string;
    hostname?: string;
    expiresAt?: string;
  };
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onExtend: () => Promise<void>;
  isLoading?: boolean;
}

export const MachinePanel: React.FC<MachinePanelProps> = ({
  machine,
  onStart,
  onStop,
  onRestart,
  onExtend,
  isLoading = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00');
  const status = machine?.status || 'STOPPED';

  useEffect(() => {
    if (!machine?.expiresAt || status !== 'RUNNING') return;

    const interval = setInterval(() => {
      const diff = new Date(machine.expiresAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [machine?.expiresAt, status]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-200 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold tracking-wide text-emerald-400">Lab Machine</h3>
        <span className={`px-2 py-1 text-xs font-mono rounded ${
          status === 'RUNNING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
          status === 'STARTING' || status === 'STOPPING' ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
          'bg-slate-800 text-slate-400'
        }`}>
          {status}
        </span>
      </div>

      {status === 'RUNNING' && (
        <div className="space-y-3 mb-4 text-sm font-mono">
          <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400">IP Address:</span>
            <span className="text-emerald-300 select-all">{machine?.ipAddress || '10.x.x.x'}</span>
          </div>
          <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-slate-400">Time Remaining:</span>
            <span className="text-amber-400 font-bold">{timeLeft}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status === 'STOPPED' && (
          <button
            onClick={onStart}
            disabled={isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold py-2 px-4 rounded transition disabled:opacity-50"
          >
            {isLoading ? 'Starting...' : 'Start Machine'}
          </button>
        )}

        {status === 'RUNNING' && (
          <>
            <button
              onClick={onStop}
              disabled={isLoading}
              className="flex-1 bg-rose-600/80 hover:bg-rose-500 text-white py-2 px-3 rounded text-sm transition disabled:opacity-50"
            >
              Stop
            </button>
            <button
              onClick={onRestart}
              disabled={isLoading}
              className="flex-1 bg-amber-600/80 hover:bg-amber-500 text-white py-2 px-3 rounded text-sm transition disabled:opacity-50"
            >
              Restart
            </button>
            <button
              onClick={onExtend}
              disabled={isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-600/40 py-2 px-3 rounded text-sm transition disabled:opacity-50 mt-1"
            >
              Extend Time (+15m)
            </button>
          </>
        )}

        {(status === 'STARTING' || status === 'STOPPING') && (
          <div className="w-full text-center py-2 text-slate-400 text-sm italic animate-pulse">
            Processing machine state...
          </div>
        )}
      </div>
    </div>
  );
};
