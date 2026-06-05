'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  bio?: string;
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
  // State untuk penampung URL Internet
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  // State untuk preview foto (base64 lokal atau URL internet)
  const [newPhotoPreview, setNewPhotoPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const localFileInputRef = useRef<HTMLInputElement>(null);

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
        // Set nilai form awal saat data user berhasil di-fetch
        setNewName(data.user.name);
        setNewBio(data.user.bio || 'halo aku marcel'); // Contoh bio default
        setNewPhotoPreview(data.user.photo); // Preview awal dari user
        setNewPhotoUrl(data.user.photo); // Sinkronisasi URL state
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

  // Sinkronisasi state saat memasuki mode edit untuk memastikan data segar
  useEffect(() => {
    if (isEditing && user) {
      setNewName(user.name);
      setNewBio(user.bio || 'halo aku marcel');
      setNewPhotoPreview(user.photo); // Preview mulai dari foto user
      setNewPhotoUrl(user.photo); // Input URL juga mulai dari foto user
      // Reset input file agar kosong
      if (localFileInputRef.current) {
        localFileInputRef.current.value = '';
      }
    }
  }, [isEditing, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Fungsi untuk menangani unggahan file lokal
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi file (harus gambar dan < 5MB)
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar.');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file tidak boleh lebih dari 5MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Bersihkan input URL, set preview foto lokal
        setNewPhotoUrl('');
        setNewPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk menangani input URL internet
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    // Set URL state dan preview foto internet
    setNewPhotoUrl(url);
    setNewPhotoPreview(url);
    // Bersihkan input file lokal
    if (localFileInputRef.current) {
      localFileInputRef.current.value = '';
    }
  };

  // Fungsi simpan perubahan ke layar langsung (state lokal)
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Nanti ganti simulasi ini dengan fetch/axios ke backend OAuth untuk update permanen
    setTimeout(() => {
      if (user) {
        setUser({ 
          ...user, 
          name: newName, 
          bio: newBio,
          photo: newPhotoPreview // Simpan preview foto yang terpilih
        });
      }
      setIsSaving(false);
      setIsEditing(false); // Keluar dari mode edit setelah sukses
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
    <div className="min-h-screen bg-[#E8F1F5] py-12 px-4 flex items-center justify-center antialiased">
      <div className="w-full max-w-md">
        
        {/* Header (Single-card terpusat) */}
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
          
          {/* Foto Profil ( preview dinamis di mode edit) */}
          <div className="relative w-24 h-24 mx-auto mb-5 border-4 border-white shadow-md rounded-full overflow-hidden">
            <Image
              src={isEditing ? newPhotoPreview : (user.photo || '/default-avatar.png')} // Tampilkan preview foto saat edit
              alt={isEditing ? 'Preview Foto' : (user.name || 'User')}
              fill
              className="object-cover"
              unoptimized // Menghindari isu konfigurasi domain image Next.js jika input URL eksternal
            />
          </div>

          {!isEditing ? (
            /* MODE PREVIEW (Tampilan Biasa) */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              
              {/* Tampilan Bio Aktif */}
              <p className="text-sm text-gray-600 bg-gray-50/70 py-2 px-3 rounded-xl italic border border-gray-100 max-w-xs mx-auto mb-5">
                "{user.bio || 'halo aku marcel'}"
              </p>
              
              <div className="border-t border-gray-100 my-5"></div>
              
              {/* Detail Info */}
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

              {/* Tombol pemicu masuk ke mode edit */}
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#4A76A8] hover:bg-[#A2C2E8] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-[#4A76A8]/20 cursor-pointer active:scale-[0.98]"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            /* MODE EDIT FORM (Satu Card, Interaktif) */
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-[#4A76A8]">Ubah Info Profil</h3>
                <p className="text-xs text-gray-400">Silakan perbarui data profil akun kamu di bawah ini</p>
              </div>

              {/* Ganti Foto Profil (Kombinasi Lokal & Internet) */}
              <div className="space-y-3.5 border-t border-gray-100 pt-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Ganti Foto Profil</label>
                
                <div className="space-y-3">
                  {/* Opsi Lokal */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Unggah dari Komputer (Lokal)</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleLocalFileChange}
                      ref={localFileInputRef}
                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    />
                  </div>

                  {/* Opsi Internet */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Ambil dari Internet (URL)</label>
                    <input 
                      type="text"
                      value={newPhotoUrl}
                      onChange={handleUrlChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-mono text-xs text-gray-600 bg-gray-50/50 text-sm"
                      placeholder="Masukkan URL Gambar baru"
                    />
                  </div>
                </div>
              </div>

              {/* Input Nama */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 pt-1">Nama Tampilan</label>
                <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 bg-gray-50/50 text-sm"
                    placeholder="Masukkan nama baru"
                    required
                />
              </div>

              {/* Input Bio (Bisa di-edit dan fungsi) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 pt-1">Bio / Deskripsi Singkat</label>
                <textarea 
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 bg-gray-50/50 h-20 resize-none text-sm"
                  placeholder="Tulis bio singkat kamu di sini..."
                />
              </div>

              {/* Aksi Tombol */}
              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 bg-[#4A76A8] hover:bg-[#A2C2E8] text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm shadow-md shadow-[#4A76A8]/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSaving && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="text-center mt-6 text-gray-400 text-sm antialiased">
          <p>Terhubung dengan Dashboard OAuth v4.1 👋</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-500 antialiased">Loading session state...</div>}>
      <ProfileContent />
    </Suspense>
  );
}