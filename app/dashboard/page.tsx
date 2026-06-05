'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  bio?: string; // Menambahkan opsi bio di interface
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk kontrol edit profile
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
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
        setNewName(data.user.name);
        setNewPhoto(data.user.photo);
        setNewBio(data.user.bio || 'halo aku marcel'); // Default bio sesuai screenshot kamu
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

  // Fungsi simpan perubahan ke layar langsung
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      if (user) {
        setUser({ 
          ...user, 
          name: newName, 
          photo: newPhoto,
          bio: newBio 
        });
      }
      setIsSaving(false);
      setIsEditing(false);
      alert('Profil berhasil diperbarui!');
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F1F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#4A76A8] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F1F5]">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center border border-white">
          <p className="text-red-500 font-semibold mb-2">{error}</p>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F1F5] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-[#4A76A8] tracking-tight">Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition text-sm shadow-md shadow-red-500/10 cursor-pointer active:scale-95"
          >
            Logout
          </button>
        </div>

        {/* Card Utama */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#A2C2E8]/20 p-8 border border-white">
          
          {/* Foto Profil (Akan dinamis berubah jika di-input baru) */}
          <div className="relative w-24 h-24 mx-auto mb-5 border-4 border-white shadow-md rounded-full overflow-hidden">
            <Image
              src={user.photo || '/default-avatar.png'}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized // Menghindari isu konfigurasi domain image Next.js jika input URL eksternal
            />
          </div>

          {!isEditing ? (
            /* MODE PREVIEW */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              
              {/* Tampilan Bio */}
              <p className="text-sm text-gray-600 bg-gray-50/70 py-2 px-3 rounded-xl italic border border-gray-100 max-w-xs mx-auto mb-5">
                "{user.bio || newBio}"
              </p>
              
              <div className="border-t border-gray-100 my-5"></div>
              
              <div className="space-y-3.5 text-left mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md text-xs">✓ Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Login Method:</span>
                  <span className="font-semibold text-[#4A76A8] text-xs">Google OAuth</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">User ID:</span>
                  <span className="font-mono text-gray-400 text-xs bg-gray-50 px-2 py-0.5 rounded">{user.id.slice(0, 10)}...</span>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#4A76A8] hover:bg-[#A2C2E8] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-[#4A76A8]/20 cursor-pointer active:scale-[0.98]"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            /* MODE EDIT FORM */
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-[#4A76A8]">Ubah Info Profil</h3>
                <p className="text-xs text-gray-400">Perbarui data profil akun kamu</p>
              </div>

              {/* Input Nama */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nama Lengkap</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 bg-gray-50/50 text-sm"
                  required
                />
              </div>

              {/* Input URL Foto Profil */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">URL Foto Profil</label>
                <input 
                  type="text"
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-mono text-xs text-gray-600 bg-gray-50/50"
                  placeholder="Masukkan URL Gambar baru"
                  required
                />
              </div>

              {/* Input Bio */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bio / Deskripsi</label>
                <textarea 
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 bg-gray-50/50 h-20 resize-none text-sm"
                  placeholder="Tulis bio singkat kamu..."
                />
              </div>

              {/* Aksi Tombol */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(user.name);
                    setNewBio(user.bio || 'halo aku marcel');
                    setNewPhoto(user.photo);
                  }}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 bg-[#4A76A8] hover:bg-[#A2C2E8] text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm shadow-md shadow-[#4A76A8]/10 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>Selamat datang! 👋</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-500">Loading session...</div>}>
      <ProfileContent />
    </Suspense>
  );
}