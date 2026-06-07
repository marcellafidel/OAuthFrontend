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
  uploadedDocName?: string;
  uploadedDocType?: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State kontrol khusus edit profile (Nama & Bio saja)
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // State kontrol khusus upload file/dokumen (Terpisah)
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

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
        setNewBio(data.user.bio || 'halo aku marcel'); 
        setDocName(data.user.uploadedDocName || '');
        setDocType(data.user.uploadedDocType || '');
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

  // Sinkronisasi data profile saat masuk mode edit
  useEffect(() => {
    if (isEditing && user) {
      setNewName(user.name);
      setNewBio(user.bio || 'halo aku marcel');
    }
  }, [isEditing, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // 1. Fungsi khusus ganti Foto Profil dari lokal komputer
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (user) {
          setUser({ ...user, photo: reader.result as string });
          alert('Foto profil berhasil diubah!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Fungsi khusus simpan perubahan info Nama & Bio
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    setTimeout(() => {
      if (user) {
        setUser({ ...user, name: newName, bio: newBio });
      }
      setIsSavingProfile(false);
      setIsEditing(false);
      alert('Profil berhasil diperbarui!');
    }, 500);
  };

  // 3. Fungsi khusus Upload Berkas/Dokumen (Bagian Terpisah)
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
      }
      
      setIsUploadingDoc(true);
      
      setTimeout(() => {
        setDocName(file.name);
        setDocType(file.type || 'application/octet-stream');
        if (user) {
          setUser({
            ...user,
            uploadedDocName: file.name,
            uploadedDocType: file.type || 'application/octet-stream'
          });
        }
        setIsUploadingDoc(false);
        alert('Berkas berhasil diunggah ke dashboard!');
      }, 700);
    }
  };

  const getDocIcon = (type: string) => {
    if (type.includes('pdf')) return '📕 PDF';
    if (type.includes('word') || type.includes('officedocument')) return '📘 DOCX';
    if (type.startsWith('image/')) return '🖼️ IMAGE';
    return '📁 FILE';
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
      <div className="w-full max-w-md space-y-5">
        
        {/* Header Atas */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-[#4A76A8] tracking-tight">Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition text-sm shadow-md shadow-red-500/10 cursor-pointer active:scale-95"
          >
            Logout
          </button>
        </div>

        {/* ================= SEKSI 1: KOTAK UTAMA PROFILE ================= */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#A2C2E8]/20 p-8 border border-white">
          
          {/* Avatar Area dengan hover click untuk ganti foto langsung */}
          <div 
            onClick={() => profilePhotoInputRef.current?.click()}
            className="relative w-24 h-24 mx-auto mb-5 border-4 border-white shadow-md rounded-full overflow-hidden bg-gray-100 cursor-pointer group"
            title="Klik untuk ganti foto profil"
          >
            <Image
              src={user.photo || '/default-avatar.png'}
              alt={user.name || 'User'}
              fill
              className="object-cover group-hover:scale-105 transition-all"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-white font-bold">Ubah Foto</span>
            </div>
          </div>
          {/* Hidden input file untuk foto */}
          <input 
            type="file" 
            ref={profilePhotoInputRef} 
            onChange={handlePhotoChange} 
            accept="image/*" 
            className="hidden" 
          />

          {!isEditing ? (
            /* TAMPILAN PREVIEW PROFILE BIASA */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              
              <div className="bg-gray-50/80 border border-gray-100 text-sm text-gray-600 py-2.5 px-4 rounded-xl italic max-w-xs mx-auto mb-5 shadow-inner">
                "{user.bio || 'halo aku marcel'}"
              </div>
              
              <div className="border-t border-gray-100 my-5"></div>
              
              <div className="space-y-3 text-left mb-6 text-xs text-gray-500 font-medium">
                <div className="flex justify-between items-center">
                  <span>Status Account:</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">✓ Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Metode Otentikasi:</span>
                  <span className="font-bold text-[#4A76A8]">Google OAuth</span>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#4A76A8] hover:bg-[#A2C2E8] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-[#4A76A8]/20 cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            /* FORM EDIT PROFILE (NAMA & BIO SAJA) */
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-[#4A76A8]">Ubah Informasi</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nama Lengkap</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bio / Deskripsi</label>
                <textarea 
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 h-20 resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-1/2 bg-[#4A76A8] hover:bg-[#A2C2E8] text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm shadow-md"
                >
                  {isSavingProfile ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* ================= SEKSI 2: KOTAK BAGIAN BERBEDA (UPLOAD FILE / DOC) ================= */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#A2C2E8]/20 p-6 border border-white">
          <h3 className="text-sm font-bold text-gray-800 mb-3 tracking-wide uppercase">📁 Pusat Berkas & Dokumen</h3>
          
          {/* Komponen Unggah File */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors group relative">
              <input 
                type="file"
                accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleDocUpload}
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploadingDoc}
              />
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📤</span>
              <p className="text-xs font-semibold text-gray-600">
                {isUploadingDoc ? 'Sedang Memproses Berkas...' : 'Pilih Foto, PDF, atau berkas DOC'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Maksimal ukuran file 5MB</p>
            </div>

            {/* List Gambar/Dokumen yang Terunggah */}
            {docName && (
              <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-base bg-white p-2 rounded-lg shadow-sm border border-blue-50/60 font-bold shrink-0">
                    {getDocIcon(docType)}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-gray-400 font-medium">File Aktif Terlampir</p>
                    <p className="text-xs font-bold text-gray-700 truncate max-w-[220px]">{docName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setDocName(''); setDocType(''); }}
                  className="text-gray-400 hover:text-red-500 font-bold text-xs p-1 px-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus berkas"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-2 text-gray-400 text-xs">
          <p>Terhubung dengan Dashboard OAuth v4.2 👋</p>
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