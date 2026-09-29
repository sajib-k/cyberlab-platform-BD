'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  learningPaths: Array<{ id: string; title: string; slug: string; difficulty: string; imageUrl?: string }>;
  courses: Array<{ id: string; title: string; slug: string; difficulty: string }>;
  rooms: Array<{ id: string; title: string; slug: string; difficulty: string; estimatedMinutes: number }>;
  tasks: Array<{ id: string; title: string; slug: string; roomId: string }>;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ learningPaths: [], courses: [], rooms: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ learningPaths: [], courses: [], rooms: [], tasks: [] });
    }
  }, [isOpen]);

  // Debounced API fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults({ learningPaths: [], courses: [], rooms: [], tasks: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:4000/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const hasResults =
    results.learningPaths.length > 0 ||
    results.courses.length > 0 ||
    results.rooms.length > 0 ||
    results.tasks.length > 0;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
      >
        <span>Search CyberLab...</span>
        <kbd className="px-1.5 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Ctrl K</kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-zinc-800">
              <svg className="w-5 h-5 text-zinc-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search learning paths, courses, rooms, tasks..."
                className="w-full py-4 bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none text-sm"
              />
              {loading && <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full" />}
            </div>

            {/* Results Container */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {!query.trim() && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Type something to search across CyberLab...
                </div>
              )}

              {query.trim() && !hasResults && !loading && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  No results found for &quot;<span className="text-zinc-300">{query}</span>&quot;
                </div>
              )}

              {/* Learning Paths */}
              {results.learningPaths.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider mb-2">Learning Paths</h3>
                  <div className="space-y-1">
                    {results.learningPaths.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(`/learning-paths/${item.slug}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition text-sm"
                      >
                        <span className="text-zinc-200 font-medium">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{item.difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses */}
              {results.courses.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider mb-2">Courses</h3>
                  <div className="space-y-1">
                    {results.courses.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(`/courses/${item.slug}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition text-sm"
                      >
                        <span className="text-zinc-200 font-medium">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{item.difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms */}
              {results.rooms.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider mb-2">Rooms</h3>
                  <div className="space-y-1">
                    {results.rooms.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(`/rooms/${item.slug}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition text-sm"
                      >
                        <span className="text-zinc-200 font-medium">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">{item.estimatedMinutes} mins</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{item.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-t border-zinc-800 text-xs text-zinc-500">
              <span>Navigate with mouse or click Escape to close</span>
              <span className="font-mono text-zinc-400">CyberLab Discovery</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
