'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Redirect ke backend OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8F1F5] p-6 relative overflow-hidden">
      {/* Dekorasi Estetik Latar Belakang (Blob Lingkaran Halus) */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#A2C2E8] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-[#4A76A8] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>

      {/* Card Utama */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl shadow-[#A2C2E8]/40 p-10 w-full max-w-md border border-white/60 transform transition-all hover:scale-[1.01]">
        
        {/* Header App */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8F1F5] text-[#4A76A8] font-bold text-2xl mb-4 shadow-inner shadow-[#A2C2E8]/30">
            A
          </div>
          <h1 className="text-3xl font-extrabold text-[#4A76A8] tracking-tight">
            Welcome <span className="text-[#A2C2E8]">Back</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Silakan masuk untuk mengakses dashboard OAuth kamu.
          </p>
        </div>

        {/* Tombol Login Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 px-4 rounded-xl font-semibold hover:bg-[#E8F1F5] hover:border-[#A2C2E8] hover:text-[#4A76A8] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-md shadow-gray-100/50 cursor-pointer active:scale-[0.98]"
        >
          {loading ? (
            // Spinner Animasi Cantik
            <svg className="animate-spin h-5 w-5 text-[#4A76A8]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            // Icon Google
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.216 1.414 15.48 0 12.24 0 5.58 0 0 5.373 0 12s5.58 12 12.24 12c6.96 0 11.57-4.855 11.57-11.76 0-.79-.085-1.39-.19-1.955H12.24z"
              />
            </svg>
          )}
          <span className="tracking-wide">
            {loading ? 'Menghubungkan...' : 'Masuk dengan Google'}
          </span>
        </button>

        {/* Footer Link */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col items-center gap-1">
          <p className="text-gray-400 text-xs">
            Aplikasi Keamanan Terenkripsi OAuth 2.0
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Belum punya akun?{' '}
            <Link 
              href="/signup" 
              className="text-[#4A76A8] hover:text-[#A2C2E8] font-bold transition-colors duration-200 underline underline-offset-4"
            >
              Daftar di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}