'use client';

import React, { useState } from 'react';

interface FlagSubmissionProps {
  flagId: string;
  onSubmitted: (result: { correct: boolean; message: string; pointsAwarded?: number }) => void;
}

export const FlagSubmission: React.FC<FlagSubmissionProps> = ({ flagId, onSubmitted }) => {
  const [flagValue, setFlagValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ correct?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagValue.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/flags/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, value: flagValue.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit flag.');
      }

      setFeedback({
        correct: data.correct,
        message: data.message || (data.correct ? 'Correct flag!' : 'Incorrect flag.'),
      });

      if (data.correct) {
        setFlagValue('');
      }

      onSubmitted(data);
    } catch (err: any) {
      setFeedback({
        correct: false,
        message: err.message || 'An error occurred during submission.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-200 shadow-lg">
      <h3 className="text-lg font-semibold tracking-wide text-emerald-400 mb-3">Submit Flag</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={flagValue}
            onChange={(e) => setFlagValue(e.target.value)}
            placeholder="CL{flag_here}"
            disabled={isSubmitting}
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !flagValue.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded transition disabled:opacity-50 text-sm"
          >
            {isSubmitting ? 'Checking...' : 'Submit'}
          </button>
        </div>

        {feedback && (
          <div className={`p-3 rounded text-sm font-mono border ${
            feedback.correct 
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
              : 'bg-rose-950/80 text-rose-300 border-rose-800'
          }`}>
            {feedback.correct ? '✓ ' : '✗ '} {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
};
