'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  slug: string;
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string;
  imageUrl: string | null;
  published: boolean;
  learningPath: LearningPath;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:4000/api/courses/${slug}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Course not found');
          throw new Error('Failed to fetch course details');
        }
        return res.json();
      })
      .then((data) => {
        setCourse(data);
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
        <p className="text-lg animate-pulse">Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
        <p className="text-gray-400 mb-6">{error || 'Course not found'}</p>
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
        {course.learningPath && (
          <Link
            href={`/learning-paths/${course.learningPath.slug}`}
            className="inline-block text-cyan-400 hover:text-cyan-300 text-sm mb-6 transition"
          >
            ← Back to {course.learningPath.title}
          </Link>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-xs font-semibold uppercase">
              {course.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
          <p className="text-gray-300 leading-relaxed">
            {course.description || 'No description available for this course.'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Rooms in this Course</h2>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-400">
            Rooms for this course will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}
