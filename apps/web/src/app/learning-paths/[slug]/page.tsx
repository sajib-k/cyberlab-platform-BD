'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string;
  order: number;
}

interface LearningPathDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string;
  imageUrl: string | null;
  courses: Course[];
}

export default function LearningPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:4000/api/learning-paths/${slug}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Learning path not found');
          throw new Error('Failed to fetch learning path details');
        }
        return res.json();
      })
      .then((data) => {
        setPath(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Loading path details...</p>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
        <p className="text-gray-400 mb-6">{error || 'Path not found'}</p>
        <button
          onClick={() => router.push('/learning-paths')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium transition"
        >
          Back to Learning Paths
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/learning-paths"
          className="inline-block text-cyan-400 hover:text-cyan-300 text-sm mb-6 transition"
        >
          ← Back to all learning paths
        </Link>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-xs font-semibold uppercase">
              {path.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{path.title}</h1>
          <p className="text-gray-300 leading-relaxed">{path.description || 'No description available.'}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Courses in this Path</h2>
          {path.courses && path.courses.length > 0 ? (
            path.courses.map((course, index) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="bg-gray-800/70 border border-gray-700 hover:border-cyan-500 rounded-lg p-5 flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-4">
                  <span className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition">{course.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{course.description || 'Course module'}</p>
                  </div>
                </div>
                <span className="text-cyan-400 text-sm font-medium">View Course →</span>
              </Link>
            ))
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
              No courses added to this learning path yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
