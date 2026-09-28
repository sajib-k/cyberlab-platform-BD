'use client';

import React, { useState, useEffect } from 'react';

interface Option {
  id: string;
  text: string;
  sortOrder: number;
}

interface Question {
  id: string;
  type: 'TEXT' | 'MCQ' | 'TRUE_FALSE' | 'FLAG' | 'NUMERIC';
  question: string;
  points: number;
  options?: Option[];
}

interface TaskQuestionsViewProps {
  taskId: string;
}

export default function TaskQuestionsView({ taskId }: TaskQuestionsViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{ [key: string]: { correct: boolean; pointsAwarded: number } }>({});

  useEffect(() => {
    if (!taskId) return;
    
    fetch(`/api/tasks/${taskId}/questions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        }
      })
      .catch((err) => console.error('Failed to load questions:', err));
  }, [taskId]);

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return;

    setLoading((prev) => ({ ...prev, [questionId]: true }));

    try {
      const res = await fetch(`/api/questions/${questionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults((prev) => ({
          ...prev,
          [questionId]: { correct: data.correct, pointsAwarded: data.pointsAwarded },
        }));
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-xl font-bold">টাস্কের প্রশ্নসমূহ</h3>
      {questions.map((q, index) => (
        <div key={q.id} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">প্রশ্ন #{index + 1}</span>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {q.points} পয়েন্ট
            </span>
          </div>
          
          <p className="text-gray-900 font-medium">{q.question}</p>

          {q.type === 'MCQ' && q.options && (
            <div className="space-y-2">
              {q.options.map((option) => (
                <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={option.id}
                    checked={answers[q.id] === option.id}
                    onChange={() => handleInputChange(q.id, option.id)}
                    className="form-radio"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {(q.type === 'TEXT' || q.type === 'NUMERIC' || q.type === 'FLAG') && (
            <input
              type={q.type === 'NUMERIC' ? 'number' : 'text'}
              placeholder="আপনার উত্তর লিখুন..."
              value={answers[q.id] || ''}
              onChange={(e) => handleInputChange(q.id, e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {q.type === 'TRUE_FALSE' && (
            <div className="flex space-x-4">
              {['True', 'False'].map((val) => (
                <label key={val} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={val.toLowerCase()}
                    checked={answers[q.id] === val.toLowerCase()}
                    onChange={() => handleInputChange(q.id, val.toLowerCase())}
                    className="form-radio"
                  />
                  <span>{val}</span>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={() => handleSubmit(q.id)}
            disabled={loading[q.id] || !answers[q.id]}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading[q.id] ? 'যাচাই করা হচ্ছে...' : 'উত্তর জমা দিন'}
          </button>

          {results[q.id] && (
            <div
              className={`p-3 rounded mt-2 ${
                results[q.id].correct
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {results[q.id].correct
                ? `সঠিক উত্তর! আপনি পেয়েছেন ${results[q.id].pointsAwarded} পয়েন্ট।`
                : 'উত্তর সঠিক হয়নি। আবার চেষ্টা করুন!'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}