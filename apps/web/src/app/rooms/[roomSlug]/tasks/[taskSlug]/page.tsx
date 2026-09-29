'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MachinePanel } from '@/components/lab/MachinePanel';
import { FlagSubmission } from '@/components/lab/FlagSubmission';

export default function LabWorkspacePage() {
  const params = useParams();
  const roomSlug = params?.roomSlug as string;
  const taskSlug = params?.taskSlug as string;

  const [taskData, setTaskData] = useState<any>(null);
  const [machineData, setMachineData] = useState<any>(null);
  const [isLoadingMachine, setIsLoadingMachine] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(true);

  // Fetch task and room details
  useEffect(() => {
    if (!roomSlug || !taskSlug) return;
    
    async function loadTask() {
      try {
        const res = await fetch(`/api/rooms/${roomSlug}/tasks/${taskSlug}`);
        if (res.ok) {
          const data = await res.json();
          setTaskData(data);
          if (data.machineId) {
            fetchMachineStatus(data.machineId);
          }
        }
      } catch (err) {
        console.error('Failed to load task content', err);
      } finally {
        setIsLoadingTask(false);
      }
    }

    loadTask();
  }, [roomSlug, taskSlug]);

  const fetchMachineStatus = async (machineId: string) => {
    try {
      const res = await fetch(`/api/machines/${machineId}/status`);
      if (res.ok) {
        const data = await res.json();
        setMachineData(data);
      }
    } catch (err) {
      console.error('Failed to fetch machine status', err);
    }
  };

  const handleStartMachine = async () => {
    if (!taskData?.machineId) return;
    setIsLoadingMachine(true);
    try {
      const res = await fetch(`/api/machines/${taskData.machineId}/start`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMachineData(data);
      }
    } catch (err) {
      console.error('Error starting machine', err);
    } finally {
      setIsLoadingMachine(false);
    }
  };

  const handleStopMachine = async () => {
    if (!taskData?.machineId) return;
    setIsLoadingMachine(true);
    try {
      const res = await fetch(`/api/machines/${taskData.machineId}/stop`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMachineData(data);
      }
    } catch (err) {
      console.error('Error stopping machine', err);
    } finally {
      setIsLoadingMachine(false);
    }
  };

  const handleRestartMachine = async () => {
    if (!taskData?.machineId) return;
    setIsLoadingMachine(true);
    try {
      const res = await fetch(`/api/machines/${taskData.machineId}/restart`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMachineData(data);
      }
    } catch (err) {
      console.error('Error restarting machine', err);
    } finally {
      setIsLoadingMachine(false);
    }
  };

  const handleExtendMachine = async () => {
    if (!taskData?.machineId) return;
    setIsLoadingMachine(true);
    try {
      const res = await fetch(`/api/machines/${taskData.machineId}/extend`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMachineData(data);
      }
    } catch (err) {
      console.error('Error extending machine time', err);
    } finally {
      setIsLoadingMachine(false);
    }
  };

  if (isLoadingTask) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-mono">
        Loading lab workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">{roomSlug}</span>
          <h1 className="text-xl font-bold tracking-tight text-white">{taskData?.title || 'Lab Task'}</h1>
        </div>
        <div className="text-sm font-mono text-slate-400">
          CyberLab Interactive Workspace
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Task Content & Flag Submission */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">Task Instructions</h2>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
              {taskData?.content || 'No instructions provided for this task.'}
            </div>
          </div>

          {taskData?.flagId && (
            <FlagSubmission
              flagId={taskData.flagId}
              onSubmitted={(result) => {
                if (result.correct) {
                  // Optionally update local task completion state
                }
              }}
            />
          )}
        </div>

        {/* Right Column: Machine Panel & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <MachinePanel
            machine={machineData}
            onStart={handleStartMachine}
            onStop={handleStopMachine}
            onRestart={handleRestartMachine}
            onExtend={handleExtendMachine}
            isLoading={isLoadingMachine}
          />
        </div>
      </main>
    </div>
  );
}
