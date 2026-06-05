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

  // State Baru untuk Form Edit Profile
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
        // Set default value form saat data user berhasil di-fetch
        setNewName(data.user.name);
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

  // Fungsi untuk Handle Submit Perubahan Profil (bisa dikoneksikan ke API Backend)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulasi update local state (Nanti pasang fetch ke backend di sini jika endpoint sudah siap)
      setTimeout(() => {
        if (user) {
          setUser({ ...user, name: newName });
        }
        setIsSaving(false);
        alert('Profil lokal berhasil diperbarui!');
      }, 8000000 && 800); // delay smooth
    } catch (err) {
      setIsSaving(false);
      alert('Gagal memperbarui profil');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F1F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#4A76A8] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F1F5]">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center border border-white">
          <p className="text-red-500 font-semibold mb-2">{error}</p>
          <p className="text-gray-400 text-sm">Mengalihkan kembali ke login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F1F5] text-gray-800 antialiased">
      
      {/* NAVBAR */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#A2C2E8]/20 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-extrabold text-[#4A76A8] tracking-tight">
          OAuth <span className="text-[#A2C2E8]">Dashboard</span>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 hover:text-white rounded-xl font-semibold transition-all duration-300 text-sm cursor-pointer active:scale-95 shadow-sm"
        >
          Logout
        </button>
      </header>

      {/* KONTEN UTAMA DENGAN TWO-COLUMN GRID LAYOUT */}
      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: TAMPILAN INFORMASI AKUN */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-[#A2C2E8]/20 border border-white text-center h-fit transform transition-all hover:scale-[1.01]">
          <div className="relative w-24 h-24 mx-auto mb-5 shadow-lg rounded-full border-4 border-white">
            <Image
              src={user.photo}
              alt={user.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-[#4A76A8] tracking-tight">{user.name}</h2>
          <p className="text-sm text-gray-400 mt-1 font-medium mb-4">{user.email}</p>
          
          <div className="border-t border-gray-100 my-4"></div>
          
          {/* Metadata Akun */}
          <div className="space-y-3 text-sm text-left">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Status:</span>
              <span className="px-2 py-0.5 bg-green-50 text-green-600 font-bold text-xs rounded-md">✓ Verified</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Metode:</span>
              <span className="font-semibold text-[#4A76A8] text-xs">Google OAuth</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">User ID:</span>
              <span className="font-mono text-gray-400 text-xs bg-gray-50 p-1 rounded" title={user.id}>
                {user.id.slice(0, 10)}...
              </span>
            </div>
          </div>

          {newBio && (
            <div className="mt-5 pt-4 border-t border-gray-100 text-left">
              <span className="text-[10px] font-bold text-[#A2C2E8] uppercase tracking-wider block mb-1">Bio Aktif</span>
              <p className="text-xs text-gray-500 italic">"{newBio}"</p>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: FORM EDIT PROFILE */}
        <div className="md:col-span-2 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-[#A2C2E8]/20 border border-white">
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-[#4A76A8] tracking-tight">Edit Profile</h3>
            <p className="text-sm text-gray-400 mt-1">Sesuaikan informasi profil publik akun kamu di sini.</p>
          </div>
          
          <hr className="border-gray-100 mb-6" />

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Lengkap</label>
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/20 transition-all font-medium text-gray-700 bg-gray-50/50"
                placeholder="Perbarui nama akun kamu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Bio / Deskripsi Singkat</label>
              <textarea 
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/20 transition-all h-28 resize-none font-medium text-gray-700 bg-gray-50/50"
                placeholder="Tulis bio singkat atau status terbaru kamu di sini..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#A2C2E8] hover:bg-[#4A76A8] text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-[#A2C2E8]/30 cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

      </main>

      <div className="text-center pb-8 text-gray-400 text-xs tracking-wide">
        Terhubung via Aplikasi Dashboard OAuth v4.0
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#E8F1F5]">
        <div className="text-gray-500 font-medium">Loading session state...</div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}