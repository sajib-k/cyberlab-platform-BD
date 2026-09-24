'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  points: number;
  xp: number;
  level: number;
  streak: number;
  emailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/profile', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setProfile(data);
      setUsername(data.username || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatarUrl || '');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:4000/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          bio,
          avatarUrl: avatarUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfile(data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-bold tracking-wide text-cyan-400">User Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500 text-green-200 rounded-lg text-sm">
            {success}
          </div>
        )}

        {profile && !isEditing ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-2 border-cyan-500 flex items-center justify-center text-3xl font-bold text-cyan-400">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile.username}</h2>
                <p className="text-gray-400 text-sm">{profile.email}</p>
                <span
                  className={`inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-medium ${
                    profile.emailVerified
                      ? 'bg-green-900/60 text-green-300 border border-green-700'
                      : 'bg-yellow-900/60 text-yellow-300 border border-yellow-700'
                  }`}
                >
                  {profile.emailVerified ? 'Email Verified' : 'Email Unverified'}
                </span>
              </div>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Bio</h3>
              <p className="text-gray-200 whitespace-pre-wrap">{profile.bio || 'No bio provided yet.'}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50">
                <span className="text-xs text-gray-400 block">Level</span>
                <span className="text-xl font-bold text-cyan-400">{profile.level}</span>
              </div>
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50">
                <span className="text-xs text-gray-400 block">XP</span>
                <span className="text-xl font-bold text-cyan-400">{profile.xp}</span>
              </div>
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50">
                <span className="text-xs text-gray-400 block">Points</span>
                <span className="text-xl font-bold text-cyan-400">{profile.points}</span>
              </div>
              <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50">
                <span className="text-xs text-gray-400 block">Streak</span>
                <span className="text-xl font-bold text-cyan-400">{profile.streak} Days</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-700/50">
              Member since: {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                placeholder="Tell something about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                placeholder="https://example.com/avatar.png"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setUsername(profile.username);
                    setBio(profile.bio || '');
                    setAvatarUrl(profile.avatarUrl || '');
                  }
                }}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
