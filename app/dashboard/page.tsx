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
  uploadedDocName?: string; // Menyimpan nama dokumen/PDF yang diunggah
  uploadedDocType?: string; // Menyimpan tipe format dokumen
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State kontrol edit profile
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPhotoPreview, setNewPhotoPreview] = useState('');
  
  // State khusus untuk menampung data dokumen/PDF baru
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setNewPhotoPreview(data.user.photo);
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

  useEffect(() => {
    if (isEditing && user) {
      setNewName(user.name);
      setNewBio(user.bio || 'halo aku marcel');
      setNewPhotoPreview(user.photo);
      setDocName(user.uploadedDocName || '');
      setDocType(user.uploadedDocType || '');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isEditing, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Handler serbaguna untuk Foto, PDF, atau Doc
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran maksimal (misal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar! Maksimal 5MB.');
        return;
      }

      // 1. Jika yang diunggah adalah Gambar / Foto
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } 
      // 2. Jika yang diunggah adalah PDF atau Dokumen teks
      else {
        setDocName(file.name);
        setDocType(file.type || 'application/octet-stream');
      }
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      if (user) {
        setUser({ 
          ...user, 
          name: newName, 
          bio: newBio,
          photo: newPhotoPreview,
          uploadedDocName: docName,
          uploadedDocType: docType
        });
      }
      setIsSaving(false);
      setIsEditing(false);
      alert('Profil & Dokumen berhasil diperbarui!');
    }, 600);
  };

  // Fungsi helper untuk menentukan ikon dokumen
  const getDocIcon = (type: string) => {
    if (type.includes('pdf')) return '📕 PDF';
    if (type.includes('word') || type.includes('officedocument')) return '📘 DOCX';
    return '📁 File';
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
        
        {/* Header Atas */}
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
          
          {/* Foto Profil */}
          <div className="relative w-24 h-24 mx-auto mb-5 border-4 border-white shadow-md rounded-full overflow-hidden bg-gray-100">
            <Image
              src={isEditing ? newPhotoPreview : (user.photo || '/default-avatar.png')}
              alt={user.name || 'User'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {!isEditing ? (
            /* MODE PREVIEW */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              
              {/* Box Bio */}
              <div className="bg-gray-50/80 border border-gray-100 text-sm text-gray-600 py-2.5 px-4 rounded-xl italic max-w-xs mx-auto mb-5 shadow-inner">
                "{user.bio || 'halo aku marcel'}"
              </div>

              {/* Tampilan Lampiran Dokumen Jika Ada */}
              {user.uploadedDocName && (
                <div className="mb-5 p-3 bg-blue-50/50 border border-blue-100 text-left rounded-xl flex items-center gap-3">
                  <span className="text-lg bg-white p-2 rounded-lg shadow-sm border border-blue-50">
                    {getDocIcon(user.uploadedDocType || '')}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-400 font-medium">Dokumen Terunggah</p>
                    <p className="text-xs font-semibold text-gray-700 truncate">{user.uploadedDocName}</p>
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-100 my-5"></div>
              
              {/* Detail Metadata */}
              <div className="space-y-3.5 text-left mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md text-xs">✓ Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Login Method:</span>
                  <span className="font-semibold text-[#4A76A8] text-xs">Google OAuth</span>
                </div>
              </div>

              {/* Tombol Edit */}
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#4A76A8] hover:bg-[#A2C2E8] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-[#4A76A8]/20 cursor-pointer active:scale-[0.98]"
              >
                Edit Profile & Berkas
              </button>
            </div>
          ) : (
            /* MODE EDIT FORM MULTI-UPLOAD */
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-[#4A76A8]">Ubah Profil & Berkas</h3>
                <p className="text-xs text-gray-400">Unggah foto baru atau berkas PDF/Doc Anda</p>
              </div>

              {/* Input Upload Serbaguna */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Unggah Foto / PDF / Doc</label>
                <input 
                  type="file"
                  accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
                
                {/* Preview Status Sementara saat Edit */}
                {docName && (
                  <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-dashed">
                    <span>Selected File:</span>
                    <span className="font-semibold text-gray-700 truncate max-w-[200px]">{docName}</span>
                  </div>
                )}
              </div>

              {/* Input Nama */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 pt-1">Nama Lengkap</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 bg-gray-50/50 text-sm"
                  required
                />
              </div>

              {/* Input Bio */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 pt-1">Bio / Deskripsi Singkat</label>
                <textarea 
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A2C2E8] focus:ring-4 focus:ring-[#A2C2E8]/10 transition-all font-medium text-gray-700 bg-gray-50/50 h-20 resize-none text-sm"
                  placeholder="Tulis bio singkat kamu..."
                />
              </div>

              {/* Aksi Batal / Simpan */}
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