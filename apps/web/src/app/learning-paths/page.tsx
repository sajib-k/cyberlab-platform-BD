'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string;
  imageUrl: string | null;
  courses: Course[];
}

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/learning-paths')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch learning paths');
        return res.json();
      })
      .then((data) => {
        setPaths(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Loading learning paths...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold tracking-wide text-cyan-400">Learning Paths</h1>
          <p className="text-gray-400 mt-1">Structured tracks to guide your cybersecurity journey.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {paths.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-gray-400">No learning paths available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => (
              <Link
                key={path.id}
                href={`/learning-paths/${path.slug}`}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-cyan-500 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-xs font-semibold uppercase">
                      {path.difficulty}
                    </span>
                    <span className="text-xs text-gray-400">
                      {path.courses?.length || 0} Courses
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition mb-2">
                    {path.title}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {path.description || 'No description provided.'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-700/60 flex items-center justify-between text-cyan-400 text-sm font-medium">
                  <span>Explore Path</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
