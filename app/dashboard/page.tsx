'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const tokenFromUrl = searchParams.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        window.history.replaceState({}, '', '/dashboard');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Anda belum login');
        setTimeout(() => router.push('/login'), 1000);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Unauthorized');
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem('token');
        setError('Anda belum login');
        setTimeout(() => router.push('/login'), 1000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image
              src={user.photo}
              alt={user.name}
              fill
              className="rounded-full object-cover border-4 border-indigo-600"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
          <p className="text-gray-600 mb-4">{user.email}</p>
          <div className="border-t border-gray-200 my-6"></div>
          <div className="space-y-3 text-left mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">✓ Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Login Method:</span>
              <span className="font-semibold text-blue-600">Google OAuth</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="font-semibold text-gray-900 text-sm">{user.id.slice(0, 10)}...</span>
            </div>
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Edit Profile
          </button>
        </div>

        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Selamat datang! 👋</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}